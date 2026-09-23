import { useRef, useState } from 'react';
import { FaMicrophone, FaArrowUp } from 'react-icons/fa';
import { Visualizer } from 'react-sound-visualizer';
import api from '../../api';

interface VoiceAnswerRecorderProps {
  // Called with the server-side transcript (+ S3 url + Vietnamese translation)
  // once recording is stopped and transcribed.
  onTranscribed: (text: string, audioUrl?: string, translation?: string) => void;
  userName: string; // used to name the S3 object (matches the backend's "<user>_..." convention)
  disabled?: boolean;
  highlight?: boolean; // pulse the mic to prompt the student to answer by voice
}

// Recordings shorter than this are treated as accidental blips: not uploaded/transcribed.
const MIN_RECORDING_MS = 1000;

/**
 * Records a short audio answer (getUserMedia + MediaRecorder, same technique as AudioRecorder),
 * then uploads it to the server which saves it to S3 AND transcribes it with Whisper in one call
 * (POST /api/transcribe-and-save/). The transcript (+ audio url) is reported via onTranscribed.
 */
const VoiceAnswerRecorder = ({ onTranscribed, userName, disabled, highlight }: VoiceAnswerRecorderProps) => {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [tooShort, setTooShort] = useState(false); // brief "too short" notice after a blip
  // Kept in state (not just a ref) so the Visualizer can render the live waveform while recording.
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  const startTimeRef = useRef<number>(0); // when the current recording started, to measure duration
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
      const res = await api.post<{ transcription: string; translation?: string; audio_url?: string }>(
        '/api/transcribe-and-save/',
        formData,
      );
      onTranscribed(res.data.transcription ?? '', res.data.audio_url, res.data.translation);
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
      setAudioStream(stream); // feed the visualizer
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => chunksRef.current.push(event.data);
      recorder.onstop = async () => {
        const durationMs = Date.now() - startTimeRef.current;
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        chunksRef.current = [];
        // release the microphone and stop the visualizer
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setAudioStream(null);
        // Guard against accidental blips: don't upload/transcribe a too-short recording.
        if (durationMs < MIN_RECORDING_MS) {
          setTooShort(true);
          setTimeout(() => setTooShort(false), 2500);
          return; // mic stays available so the student can re-record
        }
        await transcribe(blob);
      };

      recorder.start();
      startTimeRef.current = Date.now();
      setTooShort(false);
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
    <span className="flex items-center gap-1">
      <button
        type="button"
        onClick={recording ? stopRecording : startRecording}
        disabled={disabled || transcribing}
        title={recording ? 'Stop recording' : 'Record your answer'}
        aria-label={recording ? 'Stop recording' : 'Record your answer'}
        className={`p-2 rounded-md text-white ${recording ? 'bg-red-600' : 'bg-green-700'} ${
          disabled || transcribing ? 'opacity-50 cursor-not-allowed' : ''
        } ${highlight && !recording && !transcribing ? 'animate-pulse ring-2 ring-green-400 ring-offset-1' : ''}`}
      >
        {transcribing ? '…' : recording ? <FaArrowUp /> : <FaMicrophone />}
      </button>

      {/* Live waveform while recording (same Visualizer as AudioRecorder) */}
      {recording && audioStream && (
        <Visualizer audio={audioStream} autoStart mode="current">
          {({ canvasRef }) => <canvas ref={canvasRef} width={56} height={28} />}
        </Visualizer>
      )}

      {/* Brief notice when a recording was too short to send */}
      {tooShort && <span className="text-xs text-red-600">Too short</span>}
    </span>
  );
};

export default VoiceAnswerRecorder;
