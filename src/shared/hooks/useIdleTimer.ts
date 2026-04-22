import { useEffect, useRef } from 'react';

/**
 * Ejecuta `onIdle` si el usuario no interactúa en `timeoutMs` milisegundos.
 * Útil para volver a la pantalla de inicio en un kiosk.
 */
export function useIdleTimer(onIdle: () => void, timeoutMs = 60_000) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const reset = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(onIdle, timeoutMs);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [onIdle, timeoutMs]);
}
