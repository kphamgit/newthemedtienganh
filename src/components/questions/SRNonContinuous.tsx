
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import classNames from 'classnames';
import { FaMicrophone } from 'react-icons/fa';
import { type ChildRef } from '../TakeQuiz';
import { useImperativeHandle } from 'react';

interface Props {
  content?: string | undefined;
  ref: React.Ref<ChildRef>;
}

const SRNonContinuous = ({ ref }: Props) => {
  const {
    transcript,
    listening,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  const getAnswer = () => {
    console.log("getAnswer called, transcript = ", transcript)
    return transcript
}
  useImperativeHandle(ref, () => ({
        getAnswer,
      }));

  const handleClick = () => {
    console.log("handleClick called, listening = ", listening)
    if (listening === false) {
        console.log("Starting speech recognition..by calling startListening.")
        try {
            SpeechRecognition.startListening({
              language: "en-US",
            });
            console.log("Speech recognition started successfully.");
          } catch (error) {
            console.error("Error starting speech recognition:", error);
          }
    }
    else {
        console.log("Stopping speech recognition..by calling stopListening.")
        SpeechRecognition.stopListening()
    }

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