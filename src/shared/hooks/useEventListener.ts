import { useEffect, useRef } from 'react';

export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | HTMLElement | null = typeof window !== 'undefined' ? window : null
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!element || !element.addEventListener) return;

    const eventListener: typeof handler = (event) => savedHandler.current(event);
    element.addEventListener(eventName, eventListener as EventListener);

    return () => {
      element.removeEventListener(eventName, eventListener as EventListener);
    };
  }, [eventName, element]);
}
