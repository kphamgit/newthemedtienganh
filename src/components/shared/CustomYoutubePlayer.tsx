import { useEffect, useRef } from 'react';
import type { VideoSegment } from './types';

declare global {
  interface Window {
    // The YouTube IFrame API is loaded at runtime; typed loosely since @types/youtube isn't installed.
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface CustomYoutubePlayerProps {
  videoId: string;
  startTime?: number;  // seconds; where the current segment begins
  stopTime?: number;   // seconds; the video auto-pauses when it reaches this time (0 = no auto-stop)
  playKey?: number;    // change this value to (re)start playback of the current segment
  allVideoSegments?: VideoSegment[];
  onSegmentEnd?: () => void; // called once when the current segment reaches its stop time
}

export default function CustomYoutubePlayer({ videoId, startTime = 0, stopTime = 0, playKey, onSegmentEnd }: CustomYoutubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerHostRef = useRef<HTMLDivElement>(null); // absolute, full-size div the iframe mounts into
  const playerRef = useRef<any>(null);
  //const [isPlaying, setIsPlaying] = useState(false);
  //const [progress, setProgress] = useState(0);

  // Keep the latest segment bounds / callback in refs so the (once-only) player effect reads current values.
  const startTimeRef = useRef(startTime);
  const stopTimeRef = useRef(stopTime);
  const onSegmentEndRef = useRef(onSegmentEnd);
  startTimeRef.current = startTime;
  stopTimeRef.current = stopTime;
  onSegmentEndRef.current = onSegmentEnd;

  // Player readiness + a pending seek to apply once the player is ready.
  const readyRef = useRef(false);
  const pendingSeekRef = useRef<number | null>(null);
  // Guards onSegmentEnd so it fires only once per segment (not every interval tick).
  const segmentEndedRef = useRef(false);

  useEffect(() => {
    // 1. Load the YouTube IFrame API Script dynamically if not already present
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // 2. Define the global callback YouTube looks for
    window.onYouTubeIframeAPIReady = createPlayer;

    // If the API script is already loaded, instantiate immediately
    if (window.YT && window.YT.Player) {
      createPlayer();
    }

    function createPlayer() {
      // Create a div for YT to replace with the iframe, inside the absolute full-size host
      // so the iframe fills the 16:9 aspect box (instead of collapsing below the padding).
      const playerDiv = document.createElement('div');
      playerHostRef.current?.appendChild(playerDiv);

      playerRef.current = new window.YT.Player(playerDiv, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          controls: 0,          // Hide native YouTube controls completely
          disablekb: 1,         // Disable keyboard controls to prevent conflicts
          modestbranding: 1,    // Hide YouTube logo where possible
          rel: 0,               // Don't show related videos from other channels
          fs: 0,                // Disable native fullscreen button
        },
        events: {
          onReady: () => {
            readyRef.current = true;
            // If a segment was requested before the player finished loading, play it now.
            if (pendingSeekRef.current !== null) {
              playerRef.current.seekTo(pendingSeekRef.current, true);
              playerRef.current.playVideo();
              pendingSeekRef.current = null;
            }
          },
    
        },
      });
    }

    // 3. Track progress smoothly via an interval loop. Read the live player state (rather than
    //    the `isPlaying` state) so this effect doesn't need to depend on it — otherwise the
    //    player would be destroyed/recreated on every play/pause.
    const progressInterval = setInterval(() => {
      const player = playerRef.current;
      if (player && typeof player.getCurrentTime === 'function' && player.getPlayerState?.() === 1) {
        const currentTime = player.getCurrentTime();
        //const duration = player.getDuration();
        //if (duration > 0) {
          //setProgress((currentTime / duration) * 100);
        //}
        // Auto-pause once we reach the current segment's stop time, and notify the parent (once).
        if (stopTimeRef.current > 0 && currentTime >= stopTimeRef.current) {
          player.pauseVideo();
          if (!segmentEndedRef.current) {
            segmentEndedRef.current = true;
            onSegmentEndRef.current?.();
          }
        }
      }
    }, 250);

    // Cleanup when component unmounts
    return () => {
      clearInterval(progressInterval);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
      if (playerHostRef.current) {
        playerHostRef.current.innerHTML = '';
      }
    };
  }, [videoId]);

  // When a segment is requested (playKey changes), seek to its start and play.
  useEffect(() => {
    if (playKey === undefined) return; // no segment requested yet
    segmentEndedRef.current = false; // new segment: allow onSegmentEnd to fire again
    const player = playerRef.current;
    if (readyRef.current && player && typeof player.seekTo === 'function') {
      player.seekTo(startTimeRef.current, true);
      player.playVideo();
    } else {
      // Player not ready yet — remember the request; onReady will apply it.
      pendingSeekRef.current = startTimeRef.current;
    }
  }, [playKey]);

  // --- Control Handlers ---
  /*
  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };
*/

/*
  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    if (!playerRef.current) return;
    const newProgress = parseFloat(e.target.value);
    const duration = playerRef.current.getDuration();
    const newTime = (newProgress / 100) * duration;

    playerRef.current.seekTo(newTime, true);
    setProgress(newProgress);
  };
*/
  return (
    <div style={{ maxWidth: '640px', margin: 'auto' }}>
      {/* Aspect Ratio Video Container */}
      <div 
        ref={containerRef} 
        style={{ 
          position: 'relative', 
          width: '100%', 
          paddingTop: '56.25%', // 16:9 Aspect Ratio
          backgroundColor: '#000' 
        }}
        className="video-wrapper"
      >
        {/* The YouTube iframe injection-mounts inside here (fills the 16:9 box) */}
        <div ref={playerHostRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}

/*
  //* Custom Controls Panel UI 
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
  <button onClick={togglePlay} style={{ padding: '5px 15px' }}>
    {isPlaying ? 'Pause' : 'Play'}
  </button>

  <input 
    type="range" 
    min="0" 
    max="100" 
    step="0.1"
    value={progress} 
    onChange={handleSeek} 
    style={{ flexGrow: 1 }}
  />
</div>
*/
