import { useContext } from 'react'
import { TtSpeechContext } from '../context/azure'
import {
  SpeechSynthesizer, AudioConfig,
  SpeechSynthesisOutputFormat,
  SpeakerAudioDestination,
} from 'microsoft-cognitiveservices-speech-sdk';
import { FaPlayCircle } from "react-icons/fa";

interface MyProps {
    text: string | undefined;
  }
  
export const AzureAudioPlayer = (props: MyProps) => {

    const { ttSpeechConfig } = useContext(TtSpeechContext)
    //console.log("MMMMpppp", props.text)
    //const handleClick: MouseEventHandler<HTMLSpanElement> = (event) => {

    const playAudio = () => {
        //console.log(" call playAudio props text=", props.text)
        let player = new SpeakerAudioDestination()
        const audioConfig = AudioConfig.fromSpeakerOutput(player);

        //ttSpeechConfig.config.speechSynthesisVoiceName = "en-US-JaneNeural"
        ttSpeechConfig.config.speechSynthesisOutputFormat = SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3

        const synthesizer = new SpeechSynthesizer(ttSpeechConfig.config, audioConfig);
        //synthesizer.speakTextAsync(props.text!)
        
        /*
        const t = 
        `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
            <voice name="en-US-Steffan:DragonHDLatestNeural">
               <phoneme alphabet="ipa" ph="oʊ"> ago </phoneme>
            </voice>
        </speak>`
        */

        
                const t = 
        `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="en-US-JaneNeural">
          <prosody rate="-10.00%">
              ${props.text}
          </prosody>
        </voice>
        </speak>`
        
        /*
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" 
       xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
    <voice name="en-US-AriaNeural">
        Say <phoneme alphabet="ipa" ph="ˈtoʊˌmeɪtoʊ">tomato</phoneme> or use Arpabet like 
        <phoneme alphabet="x-microsoft-arpa" ph="T AH0 M EY1 T OW0">tomato</phoneme>.
    </voice>
</speak>
*/

        synthesizer.speakSsmlAsync(t)

    }

// <button className='bg-amber-600 p-1 text-white rounded-md hover:bg-amber-700' onClick={handleClick}>{props.text}</button>
    return (
        <>
           <FaPlayCircle onClick={playAudio} className='text-2xl m-3 bg-gray-100 hover:bg-green-400'/>
        </>
    )
}
/*
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
    <voice name="en-US-AvaNeural">
        <phoneme alphabet="ipa" ph="tə.ˈmeɪ.toʊ"> tomato </phoneme>
    </voice>
</speak>
*/