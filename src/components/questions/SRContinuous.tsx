import { forwardRef, useEffect, useImperativeHandle } from 'react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import classNames from 'classnames';
import { FaMicrophone } from 'react-icons/fa';
import { type ChildRef } from '../TakeQuiz';

//FaMicrophoneSlash
//export function MySpeechRecognition(props:any) {
    interface Props {
        content: string | undefined;
      }
    
  
export const SRContinuous = forwardRef<ChildRef, Props>((props, ref) => {

        //const { startListening } = useSpeechRecognition();
//const [isHovered, setIsHovered] = useState(false);

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
        isMicrophoneAvailable
    } = useSpeechRecognition();
    
    const getAnswer = () => {
        console.log("getAnswer called, transcript = ", transcript)
        return transcript
    }

    useEffect(() => {
        return () => {
            // Code to run on component unmount
            SpeechRecognition.stopListening()
          };
    },[])

    useImperativeHandle(ref, () => ({
        getAnswer,
      }));

      const handleClick = () => {
        if (!listening) {
            SpeechRecognition.startListening({ continuous: true })
        }
        else {
            SpeechRecognition.stopListening()
        }

    }

    const reset_transcript = () => {
        resetTranscript()

    }

    if (!browserSupportsSpeechRecognition) {
        // Render some fallback content
        return (
            <div>Trình duyệt này không thể nhận giọng nói.</div>
        )
      }

      if (!isMicrophoneAvailable) {
        return (
            <div>Không thể dùng Microphone.</div>
        )
      }

      return (
        <>
        <div>{props.content}</div>
        {listening ? <p>Listening ...</p> : <p>&nbsp;</p>}
            <div className='flex flex-row'>
                <button  className={classNames(
                     'text-white',
                     'p-1',
                     !listening && 'bg-green-700',
                     listening && 'bg-red-700',
                     'rounded-md'
                    )
                    }
                    onClick={handleClick}
                >
                    <div>
                    <FaMicrophone />
                    </div>
                </button>
                <button className='bg-amber-500 rounded-md p-1 mx-2' onClick={reset_transcript}>
                    Reset
                </button>
            </div>
                   
            <p className='mt-2'>{transcript}</p>
        </>
    )

})

/*
       onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
*/
