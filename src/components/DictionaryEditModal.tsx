import { useState } from "react";
import { createPortal } from "react-dom";
import api from "../api";
import type { DictEntry, DictExample, DictSense } from "./DictionaryLookup";

interface DictionaryEditModalProps {
  entry: DictEntry;
  // Called when the modal closes; `changed` is true if anything was saved (parent can refresh).
  onClose: (changed: boolean) => void;
}

// Teacher-only editor for a single dictionary entry: edit sense definitions, edit example
// sentences, and add new examples. Opened as a large modal from the teacher search box so
// vocabulary management is a deliberate action, not something that happens inline while
// working with students.
export default function DictionaryEditModal({ entry: initialEntry, onClose }: DictionaryEditModalProps) {
  const [entry, setEntry] = useState<DictEntry>(initialEntry);
  const [changed, setChanged] = useState(false);

  // In-progress edits (present only for fields the teacher has changed).
  const [editedDefs, setEditedDefs] = useState<{ [senseId: number]: string }>({});
  const [editedExamples, setEditedExamples] = useState<{ [exampleId: number]: string }>({});
  const [newExampleText, setNewExampleText] = useState<{ [senseId: number]: string }>({});
  const [busy, setBusy] = useState(false);

  // --- local-state helpers (update the working copy so edits show immediately) ---
  const applyToSense = (senseId: number, fn: (s: DictSense) => DictSense) =>
    setEntry((e) => ({
      ...e,
      part_of_speeches: (e.part_of_speeches || []).map((pos) => ({
        ...pos,
        senses: (pos.senses || []).map((s) => (s.id === senseId ? fn(s) : s)),
      })),
    }));

  const saveDefinition = (senseId: number) => {
    const definition = editedDefs[senseId];
    if (definition === undefined) return;
    setBusy(true);
    api.patch(`/english/update-dictionary-sense/${senseId}/`, { definition })
      .then(() => {
        applyToSense(senseId, (s) => ({ ...s, definition }));
        setEditedDefs((prev) => { const n = { ...prev }; delete n[senseId]; return n; });
        setChanged(true);
      })
      .catch((err) => alert(`Failed to save definition: ${err.response?.data?.error || err.message}`))
      .finally(() => setBusy(false));
  };

  const saveExample = (senseId: number, exampleId: number) => {
    const sentence = editedExamples[exampleId];
    if (sentence === undefined) return;
    setBusy(true);
    api.patch(`/english/examples/${exampleId}/`, { sentence })
      .then(() => {
        applyToSense(senseId, (s) => ({
          ...s,
          examples: (s.examples || []).map((x) => (x.id === exampleId ? { ...x, sentence } : x)),
        }));
        setEditedExamples((prev) => { const n = { ...prev }; delete n[exampleId]; return n; });
        setChanged(true);
      })
      .catch((err) => alert(`Failed to save example: ${err.response?.data?.error || err.message}`))
      .finally(() => setBusy(false));
  };

  const addExample = (senseId: number) => {
    const sentence = (newExampleText[senseId] || "").trim();
    if (sentence === "") return;
    setBusy(true);
    api.post(`/english/examples/`, { sense_id: senseId, sentence })
      .then((res) => {
        const created: DictExample = {
          id: res.data?.id ?? Date.now(),
          sentence: res.data?.sentence ?? sentence,
          translation: res.data?.translation ?? "",
        };
        applyToSense(senseId, (s) => ({ ...s, examples: [...(s.examples || []), created] }));
        setNewExampleText((prev) => ({ ...prev, [senseId]: "" }));
        setChanged(true);
      })
      .catch((err) => alert(`Failed to add example: ${err.response?.data?.error || err.message}`))
      .finally(() => setBusy(false));
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => onClose(changed)}>
      <div
        className="bg-white text-gray-900 rounded-lg shadow-xl p-6 w-[46rem] max-w-[95vw] max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-semibold">Edit dictionary entry: <span className="text-indigo-700">{entry.head_word}</span></div>
          <button className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300" onClick={() => onClose(changed)}>Close</button>
        </div>

        {(entry.part_of_speeches || []).map((pos, pi) => (
          <div key={pi} className="mb-5">
            <div className="italic text-indigo-700 font-medium text-lg">{pos.name}</div>
            {(pos.senses || []).map((sense) => (
              <div key={sense.id} className="mt-2 border-l-2 border-gray-200 pl-3">
                {/* Editable definition */}
                <div className="flex flex-row items-center gap-2">
                  <span className="text-gray-500 text-base">{sense.sense_number}.</span>
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-base"
                    value={editedDefs[sense.id] ?? sense.definition}
                    onChange={(e) => setEditedDefs((prev) => ({ ...prev, [sense.id]: e.target.value }))}
                  />
                  <button
                    className="bg-indigo-600 text-white text-base px-3 py-1 rounded-md hover:bg-indigo-800 disabled:opacity-50"
                    disabled={busy || editedDefs[sense.id] === undefined}
                    onClick={() => saveDefinition(sense.id)}
                  >
                    Save
                  </button>
                </div>

                {/* Editable examples */}
                <div className="ml-6 mt-2 space-y-1">
                  {(sense.examples || []).map((ex) => (
                    <div key={ex.id} className="flex flex-row items-center gap-2">
                      <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm"
                        value={editedExamples[ex.id] ?? ex.sentence}
                        onChange={(e) => setEditedExamples((prev) => ({ ...prev, [ex.id]: e.target.value }))}
                      />
                      <button
                        className="bg-indigo-600 text-white text-sm px-2 py-1 rounded-md hover:bg-indigo-800 disabled:opacity-50"
                        disabled={busy || editedExamples[ex.id] === undefined}
                        onClick={() => saveExample(sense.id, ex.id)}
                      >
                        Save
                      </button>
                    </div>
                  ))}

                  {/* Add example */}
                  <div className="flex flex-row items-center gap-2">
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm"
                      placeholder="New example sentence"
                      value={newExampleText[sense.id] || ""}
                      onChange={(e) => setNewExampleText((prev) => ({ ...prev, [sense.id]: e.target.value }))}
                    />
                    <button
                      className="bg-green-600 text-white text-sm px-2 py-1 rounded-md hover:bg-green-700 disabled:opacity-50"
                      disabled={busy || (newExampleText[sense.id] || "").trim() === ""}
                      onClick={() => addExample(sense.id)}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>,
    document.body
  );
}
