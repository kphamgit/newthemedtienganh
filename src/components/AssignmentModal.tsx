import { useNavigate } from "react-router-dom";

interface Assignment {
    assignment_id: number;
    quiz_id: number;
    quiz_name: string;
    assigned_at: string;
}

interface AssignmentModalProps {
    assignments: Assignment[];
    onClose: () => void;
}

function AssignmentModal({ assignments, onClose }: AssignmentModalProps) {
    const navigate = useNavigate();

    const handleStart = (quizId: number) => {
        onClose();
        navigate(`/quiz/${quizId}`);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <h2 className="text-xl font-bold mb-4">Pending Assignments</h2>
                <p className="text-gray-600 mb-4">You have the following assignments waiting:</p>
                <ul className="space-y-3 mb-6">
                    {assignments.map((a) => (
                        <li key={a.assignment_id} className="flex items-center justify-between border rounded-md p-3">
                            <span className="font-medium">{a.quiz_name}</span>
                            <button
                                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                onClick={() => handleStart(a.quiz_id)}
                            >
                                Start
                            </button>
                        </li>
                    ))}
                </ul>
                <button
                    className="w-full px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    onClick={onClose}
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
}

export default AssignmentModal;
