// biome-ignore lint/style/useImportType:
import React, { useState, useRef, useCallback, useEffect, useImperativeHandle, } from 'react';
////import screenfull from 'screenfull';
import './MyReactPlayer.css';

//import react-player/lib/players/YouTube

//import { version } from '../../../package.json';
import ReactPlayer from 'react-player';
//import Duration from './Duration';

export interface YoutubePlayerRefProps {
    playSegment: (startTime: string, endTime: string) => void;
}
interface Props {
    url: string;
    ref: React.Ref<YoutubePlayerRefProps>;
}

const YoutubePlayer = ({url, ref}: Props) => {
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const urlInputRef = useRef<HTMLInputElement | null>(null);

  const initialState = {
    src: undefined,
    pip: false,
    playing: false,
    controls: false,
    light: false,
    volume: 1,
    muted: false,
    played: 0,
    loaded: 0,
    duration: 0,
    playbackRate: 1.0,
    loop: false,
    seeking: false,
    loadedSeconds: 0,
    playedSeconds: 0,
    
  };

  type PlayerState = Omit<typeof initialState, 'src'> & {
    src?: string;
  };

  const [state, setState] = useState<PlayerState>(initialState);
  const [targetStopTime, setTargetStopTime] = useState<number | null>(37.345);

  useImperativeHandle(ref, () => ({
        playSegment(startTime: string, endTime: string) {
            //const start = parseFloat(startTime);
            console.log("playSegment called with", startTime, endTime);

            const [minutes_start, seconds_start, milliseconds_start] = startTime.split(":").map(Number); // Split and convert to numbers

            const [minutes_end, seconds_end, milliseconds_end] = endTime.split(":").map(Number); // Split and convert to numbers
            //console.log(" TEST minutes =", minutes, ' seconds =', seconds, ' milliseconds =', milliseconds);
            //console.log(" TEST time = ", (minutes * 60 + seconds) * 1000) // Calculate total seconds
            //console.log(" total seconds =", (minutes * 60 + seconds));
            // convert total seconds and milliseconds to a float value in seconds
            const startTimeInSeconds = (minutes_start * 60 + seconds_start + milliseconds_start / 1000);
            const stopTimeInSeconds = (minutes_end * 60 + seconds_end + milliseconds_end / 1000);
            // stopTimeInSeconds is a float value in seconds, such as 37.573, 1.245
            // this is to be consistent with player.currentTime in ReactPlayer
            console.log(" startTimeInSeconds =", startTimeInSeconds);
            console.log(" stopTimeInSeconds =", stopTimeInSeconds);
            setTargetStopTime(stopTimeInSeconds);
            if (playerRef.current) {
                playerRef.current.currentTime = startTimeInSeconds;
                playerRef.current.play();
            }
/*
 kpham addition
    const seekToTime = () => {
        //const player = playerRef.current;
        if (playerRef.current) {
        const seekTime = 25; // time in seconds to seek to
        playerRef.current.currentTime = seekTime;
        console.log(`Seeking to ${seekTime} seconds`);
        // play after seeking
        playerRef.current.play();
        }
    };
*/

        }
    }));

  useEffect(() => {
    if (!url) return;
    setState(prevState => ({ ...prevState, src: url }));
  }, [url]);


// kpham addition
    const seekToTime = () => {
        //const player = playerRef.current;
        if (playerRef.current) {
        const seekTime = 25; // time in seconds to seek to
        playerRef.current.currentTime = seekTime;
        console.log(`Seeking to ${seekTime} seconds`);
        // play after seeking
        playerRef.current.play();
        }
    };
 
// end kpham

  const handlePlayPause = () => {
    setState(prevState => ({ ...prevState, playing: !prevState.playing }));
  };

  const handleStop = () => {
    setState(prevState => ({ ...prevState, src: undefined, playing: false }));
  };

  const handleToggleControls = () => {
    setState(prevState => ({ ...prevState, controls: !prevState.controls }));
  };

  const handleRateChange = () => {
    const player = playerRef.current;
    if (!player) return;

    setState(prevState => ({ ...prevState, playbackRate: player.playbackRate }));
  };

  const handleTogglePIP = () => {
    setState(prevState => ({ ...prevState, pip: !prevState.pip }));
  };

  const handlePlay = () => {
    console.log('onPlay');
    setState(prevState => ({ ...prevState, playing: true }));
  };

  const handleEnterPictureInPicture = () => {
    console.log('onEnterPictureInPicture');
    setState(prevState => ({ ...prevState, pip: true }));
  };

  const handleLeavePictureInPicture = () => {
    console.log('onLeavePictureInPicture');
    setState(prevState => ({ ...prevState, pip: false }));
  };

  const handlePause = () => {
    console.log('onPause');
    setState(prevState => ({ ...prevState, playing: false }));
  };

  const handleProgress = () => {
    const player = playerRef.current;
    // We only want to update time slider if we are not currently seeking
    if (!player || state.seeking || !player.buffered?.length) return;

  
    setState(prevState => ({
      ...prevState,
      loadedSeconds: player.buffered?.end(player.buffered?.length - 1),
      loaded: player.buffered?.end(player.buffered?.length - 1) / player.duration,
    }));
  };

  const handleTimeUpdate = () => {
    const player = playerRef.current;
    // We only want to update time slider if we are not currently seeking
    if (!player || state.seeking) return;

    //console.log('onTimeUpdate current time', player.currentTime);

    if (!player.duration) return;

    //console.log('onProgress');
    //const currentTime = player.currentTime;
    //console.log('currentTime', currentTime);
   // console.log('targetStopTime', targetStopTime);

    if (targetStopTime && player.currentTime >= targetStopTime) {
        //console.log(`Reached target stop time of ${targetStopTime} seconds, pausing playback.`);
       player.pause();
        setState(prevState => ({ ...prevState, playing: false }));
    }

    // this block of code updates playedSeconds and played fraction
    // such as in a progress bar or time display
    // probably redundant with handleProgress above
    // so commenting out for now
    /*
    setState(prevState => ({
      ...prevState,
      playedSeconds: player.currentTime,
      played: player.currentTime / player.duration,
    }));
    */
  };

  const handleEnded = () => {
    //console.log('onEnded');
    setState(prevState => ({ ...prevState, playing: prevState.loop }));
  };

  const handleDurationChange = () => {
    const player = playerRef.current;
    if (!player) return;

    //console.log('onDurationChange', player.duration);
    setState(prevState => ({ ...prevState, duration: player.duration }));
  };

  //const handleClickFullscreen = () => {
    //const reactPlayer = document.querySelector('.react-player');
   // if (reactPlayer) screenfull.request(reactPlayer);
  //};

  const setPlayerRef = useCallback((player: HTMLVideoElement) => {
    if (!player) return;
    playerRef.current = player;
    console.log(player);
  }, []);

  const handleLoadCustomUrl = () => {
    if (urlInputRef.current?.value) {
      setState(prevState => ({ ...prevState, src: urlInputRef.current?.value }));
    }
  };

  const {
    src,
    playing,
    controls,
    light,
    volume,
    muted,
    loop,
    playbackRate,
    pip,
  } = state;



  return (
    <div>
      <section className="section">
        <h1>ReactPlayer Demo URL: {url}</h1>
        <div className="player-wrapper">
          <ReactPlayer
            ref={setPlayerRef}
            className="react-player"
            style={{ width: '100%', height: 'auto', aspectRatio: '16/9' }}
            src={src}
            pip={pip}
            playing={playing}
            controls={controls}
            light={light}
            loop={loop}
            playbackRate={playbackRate}
            volume={volume}
            muted={muted}
            config={{
              youtube: {
                color: 'white'
              },
              vimeo: {
                color: 'ffffff'
              },
              spotify: {
                preferVideo: true
              },
              tiktok: {
                fullscreen_button: true,
                progress_bar: true,
                play_button: true,
                volume_control: true,
                timestamp: false,
                music_info: false,
                description: false,
                rel: false,
                native_context_menu: true,
                closed_caption: false,
              }
            }}
            onLoadStart={() => console.log('onLoadStart')}
            onReady={() => console.log('onReady')}
            onStart={(e) => console.log('onStart', e)}
            onPlay={handlePlay}
            onEnterPictureInPicture={handleEnterPictureInPicture}
            onLeavePictureInPicture={handleLeavePictureInPicture}
            onPause={handlePause}
            onRateChange={handleRateChange}
            onSeeking={(e) => console.log('onSeeking', e)}
            onSeeked={(e) => console.log('onSeeked', e)}
            onEnded={handleEnded}
            onError={(e) => console.log('onError', e)}
            onTimeUpdate={handleTimeUpdate}
            onProgress={handleProgress}
            onDurationChange={handleDurationChange}
          />
        </div>

        <table>
          <tbody>
            <tr>
              <th>Controls</th>
              <td>
                <button type="button" onClick={handleStop}>
                  Stop
                </button>
                <button type="button" onClick={handlePlayPause}>
                  {playing ? 'Pause' : 'Play'}
                </button>
              
                {src && ReactPlayer.canEnablePIP?.(src) && (
                  <button type="button" onClick={handleTogglePIP}>
                    {pip ? 'Disable PiP' : 'Enable PiP'}
                  </button>
                )}
              </td>
            </tr>
      
            <tr>
              <th>
                <label htmlFor="controls">Controls</label>
              </th>
              <td>
                <input
                  id="controls"
                  type="checkbox"
                  checked={controls}
                  onChange={handleToggleControls}
                />
                <em>&nbsp; Requires player reload for some players</em>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
      <section className="section">
        <table>
          <tbody>
            <tr>
              <th>Custom</th>
              <td>
                <input
                  ref={urlInputRef}
                  type="text"
                  placeholder="Enter URL"
                />
                <button
                  type="button"
                  onClick={handleLoadCustomUrl}
                >
                  Load
                </button>
                <button
                  type="button"
                  onClick={seekToTime}
                >
                  Seek
                </button>
              </td>
            </tr>
          </tbody>
        </table>

      </section>
   
    </div>
  );
};

export default YoutubePlayer;