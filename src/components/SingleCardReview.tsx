import { useState } from 'react';
import api from '../api';

export interface ReviewCard {
  id: number;
  text: string;            // front (the word)
  definition: string;      // back (revealed after recall)
  part_of_speech?: string; // e.g. "verb", "noun"
}

// Self-rating buttons → SM-2 quality (same mapping as CardReview).
const RATINGS: { label: string; quality: number; className: string }[] = [
  { label: 'I know it very well', quality: 5, className: 'bg-green-600 hover:bg-green-700' },
  { label: 'Knew it, but with difficulty', quality: 4, className: 'bg-blue-600 hover:bg-blue-700' },
  { label: 'I vaguely remember it', quality: 2, className: 'bg-yellow-500 hover:bg-yellow-600' },
  { label: "I don't know it at all", quality: 0, className: 'bg-red-600 hover:bg-red-700' },
];

// Review one card right away (shown when the student clicks a marked word). Reveals the
// definition on demand and records an SM-2 grade, then closes.
export default function SingleCardReview({
  card,
  userName,
  onClose,
}: {
  card: ReviewCard;
  userName: string;
  onClose: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleRate = async (quality: number) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.post(`/api/cards/${card.id}/review/`, { user_name: userName, quality });
    } catch (err) {
      console.error('Error submitting card review:', err);
    } finally {
      setSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-[28rem] max-w-[95vw] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-gray-800">Do you know this word?</h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-800">✕</button>
        </div>

        {/* Front: the word (with its part of speech) */}
        <div className="w-full min-h-16 flex items-center justify-center gap-2 bg-white border-2 border-gray-300 rounded-xl shadow p-3 mb-4">
          <span className="text-xl font-bold text-gray-800">{card.text}</span>
          {card.part_of_speech && (
            <span className="italic text-sm text-indigo-600">{card.part_of_speech}</span>
          )}
        </div>

        {!revealed ? (
          <div className="flex justify-center">
            <button
              onClick={() => setRevealed(true)}
              className="px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium"
            >
              Show definition
            </button>
          </div>
        ) : (
          <>
            {/* Back: the definition */}
            <div className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-5 mb-5 text-center">
              <span className="text-lg text-gray-800">{card.definition}</span>
            </div>

            {/* Self-rating */}
            <p className="text-sm text-gray-500 mb-2">How well did you know it?</p>
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RATINGS.map((r) => (
                <button
                  key={r.quality}
                  disabled={submitting}
                  onClick={() => handleRate(r.quality)}
                  className={`px-4 py-3 rounded-lg text-white font-medium disabled:opacity-50 ${r.className}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
