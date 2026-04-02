import { useState, useEffect, useRef } from 'react';

interface UseTestTimerProps {
  duration: number;
  isActive: boolean;
  onTimeUp: () => void;
}

export const useTestTimer = ({ duration, isActive, onTimeUp }: UseTestTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, onTimeUp]);

  return { timeLeft };
};