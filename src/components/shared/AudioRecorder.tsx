import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import {Visualizer } from 'react-sound-visualizer'
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AudioRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null); // State to store the audio stream for Visualizer
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [blob, setBlob] = useState<Blob | null>(null);

  const { name } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);


  const startRecording = async () => {
    try {
      // clear audio buffer before starting new recording
      audioChunks.current = [];
      // clear the blob state before starting new recording
      setBlob(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream); // Save the audio stream for the Visualizer
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm;codecs=opus' });
        setBlob(audioBlob); // Save the blob to state 
        //await sendToServer(audioBlob);
        audioChunks.current = []; // Reset for next time
      };

      mediaRecorder.current.start();
      setRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
    }
    if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop()); // Stop all tracks to release the microphone
        setAudioStream(null); // Clear the audio stream state
    }
    setRecording(false);
  };

  const sendToServer = async () => {
    const formData = new FormData();
    // 'audio' is the key Django will look for
    if (blob) {
        // get current timestamp to append to user name
        // convert to timestamp to local timezone
        const localTimestamp = new Date().toLocaleString().replace(/[:.]/g, '-');
        // replace slashes in local timestamp with dashes for filename compatibility\
        // also replace spaces and any commas with underscores 
        const sanitizedLocalTimestamp = localTimestamp.replace(/[\/\s,]+/g, '_');

        const filename = name + '_' + sanitizedLocalTimestamp + '.webm';
        //console.log("Generated filename for upload:", filename);
        formData.append('audio', blob, filename);
    }
    
    try {
      const baseURL = import.meta.env.VITE_API_URL;

      await fetch(`${baseURL}/api/upload-audio/`, {
        method: 'POST',
        body: formData,
      });
      // add a toast notification here to indicate successful upload
      toast.success('Okay!', {
        position: 'top-right',
        autoClose: 2000, // Auto close after 2 seconds
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

    } catch (error) {
      console.error('Error uploading audio:', error);
    }
    
  };

/*
  const sendToServer = async (blob: Blob) => {
    const formData = new FormData();
    // 'audio' is the key Django will look for
    formData.append('audio', blob, 'recording.webm');

    try {
      await fetch('http://localhost:8000/api/upload-audio/', {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.error('Error uploading audio:', error);
    }
  };
*/

  return (
    <div>
      <button
        className={`p-2 text-white rounded-md ${
          recording ? 'bg-red-500' : 'bg-green-600'
        }`}
        onClick={recording ? stopRecording : startRecording}
      >
        {recording ? 'Stop Recording' : 'Start Recording'}
      </button>
    
      <button
  className={`p-2 text-white rounded-md bg-blue-600 ml-2 ${
    recording || !blob ? 'opacity-50 cursor-not-allowed' : ''
  }`}
  onClick={() => blob && sendToServer()}
  disabled={recording || !blob} // Disable the button if recording is true or blob is null
>
  Upload
</button>

        {recording && audioStream && (
            <div className="mt-4">
                       <Visualizer audio={audioStream} autoStart={true} mode='current'>
                                        {({ canvasRef }) => (
                                            <>
                                                <canvas ref={canvasRef} width={150} height={70} />

                                            </>
                                        )}
                                    </Visualizer>
    
            </div>
        )}
                        {!recording && blob &&
                    <audio controls >
                        <source src={URL.createObjectURL(blob)} type="audio/webm" />
                    </audio>
                }
                <ToastContainer />
    </div>
  );
};

export default AudioRecorder;