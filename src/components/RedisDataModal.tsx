import { useEffect } from "react";
import { type ReceivedConnectedUserDataProps } from "./shared/types";

export interface RedisDataProps {
    // Add any props if needed
    //parentCallback: (action: string ) => void;
    users: ReceivedConnectedUserDataProps[];
    live_quiz_id: string | null;    
    live_question_number: string | null;
   
}

export interface Props {
    // Add any props if needed
    //parentCallback: (action: string ) => void;
    content: RedisDataProps
    parentCallback?: () => void;
}

function RedisDataModal({ content, parentCallback }: Props) {

    useEffect(() => {
        console.log("RedisDataModal: Received new content from WebSocket:", content);
    }, [content]);

    
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
                            <li key={index}>{user.name},
                            logged_in: <span className="text-red-700">{user.is_logged_in ? "Yes" : "No"}</span>,
                            question number: {user.live_question_number}, 
                            total score: {user.live_total_score}</li>
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

