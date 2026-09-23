import { useRef, useState } from 'react'
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react'
import { api } from '../api'

/**
 * Voice input for the query box, using Sarvam Saaras through
 * the backend. The backend maps browser WebM/Opus and Ogg/Opus recordings to
 * the encodings expected by Google's API.
 */
const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/wav']

function pickSupportedMimeType() {
  if (typeof MediaRecorder === 'undefined') return null
  for (const type of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }
  return ''  // let the browser pick its own default
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result.split(',')[1] || '')
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export default function MicButton({ sourceLanguage, onTranscribed, asrConfigured, copy }) {
  const [state, setState] = useState('idle') // idle | recording | transcribing | error
  const [errorMsg, setErrorMsg] = useState('')
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)

  async function startRecording() {
    setErrorMsg('')
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setState('error')
      setErrorMsg(copy.micNotSupported)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeType = pickSupportedMimeType()
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = () => handleRecordingStop(mimeType)
      mediaRecorderRef.current = recorder
      recorder.start()
      setState('recording')
    } catch (e) {
      setState('error')
      setErrorMsg(copy.micPermissionDenied)
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    streamRef.current?.getTracks().forEach((t) => t.stop())
  }

  async function handleRecordingStop(mimeType) {
    setState('transcribing')
    try {
      const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
      const base64 = await blobToBase64(blob)
      // Strip codec suffix ("audio/webm;codecs=opus" -> "webm") -- the
      // backend just forwards this string to Bhashini's audioFormat field.
      const audioFormat = (mimeType || 'audio/webm').split('/')[1]?.split(';')[0] || 'webm'

      const result = await api.transcribeAudio({
        audio_base64: base64,
        source_language: sourceLanguage,
        audio_format: audioFormat,
        sampling_rate: 16000,
      })

      if (result.transcribed_ok) {
        onTranscribed(result.text)
        setState('idle')
      } else {
        setState('error')
        setErrorMsg(result.text)
      }
    } catch (e) {
      setState('error')
      setErrorMsg(copy.micTranscribeFailed)
    }
  }

  if (!asrConfigured) {
    return (
      <span
        title={copy.micUnavailableTooltip}
        className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-hairline text-ink/25 cursor-not-allowed shrink-0"
      >
        <Mic size={16} />
      </span>
    )
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={state === 'recording' ? stopRecording : startRecording}
        disabled={state === 'transcribing'}
        title={state === 'recording' ? copy.micStop : copy.micStart}
        className={`inline-flex items-center justify-center w-9 h-9 rounded-md border transition-colors shrink-0 ${
          state === 'recording'
            ? 'border-rust bg-rust/10 text-rust animate-pulse'
            : 'border-hairline text-green hover:bg-green-pale'
        } disabled:opacity-50`}
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
