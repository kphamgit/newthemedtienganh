import React, { useEffect, useState } from 'react'
import {  MediaPlayer, MediaProvider, useMediaRemote, useMediaStore } from '@vidstack/react';
import { useWebSocket } from './context/WebSocketContext';
import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import type { VideoSegment, WebSocketMessageProps } from './shared/types';
import { motion } from 'framer-motion';
import airplane_chimeSound from '../assets/airplane-chime.mp3';

interface Props {
    videoUrl: string;
    allVideoSegments: VideoSegment[];
}

//function LiveVideoPlayer({ videoUrl, activeSegment }: Props) {
function LiveVideoPlayer({ videoUrl, allVideoSegments }: Props) {

    const {eventEmitter } = useWebSocket();
    const [activeSegment, setActiveSegment] = useState<VideoSegment | null>(null);
    const [stopTime, setStopTime] = useState<number | null>(null);
    //const { paused, started } = useMediaStore(playerRef);
    const chimeAduioRef = React.useRef<HTMLAudioElement | null>(null);
        const playerRef = React.useRef(null);
        const remote = useMediaRemote(playerRef);
        const { paused } = useMediaStore(playerRef);
  
        useEffect(() => {
            //console.log("LiveVideoPlayer: Received props - videoUrl =", videoUrl, " allVideoSegments =", allVideoSegments);
            setActiveSegment(allVideoSegments[0] || null); // Set the first segment as active on component loading
        }, [allVideoSegments]);

    const handleTimeUpdate = (event: any) => {
        const currentTime = event.currentTime;

        if (stopTime !== null && currentTime >= stopTime) {
            //console.log("TakeVideoQuiz: Current time has reached or exceeded stop time. Pausing and seeking back.");
            remote.pause();
            remote.seek(stopTime);
        }
        //console.log("TakeVideoQuiz: Time update event, currentTime =", currentTime);
    }

    useEffect(() => {
            chimeAduioRef.current = new Audio(airplane_chimeSound);
    }, []);

    useEffect(() => {
        // console.log("LiveVideoPlayer: activeSegment changed to segment number ", activeSegment?.segment_number);
        if (chimeAduioRef.current) {
            chimeAduioRef.current.play().catch((error) => {
                console.error("Error playing chime sound:", error);
            });
        }
    }, [activeSegment]); // Play chime sound whenever active segment changes
        
    useEffect(() => {
        const handleMessage = (data: WebSocketMessageProps) => {
            if (data.message_type === "video_segment_number") {
                // console.log("LiveVideoPlayer: Received video_segment_number message from server:", data);
                const new_segment_number = Number(data.content);
                const new_active_segment = allVideoSegments.find(segment => segment.segment_number === new_segment_number);
                //console.log("LiveVideoPlayer: Found new active segment based on segment number:", new_active_segment);
                if (new_active_segment) {
                    setActiveSegment(new_active_segment);
                    //console.log("LiveVideoPlayer: Updated active video segment to segment number ", new_active_segment.segment_number);
                }
                      toast.success('New Scene!', {
                                position: 'top-center',
                                autoClose: 2000, // Auto close after 2 seconds
                                hideProgressBar: true,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                              });
            }
        }
        // Subscribe to the "message" event
        eventEmitter?.on("message", handleMessage);
        // Cleanup the event listener on unmount
        return () => {
            eventEmitter?.off("message", handleMessage);
        };
    }, [eventEmitter, allVideoSegments]); // Only include eventEmitter in the dependency array

    const handlePlay = () => {
        //console.log("TakeVideoQuiz: handlePlay called. activeSegment =", activeSegment);
        if (!activeSegment) {
          console.error("Active segment is null");
          return;
        }
        const [minutes_start, seconds_start, milliseconds_start] = activeSegment.start_time.split(":").map(Number); // Split and convert to numbers
        const [minutes_end, seconds_end, milliseconds_end] = activeSegment.end_time.split(":").map(Number); // Split and convert to numbers
      
        const startTimeInSeconds = (minutes_start * 60 + seconds_start + milliseconds_start / 1000);
        const stopTimeInSeconds = (minutes_end * 60 + seconds_end + milliseconds_end / 1000);
      
        setStopTime(stopTimeInSeconds);
        remote.seek(startTimeInSeconds);
        remote.play();
    }

    return (
        <>
            {videoUrl && activeSegment &&
                <>
                    <div className="player-wrapper">
                        <div className="player-overlay"></div>
                        <div className='flex flex-col items-center justify-center'>
                            <div className="w-full max-w-[800px] aspect-video bg-blue-200 relative overflow-hidden rounded-lg">
                                <MediaPlayer
                                    ref={playerRef}
                                    src={videoUrl}
                                    aspectRatio="16/9"
                                    onTimeUpdate={(handleTimeUpdate)}
                                    className="w-full h-full relative 
              [&_[data-media-provider]]:!w-full [&_[data-media-provider]]:!h-full
              [&_video]:!w-full [&_video]:!h-full [&_video]:!object-cover
              [&_iframe]:!w-full [&_iframe]:!h-full [&_iframe]:!absolute"
                                >
                                    <MediaProvider>
                                    </MediaProvider>
                                </MediaPlayer>
                            </div>
                        </div>
                      

                    </div>

                    <div>
                        <div className="flex flex-row gap-2 mt-4 overflow-x-auto w-full max-w-[800px] px-2">
                        <div>
                            <button
                                onClick={() => (paused ? handlePlay() : remote?.pause())}
                                className="flex items-center gap-2 bg-blue-600 px-6 py-2 mt-3 text-white rounded-full hover:bg-blue-500 transition-colors"
                            >
                                {paused ? (
                                    <span>Play</span>
                                ) : (
                                    <span> Pause</span>
                                )}
                            </button>
                        </div>
                            {allVideoSegments.length > 0 &&
                                allVideoSegments.map((segment) => {
                                    const isActive = activeSegment.segment_number === segment.segment_number;

                                    return (
                                        <motion.div
                                            key={segment.segment_number}
                                            className={`mt-2 p-2 text-white rounded ${isActive ? "bg-green-600" : "bg-amber-500"
                                                }`}
                                            initial={{ scale: 1, opacity: 0.8 }}
                                            animate={isActive ? { scale: 1.2, opacity: 1 } : { scale: 1, opacity: 0.8 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {segment.segment_number}
                                        </motion.div>
                                    );
                                })}
                        </div>
                    </div>
                </>
            }
            <ToastContainer />
        </>
    )
}

export default LiveVideoPlayer