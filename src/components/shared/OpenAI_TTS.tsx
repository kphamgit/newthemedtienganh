import { useState } from "react";
import api from "../../api";

function OpenAI_TTS() {
  const [text, setText] = useState("Hello, this is a test!");

  const playAudio = async () => {
    
     const url = '/api/text_to_speech_openai/';
     console.log("Calling TTS API url: ", url)
     api.post(url, { text }, { responseType: 'blob' })
      .then((response) => {
        const audioBlob = response.data;
        const audioUrl = URL.createObjectURL(audioBlob);
  
        const audio = new Audio(audioUrl);
        audio.play();
      })
      .catch((err) => {
        console.error("TTS request failed", err);
      });
    

    //http://localhost:8000
    
    /*
   try {
      const response = await fetch("http://localhost:8000/api/text_to_speech_openai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error("TTS request failed");

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audio.play();
    } catch (err) {
      console.error(err);
    }
    */


  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        cols={50}
      />
      <br />
      <button onClick={playAudio}>Play TTS</button>
    </div>
  );
}

export default OpenAI_TTS;