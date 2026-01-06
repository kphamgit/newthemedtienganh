import { type MouseEventHandler, useEffect, useRef, useState } from 'react'
//import { TtSpeechContext } from '../../contexts/azure';

/*
import {
  SpeechSynthesizer, AudioConfig,
  SpeechSynthesisOutputFormat,
  SpeakerAudioDestination,
} from 'microsoft-cognitiveservices-speech-sdk';
import { DOMRectPropsType } from '../quiz_attempts/question_attempts/ButtonSelecCloze';
*/

export type DOMRectPropsType = {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type DroppedBoxInfo = {
  droppedBoxId: string | undefined,
  rect: DOMRectPropsType | undefined
}
export interface AzureButtonProps {
    id: string;
    voice_text?: string;
    button_text: string | undefined;
    //dropBoxes?: DropBoxProps[] | undefined;
    parentFunc: (selectedAnimatedButtonId: string, selected_text: string) => DroppedBoxInfo
    parentFunc1: (width: number) => void  // called after components finished mounting to inform parent of my width
    parentFuncResetDropBox: (dropBoxId: string) => void
  }
  
export const AnimatedButton = (props: AzureButtonProps) => {
    //const { ttSpeechConfig } = useContext(TtSpeechContext)
    //console.log("in AzureButton", props)
      const buttonRef = useRef<HTMLButtonElement>(null);

      // the id of the drop box where this Animated Button is dropped onto
      const [droppedBoxId, setDroppedBoxId] = useState<string | undefined>(); // >=0 means dropped
    
      const [myRect, setMyRect] = useState<DOMRect | null>(null);
  
      const clickCount = useRef<number>(0);
 
      //const [dynamicVerticalOffsets, setDynamicVerticalOffsets] = useState<number[]>([]);
      //const [dynamicHorizontalOffsets, setDynamicHorizontalOffsets] = useState<number[]>([]);

      const [isClicked, setIsClicked] = useState<boolean>(false);

      useEffect(() => {
       // console.log("in AzureAnimatedButton useEffect button Bounding Rectangle =", buttonRef.current!.getBoundingClientRect());
        setMyRect(buttonRef.current!.getBoundingClientRect());        
      }, []); // Run once on mount 
     
      useEffect(() => {
        if (myRect) {
          props.parentFunc1(myRect.width);  //now that I got my reactangle, let inform parent of my width
        }
      }, [myRect, props]);
  
      const handleClick: MouseEventHandler<HTMLButtonElement> = () => {
          // increment click count
          clickCount.current += 1;
          
          // click count is even means button is being reset to original position
          if (clickCount.current % 2 === 0) {
            // reset button position
            if (buttonRef.current) {
              buttonRef.current.style.transform = `translate(0px, 0px)`;
            }
            // call parent function to clear corresponding drop box for this animated button
            if (droppedBoxId) {
              console.log("in AzureAnimatedButton handleClick: resetting drop box id =", droppedBoxId);
              props.parentFuncResetDropBox(droppedBoxId);
            }
            else {
              console.warn("in AzureAnimatedButton handleClick: droppedBoxId is undefined during reset");
            }
            return;
          }
          
          //const dropBoxRect: DOMRectPropsType | undefined = props.parentFunc( props.id, props.button_text!);
          const droppedBoxInfo: DroppedBoxInfo = props.parentFunc( props.id, props.button_text!);
          //droppedBoxId: availableDropBox?.id, rect: availableDropBox?.rect };
          if (buttonRef.current && droppedBoxInfo.rect) {
            setDroppedBoxId(droppedBoxInfo.droppedBoxId ? droppedBoxInfo.droppedBoxId : undefined);
            //console.log("in **** AzureAnimatedButton handleClick NO Picture, received dropBoxRect =", droppedBoxInfo.rect);
            //console.log("in **** AzureAnimatedButton handleClick NO Picture, buttonRef rec =", buttonRef.current.getBoundingClientRect());
            const dropBoxRect = droppedBoxInfo.rect;
            // the assumption is that animated button's width is always smaller than dropbox width
            // get the difference and divide by 2 to establish the x margin to center the button in the dropbox
            const margin_x = (dropBoxRect.width - buttonRef.current.getBoundingClientRect().width) / 2;
          const x_diff = dropBoxRect.x - buttonRef.current.getBoundingClientRect().x;

          const margin_y = (dropBoxRect.height - buttonRef.current.getBoundingClientRect().height) / 2;
          
          const y_diff = dropBoxRect.y - buttonRef.current.getBoundingClientRect().y;
          buttonRef.current.style.transform = `translate(${x_diff + margin_x}px,  ${y_diff + margin_y}px)`;
          }
      }

    return (
      <button
      ref={buttonRef}
      className={`bg-blue-300 px-2 text-black rounded-md ${
        isClicked ? "" : "hover:bg-blue-200"
      }`}
      onClick={(e) => {
        setIsClicked(true); // Set isClicked to true when the button is clicked
        handleClick(e); // Call the existing handleClick function
      }}
      style={{
        transition: "transform 0.3s ease-in-out", // Smooth animation
      }}
    >
      {props.button_text}
    </button> 
  )
}


/*
  let player = new SpeakerAudioDestination()
        const audioConfig = AudioConfig.fromSpeakerOutput(player);

        //ttSpeechConfig.config.speechSynthesisVoiceName = "en-US-JaneNeural"
        ttSpeechConfig.config.speechSynthesisOutputFormat = SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3

        const synthesizer = new SpeechSynthesizer(ttSpeechConfig.config, audioConfig);
        //synthesizer.speakTextAsync(props.text!)
        const t = 
        `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
            <voice name="en-US-AvaNeural">
            <phoneme alphabet="ipa" ph="ə."> tomato </phoneme>
            </voice>
        </speak>`

        /*
        const t = 
        `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="en-US-JaneNeural">
          <prosody rate="-10.00%">
              ${props.text}
          </prosody>
        </voice>
        </speak>`
        */
        //synthesizer.speakSsmlAsync(t)
