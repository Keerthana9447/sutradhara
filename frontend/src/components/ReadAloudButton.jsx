import { useEffect, useRef, useState } from 'react'
import { Volume2, Square, Loader2 } from 'lucide-react'
import { api } from '../api'

/**
 * "Read answer aloud" using Sarvam Bulbul v3 audio from the backend.
 */
export default function ReadAloudButton({ text, lang, copy }) {
  const [speaking, setSpeaking] = useState(false)
  const [loading, setLoading] = useState(false)
  const audioRef = useRef(null)

  // Stop any in-flight speech if the answer text changes or the component
  // unmounts (e.g. navigating away mid-sentence) — never leave a stray
  // utterance talking over a new one.
  useEffect(() => {
    return () => {
      audioRef.current?.pause()
    }
  }, [text])

  function stop() {
    audioRef.current?.pause()
    setSpeaking(false)
  }

  async function start() {
    if (!text || loading) return
    setLoading(true)
    try {
      const result = await api.synthesizeSpeech({ text, language: lang, speaker: 'shubh' })
      const audio = new Audio(`data:audio/wav;base64,${result.audio_base64}`)
      audio.onended = () => setSpeaking(false)
      audio.onerror = () => setSpeaking(false)
      audioRef.current = audio
      await audio.play()
      setSpeaking(true)
    } catch {
      setSpeaking(false)
    } finally {
      setLoading(false)
    }
  }

  const disabled = !text || loading
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
      {loading ? <Loader2 size={16} className="animate-spin" /> : speaking ? <Square size={14} /> : <Volume2 size={16} />}
    </button>
  )
}
