import { type MouseEventHandler } from 'react'
//import { TtSpeechContext } from '../../contexts/azure';


export interface AzureButtonProps {
    voice_text?: string;
    button_text: string | undefined;
    parentFunc: (selected_text: string) => void
  }
  
export const AzureButton = (props: AzureButtonProps) => {

    //const { ttSpeechConfig } = useContext(TtSpeechContext)
    //console.log("in AzureButton", props)
    //const handleClick: MouseEventHandler<HTMLSpanElement> = (event) => {

    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
       
        const el = event.target as HTMLButtonElement
        console.log('in handle click text content', el.textContent)
        //playAudio()
        props.parentFunc(el.textContent!)
    }


    return (
        <>
            <button className='bg-amber-700 p-1 text-white rounded-md hover:bg-amber-900' onClick={handleClick}>{props.button_text}</button>
        </>
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
