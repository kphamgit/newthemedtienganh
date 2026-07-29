import { useRef, useState } from 'react';
import { FaMicrophone, FaArrowUp } from 'react-icons/fa';
import api from '../../api';

interface VoiceAnswerRecorderProps {
  // Called with the server-side transcript (and S3 url) once recording is stopped and transcribed.
  onTranscribed: (text: string, audioUrl?: string) => void;
  userName: string; // used to name the S3 object (matches the backend's "<user>_..." convention)
  disabled?: boolean;
}

/**
 * Records a short audio answer (getUserMedia + MediaRecorder, same technique as AudioRecorder),
 * then uploads it to the server which saves it to S3 AND transcribes it with Whisper in one call
 * (POST /api/transcribe-and-save/). The transcript (+ audio url) is reported via onTranscribed.
 */
const VoiceAnswerRecorder = ({ onTranscribed, userName, disabled }: VoiceAnswerRecorderProps) => {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const transcribe = async (blob: Blob) => {
    setTranscribing(true);
    try {
      // Name the file "<user>_<timestamp>.webm" so the backend can attribute the S3 object.
      const timestamp = new Date().toLocaleString().replace(/[/\s,:.]+/g, '_');
      const filename = `${userName || 'anonymous'}_${timestamp}.webm`;
      const formData = new FormData();
      formData.append('audio', blob, filename);
      const res = await api.post<{ transcription: string; audio_url?: string }>(
        '/api/transcribe-and-save/',
        formData,
      );
      onTranscribed(res.data.transcription ?? '', res.data.audio_url);
    } catch (err) {
      console.error('VoiceAnswerRecorder: transcribe/save failed', err);
    } finally {
      setTranscribing(false);
    }
  };

  const startRecording = async () => {
    try {
      chunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => chunksRef.current.push(event.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        chunksRef.current = [];
        // release the microphone
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        await transcribe(blob);
      };

      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error('VoiceAnswerRecorder: could not access microphone', err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <button
      type="button"
      onClick={recording ? stopRecording : startRecording}
      disabled={disabled || transcribing}
      title={recording ? 'Stop recording' : 'Record your answer'}
      aria-label={recording ? 'Stop recording' : 'Record your answer'}
      className={`p-2 rounded-md text-white ${recording ? 'bg-red-600' : 'bg-green-700'} ${
        disabled || transcribing ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {transcribing ? '…' : recording ? <FaArrowUp /> : <FaMicrophone />}
    </button>
  );
};

export default VoiceAnswerRecorder;
