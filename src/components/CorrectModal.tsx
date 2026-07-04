export interface CorrectModalProps {
    // Add any props if needed
    //parentCallback: (action: string ) => void;
    message?: string;
    score?: number;
}


function CorrectModal({ message, score}: CorrectModalProps) {

    
    return (

        <div className="bg-white rounded-lg shadow-xl p-6 w-72 text-center">
            <p className="text-xl font-bold mb-4 text-green-700">Good job! Keep going!</p>
            <p className="text-sm text-gray-600 mb-4">{message}</p>
            <p className="text-gray-800">Score: {score}</p>
        </div>

    )
}

export default CorrectModal

/*
return (

    <div 
    className="fixed inset-80 bg-green-600 bg-opacity-50 flex items-center justify-center z-10"
>
    <div className="bg-white rounded-lg shadow-lg p-6 w-80 h-auto text-center">
        <p className="text-lg font-bold mb-4">Good job! Keep going!</p>
        <p className="text-sm text-gray-700 mb-4">{message}</p>
        <button 
            className="px-4 py-2 rounded-md bg-amber-400 hover:bg-amber-500 text-white font-medium"
            onClick={handleCloseModal}
        >
            Continue
        </button>
    </div>
</div>
   
  )
*/