import { useState } from "react";
import { FaPlayCircle } from "react-icons/fa";
import api from "../api";

// --- Shape of the /english/read-dictionary/ response (array of matching entries) ---
interface DictExample {
  id: number;
  sentence: string;
  translation: string;
}
interface DictSense {
  id: number;
  sense_number: number;
  definition: string;
  examples?: DictExample[];
  card_id?: number | null; // id of the teacher-created card for this sense, if any
}
interface DictPartOfSpeech {
  name: string;
  audio_blob?: string;  // blob name (no ".mp3") set by the backend when audio was generated; "" = none
  senses?: DictSense[];
}
interface DictEntry {
  head_word: string;
  source: string;
  part_of_speeches?: DictPartOfSpeech[];
}

// Selectable source dictionaries. `label` is what the student sees; `value` is the
// exact `source` string stored on the backend. Viet is the default (first entry).
const SOURCES = [
  { label: "Viet", value: "ho-ngoc-duc-stardict" },
  { label: "Longman", value: "longman" },
];

// mode="student": each reviewable sense gets a "+ Review" button (adds to the student's queue).
// mode="teacher": each sense gets a "+ Create Card" button (creates the global card).
export default function DictionaryLookup({ mode = "student" }: { mode?: "student" | "teacher" }) {
  const [word, setWord] = useState("");
  const [source, setSource] = useState(SOURCES[0].value); // default: Viet
  const [entries, setEntries] = useState<DictEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // card_ids the student has added to their review this session (for button feedback).
  const [addedCardIds, setAddedCardIds] = useState<Set<number>>(new Set());
  // sense ids the teacher has created a card for this session (for button feedback).
  const [createdSenseIds, setCreatedSenseIds] = useState<Set<number>>(new Set());

  const search = () => {
    const term = word.trim();
    if (!term) return;
    setLoading(true);
    setError(null);
    setEntries(null);
    api.post("/english/read-dictionary/", { word: term, source })
      .then((res) => {
        setEntries(res.data as DictEntry[]);
      })
      .catch((err) => {
        // 404 => no entry found; anything else => generic error.
        if (err.response?.status === 404) {
          setError(`No dictionary entry found for "${term}".`);
        } else {
          setError(err.response?.data?.error ?? "Dictionary lookup failed.");
        }
      })
      .finally(() => setLoading(false));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") search();
  };

  // Student: add the teacher-created card for this sense to the review queue.
  const addSenseToReview = (cardId: number) => {
    api.post(`/api/cards/${cardId}/add-to-review/`)
      .then(() => {
        setAddedCardIds((prev) => new Set(prev).add(cardId));
      })
      .catch((err) => {
        console.error("Error adding card to review:", err);
        alert("Could not add this word to your review.");
      });
  };

  // Teacher: create the global card for this sense (idempotent on the backend).
  const createCard = (headWord: string, sense: DictSense, partOfSpeech: string) => {
    api.post("/api/cards/", { text: headWord, definition: sense.definition, part_of_speech: partOfSpeech })
      .then(() => {
        setCreatedSenseIds((prev) => new Set(prev).add(sense.id));
      })
      .catch((err) => {
        console.error("Error creating card:", err);
        alert("Could not create a card for this sense.");
      });
  };

  const closeResults = () => {
    setEntries(null);
    setError(null);
  };

  // Teachers get a larger, wider results panel (they scan/curate more than students).
  const isTeacher = mode === "teacher";

  // Play a part of speech's pronunciation at normal speed, then automatically again slowly.
  // The backend stored the normal blob name on the POS (audio_blob) and also generated a natural
  // slow re-synthesis at "slow_<audio_blob>.mp3", so both names are known without any hashing.
  const playPos = (audioBlob: string) => {
    const base = "https://kphamazureblobstore.blob.core.windows.net/tts-audio/";
    const normal = new Audio(`${base}${audioBlob}.mp3`);
    normal.onended = () => {
      // Short pause, then the slow version at true speed (it's already slowed server-side).
      setTimeout(() => {
        const slow = new Audio(`${base}slow_${audioBlob}.mp3`);
        slow.play().catch(() => {});
      }, 250);
    };
    normal.play().catch(() => {});
  };

  return (
    <div className="relative flex items-center gap-2">
      <select
        className="bg-white border border-gray-400 text-black text-sm px-2 py-1 rounded-md"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        title="Source dictionary"
      >
        {SOURCES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <input
        className="bg-white border border-gray-400 text-black text-sm px-2 py-1 rounded-md w-48"
        placeholder="Look up a word..."
        value={word}
        onChange={(e) => setWord(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <button
        onClick={search}
        disabled={!word.trim() || loading}
        className={`text-white bg-indigo-600 text-sm px-3 py-1 rounded-md hover:bg-indigo-800 ${
          !word.trim() || loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "..." : "Search"}
      </button>

      {/* Results / error panel */}
      {(entries !== null || error) && (
        <div className={`absolute top-full right-0 mt-1 ${isTeacher ? "w-[32rem]" : "w-96"} max-h-[70vh] overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-xl z-30 p-4 text-left`}>
          <button
            onClick={closeResults}
            aria-label="Close"
            className="float-right text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>

          {error && <p className="text-red-700 text-sm">{error}</p>}

          {entries && entries.length === 0 && (
            <p className="text-gray-600 text-sm">No results.</p>
          )}

          {entries?.map((entry, ei) => (
            <div key={ei} className="mb-4 last:mb-0">
              <h3 className={`font-bold text-gray-900 ${isTeacher ? "text-2xl" : "text-lg"}`}>{entry.head_word}</h3>
              {entry.part_of_speeches?.map((pos, pi) => (
                <div key={pi} className="mt-1">
                  {pos.name && (
                    <span className={`italic text-indigo-700 ${isTeacher ? "text-base" : "text-sm"}`}>{pos.name}</span>
                  )}
                  {/* Student: play this part of speech's pronunciation, only if audio exists. */}
                  {!isTeacher && pos.audio_blob && (
                    <button
                      onClick={() => playPos(pos.audio_blob!)}
                      title="Play pronunciation"
                      aria-label="Play pronunciation"
                      className="ml-2 align-middle text-green-600 hover:text-green-700"
                    >
                      <FaPlayCircle className="inline text-lg" />
                    </button>
                  )}
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    {pos.senses?.map((sense) => (
                      <li key={sense.id} className={`text-gray-800 ${isTeacher ? "text-base" : "text-sm"}`}>
                        <span>{sense.definition}</span>
                        {mode === "teacher" ? (
                          // Teacher: create a card for any sense that doesn't already have one.
                          sense.card_id != null || createdSenseIds.has(sense.id) ? (
                            <span className="ml-2 align-baseline text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                              ✓ Card exists
                            </span>
                          ) : (
                            <button
                              onClick={() => createCard(entry.head_word, sense, pos.name)}
                              title="Create a review card for this sense"
                              className="ml-2 align-baseline text-xs px-1.5 py-0.5 rounded bg-amber-500 hover:bg-amber-600 text-white"
                            >
                              + Create Card
                            </button>
                          )
                        ) : (
                          // Student: only senses a teacher has made a card for are reviewable.
                          sense.card_id != null && (
                            addedCardIds.has(sense.card_id) ? (
                              <span className="ml-2 align-baseline text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                                ✓ Added
                              </span>
                            ) : (
                              <button
                                onClick={() => addSenseToReview(sense.card_id!)}
                                title="Add this sense to my review"
                                className="ml-2 align-baseline text-xs px-1.5 py-0.5 rounded bg-amber-500 hover:bg-amber-600 text-white"
                              >
                                + Review
                              </button>
                            )
                          )
                        )}
                        {sense.examples && sense.examples.length > 0 && (
                          <ul className="mt-1 ml-4 space-y-0.5">
                            {sense.examples.map((ex) => (
                              <li key={ex.id} className={`text-gray-500 ${isTeacher ? "text-sm" : "text-xs"}`}>
                                • {ex.sentence}
                                {ex.translation ? ` — ${ex.translation}` : ""}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
