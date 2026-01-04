import React, { useEffect, useImperativeHandle, useState } from 'react';

export interface CounterHandleRefProps {
    start: () => void;
    stop: () => void;
}   

interface CounterProps {
  duration: number; // Total duration in milliseconds
  onComplete: () => void; // Callback when the countdown completes
  ref? : React.RefObject<CounterHandleRefProps  | null>; // Optional ref to expose start method
}

const CounterSave: React.FC<CounterProps> = ({ duration, onComplete, ref }) => {

  const [remainingTime, setRemainingTime] = useState(duration);
  const [isRunning, setIsRunning] = useState(false); // Track if the counter is running

  useImperativeHandle(ref, () => ({
    start: () => {
      setRemainingTime(duration); // Reset the remaining time
      setIsRunning(true); // Start the counter
    }, 
    stop: () => {
      setIsRunning(false); // Stop the counter
    }
  }), [duration]);

  useEffect(() => {
    console.log(" Counter  useEffect duration", duration, " isRunning:", isRunning);
    let interval: ReturnType<typeof setInterval> | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    //let timeout

    if (isRunning) {
      // Start the interval to update the counter every 100ms
      interval = setInterval(() => {
        setRemainingTime((prev) => Math.max(prev - 100, 0)); // Decrease by 100ms
      }, 100);

      // Start the timeout to stop the counter and trigger onComplete
      timeout = setTimeout(() => {
        clearInterval(interval!); // Clear the interval when the countdown ends
        onComplete(); // Trigger the onComplete callback
        setIsRunning(false); // Stop the counter
      }, duration);
    }

    // Cleanup both interval and timeout on unmount or when isRunning changes
    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [isRunning, duration, onComplete]);

  //Time Remaining: {(remainingTime / 1000).toFixed(1)}s
  return (
    <div className="text-center text-lg font-bold">
        <div>In COUNTER: isRunning: {isRunning.toString()}</div>
        { remainingTime > 0 ?
      <div>
        Time Remaining: {remainingTime}
      </div>
      :
      <div>
      Time Remaining IS ZERO
    </div>
}
    </div>
  );
};

export default CounterSave;

/*
 return (
    <div className="text-center text-lg font-bold">
      <div>
        Time Remaining: {(remainingTime / 1000).toFixed(1)}s
      </div>
      {!isRunning && (
        <button
          onClick={handleStart}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Start
        </button>
      )}
    </div>
  );
*/
