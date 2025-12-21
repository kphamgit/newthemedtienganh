interface QuizStartModalProps {
    // Add any props if needed
    parentCallback: (action: string ) => void;
 
}


function QuizStartModal({ parentCallback }: QuizStartModalProps) {

    const handleCancel = () => {
        // Close the modal
        parentCallback("cancel");
    };

    const handleContinue = () => {
        // Continue the quiz from where the user left off
        parentCallback("continue");
    }

    const handleStartOver = () => {
        parentCallback("start_over");
        // Start the quiz over from the beginning
    };

  return (

    <div 
        className="fixed inset-10 bg-amber-600s bg-opacity-50 flex items-center justify-center z-10"
    >
        <button className=' px-2 rounded-md hover:underline bg-green-500 '
            onClick={handleStartOver}>
            Start Over
        </button>
        <button className=' px-2 rounded-md hover:underline bg-amber-400'
            onClick={handleContinue}>
            Continue Where You Left Off
        </button>
        <button className=' px-2 rounded-md hover:underline bg-red-500'
            onClick={handleCancel}>
            Cancel
        </button>
    </div>

   
  )
}

export default QuizStartModal