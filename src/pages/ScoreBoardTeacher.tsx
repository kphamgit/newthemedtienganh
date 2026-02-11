import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { useWebSocket } from '../components/context/WebSocketContext';
import { FaSpinner } from "react-icons/fa";
import { useEffect, useState } from 'react';
import type { WebSocketMessageProps } from '../components/shared/types';

type UserRowProps = {
    name: string;
    live_quiz_id?: string;
    live_score?: number;
    total_score?: number;
    live_question_number?: number;
}


function ScoreBoardTeacher() {
    const { name } = useSelector((state: RootState) => state.user);
    //const connectedUsersInReduxStore = useSelector((state: RootState) => state.connectedUsers.list);
    const {websocketRef, eventEmitter} = useWebSocket();

    const [userRows, setUserRows] = useState<UserRowProps[]>([]);

    const [quizName, setQuizName] = useState<string>("");

  useEffect(() => {
      const handleMessage = (data: WebSocketMessageProps) => {
        console.log("ScoreBoard: handleMessage called with data:", data);
        if (data.message_type === "welcome_message") {
            /*
const welcomeMessage = JSON.stringify({
          message_type: "welcome_message",
          content: `Welcome ${user_name} to the WebSocket server!`,
          user_name: user_name,
          other_connected_users: other_logged_in_users,
          pending_data: {
            live_quiz_id: quizId || null,
            live_question_number: liveQuestionNumber || null,
            total_live_score: liveTotalScore || 0,
          },
        });
            */
          console.log("ScoreBoard: Received welcome_message from server for user:", data.user_name);
          console.log("ScoreBoard: welcome_message pending:", data.pending_data);
          const other_connected_users = data.other_connected_users || [];
            const all_connected = [data.user_name, ...other_connected_users];
            setUserRows(all_connected.map((user_name) => ({
              name: user_name,
              //live_quiz_id: data.live_quiz_id || undefined,
        
            })));
          /*
           //setUserRows([{ name: data.user_name }]);
           //add this user to user rows, but only if not already in the list (to avoid duplicate when teacher opens multiple tabs)
           console.log("ScoreBoard: Adding user to userRows:", data.user_name);  
           setUserRows((prevRows) => {
                if (prevRows.some((row) => row.name === data.user_name)) {
                    console.log("ScoreBoard: ********* THIS SHOULD NOT HAPPEND User already in the list, not adding again:", data.user_name);
                  return prevRows; // user already in the list, do not add again
                }
                return [...prevRows, { name: data.user_name }]; // add new user to the list 
              });
              */
        }
        else if (data.message_type === "another_user_joined") {
          console.log("ScoreBoard: Received another_user_joined message from server for user:", data);
            // add this user to user rows, but only if not already in the list (to avoid duplicate when teacher opens multiple tabs)
            setUserRows((prevRows) => {
                if (prevRows.some((row) => row.name === data.user_name)) {
                    console.log("ScoreBoard: ********* THIS SHOULD NOT HAPPEND User already in the list, not adding again:", data.user_name);
                  return prevRows; // user already in the list, do not add again
                }
                return [...prevRows, { name: data.user_name }]; // add new user to the list 
              });
          
            /*
          const others = data.other_connected_users || [];
          const all_connected = [data.user_name, ...others];
          if (data.live_total_score) {
            console.log("ScoreBoard: connection_established message contains live_total_score for user:", data.user_name, " score:", data.live_total_score);
            // if live_total_score is present, set live total score for each this user
           
            setUserRows(all_connected.map((user_name) => ({
              name: user_name,
              //live_quiz_id: data.live_quiz_id || undefined,
              live_question_number: data.live_question_number ? Number(data.live_question_number) : undefined,
              total_score: user_name === data.user_name ? Number(data.live_total_score) : undefined, // only set total score for the user who just connected, since other users might have different total scores
            })));
            
          } else {
            setUserRows(all_connected.map((user_name) => ({name: user_name})));
          }
            */
        }
        else if (data.message_type === "live_quiz_id") {
            console.log("ScoreBoard: Received live_quiz_id message from server data = ", data);
            setQuizName(data.quiz_name || "");
        }
        else if (data.message_type === "user_disconnected") {
            console.log("ScoreBoard: Received user_disconnected message from server for user:", data.user_name);
            const dropped_user = data.user_name;
            //console.log("ScoreBoard: current userRows:", userRows);
            setUserRows((prevRows) => prevRows.filter((row) => row.name !== dropped_user));
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
         else if (data.message_type === "live_question_number") {
               // is this for everybody or for me, either way I will accept

               console.log("ScoreBoard: Received live_question_number message from server for user:", data.user_name, " question number:", data.content);
                // update question number in redux store for that user
                const sender = data.user_name;
                setUserRows((prevRows) => prevRows.map((row) => {
                    console.log("ScoreBoard: Checking if row.name === sender:", row.name, " === ", sender);
                    if (row.name === name) {
                        return { ...row, live_question_number: Number(data.content), live_score: undefined }; // reset live score when question number is updated
                    }
                    return row;
                }));
                
         }
         else if (data.message_type === "live_score") {
            console.log("ScoreBoard: Received live_score message from :", data);
            // score should be in the form of : "5:10" where 5 is the live score for the current question 
            // and 10 is the total score for the quiz so far. We will split it and only update the live score, and add the live score to total score.
            // update live score in redux store for that user
            /*
                  Parsed message:  {
              message_type: 'live_score',
              content: { live_question_number: '1', score: 5 },
              user_name: 'student1'
            }
            */

            const sender = data.user_name;
            
            // kpham: note that the server (Nodejs/Redis also keeps track of the total scores for students), for recovery purposes
            // here, the total score is calculated by adding live score to previous total score in the client side.
            // the two should be the same unless there are bugs.
            setUserRows((prevRows) => prevRows.map((row) => {
                if (row.name === sender) {
                    return { ...row, live_score: data.content.score, total_score: data.content.score + (row.total_score || 0)};
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

    const sendDisconnect = (username: string) => {
         console.log("sendDisconnect username:", username);
         if (!websocketRef.current) {
             alert("WebSocket is not connected.");
             return;
         }
         websocketRef.current.send(JSON.stringify({
             message_type: "disconnect_user",
             message: username,  // user to be disconnected
             user_name: name,    // identify sender
         }));
     
     };

    return (
        <>
        <div>UserRows: {JSON.stringify(userRows)}</div>
        <div>{quizName}</div>
            <div className="bg-green-300 p-2 mb-2">
                <div>Users online:</div>
                {userRows && userRows.length > 0 &&
                    userRows.map((user, index) => (
                        <div className='flex flex-row justify-start mb-2 items-center bg-green-100 px-2' key={index}>
                            <div>
                                <span>
                                    <button
                                        className="bg-red-500 text-white px-1 py-0 rounded mr-2"
                                        onClick={() => sendDisconnect(user.name)}   
                                    >X
                                    </button>
                                </span>
                                 - {user.name}
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
                            {user.total_score !== undefined &&
                                <div className='flex flex-row justify-center items-center ml-2'>
                                    
                                    <div className='p-1 mx-2'>Total:</div>
                                    <div>
                                        <span className="ml-2">{user.total_score}</span>

                                    </div>

                                </div>
                            }
                        </div>
                    ))
                }
            </div>
        </>
    )
}

export default ScoreBoardTeacher

