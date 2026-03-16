export interface Props {
    // Add any props if needed
    //parentCallback: (action: string ) => void;
    message?: string;
    parentCallback: () => void;
}


function TimeoutModal({ message, parentCallback}: Props) {

    
    return (

        <div
            className="fixed inset-100 inset-x-1/3 rounded-mdbg-opacity-0 flex flex-col items-center justify-center z-10"
        >
            <div className="bg-green-300 bg-opacity-50 rounded-md p-6 w-auto h-auto text-center">
            <div className="bg-gray-100 rounded-lg shadow-lg p-6 w-auto h-auto text-center">
                <p className="text-lg font-bold mb-4">Sorry. Time's up!</p>
                <p className="text-sm text-gray-700 mb-4">{message}</p>
            </div>
            <button
                className="px-4 py-2 mt-5 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-medium"
                onClick={parentCallback}
            >
                Continue
            </button>
            </div>
        </div>

    )
}

export default TimeoutModal

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
