import { useEffect, useState } from "react";
import { FaPlayCircle } from "react-icons/fa";

interface Props {
  sentence: string;
}

function OpenAIStream({ sentence }: Props) {
  const [text, setText] = useState("");

  useEffect(() => {
    setText(sentence);
  }, [sentence]);

  //const url = '/api/text_to_speech_openai/';
  const playAudio = async () => {
     const token = localStorage.getItem("access");
     const baseURL = import.meta.env.VITE_API_URL
    const response = await fetch(`${baseURL}/api/text_to_speech_openai/`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.error("TTS request failed");
      return;
    }

    // Read response as a stream
    if (!response.body) {
      console.error("Response body is null");
      return;
    }
    const reader = response.body.getReader();
    const chunks = [];
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      if (value) chunks.push(value);
      done = readerDone;
    }

    // Concatenate all Uint8Array chunks
    const audioBlob = new Blob(chunks, { type: "audio/mpeg" });
    const audioUrl = URL.createObjectURL(audioBlob);

    const audio = new Audio(audioUrl);
    audio.play();
  };

  return (
    <div>
     
           <FaPlayCircle onClick={playAudio} className='text-2xl m-3 bg-gray-100 hover:bg-green-400'/>
     
    </div>
  );
}

export default OpenAIStream;