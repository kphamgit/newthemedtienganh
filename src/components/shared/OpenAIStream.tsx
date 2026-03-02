import { useEffect, useState } from "react";
import { FaPlayCircle } from "react-icons/fa";

import { ClipLoader } from "react-spinners";

interface Props {
  sentence: string;
}

function OpenAIStream({ sentence }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state

  useEffect(() => {
    setText(sentence);
  }, [sentence]);

  const playAudio = async () => {
    const token = localStorage.getItem("access");
    const baseURL = import.meta.env.VITE_API_URL;

    setLoading(true); // Set loading to true before the request

    try {
      const response = await fetch(`${baseURL}/api/text_to_speech_openai/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        console.error("TTS request failed");
        setLoading(false); // Set loading to false on error
        return;
      }

      if (!response.body) {
        console.error("Response body is null");
        setLoading(false); // Set loading to false on error
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

      const audioBlob = new Blob(chunks, { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error("Error during fetch:", error);
    } finally {
      setLoading(false); // Set loading to false after the request completes
    }
  };

  return (
    <div className="flex items-center justify-start">
      {/* Conditionally render loading indicator */}
      {loading ? (
        <ClipLoader color="#3498db" size={24} />
      ) : (
        <FaPlayCircle
          onClick={playAudio}
          className="text-2xl hover:bg-green-500 hover:rounded-full"
        />
      )}
    </div>
  );
}

export default OpenAIStream;