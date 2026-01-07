import React, { useState, useEffect, useImperativeHandle } from 'react';

// Define the props type for the component
export interface CoundownTimerHandleProps {
  start: () => void;
  stop: () => void;
}

interface CountdownTimerProps {
  initialSeconds: number;
  onComplete: () => void;
  ref: React.Ref<CoundownTimerHandleProps>;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ initialSeconds, onComplete,  ref }) => {
  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(true);

  useEffect(() => {
    //alert("Initial seconds changed to " + initialSeconds);
    if (initialSeconds >= 0)
    setTimeLeft(initialSeconds);
  }, [initialSeconds]);

  useImperativeHandle(ref, () => ({
    start: () => {
      setIsRunning(true);
    },
    stop: () => {
      setIsRunning(false);
    },
  }));


  useEffect(() => {
    // Exit early if the timer is paused or has reached zero
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft === 0) {
        // Optional: Perform an action when the countdown finishes
        //console.log("Countdown finished!");
        onComplete && onComplete();
      }
      return;
    }

  
    // Set up the interval
    const intervalId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000); // Update every second

    // Cleanup function to clear the interval when the component unmounts
    // or when the dependencies (isRunning, timeLeft) change
    return () => clearInterval(intervalId);
  }, [isRunning, timeLeft]); // Rerun the effect if isRunning or timeLeft changes

  // Format time (e.g., 5 -> "05")
  const formatTime = (time: number): string => {
    return time < 10 ? `0${time}` : String(time);
  };

  //const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  //<span>{formatTime(minutes)}</span>:<span>{formatTime(seconds)}</span>
  /* keep this for reference later. kpham
    <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? 'Pause' : 'Start'}
      </button>
  */

  return (
    <div className="countdown-timer-container">
      <p>
        Time Remaining: 
        <span className='text-red-600 font-bold'> {formatTime(seconds)}</span><span> seconds.</span>
      </p>
  
    </div>
  );
};

export default CountdownTimer;
