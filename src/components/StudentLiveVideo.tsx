import { useState, useEffect } from 'react';
import CustomYoutubePlayer from './shared/CustomYoutubePlayer';

// Extract the 11-char YouTube video id from a URL (watch, youtu.be, embed, shorts).
// If the string is already just an id, return it as-is.
function extractVideoId(url: string): string {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([\w-]{11})/);
  return match ? match[1] : url;
}

interface StudentLiveVideoProps {
  videoUrl: string;        // full YouTube url pushed by the teacher
  onDismiss?: () => void;
}

// Shows a teacher-pushed YouTube video to the student. The video does NOT autoplay —
// the student must press Play (which drives CustomYoutubePlayer via a changing playKey).
export default function StudentLiveVideo({ videoUrl, onDismiss }: StudentLiveVideoProps) {
  const videoId = extractVideoId(videoUrl);
  // undefined => not requested yet (no autoplay). Each Play click bumps it to (re)start playback.
  const [playKey, setPlayKey] = useState<number | undefined>(undefined);

  // A new video url resets playback so the fresh video waits for the student to press Play.
  useEffect(() => {
    setPlayKey(undefined);
  }, [videoUrl]);

  if (!videoId) return null;

  return (
    <div className="flex flex-col items-center my-4">
      <CustomYoutubePlayer videoId={videoId} startTime={0} stopTime={0} playKey={playKey} maxWidth="640px" />
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => setPlayKey((k) => (k ?? 0) + 1)}
          className="px-5 py-2 rounded-md bg-green-600 hover:bg-green-800 text-white font-medium"
        >
          ▶ Play
        </button>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-800 text-white text-sm"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
