import { useState } from "react";
import api from "../../api";

// kpham: this component is for testing the TTS API, not currently used in the app
function Azure_TTS() {

  const [text, setText] = useState("Hello, this is a test!");

  const playAudio = async () => {
    
     const url = '/api/text_to_speech_azure/';
     console.log("Calling AZURE TTS API url: ", url)
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
    

      /*
 useEffect(() => {

// Fetch the URL from your Django API first
    const playAudio = async () => {
    const friendlyName = "welcome message"; // This should match the name used in your Django view to generate the TTS audio
    const response = await fetch(`/api/text_speech_azure/?name=${friendlyName}`);
    const data = await response.json();
    
    // Use the URL returned (which points to the hashed file)
    const audio = new Audio(data.azure_url);
    audio.play();
  };
    playAudio();

    }, []);

      */


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

export default Azure_TTS;