"""
Input-language detection + fallback query normalization.

This is the missing piece in the pipeline: previously `language` on
AnalyzeRequest only controlled *output* translation. The query text itself
was passed straight into classify()/route_areas()/retrieve(), all of which
only understand English keywords/tokens. For a Telugu query that meant a
guaranteed zero-relevance retrieval (see retrieval.py docstring for the
mechanism), regardless of how good the underlying corpus match actually was.

detect_language() looks at the query text itself (Unicode script), not a
UI toggle or browser locale, per the "use the actual query text" requirement.

fallback_normalize() is a small, explicit second line of defense: if the real
translator (translate.translate_to_english) is unavailable or fails, we still
want *some* English signal for retrieval rather than silently returning
nothing. It is intentionally tiny and is never used to author legal claims —
only to help the TF-IDF retriever match on domain terms.
"""
import re

_TELUGU_RANGE = re.compile(r"[\u0C00-\u0C7F]")


def detect_language(text: str) -> str:
    """Detect input language from the query text itself.

    Only Telugu vs. English is distinguished today (the two languages this
    prototype's corpus/UI supports) — this is a targeted fix, not a general
    language-ID model.
    """
    if text and _TELUGU_RANGE.search(text):
        return "te"
    return "en"


# Small, explicit term glossary — used ONLY as a fallback normalization
# strategy when live translation is unavailable (see main.py). NOT a
# replacement for real translation, and NOT applied to the corpus or to
# anything shown to the user.
TELUGU_TERM_MAP = {
    "పేటెంట్": "patent",
    "సాంప్రదాయ జ్ఞానం": "traditional knowledge",
    "ఆయుర్వేదం": "Ayurveda",
    "ఆయుర్వేద": "Ayurvedic",
    "శాస్త్రీయ": "classical",
    "ఫార్ములేషన్": "formulation",
    "జీవ వనరులు": "biological resources",
    "ప్రయోజన భాగస్వామ్యం": "access and benefit sharing",
    "గ్రంథం": "text",
    "సంప్రదాయ": "traditional",
}


def fallback_normalize(text: str) -> str:
    """Best-effort English gloss built by substring term substitution.

    Used only when the real translator call fails/is offline. Strips any
    remaining non-Latin characters afterward so leftover Telugu text can't
    silently zero out the TF-IDF tokenizer again.
    """
    out = text
    for te_term, en_term in TELUGU_TERM_MAP.items():
        out = out.replace(te_term, f" {en_term} ")
    out = re.sub(r"[^\x00-\x7F]+", " ", out)
    return re.sub(r"\s+", " ", out).strip()
