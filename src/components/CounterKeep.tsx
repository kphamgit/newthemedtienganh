import React, { useEffect, useImperativeHandle, useRef, useState } from "react";

export interface CounterHandleRefProps {
  start: () => void;
  stop: () => void;
}

interface CounterProps {
  duration: number; // Total duration in milliseconds
  onComplete: () => void; // Callback when the countdown completes
  ref?: React.RefObject<CounterHandleRefProps | null>; // Optional ref to expose start/stop methods
}

const CounterKeep: React.FC<CounterProps> = ({ duration, onComplete, ref }) => {
  const initialCount = Math.ceil(duration / 1000); // Convert milliseconds to seconds
  const [count, setCount] = useState(initialCount);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null); // To store the interval ID
  //useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentCountRef = useRef(initialCount); // To store the current count

  useImperativeHandle(ref, () => ({
    start: () => {
        //alert("Starting counter at count = " + initialCount);
      setCount(initialCount); // Reset the count
      currentCountRef.current = initialCount; // Reset the current count
      if (!intervalRef.current) {
        startInterval();
      }
    },
    stop: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current); // Clear the interval
        intervalRef.current = null; // Reset the interval reference
        alert(`Stopping counter at count = ${currentCountRef.current}`);
      }
    },
  }));

  const startInterval = () => {
    intervalRef.current = setInterval(() => {
      setCount((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(intervalRef.current!); // Stop the interval when count reaches 0
          intervalRef.current = null; // Reset the interval reference
          onComplete(); // Invoke the onComplete callback
          return 0;
        }
        currentCountRef.current = prevCount - 1; // Update the current count
        return prevCount - 1;
      });
    }, 1000); // 1000 milliseconds = 1 second
  };

  useEffect(() => {
    // Cleanup function to clear the interval when the component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div>
      <h2>Countdown Timer (setInterval): {count}</h2>
      {count === 0 && <p>Countdown finished!</p>}
    </div>
  );
};

export default CounterKeep;