export interface RedisDataProps {
    // Add any props if needed
    //parentCallback: (action: string ) => void;
    users: any[]
    live_quiz_id: string | null;    
    live_question_number: string | null;
    parentCallback?: () => void;
}

export interface Props {
    // Add any props if needed
    //parentCallback: (action: string ) => void;
    content: RedisDataProps
    parentCallback?: () => void;
}

function RedisDataModal({ content, parentCallback }: Props) {
    return (
        <div
            className="fixed inset-40 rounded-md bg-blue-200 bg-opacity-50 flex flex-col items-center justify-center z-10"
        >
           <div>
            { content && (
                <div>
                    <p>Live Quiz ID:<span className="text-red-700 ml-2">{content.live_quiz_id}</span></p>
                    <p>Live Question Number: <span className="text-red-500 ml02">{content.live_question_number}</span></p>
                    <p>Connected Users:</p>
                    <ul className="ml-5 list-disc">
                        {content.users.map((user, index) => (
                            <li key={index}>{user.name}, question number: {user.live_question_number}, total score: {user.live_total_score}</li>
                        ))}
                    </ul>
                  
                </div>
            )
            }
            </div>
            <button className='m-3 px-2 rounded-md hover:underline bg-green-500 '
                onClick = { () => parentCallback && parentCallback()}
            >
                Close Modal
            </button>


        </div>

    )
}

export default RedisDataModal

