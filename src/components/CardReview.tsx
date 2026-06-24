import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../api';

interface CardOption {
  definition: string;
  is_correct: boolean;
}

interface DueCard {
  id: number;
  text: string;          // front (the word)
  definition: string;    // correct definition (for reveal)
  options: CardOption[]; // shuffled multiple-choice options
}

interface CardReviewProps {
  quizId?: string;   // when set, reviews one quiz's due cards (before the quiz); omit for all-vocabulary review
  userName: string;
  onComplete: () => void;
}

// Delay before a card's pronunciation plays (and the progress bar fills), in milliseconds.
const AUDIO_DELAY_MS = 1000;

// SM-2 quality is derived from objective behavior instead of self-rating:
//   wrong answer            -> 1 (lapse)
//   correct but slow        -> 4 (Good)   [slower than the user's session median]
//   correct and fast        -> 5 (Easy)   [at or faster than the session median]
function computeQuality(correct: boolean, latencyMs: number, sessionLatencies: number[]): number {
  if (!correct) return 1;
  if (sessionLatencies.length === 0) return 5; // no baseline yet: treat first correct as Easy
  const sorted = [...sessionLatencies].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  return latencyMs <= median ? 5 : 4;
}

export default function CardReview({ quizId, userName, onComplete }: CardReviewProps) {
  const [cards, setCards] = useState<DueCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [chosenIdx, setChosenIdx] = useState<number | null>(null); // null until answered
  const [dontKnow, setDontKnow] = useState(false);                 // user pressed "I don't know"
  const [submitting, setSubmitting] = useState(false);
  const [audioPending, setAudioPending] = useState(false);         // true during the 2s wait before audio plays

  const startRef = useRef<number>(performance.now());          // when the current card was shown
  const correctLatenciesRef = useRef<number[]>([]);            // session latencies of correct answers
  const lastPlayedIdRef = useRef<number | null>(null);         // guards against replaying the same card's audio

  useEffect(() => {
    // quizId set -> review one quiz's due cards before the quiz; omitted -> review all vocabulary.
    const url = quizId ? `/api/quizzes/${quizId}/cards/due/` : `/api/cards/due/`;
    api.get(url, { params: { user_name: userName } })
      .then((res) => {
        const due: DueCard[] = res.data.due_cards ?? [];
        setCards(due);
        setLoading(false);
        startRef.current = performance.now();
        // In quiz mode, having no due cards means "go straight to the quiz".
        // In vocabulary mode, we keep the view mounted to show a "nothing due" message.
        if (due.length === 0 && quizId) onComplete();
      })
      .catch((err) => {
        console.error('Error fetching due cards:', err);
        setLoading(false);
        if (quizId) onComplete(); // fail open: don't block the quiz if cards can't load
      });
  }, [quizId, userName]);

  // Play the word's pronunciation AUDIO_DELAY_MS after a new card is shown.
  useEffect(() => {
    if (loading || cards.length === 0) return;
    const card = cards[index];
    if (!card) return;
    const audioUrl = `https://kphamazureblobstore.blob.core.windows.net/tts-audio/${card.text}.mp3`;
    setAudioPending(true);
    const timeoutId = setTimeout(() => {
      setAudioPending(false);
      // Set the guard only when we actually play, so StrictMode's mount→cleanup→mount
      // (which clears the first timer) doesn't leave the guard set with nothing scheduled.
      if (lastPlayedIdRef.current === card.id) return;
      lastPlayedIdRef.current = card.id;
      new Audio(audioUrl).play().catch(() => {});
    }, AUDIO_DELAY_MS);
    return () => {
      clearTimeout(timeoutId); // cancel if the card changes before the delay elapses
      setAudioPending(false);
    };
  }, [index, loading, cards]);

  const answered = chosenIdx !== null || dontKnow;

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

  const handleSelect = async (optIdx: number) => {
    if (answered || submitting) return;
    const card = cards[index];
    const opt = card.options[optIdx];
    const latency = performance.now() - startRef.current;
    const correct = opt.is_correct;

    setChosenIdx(optIdx);

    const quality = computeQuality(correct, latency, correctLatenciesRef.current);
    if (correct) correctLatenciesRef.current.push(latency);

    await submitReview(card.id, quality);
  };

  // Explicit lapse: the user acknowledges they don't know the word (no guessing).
  const handleDontKnow = async () => {
    if (answered || submitting) return;
    const card = cards[index];
    setDontKnow(true);
    await submitReview(card.id, 1); // quality 1 -> SM-2 lapse
  };

  const next = () => {
    if (index + 1 >= cards.length) {
      onComplete();
    } else {
      setChosenIdx(null);
      setDontKnow(false);
      setIndex((i) => i + 1);
      startRef.current = performance.now();
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
    // Quiz mode already fired onComplete; vocabulary mode shows a friendly message.
    if (quizId) return null;
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

  const optionClass = (optIdx: number) => {
    if (!answered) return 'bg-white border-gray-300 hover:border-amber-400';
    const opt = card.options[optIdx];
    if (opt.is_correct) return 'bg-green-100 border-green-500 text-green-800';
    if (optIdx === chosenIdx) return 'bg-red-100 border-red-500 text-red-800';
    return 'bg-white border-gray-200 text-gray-400';
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-6">
      <div className="w-full flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Which definition matches?</h2>
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
          {/* Front: the word */}
          <div className="w-full min-h-28 flex items-center justify-center bg-white border-2 border-gray-300 rounded-xl shadow-lg p-6 mb-3">
            <span className="text-3xl font-bold text-gray-800">{card.text}</span>
          </div>

          {/* Audio "about to play" indicator: a 2s progress bar with a pulsing speaker */}
          <div className="w-full h-6 mb-3 flex items-center gap-2">
            {audioPending && (
              <>
                <span className="text-gray-500 animate-pulse">🔊</span>
                <div className="flex-1 h-1.5 bg-gray-200 rounded overflow-hidden">
                  <motion.div
                    key={card.id}
                    className="h-full bg-amber-500"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: AUDIO_DELAY_MS / 1000, ease: 'linear' }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Multiple-choice definitions */}
          <div className="w-full flex flex-col gap-3">
            {card.options.map((opt, optIdx) => (
              <button
                key={optIdx}
                disabled={answered || submitting}
                onClick={() => handleSelect(optIdx)}
                className={`text-left px-5 py-3 border-2 rounded-lg transition-colors ${optionClass(optIdx)}`}
              >
                {opt.definition}
              </button>
            ))}
          </div>

          {/* Explicit lapse — acknowledge not knowing instead of guessing */}
          <button
            disabled={answered || submitting}
            onClick={handleDontKnow}
            className="mt-4 px-5 py-2 rounded-lg border-2 border-gray-500 text-gray-600 font-medium hover:bg-gray-100 hover:border-gray-700 disabled:opacity-40"
          >
            I don't know
          </button>
        </motion.div>
      </AnimatePresence>

      {/* After answering: feedback + advance */}
      <div className="mt-6 min-h-12 flex items-center">
        {answered && (
          <button
            onClick={next}
            className="px-6 py-2 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-medium"
          >
            {index + 1 >= cards.length ? (quizId ? 'Start quiz →' : 'Done') : 'Next →'}
          </button>
        )}
      </div>

    </div>
  );
}
