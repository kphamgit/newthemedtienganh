interface ReviewPromptModalProps {
  onYes: () => void;
  onNo: () => void;
  incorrectCount: number;
}

export default function ReviewPromptModal({ onYes, onNo, incorrectCount }: ReviewPromptModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-96 text-center">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Quiz Complete!</h2>
        <p className="text-gray-600 mb-6">
          You have <span className="font-semibold text-red-600">{incorrectCount}</span> incorrectly answered question{incorrectCount !== 1 ? 's' : ''}. Would you like to review them?
        </p>
        <div className="flex gap-4 justify-center">
          <button
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md"
            onClick={onYes}
          >
            Yes, review
          </button>
          <button
            className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white font-medium rounded-md"
            onClick={onNo}
          >
            No, finish
          </button>
        </div>
      </div>
    </div>
  );
}
