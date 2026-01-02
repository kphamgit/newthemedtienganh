interface TimeoutModalProps {
    // Add any props if needed
    parentCallback: (action: string ) => void;
 
}


function TimeoutModal({ parentCallback }: TimeoutModalProps) {

    const handleContinue = () => {
        // Continue the quiz from where the user left off
        parentCallback("continue");
    }

  return (

    <div 
        className="fixed inset-10 bg-amber-600s bg-opacity-50 flex items-center justify-center z-10"
    >
        Sorry. You have been timed out. Please click below to continue.
        <button className=' px-2 rounded-md hover:underline bg-amber-400'
            onClick={handleContinue}>
            Continue
        </button>
 
    </div>

   
  )
}

export default TimeoutModal