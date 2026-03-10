import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { useWebSocket } from '../components/context/WebSocketContext';
import { FaSpinner } from "react-icons/fa";
import { useEffect } from 'react';
import type { WebSocketMessageProps } from '../components/shared/types';
import { useUserConnections } from '../components/context/UserConnectionsContext';

//import { setUser } from '../redux/userSlice';
//import { setUser } from '../redux/userSlice';
//import { type LoggedInUserPendingDataProps } from '../components/shared/types';

interface Props {
   myLiveScore: {question_number: number | undefined, score: number | undefined, total_score: number | undefined};
}

function ScoreBoard({myLiveScore}: Props) {
    const { name } = useSelector((state: RootState) => state.user);
    //const connectedUsersInReduxStore = useSelector((state: RootState) => state.connectedUsers.list);
    const {eventEmitter} = useWebSocket();

    //const [userRows, setUserRows] = useState<UserRowProps[]>([]);
     const {userRows, setUserRows} = useUserConnections();

    //const [quizName, setQuizName] = useState<string>("");

    
 
  useEffect(() => {
      const handleMessage = (data: WebSocketMessageProps) => {
        //console.log("ScoreBoard: handleMessage called with data:", data);
        if (data.message_type === "live_question_retrieved") {
            //console.log("ScoreBoard: Received live_question_retrieved message from server for user:", data.user_name, " question number:", data.content);
            // update question number in score board
            const sender = data.user_name;
            //console.log("ScoreBoard: live_question_retrieved updating live question number for user:", sender, " to ", data.content);
            
            setUserRows((prevRows) => prevRows.map((row) => {
                if (row.name === sender) {
                    return { ...row, live_question_number: Number(data.content), live_score: undefined }; // reset live score when question number is updated
                }
                return row;
            }));
            
      
        }
        else if (data.message_type === "student_acknowleged_live_question_number") {
            //console.log("ScoreBoard: Received student_acknowleged_live_question_number message from server for user:", data.user_name, " question number:", data.message);
            // update question number in redux store for that user
            const sender = data.user_name;
            
            setUserRows((prevRows) => prevRows.map((row) => {
                if (row.name === sender) {
                    return { ...row, live_question_number: Number(data.content), live_score: undefined }; // reset live score and total score when question number is updated
                }
                return row;
            }));
            

            //dispatch(updateLiveQuestionNumber({name: sender, question_number: data.content}));
        }
         else if (data.message_type === "live_score") {
            const sender = data.user_name;
            
            setUserRows((prevRows) => prevRows.map((row) => {
                if (row.name === sender) {
                    return { ...row, live_score: Number(data.content.score), live_total_score: data.content.live_total_score };
                }
                return row;
            }));
           
        }
        else if (data.message_type === "live_quiz_terminated") {
            //console.log("ScoreBoard: Received live_quiz_terminated message from server.");
            // reset all user rows
            
            setUserRows((prevRows) => prevRows.map((row) => ({
                ...row,
                live_quiz_id: undefined,
                live_score: undefined,
                total_score: undefined,
                live_question_number: undefined,
            })));
            
        }
      }
      // Subscribe to the "message" event
      eventEmitter?.on("message", handleMessage);
      // Cleanup the event listener on unmount
      return () => {
        eventEmitter?.off("message", handleMessage);
      };
    }, [eventEmitter]); // Only include eventEmitter in the dependency array

    return (
        <>
        
            <div className="bg-green-300 p-0 mt-10 mb-2">
            

          
                        <div className='flex flex-row justify-start mb-2 items-center bg-cyan-300 px-2'>
                            <div
                                className={`text-red-900 font-bold `}
                            >
                                {name}
                            </div>
                            {myLiveScore.question_number !== undefined &&
                                <>
                                    <div
                                        className={`${myLiveScore.score === undefined ? "bg-amber-600" : "bg-green-600"
                                            } py-0 ml-1 px-2 rounded-full text-md text-white`}
                                    >{myLiveScore.question_number}
                                    </div>

                                    <div className='flex flex-row justify-center items-center ml-2'>
                                        <div className='mx-2'>Score:</div>
                                        <div>
                                            {myLiveScore.score === undefined ?

                                                <FaSpinner className="animate-spin text-blue-500" size={17} />
                                                :
                                                <span className="ml-2">{myLiveScore.score}</span>
                                            }
                                        </div>
                                    </div>
                                </>
                            }
                            {myLiveScore.total_score !== undefined && myLiveScore.total_score !== 999 &&
                                <div className='flex flex-row justify-center items-center ml-2'>
                                    
                                    <div className='p-1 mx-2'>Total:</div>
                                    <div>
                                        <span className="ml-2">{myLiveScore.total_score}</span>

                                    </div>

                                </div>
                            }

                        </div>
  
                



                { userRows && userRows.length > 0 &&
                    userRows.map((user, index) => (
                        (user.name !== "teacher" && user.name !== "admin" ) && (
                        <div className='flex flex-row justify-start mb-2 items-center bg-cyan-100 px-2' key={index}>
                            <div
                                className={`text-red-900 font-bold ${user.is_logged_in === false ? "opacity-50" : "opacity-100"
                                    }`}
                            >
                                {user.name}
                            </div>
                          
                            {user.live_question_number !== undefined &&
                                <>
                                    <div
                                        className={`${user.live_score === undefined ? "bg-amber-600" : "bg-green-600"
                                            } py-0 ml-1 px-2 rounded-full text-md text-white`}
                                    >{user.live_question_number}
                                    </div>

                                    <div className='flex flex-row justify-center items-center ml-2'>
                                        <div className='mx-2'>Score:</div>
                                        <div>
                                            {user.live_score === undefined ?

                                                <FaSpinner className="animate-spin text-blue-500" size={17} />
                                                :
                                                <span className="ml-2">{user.live_score}</span>
                                            }
                                        </div>
                                    </div>
                                </>
                            }
                            {user.live_total_score !== undefined && user.live_total_score !== 999 &&
                                <div className='flex flex-row justify-center items-center ml-2'>
                                    
                                    <div className='p-1 mx-2'>Total:</div>
                                    <div>
                                        <span className="ml-2">{user.live_total_score}</span>

                                    </div>

                                </div>
                            }
  
                        </div>
                    )
                    ))
                }
            </div>
        </>
    )
}

export default ScoreBoard

