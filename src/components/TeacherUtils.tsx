import { useState } from "react";
import api from "../api";

// Teacher utilities panel (Utils tab). For now: generate an Azure TTS audio clip for a word.
export default function TeacherUtils() {
  const [word, setWord] = useState("");
  const [creating, setCreating] = useState(false);
  const [normalUrl, setNormalUrl] = useState<string | null>(null);
  const [slowUrl, setSlowUrl] = useState<string | null>(null);
  const [alreadyExisted, setAlreadyExisted] = useState(false);

  const createAudio = async () => {
    const text = word.trim();
    if (!text) return;
    setCreating(true);
    setNormalUrl(null);
    setSlowUrl(null);
    setAlreadyExisted(false);
    try {
      // Pass blob_name so it's saved as "<word>.mp3" (the name the rest of the app plays),
      // not the backend's "default_name" fallback.
      // 1) Normal speed -> "<word>.mp3"
      const normalRes = await api.post<{ audio_url: string; blob_name: string; existed: boolean }>(
        "/api/create-azure-audio/",
        { text, blob_name: text }
      );
      // 2) Slow speed -> "slow_<word>.mp3"
      const slowRes = await api.post<{ audio_url: string; blob_name: string; existed: boolean }>(
        "/api/create-azure-audio/",
        { text, blob_name: text, slow: true }
      );
      setNormalUrl(normalRes.data.audio_url);
      setSlowUrl(slowRes.data.audio_url);
      // The clip already existed and was NOT regenerated (either version already present).
      setAlreadyExisted(normalRes.data.existed || slowRes.data.existed);
    } catch (err) {
      console.error("Error creating Azure audio:", err);
      alert("Could not create Azure audio.");
    } finally {
      setCreating(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") createAudio();
  };

  return (
    <div className="m-4 p-4 bg-white rounded-md min-h-40">
      <h3 className="text-lg font-bold mb-2">Create Azure Audio</h3>
      <p className="text-sm text-gray-600 mb-2">
        Creates two versions of the audio for the word: normal speed and a slow version.
      </p>
      <div className="flex items-center gap-2">
        <input
          className="bg-gray-100 border border-gray-300 text-black px-2 py-1 rounded-md"
          placeholder="Enter a word..."
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          onClick={createAudio}
          disabled={!word.trim() || creating}
          className={`text-white bg-blue-600 px-3 py-1 rounded-md hover:bg-blue-800 ${
            !word.trim() || creating ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {creating ? "Creating..." : "Create Azure Audio"}
        </button>
      </div>

      {alreadyExisted && (
        <p className="mt-3 text-sm text-amber-700 bg-amber-100 border border-amber-300 rounded px-2 py-1">
          ⚠️ Audio for this word already existed — the existing clip was kept (not regenerated).
        </p>
      )}

      {(normalUrl || slowUrl) && (
        <div className="mt-3">
          <p className="text-sm text-green-700 mb-1">Audio created — preview:</p>
          {normalUrl && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-700 w-16">Normal:</span>
              <audio controls src={normalUrl} className="h-8" />
            </div>
          )}
          {slowUrl && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 w-16">Slow:</span>
              <audio controls src={slowUrl} className="h-8" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
