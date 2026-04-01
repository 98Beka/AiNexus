import { useState, useEffect, useRef, useCallback, RefObject } from 'react';

export function useDraggable(popupRef: RefObject<HTMLDivElement>, initialWidth: number) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Установка начальной позиции
  useEffect(() => {
    const update = () => setPos({ x: window.innerWidth - initialWidth - 16, y: 16 });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [initialWidth]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    dragging.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  }, [pos]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    dragging.current = true;
    dragOffset.current = { x: e.touches[0].clientX - pos.x, y: e.touches[0].clientY - pos.y };
  }, [pos]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !popupRef.current) return;
      setPos({
        x: Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - popupRef.current.offsetWidth)),
        y: Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - popupRef.current.offsetHeight)),
      });
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current || !popupRef.current) return;
      setPos({
        x: Math.max(0, Math.min(e.touches[0].clientX - dragOffset.current.x, window.innerWidth - popupRef.current.offsetWidth)),
        y: Math.max(0, Math.min(e.touches[0].clientY - dragOffset.current.y, window.innerHeight - popupRef.current.offsetHeight)),
      });
    };

    const onEnd = () => { dragging.current = false; };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [popupRef]);

  return { pos, onMouseDown, onTouchStart };
}