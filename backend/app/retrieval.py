"""
Retrieval layer.

Primary path: dense BGE embeddings (BAAI/bge-small-en-v1.5) with NumPy
cosine similarity. The embedding model runs through `fastembed` (Qdrant's
library), which executes
the model via ONNX Runtime — deliberately NOT sentence-transformers/torch.
Torch alone is a multi-GB install and materially slows cold starts on small
hosting tiers (e.g. Render's free/starter plans); fastembed's dependency
stack (onnxruntime, tokenizers, huggingface-hub) is CPU-only and far
lighter, with no other change in behavior for this file. Per-jurisdiction
matrices of L2-normalized embeddings are scored with NumPy, so an India
query only searches the India matrix.

BGE is an *asymmetric* embedding model: it was trained expecting a fixed
instruction prefix on the QUERY side only ("Represent this sentence for
searching relevant passages: "), while documents/passages are embedded with
no prefix at all. Skipping this halves the model's effective retrieval
quality versus what BAAI's own benchmarks report, so `_retrieve_embeddings`
applies it to every query variant before encoding, and `_try_init_embeddings`
deliberately does NOT apply it when encoding the corpus.

Fallback path: the original TF-IDF retrieval (kept verbatim, renamed
`_retrieve_tfidf`). This is not a toy fallback — it is what actually runs in
any environment without live internet access to download the ONNX model
files from the Hugging Face Hub on first use (e.g. this project's own build
sandbox), and it is what the automated test suite exercises. In a normal
internet-connected dev/demo machine, the model downloads once (~130MB,
cached locally by fastembed afterwards) and the embeddings path takes over
transparently — no config flag to flip, no API change either way.

`retrieve()` keeps the exact same signature and return shape regardless of
which backend served the request: List[dict] with a `relevance_score` field
added, same corpus dict fields otherwise. `retrieval.BACKEND` reports which
one is actually active, for logging/tests.
"""
import json
import logging
import os
import re
from typing import List, Dict, Any, Union

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger("ip_sakti.retrieval")

_CORPUS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "corpus.json")

with open(_CORPUS_PATH, "r", encoding="utf-8") as f:
    _CORPUS: List[Dict[str, Any]] = json.load(f)

_CORPUS_BY_ID = {doc["id"]: doc for doc in _CORPUS}

_DOC_TEXTS = [f"{d['title']} {d['section']} {d['summary']} {d['domain']}" for d in _CORPUS]

# Retrieval-floor / domain-boost constants differ by backend: cosine
# similarity from a dense embedding model sits on a noticeably higher
# baseline (~0.15-0.35) for *unrelated* text than sparse TF-IDF does,
# because embeddings encode broad topical/semantic proximity, not just
# shared vocabulary. Reusing the TF-IDF thresholds unchanged would let more
# irrelevant documents pass the abstention floor. These embedding
# thresholds are a reasoned starting point, not empirically tuned against
# live model output — this sandbox cannot reach the Hugging Face Hub to
# download the model and verify real score distributions (see EMBEDDINGS
# section below). Revisit once you can run this end-to-end with internet;
# BGE's score distribution is broadly similar to other BERT-family sentence
# embedding models but has not itself been measured here.
_TFIDF_RELEVANCE_FLOOR = 0.05
_TFIDF_DOMAIN_BOOST_GATE = 0.02
_TFIDF_DOMAIN_BOOST = 0.15

_EMB_RELEVANCE_FLOOR = 0.30
_EMB_DOMAIN_BOOST_GATE = 0.20
_EMB_DOMAIN_BOOST = 0.10

# BAAI/bge-small-en-v1.5: 384-dim, ~130MB ONNX weights via fastembed. Small
# variant chosen deliberately over bge-base/bge-large for faster cold starts
# and lower memory on small hosting tiers — swap the string below (and
# redeploy) if you have headroom for better recall and want to trade up.
_EMBEDDING_MODEL_NAME = "BAAI/bge-small-en-v1.5"

# BGE is asymmetric: only queries get this instruction prefix; passages/docs
# never do. This exact string is BAAI's documented instruction for
# retrieval tasks with this model family — see the model card.
_BGE_QUERY_INSTRUCTION = "Represent this sentence for searching relevant passages: "


def _l2_normalize(mat: np.ndarray) -> np.ndarray:
    """Row-wise L2 normalize so a matrix product yields cosine similarity."""
    norms = np.linalg.norm(mat, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    return mat / norms


def _light_stem(token: str) -> str:
    """
    Very small suffix-stripping stemmer (no external NLTK data needed offline).
    Exact-token TF-IDF otherwise misses obvious matches like patent/patents/
    patentable/patentability, which would silently starve retrieval.
    """
    for suffix in ("abilities", "ability", "ization", "ations", "ation", "ing", "ies", "ed", "es", "s"):
        if token.endswith(suffix) and len(token) - len(suffix) >= 4:
            return token[: -len(suffix)]
    return token


def _tokenizer(text: str) -> List[str]:
    words = re.findall(r"[a-zA-Z]+", text.lower())
    return [_light_stem(w) for w in words]


_VECTORIZER = TfidfVectorizer(stop_words="english", tokenizer=_tokenizer, token_pattern=None)
_DOC_MATRIX = _VECTORIZER.fit_transform(_DOC_TEXTS)


def get_document(doc_id: str):
    return _CORPUS_BY_ID.get(doc_id)


# --------------------------------------------------------------------------
# DENSE EMBEDDINGS (primary path)
# --------------------------------------------------------------------------
BACKEND = "tfidf"  # flipped to "embeddings" below iff model load succeeds
_EMBED_MODEL = None
_EMBEDDINGS_BY_JUR: Dict[str, np.ndarray] = {}
_JUR_DOC_IDS: Dict[str, List[int]] = {}  # per-jurisdiction row -> global corpus index


def _try_init_embeddings() -> bool:
    """
    Attempt to load the BGE ONNX model (via fastembed) and build
    per-jurisdiction embedding matrices. Returns True on success. Any failure
    (missing packages, no internet to fetch the model from the Hugging Face
    Hub, corrupted cache, etc.) is caught broadly and logged — this must
    never crash startup; the TF-IDF path above is already fully built and
    ready to serve every request on its own.
    """
    global _EMBED_MODEL, _EMBEDDINGS_BY_JUR, _JUR_DOC_IDS

    if os.getenv("SUTRADHARA_DISABLE_EMBEDDINGS") == "1":
        logger.info("Embeddings backend disabled by SUTRADHARA_DISABLE_EMBEDDINGS. Using TF-IDF.")
        return False

    try:
        from fastembed import TextEmbedding
    except ImportError as e:
        logger.warning("Embeddings backend unavailable (missing package): %r. Using TF-IDF.", e)
        return False

    try:
        model = TextEmbedding(model_name=_EMBEDDING_MODEL_NAME)
        # No instruction prefix here — only queries get one (see module
        # docstring). `.embed()` returns a generator of 1D np.ndarrays.
        doc_embeddings = np.asarray(list(model.embed(_DOC_TEXTS)), dtype="float32")
        doc_embeddings = _l2_normalize(doc_embeddings)

        embeddings_by_jur: Dict[str, np.ndarray] = {}
        ids_by_jur: Dict[str, List[int]] = {}
        for jur in ("India", "International"):
            row_ids = [i for i, d in enumerate(_CORPUS) if d["jurisdiction"] == jur]
            if not row_ids:
                continue
            embeddings_by_jur[jur] = doc_embeddings[row_ids]
            ids_by_jur[jur] = row_ids

        _EMBED_MODEL = model
        _EMBEDDINGS_BY_JUR = embeddings_by_jur
        _JUR_DOC_IDS = ids_by_jur
        logger.info(
            "Embeddings backend ready: model=%s, documents=%s",
            _EMBEDDING_MODEL_NAME, {k: len(v) for k, v in embeddings_by_jur.items()},
        )
        return True
    except Exception as e:
        # Broad on purpose: covers no-internet model download failures
        # (OSError/HTTPError variants from huggingface_hub), corrupted local
        # cache, etc. — all of which mean "fall back",
        # none of which should be allowed to take the API down.
        logger.warning("Embeddings backend failed to initialize: %r. Falling back to TF-IDF.", e)
        return False


if _try_init_embeddings():
    BACKEND = "embeddings"


def _retrieve_embeddings(variants: List[str], jurisdiction: str, areas: List[str], top_k: int) -> List[Dict[str, Any]]:
    doc_embeddings = _EMBEDDINGS_BY_JUR.get(jurisdiction)
    row_ids = _JUR_DOC_IDS.get(jurisdiction)
    if doc_embeddings is None or not row_ids:
        return []

    # BGE instruction prefix goes on every query variant, never on documents
    # (see module docstring) — skipping this measurably hurts recall.
    prefixed_variants = [_BGE_QUERY_INSTRUCTION + v for v in variants]
    query_vecs = np.asarray(list(_EMBED_MODEL.embed(prefixed_variants)), dtype="float32")
    query_vecs = _l2_normalize(query_vecs)

    all_scores = query_vecs @ doc_embeddings.T

    # A document only needs to match one good phrasing of the question, not
    # every query variant.
    best_scores = all_scores.max(axis=0)

    scored = []
    for local_row, raw_sim in enumerate(best_scores):
        global_i = row_ids[local_row]
        doc = _CORPUS[global_i]
        raw_sim = float(raw_sim)
        score = raw_sim
        if doc["domain"] in areas and raw_sim > _EMB_DOMAIN_BOOST_GATE:
            score += _EMB_DOMAIN_BOOST
        scored.append((score, doc))

    scored.sort(key=lambda x: x[0], reverse=True)
    results = []
    for score, doc in scored[:top_k]:
        if score > _EMB_RELEVANCE_FLOOR:
            d = dict(doc)
            d["relevance_score"] = round(min(score, 0.99), 3)
            results.append(d)
    return results


def _retrieve_tfidf(variants: List[str], jurisdiction: str, areas: List[str], top_k: int) -> List[Dict[str, Any]]:
    # 1. Hard filter by jurisdiction — never mixed.
    candidate_idx = [i for i, d in enumerate(_CORPUS) if d["jurisdiction"] == jurisdiction]
    if not candidate_idx:
        return []

    query_vecs = _VECTORIZER.transform(variants)
    sims_per_variant = cosine_similarity(query_vecs, _DOC_MATRIX[candidate_idx])
    sims = sims_per_variant.max(axis=0)

    scored = []
    for local_i, global_i in enumerate(candidate_idx):
        doc = _CORPUS[global_i]
        raw_sim = float(sims[local_i])
        score = raw_sim
        # Only apply the domain-match boost when there is already some genuine
        # lexical relevance — otherwise a domain-only match on a completely
        # off-topic query (e.g. classifier fell back to a default category)
        # could push an irrelevant document above the retrieval threshold.
        if doc["domain"] in areas and raw_sim > _TFIDF_DOMAIN_BOOST_GATE:
            score += _TFIDF_DOMAIN_BOOST
        scored.append((score, doc))

    scored.sort(key=lambda x: x[0], reverse=True)
    results = []
    for score, doc in scored[:top_k]:
        if score > _TFIDF_RELEVANCE_FLOOR:
            d = dict(doc)
            d["relevance_score"] = round(min(score, 0.99), 3)
            results.append(d)
    return results


def retrieve(
    query: Union[str, List[str]],
    jurisdiction: str,
    areas: List[str],
    top_k: int = 5,
) -> List[Dict[str, Any]]:
    """
    `query` may be a single retrieval string, or a list of query-expansion
    variants (see query_expansion.py). Dispatches to the embeddings
    backend if it initialized successfully at import time, else to TF-IDF.
    Same return shape either way: List[dict] with a `relevance_score` field.
    """
    variants = query if isinstance(query, (list, tuple)) else [query]
    variants = [v for v in variants if v and v.strip()]
    if not variants:
        return []

    if BACKEND == "embeddings":
        return _retrieve_embeddings(variants, jurisdiction, areas, top_k)
    return _retrieve_tfidf(variants, jurisdiction, areas, top_k)
