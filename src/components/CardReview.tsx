import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../api';

// Base url for the Azure TTS pronunciation clips ("<word>.mp3").
const TTS_BASE = 'https://kphamazureblobstore.blob.core.windows.net/tts-audio/';

interface DueCard {
  id: number;
  text: string;            // front (the word)
  definition: string;      // back (revealed after recall)
  part_of_speech?: string; // e.g. "verb", "noun"
}

interface CardReviewProps {
  userName: string;
  onComplete: () => void;
}

// Self-rating buttons → SM-2 quality. apply_sm2 treats quality < 4 as a lapse
// (interval resets to 1 day) and only adjusts easiness when quality >= 4.
const RATINGS: { label: string; quality: number; className: string }[] = [
  { label: 'I know it very well', quality: 5, className: 'bg-green-600 hover:bg-green-700' },
  { label: 'Knew it, but with difficulty', quality: 4, className: 'bg-blue-600 hover:bg-blue-700' },
  { label: 'I vaguely remember it', quality: 2, className: 'bg-yellow-500 hover:bg-yellow-600' },
  { label: "I don't know it at all", quality: 0, className: 'bg-red-600 hover:bg-red-700' },
];

export default function CardReview({ userName, onComplete }: CardReviewProps) {
  const [cards, setCards] = useState<DueCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);   // definition shown, rating buttons available
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Cards are universal vocabulary; review all cards due for this user.
    api.get('/api/cards/due/', { params: { user_name: userName } })
      .then((res) => {
        const due: DueCard[] = res.data.due_cards ?? [];
        setCards(due);
        setLoading(false);
        // With no due cards we keep the view mounted to show a "nothing due" message.
      })
      .catch((err) => {
        console.error('Error fetching due cards:', err);
        setLoading(false);
      });
  }, [userName]);

  const submitReview = async (cardId: number, quality: number) => {
    setSubmitting(true);
    try {
      await api.post(`/api/cards/${cardId}/review/`, { user_name: userName, quality });
    } catch (err) {
      console.error('Error submitting card review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // User self-rated their recall: record the SM-2 grade and move on.
  const handleRate = async (quality: number) => {
    if (submitting) return;
    const card = cards[index];
    await submitReview(card.id, quality);
    if (index + 1 >= cards.length) {
      onComplete();
    } else {
      setRevealed(false);
      setIndex((i) => i + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
        <p className="mt-4 text-amber-800 font-medium">Loading cards...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 p-6">
        <p className="text-lg text-gray-700">🎉 No vocabulary due for review right now.</p>
        <button
          onClick={onComplete}
          className="mt-6 px-6 py-2 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-medium"
        >
          Close
        </button>
      </div>
    );
  }

  const card = cards[index];

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-6">
      <div className="w-full flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">CardReview: Do you know this word?</h2>
        <span className="text-sm text-gray-500">{index + 1} / {cards.length}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={card.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.4 } }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className="w-full flex flex-col items-center"
        >
          {/* Front: the word (with its part of speech) */}
          <div className="w-full min-h-16 flex items-center justify-center gap-2 bg-white border-2 border-gray-300 rounded-xl shadow-lg p-3 mb-3">
            <span className="text-xl font-bold text-gray-800">{card.text}</span>
            {card.part_of_speech && (
              <span className="italic text-sm text-indigo-600">{card.part_of_speech}</span>
            )}
          </div>

          {/* Pronunciation audio — autoplays when each card is shown (key remounts it per card). */}
          <audio
            key={card.id}
            src={`${TTS_BASE}${card.text}.mp3`}
            autoPlay
            controls
            className="w-full mb-3"
          />

          {!revealed ? (
            // Recall step: hide the definition until the user commits to remembering (or not).
            <button
              onClick={() => setRevealed(true)}
              className="px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium"
            >
              Show definition
            </button>
          ) : (
            <>
              {/* Back: the definition */}
              <div className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-5 mb-5 text-center">
                <span className="text-lg text-gray-800">{card.definition}</span>
              </div>

              {/* Self-rating: how well did you recall it? */}
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
