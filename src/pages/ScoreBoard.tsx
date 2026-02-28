import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { useWebSocket } from '../components/context/WebSocketContext';
import { FaSpinner } from "react-icons/fa";
import { useEffect, useState } from 'react';
import type { ReceivedConnectedUserDataProps, WebSocketMessageProps } from '../components/shared/types';
//import { setUser } from '../redux/userSlice';
//import { setUser } from '../redux/userSlice';
//import { type LoggedInUserPendingDataProps } from '../components/shared/types';

type UserRowProps = {
    name: string;
    is_logged_in?: boolean;
    live_score?: number;
    live_total_score?: number;
    live_question_number?: number;
}

function ScoreBoard() {
    const { name } = useSelector((state: RootState) => state.user);
    //const connectedUsersInReduxStore = useSelector((state: RootState) => state.connectedUsers.list);
    const {eventEmitter} = useWebSocket();

    const [userRows, setUserRows] = useState<UserRowProps[]>([]);

    const [quizName, setQuizName] = useState<string>("");

    const getLiveQuestionNumber = (liveQuestionNumber: number | undefined) => {
        return liveQuestionNumber && liveQuestionNumber !== 0 ? Number(liveQuestionNumber) : undefined;
      };
      
    

  useEffect(() => {
      const handleMessage = (data: WebSocketMessageProps) => {
        //console.log("ScoreBoard: handleMessage called with data:", data);
        if (data.message_type === "welcome_message") {
           
          //console.log("ScoreBoard: Received welcome_message from server:", data);
          //console.log("ScoreBoard: welcome_message other_connected_users:", data.other_connected_users);
          const connectedUsersFromServer = data.other_connected_users as ReceivedConnectedUserDataProps[];

          setUserRows(
            connectedUsersFromServer.map((user) => ({
              name: user.name,
              live_question_number: getLiveQuestionNumber(Number(user.live_question_number)),
              live_total_score: user.live_total_score ? Number(user.live_total_score) : undefined,
              is_logged_in: user.is_logged_in === "true" ? true : user.is_logged_in === "false" ? false : undefined, // convert string to boolean, if it's not "true" or "false", set to undefined
            }))
          );
        } //

        else if (data.message_type === "live_question_retrieved") {
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
        else if (data.message_type === "another_user_joined") {
          //console.log("ScoreBoard: Received another_user_joined message from server for user:", data);
            // add this user to user rows, but only if not already in the list (to avoid duplicate when teacher opens multiple tabs)
            // set is_logged_in to true for this user in case they are already in the list but got disconnected before
            setUserRows((prevRows) => {
                const userExists = prevRows.some((row) => row.name === data.user_name);
                if (userExists) {
                    //console.log("ScoreBoard: User already in the list, updating is_logged_in to true for user:", data.user_name);
                    return prevRows.map((row) => {
                        if (row.name === data.user_name) {
                            return { ...row, is_logged_in: true };
                        }
                        return row;
                    });
                } else {
                    //console.log("ScoreBoard: Adding new user to the list:", data.user_name);
                    return [...prevRows, { name: data.user_name, is_logged_in: true }]; // add new user to the list with is_logged_in set to true
                }
            });
        }
        else if (data.message_type === "user_disconnected") {
            //console.log("ScoreBoard: Received user_disconnected message from server for user:", data.user_name);
            const dropped_user = data.user_name;
            // look for this user in userRows and set is_logged_in to false, but do not remove the user 
            // from the list since we want to keep their score and question number visible on the board
            setUserRows((prevRows) => prevRows.map((row) => {
                if (row.name === dropped_user) {
                    return { ...row, is_logged_in: false };
                }
                return row;
            }));
            //console.log("ScoreBoard: current userRows:", userRows);
            /*
            setUserRows((prevRows) => prevRows.filter((row) => row.name !== dropped_user));
            */
         
            
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
        else if (data.message_type === "student_acknowleged_live_quiz_id") {
            //console.log("Take Quiz Live: received acknowledge quiz id :", data.content);
             //setLiveQuizId(data.content);
             // only accept the message if you are a teacher
             if (name !== "teacher") {
                 console.log("Take Quiz Live: Ignoring quiz id acknowledge message since not a teacher.");
                 return;
             }
             setUserRows((prevRows) => prevRows.map((row) => {
                if (row.name === data.user_name) {
                    return { ...row, live_quiz_id: data.content };
                }
                return row;
            }));
         }
         else if (data.message_type === "live_quiz_id") {
          //console.log("ScoreBoard: Received live_quiz_id message from server data = ", data);
          setQuizName(data.quiz_name || "");
         }
         else if (data.message_type === "live_score") {
            
            //console.log("ScoreBoard: Received live_score message from :", data);
            /*
Received live_score notification from Redis.  {
  message_type: 'live_score',
  content: { score: 5, live_total_score: 5 },
  user_name: 'student1'
}
            */

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
        
            <div className="bg-green-300 p-2 mb-2">
                
                <div className='text-green-800 mb-2'>{quizName}</div>
         
                {userRows && userRows.length > 0 &&
                    userRows.map((user, index) => (
                        user.name !== "teacher" && (
                        <div className='flex flex-row justify-start mb-2 items-center bg-green-100 px-2' key={index}>
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
                                    >{user.live_question_number}</div>

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

