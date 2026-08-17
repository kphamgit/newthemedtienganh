import { type ReviewCard } from './SingleCardReview';

// Base url for the Azure TTS pronunciation clips ("<word>.mp3").
const TTS_BASE = 'https://kphamazureblobstore.blob.core.windows.net/tts-audio/';

// Read-only popup that just shows a word and its definition (used on repeat clicks of a marked
// word, after the audio plays — no self-rating, so it doesn't disturb the SM-2 schedule).
export default function DefinitionPopup({ card, autoPlay, audioMissing, surfaceWord, onClose }: { card: ReviewCard; autoPlay: boolean; audioMissing?: boolean; surfaceWord?: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-[26rem] max-w-[95vw] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-xl font-bold text-gray-800">{card.text}</span>
          {card.part_of_speech && (
            <span className="italic text-sm text-indigo-600">{card.part_of_speech}</span>
          )}
        </div>
        {/* Pronunciation audio — autoplays when the popup opens. */}
        <audio
          key={card.id}
          src={`${TTS_BASE}${card.text}.mp3`}
          autoPlay={autoPlay}
          controls
          className="w-full mb-3"
        />

        {audioMissing && (
          <p className="mb-3 text-center text-sm text-amber-700">
            🔇 There's no audio for the word "{surfaceWord}". Ask your teacher to create the audio.
          </p>
        )}

        <div className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-4 text-center">
          <span className="text-lg text-gray-800">{card.definition}</span>
        </div>
        {/* This popup only appears when the card is already in the student's review queue. */}
        <p className="mt-3 text-center text-sm text-green-700">
          ✓ This word is already in your review list — you'll review it when it's due.
        </p>
        <div className="flex justify-center mt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-md bg-gray-600 hover:bg-gray-800 text-white text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
