import { useEffect, useRef } from 'react';

export function useIdleTimer(onIdle: () => void, timeoutMs = 60_000, paused = false) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onIdleRef = useRef(onIdle);

  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  useEffect(() => {
    if (paused) {
      if (timer.current) clearTimeout(timer.current);
      return;
    }

    const reset = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => onIdleRef.current(), timeoutMs);
    };

    const passive = { passive: true } as const;
    window.addEventListener('mousemove', reset);
    window.addEventListener('mousedown', reset);
    window.addEventListener('keydown', reset);
    window.addEventListener('touchstart', reset, passive);
    window.addEventListener('scroll', reset, passive);
    reset();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      window.removeEventListener('mousemove', reset);
      window.removeEventListener('mousedown', reset);
      window.removeEventListener('keydown', reset);
      window.removeEventListener('touchstart', reset);
      window.removeEventListener('scroll', reset);
    };
  }, [timeoutMs, paused]);
}
