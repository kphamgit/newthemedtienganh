interface RewatchPromptModalProps {
  onYes: () => void;
  onNo: () => void;
  rewatchesLeft: number;
}

export default function RewatchPromptModal({ onYes, onNo, rewatchesLeft }: RewatchPromptModalProps) {
  const canRewatch = rewatchesLeft > 0;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-96 text-center">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Watch the segment again?</h2>
        <p className="text-gray-600 mb-6">
          {canRewatch
            ? <>You have <span className="font-semibold text-amber-600">{rewatchesLeft}</span> rewatch{rewatchesLeft !== 1 ? 'es' : ''} left.</>
            : 'You have no rewatches left.'}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            disabled={!canRewatch}
            onClick={onYes}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-600"
          >
            Yes, rewatch
          </button>
          <button
            onClick={onNo}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md"
          >
            No, show question
          </button>
        </div>
      </div>
    </div>
  );
}
