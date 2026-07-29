
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import classNames from 'classnames';
import { FaMicrophone } from 'react-icons/fa';
import { type ChildRef } from '../TakeQuiz';
import { useEffect, useImperativeHandle } from 'react';

interface Props {
  content?: string | undefined;
  ref: React.Ref<ChildRef>;
  compact?: boolean; // render just the mic button (no status/transcript text), for inline use
  onTranscriptChange?: (transcript: string) => void; // report the live transcript to the parent
}

const SRNonContinuous = ({ ref, compact, onTranscriptChange }: Props) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Report the live transcript up to the parent (e.g. so it can be shown above the controls).
  useEffect(() => {
    onTranscriptChange?.(transcript);
  }, [transcript, onTranscriptChange]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  const getAnswer = () => {
    //console.log("SRNonContinuous: getAnswer called, transcript = ", transcript)
    return transcript
}
  useImperativeHandle(ref, () => ({
        getAnswer,
        resetTranscript,
      }));

  const handleClick = () => {
    //console.log("handleClick called, listening = ", listening)
    if (listening === false) {
        //console.log("Starting speech recognition..by calling startListening.")
        try {
            SpeechRecognition.startListening({
              language: "en-US",
            });
            //console.log("Speech recognition started successfully.");
          } catch (error) {
            console.error("Error starting speech recognition:", error);
          }
    }
    else {
        //console.log("Stopping speech recognition..by calling stopListening.")
        SpeechRecognition.stopListening()
    }

}

  // Compact mode: just the mic button, so it aligns inline with neighbouring controls.
  if (compact) {
    return (
      <button
        className={classNames(
          'text-white', 'p-2',
          (listening === false) && 'bg-green-700',
          (listening === true) && 'bg-red-700',
          'rounded-md'
        )}
        onClick={handleClick}
        title={listening ? 'Listening…' : 'Tap to speak'}
      >
        <FaMicrophone />
      </button>
    );
  }

  return (
    <div>

      { (listening === true) ? <p>Listening ...</p> : <p>&nbsp;</p>}
    
 <button  className={classNames(
                     'text-white',
                     'p-1 py-2',
                     (listening === false) && 'bg-green-700',
                     (listening === true) && 'bg-red-700',
                     'rounded-md'
                    )
                    }
                    onClick={handleClick}
                >
                    <div>
                    <FaMicrophone />
                    </div>
                </button>
      <p>{transcript}</p>
    </div>
  );
};
export default SRNonContinuous;