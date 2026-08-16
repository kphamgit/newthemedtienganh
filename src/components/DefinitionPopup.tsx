import { type ReviewCard } from './SingleCardReview';

// Read-only popup that just shows a word and its definition (used on repeat clicks of a marked
// word, after the audio plays — no self-rating, so it doesn't disturb the SM-2 schedule).
export default function DefinitionPopup({ card, onClose }: { card: ReviewCard; onClose: () => void }) {
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
        <div className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-4 text-center">
          <span className="text-lg text-gray-800">{card.definition}</span>
        </div>
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
