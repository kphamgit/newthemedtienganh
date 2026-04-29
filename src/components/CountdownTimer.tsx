import React, { useState, useEffect, useImperativeHandle } from 'react';

export interface CountdownTimerHandleProps {
  start: () => void;
  stop: () => void;
  reset: (newInitialSeconds: number) => void;
}

interface CountdownTimerProps {
  initialSeconds: number;
  onComplete: () => void;
  // In React 19, ref is a standard prop and doesn't require forwardRef
  ref?: React.Ref<CountdownTimerHandleProps>;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  initialSeconds, 
  onComplete, 
  ref 
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Sync state when initialSeconds changes (e.g., from a parent update)
  useEffect(() => {
    if (initialSeconds >= 0) {
      setTimeLeft(initialSeconds);
    }
  }, [initialSeconds]);

  // Expose methods to the parent via ref
  useImperativeHandle(ref, () => ({
    start: () => setIsRunning(true),
    stop: () => setIsRunning(false),
    reset: (newInitialSeconds: number) => {
      if (newInitialSeconds >= 0) {
        setTimeLeft(newInitialSeconds);
        setIsRunning(true);
      }
    },
  }));

  // Effect 1: The Ticking Mechanism
  // This only handles the math of counting down.
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, timeLeft]);

  // Effect 2: The Completion Watcher
  // This ensures onComplete is only called once when the threshold is crossed.
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false); // Stop the "engine" immediately
      onComplete?.();
    }
  }, [timeLeft, isRunning, onComplete]);

  const formatTime = (time: number): string => {
    return time < 10 ? `0${time}` : String(time);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="countdown-timer-container">
      <p>
        Time Remaining:
        <span className="text-red-600 font-bold"> {minutes > 0 ? `${minutes}:${formatTime(seconds)}` : formatTime(seconds)}</span>
        <span> {minutes > 0 ? '' : 'seconds.'}</span>
      </p>
    </div>
  );
};

export default CountdownTimer;