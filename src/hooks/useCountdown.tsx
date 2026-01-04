import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * A custom hook to manage a countdown timer with start, stop, and onComplete functionality.
 * @param initialSeconds The initial number of seconds to count down from.
 * @param onCompleteCallback A function to call when the countdown reaches zero.
 */
const useCountdown = (initialSeconds: number, onCompleteCallback: () => void) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  // Use a ref to store the interval ID to access it across re-renders and clear it.
  //const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Function to stop the timer
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsRunning(false);
    }
  }, []);

  // Function to start the timer
  const start = useCallback(() => {
    if (!isRunning && seconds > 0) {
      setIsRunning(true);
      // Using setInterval for recurring decrements
      intervalRef.current = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds - 1);
      }, 1000);
    }
  }, [isRunning, seconds]);

  // Effect to handle the countdown logic and completion
  useEffect(() => {
    if (seconds === 0) {
      stop(); // Stop the timer when it reaches zero
      // Using setTimeout to call the onComplete callback after a slight delay
      // or simply immediately after stopping. Immediate is fine here.
      onCompleteCallback();
    }
  }, [seconds, stop, onCompleteCallback]);

  // Cleanup function for when the component unmounts
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Function to reset the counter to its initial value
  const reset = useCallback(() => {
    stop();
    setSeconds(initialSeconds);
  }, [initialSeconds, stop]);

  return { seconds, isRunning, start, stop, reset };
};



export default useCountdown;
