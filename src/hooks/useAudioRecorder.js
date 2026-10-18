import { useCallback, useEffect, useRef, useState } from 'react';

/** Maps getUserMedia / MediaRecorder failures to the same codes speech recognition uses. */
function errorCode(err) {
  const name = err?.name;
  if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') return 'not-allowed';
  if (name === 'NotFoundError' || name === 'NotReadableError' || name === 'OverconstrainedError' || name === 'DevicesNotFoundError') return 'audio-capture';
  return 'audio-capture';
}

const ERROR_MESSAGES = {
  'not-allowed': 'Microphone access was blocked. Allow microphone access in your browser settings to record your voice.',
  'audio-capture': 'Your voice couldn’t be recorded. Check that a microphone is connected and not used by another app.',
};

const stopStream = (stream) => stream?.getTracks().forEach((t) => t.stop());

/**
 * Records microphone audio so learners can play back their own voice.
 *
 * `error` is null or a code string: 'not-allowed' (permission denied) or 'audio-capture'
 * (no/busy microphone or recorder failure). `errorMessage` is a friendly text for it.
 */
export function useAudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const urlRef = useRef(null);
  const mountedRef = useRef(true);
  const genRef = useRef(0); // bumped on every start() and on unmount
  const supported = typeof window !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia) && typeof window.MediaRecorder !== 'undefined';

  /** Stop the current recorder (without delivering its audio) and release the mic. */
  const teardown = () => {
    const rec = recorderRef.current;
    recorderRef.current = null;
    if (rec) {
      rec.ondataavailable = null;
      rec.onstop = null;
      try {
        if (rec.state !== 'inactive') rec.stop();
      } catch {
        /* ignore */
      }
    }
    stopStream(streamRef.current);
    streamRef.current = null;
  };

  const start = useCallback(async () => {
    if (!supported) return false;
    const gen = ++genRef.current;
    teardown();
    setError(null);
    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Unmounted, or a newer start() happened while we waited for permission.
      if (!mountedRef.current || gen !== genRef.current) {
        stopStream(stream);
        return false;
      }
      streamRef.current = stream;
      const chunks = [];
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = () => {
        stopStream(stream); // only this recorder's own stream
        if (streamRef.current === stream) streamRef.current = null;
        if (recorderRef.current === rec) recorderRef.current = null;
        if (!mountedRef.current || gen !== genRef.current) return;
        const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = url;
        setAudioUrl(url);
        setRecording(false);
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      return true;
    } catch (err) {
      stopStream(stream);
      if (streamRef.current === stream) streamRef.current = null;
      if (mountedRef.current && gen === genRef.current) {
        setError(errorCode(err));
        setRecording(false);
      }
      return false;
    }
  }, [supported]);

  const stop = useCallback(() => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      genRef.current += 1;
      teardown();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    };
  }, []);

  return { supported, recording, audioUrl, error, errorMessage: error ? ERROR_MESSAGES[error] : null, start, stop, clearError: () => setError(null) };
}
