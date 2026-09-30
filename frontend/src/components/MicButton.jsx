import { useEffect, useRef, useState } from 'react'
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react'
import { api } from '../api'

const LOCALES = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  ml: 'ml-IN',
  sa: 'hi-IN', // browser voice support for Sanskrit is inconsistent; Hindi is the closest fallback locale
}

function getRecognition() {
  if (typeof window === 'undefined') return null
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) return null
  return SpeechRecognition
}

function pickRecorderMimeType() {
  if (typeof MediaRecorder === 'undefined') return null
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || null
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve((reader.result || '').toString().split(',')[1] || '')
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Voice input.
 *
 * Every language — English, Hindi, Telugu, Tamil, Malayalam, and Sanskrit —
 * now tries the backend's Bhashini/Sarvam ASR (app/asr.py's transcribe())
 * first: it records the microphone with MediaRecorder and uploads the audio,
 * rather than relying on the browser's own live SpeechRecognition. This
 * used to be limited to Hindi/Telugu/Tamil/Malayalam only, with English and
 * Sanskrit going straight to the browser recognizer; the backend already
 * supports all six (see SUPPORTED_ASR_LANGUAGES server-side), so there was
 * no real reason to leave two languages on a different, less controllable
 * path.
 *
 * If the backend call fails for any reason — unconfigured, network error,
 * both Bhashini and Sarvam down — this falls back to the browser's own
 * SpeechRecognition (when available) rather than a dead error. Since the
 * backend path already consumed the first recording as a one-shot audio
 * upload, that recording can't be replayed into a live SpeechRecognition
 * session, so falling back means asking the person to speak again — a
 * worse experience than succeeding on the first try, but a strictly better
 * one than silence. If mic access itself was denied, there's no fallback
 * to attempt (both paths need the same microphone permission), so that
 * error surfaces directly instead.
 */
export default function MicButton({ sourceLanguage, onTranscribed, copy }) {
  const [state, setState] = useState('idle') // idle | recording | transcribing | error
  const [errorMsg, setErrorMsg] = useState('')
  const recognitionRef = useRef(null)
  const finalTextRef = useRef('')
  const mediaRecorderRef = useRef(null)
  const mediaChunksRef = useRef([])
  const mediaStreamRef = useRef(null)
  const activePathRef = useRef(null) // 'backend' | 'browser' — which path is actually running, for stop()

  const Recognition = getRecognition()
  const recorderSupported =
    typeof navigator !== 'undefined' && !!navigator.mediaDevices && pickRecorderMimeType() !== null
  const supported = recorderSupported || !!Recognition

  useEffect(
    () => () => {
      recognitionRef.current?.abort()
      mediaRecorderRef.current?.stop()
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop())
    },
    []
  )

  // ---- Browser SpeechRecognition path (fallback for every language) ----
  function startBrowserRecording() {
    activePathRef.current = 'browser'
    if (!Recognition) {
      setState('error')
      setErrorMsg(copy.micNotSupported)
      return
    }

    try {
      const recognition = new Recognition()
      recognition.lang = LOCALES[sourceLanguage] || 'en-IN'
      recognition.continuous = false
      recognition.interimResults = false
      recognition.maxAlternatives = 1
      finalTextRef.current = ''

      recognition.onstart = () => setState('recording')
      recognition.onresult = (event) => {
        const text = Array.from(event.results)
          .map((result) => result[0]?.transcript || '')
          .join(' ')
          .trim()
        finalTextRef.current = text
      }
      recognition.onerror = (event) => {
        const messages = {
          notallowed: copy.micPermissionDenied,
          'service-not-allowed': copy.micNotSupported,
          'audio-capture': copy.micNotSupported,
          network: copy.micTranscribeFailed,
        }
        setErrorMsg(messages[event.error] || copy.micTranscribeFailed)
        setState('error')
      }
      recognition.onend = () => {
        const text = finalTextRef.current
        if (text) {
          onTranscribed(text)
          setState('idle')
        } else if (state !== 'error') {
          setErrorMsg(copy.micTranscribeFailed)
          setState('error')
        }
        recognitionRef.current = null
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch {
      setState('error')
      setErrorMsg(copy.micTranscribeFailed)
    }
  }

  function stopBrowserRecording() {
    recognitionRef.current?.stop()
    setState('transcribing')
  }

  // ---- Backend Bhashini/Sarvam ASR path (primary, all 6 languages) ----
  async function startBackendRecording() {
    activePathRef.current = 'backend'
    if (!recorderSupported) {
      // No MediaRecorder/getUserMedia in this browser at all — try the
      // live recognizer instead of failing outright, if one exists.
      if (Recognition) {
        startBrowserRecording()
      } else {
        setState('error')
        setErrorMsg(copy.micNotSupported)
      }
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      const mimeType = pickRecorderMimeType() || ''
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaChunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) mediaChunksRef.current.push(e.data)
      }
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        mediaStreamRef.current = null
        setState('transcribing')
        try {
          const blob = new Blob(mediaChunksRef.current, { type: mimeType || 'audio/webm' })
          const audioBase64 = await blobToBase64(blob)
          const format = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm'
          const res = await api.transcribeAudio({
            audio_base64: audioBase64,
            source_language: sourceLanguage,
            audio_format: format,
            sampling_rate: 16000,
          })
          if (res.transcribed_ok && res.text) {
            onTranscribed(res.text)
            setState('idle')
            return
          }
        } catch {
          // Bhashini/Sarvam unavailable, unconfigured, or errored — fall
          // through to the browser fallback below rather than a dead error.
        }
        if (Recognition) {
          startBrowserRecording()
        } else {
          setErrorMsg(copy.micTranscribeFailed)
          setState('error')
        }
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setState('recording')
    } catch (err) {
      // Mic permission denied is a hard stop either way — browser
      // recognition needs the exact same permission, so there's nothing to
      // fall back to. Any other setup failure (e.g. no usable mimeType) is
      // still worth trying the browser path for.
      if (Recognition && err?.name !== 'NotAllowedError') {
        startBrowserRecording()
      } else {
        setState('error')
        setErrorMsg(err?.name === 'NotAllowedError' ? copy.micPermissionDenied : copy.micNotSupported)
      }
    }
  }

  function stopBackendRecording() {
    mediaRecorderRef.current?.stop()
  }

  function startRecording() {
    setErrorMsg('')
    if (recorderSupported) startBackendRecording()
    else if (Recognition) startBrowserRecording()
    else {
      setState('error')
      setErrorMsg(copy.micNotSupported)
    }
  }

  function stopRecording() {
    if (activePathRef.current === 'backend') stopBackendRecording()
    else stopBrowserRecording()
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={state === 'recording' ? stopRecording : startRecording}
        disabled={!supported || state === 'transcribing'}
        title={state === 'recording' ? copy.micStop : supported ? copy.micStart : copy.micUnavailableTooltip}
        className={`inline-flex items-center justify-center w-9 h-9 rounded-md border transition-colors shrink-0 ${
          state === 'recording'
            ? 'border-rust bg-rust/10 text-rust animate-pulse'
            : 'border-hairline text-green hover:bg-green-pale'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {state === 'transcribing' ? (
          <Loader2 size={16} className="animate-spin" />
        ) : state === 'recording' ? (
          <Square size={14} />
        ) : (
          <Mic size={16} />
        )}
      </button>
      {state === 'error' && errorMsg && (
        <span className="inline-flex items-center gap-1 text-xs text-rust max-w-[220px]">
          <AlertCircle size={12} className="shrink-0" />
          {errorMsg}
        </span>
      )}
    </div>
  )
}
