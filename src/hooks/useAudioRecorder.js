import { useCallback, useEffect, useRef, useState } from 'react';

/** Records microphone audio so learners can play back their own voice. */
export function useAudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const supported = typeof window !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia) && typeof window.MediaRecorder !== 'undefined';

  const cleanupStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const start = useCallback(async () => {
    if (!supported) return false;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const chunks = [];
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
        setAudioUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return URL.createObjectURL(blob);
        });
        cleanupStream();
        setRecording(false);
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      return true;
    } catch (err) {
      setError(err.name === 'NotAllowedError' ? 'not-allowed' : 'audio-capture');
      cleanupStream();
      return false;
    }
  }, [supported]);

  const stop = useCallback(() => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  }, []);

  useEffect(
    () => () => {
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      cleanupStream();
    },
    [],
  );

  return { supported, recording, audioUrl, error, start, stop };
}
