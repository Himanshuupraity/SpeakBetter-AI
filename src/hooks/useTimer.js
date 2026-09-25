import { useEffect, useRef, useState } from 'react';

/** Counts seconds while `running` is true. */
export function useTimer(running) {
  const [seconds, setSeconds] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!running) return undefined;
    ref.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(ref.current);
  }, [running]);
  return [seconds, setSeconds];
}
