
interface RedoQuestionModalProps {
  closeModal?: () => void;
}

function RedoQuestionModal({ closeModal }: RedoQuestionModalProps) {


  return (
    <div className="fixed inset-50 bg-blue-700 bg-opacity-50 flex items-center justify-center z-10">
        <div className='bg-white p-5 rounded-md shadow-md'>
            <h2 className='text-lg font-bold mb-4'>Redo Question</h2>
            <div className='flex justify-end gap-4'>
                <button 
                    className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
                    onClick={closeModal}>
                    Redo
                </button>
            </div>
        </div>
  </div>
  )
}

export default RedoQuestionModal