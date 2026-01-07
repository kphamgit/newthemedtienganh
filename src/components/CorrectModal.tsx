export interface CorrectModalProps {
    // Add any props if needed
    //parentCallback: (action: string ) => void;
    message?: string;
    score?: number;
}


function CorrectModal({ message, score}: CorrectModalProps) {

    
    return (

        <div
            className="fixed inset-100 inset-x-1/3 rounded-md bg-green-300 bg-opacity-50 flex items-center justify-center z-10"
        >
            <div className="bg-gray-100 rounded-lg shadow-lg p-6 w-auto h-auto text-center">
                <p className="text-lg font-bold mb-4">Good job! Keep going!</p>
                <p className="text-sm text-gray-700 mb-4">{message}</p>
                <p>Score: {score}</p>
            </div>
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