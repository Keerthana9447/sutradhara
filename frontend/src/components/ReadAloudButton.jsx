import { useEffect, useRef, useState } from 'react'
import { Volume2, Square, Loader2 } from 'lucide-react'
import { api } from '../api'

const LOCALES = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  ml: 'ml-IN',
  sa: 'hi-IN',
}

// Backend voice synthesis (Bhashini / Sarvam Bulbul, app/asr.py) — Hindi,
// Telugu, Tamil, Malayalam and Sanskrit route through it: browsers rarely
// ship a usable voice for these, so the backend is a real fix there (see
// the long comment on speakInBrowser's mismatch problem below).
//
// English does NOT route through it. It was briefly included on the theory
// that "the backend has no language restriction, so there's no reason to
// exclude it" — but in practice Bhashini and Sarvam are both Indian-language
// TTS specialists, not general-purpose English voices, and routing English
// through them produced no working audio. Meanwhile every mainstream
// browser ships a reliable English voice natively, which is exactly the
// case speakInBrowser() already handles well. So English goes straight to
// the browser path; the backend is reserved for the five languages it
// actually improves on.
const BACKEND_TTS_LANGUAGES = new Set(['hi', 'te', 'ta', 'ml', 'sa'])

// TTSRequest caps text at 2500 chars server-side (app/schemas.py) — a
// longer answer skips the backend call entirely rather than sending a
// request that's guaranteed to fail.
const BACKEND_TTS_MAX_CHARS = 2500

// speechSynthesis.getVoices() can return an empty array on the very first
// call after page load — Chrome in particular loads voices asynchronously
// and fires 'voiceschanged' once they're ready. Calling speak() before that
// fires, or with no matching voice found, doesn't error — it just produces
// no audio at all. That silent-failure shape is exactly what made English
// and Sanskrit (the only two languages that ever reach speakInBrowser(),
// since every other language uses the backend voice above) sound "broken":
// there was no error to see, just nothing playing.
function getVoicesAsync() {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve([])
      return
    }
    const existing = window.speechSynthesis.getVoices()
    if (existing.length > 0) {
      resolve(existing)
      return
    }
    const onVoicesChanged = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged)
      resolve(window.speechSynthesis.getVoices())
    }
    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged)
    // Some browsers never fire voiceschanged if voices were already
    // available synchronously by the time this promise executor ran, or
    // never fire it at all in certain embedded webviews — don't wait
    // forever for an event that may not come.
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged)
      resolve(window.speechSynthesis.getVoices())
    }, 1000)
  })
}

// Picking a voice by exact locale (utterance.lang = 'en-IN') and leaving it
// to the browser to find a match is unreliable: plenty of systems ship
// only 'en-US' or 'en-GB', never 'en-IN', and some browsers silently
// produce no audio rather than substituting a close variant. Matching on
// just the language prefix ('en', 'hi', ...) against every installed
// voice's own lang is far more likely to find something real. Falls back
// to null (browser's own default voice) rather than failing outright if
// nothing matches the prefix either — some sound is better than none.
function resolveVoice(voices, langCode) {
  const prefix = (langCode || 'en').split('-')[0].toLowerCase()
  const exact = voices.find((v) => v.lang?.toLowerCase() === langCode?.toLowerCase())
  if (exact) return exact
  const byPrefix = voices.find((v) => v.lang?.toLowerCase().startsWith(prefix))
  return byPrefix || null
}

/**
 * Read Aloud.
 *
 * Hindi, Telugu, Tamil, Malayalam, and Sanskrit call the backend's
 * Bhashini/Sarvam text-to-speech (app/asr.py's synthesize()) first, instead
 * of relying solely on the browser's installed voices. Most desktop/mobile
 * browsers ship an English voice but no Telugu/Tamil/Malayalam voice; when
 * window.speechSynthesis can't find a matching voice for the requested
 * lang, it silently substitutes whatever default voice IS installed
 * (usually English) — which can't pronounce non-Latin script at all, but
 * still vocalizes the locale-independent digits it recognizes (e.g.
 * "1970"). That mismatch is what made Read Aloud sound like it was only
 * reading years: everything except the digits was being silently skipped
 * by a voice that was never the right one to begin with.
 *
 * English deliberately stays on the browser's own voice and does not call
 * the backend at all. It was briefly routed through the backend too, on
 * the assumption that since synthesize() has no server-side language
 * restriction, sending English through it would be strictly more
 * consistent than special-casing it. That assumption didn't hold up:
 * Bhashini and Sarvam are both built for Indian-language speech, and
 * neither produced usable English audio in practice, so English calls
 * through them just failed silently. Browsers, meanwhile, have shipped a
 * reliable English voice for decades — the exact opposite of the gap the
 * backend route exists to fix for the other five languages — so English
 * goes straight to speakInBrowser() (see resolveVoice() below for why that
 * path itself needed a separate fix). If the backend call for one of the
 * other five languages fails, isn't configured, or the text is too long
 * for it, this still falls back to the browser voice too — so a person
 * with no network still gets *something* rather than silence.
 */
export default function ReadAloudButton({ text, lang, copy }) {
  const [state, setState] = useState('idle') // idle | loading | speaking
  const audioRef = useRef(null)

  useEffect(() => {
    return () => stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  function stop() {
    window.speechSynthesis?.cancel()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setState('idle')
  }

  async function speakInBrowser() {
    if (!text || !window.speechSynthesis) {
      setState('idle')
      return
    }
    const targetLocale = LOCALES[lang] || 'en-IN'
    const voices = await getVoicesAsync()
    const voice = resolveVoice(voices, targetLocale)

    // Chrome fails silently on texts longer than ~200-250 characters.
    // Split into sentences to avoid this.
    const chunks = text.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [text]
    let chunkIndex = 0
    let isCancelled = false

    // Hijack audioRef to let stop() cancel our chunk loop
    audioRef.current = {
      pause: () => {
        isCancelled = true
        window.speechSynthesis.cancel()
      }
    }

    function speakNextChunk() {
      if (isCancelled || chunkIndex >= chunks.length) {
        setState('idle')
        audioRef.current = null
        return
      }

      const chunk = chunks[chunkIndex].trim()
      if (!chunk) {
        chunkIndex++
        speakNextChunk()
        return
      }

      const utterance = new SpeechSynthesisUtterance(chunk)
      utterance.lang = voice?.lang || targetLocale
      if (voice) utterance.voice = voice

      utterance.onstart = () => setState('speaking')
      utterance.onerror = () => {
        setState('idle')
        audioRef.current = null
      }
      utterance.onend = () => {
        chunkIndex++
        speakNextChunk()
      }

      window.speechSynthesis.speak(utterance)
    }

    speakNextChunk()
  }

  async function start() {
    if (!text) return
    stop()

    const useBackendVoice = BACKEND_TTS_LANGUAGES.has(lang) && text.length <= BACKEND_TTS_MAX_CHARS

    if (useBackendVoice) {
      setState('loading')
      try {
        const res = await api.synthesizeSpeech({ text, language: lang })
        const audio = new Audio(`data:audio/wav;base64,${res.audio_base64}`)
        audio.onplay = () => setState('speaking')
        audio.onended = () => setState('idle')
        audio.onerror = () => setState('idle')
        audioRef.current = audio
        await audio.play()
        return
      } catch {
        // Sarvam/Bhashini unavailable, unconfigured, or errored — fall
        // through to the browser voice below rather than leaving the
        // person with nothing.
      }
    }

    await speakInBrowser()
  }

  const speaking = state === 'speaking' || state === 'loading'
  const disabled = !text
  return (
    <button
      type="button"
      onClick={speaking ? stop : start}
      disabled={disabled}
      title={disabled ? copy.readAloudNoAnswer : speaking ? copy.readAloudStop : copy.readAloudStart}
      aria-pressed={speaking}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-md border transition-colors shrink-0 ${
        speaking
          ? 'border-gold bg-gold-light/20 text-gold-dark animate-pulse'
          : 'border-hairline text-green hover:bg-green-pale'
      } disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed`}
    >
      {state === 'loading' ? (
        <Loader2 size={16} className="animate-spin" />
      ) : speaking ? (
        <Square size={14} />
      ) : (
        <Volume2 size={16} />
      )}
    </button>
  )
}
