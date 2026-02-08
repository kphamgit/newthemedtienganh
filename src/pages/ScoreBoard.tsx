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


function ScoreBoard() {
    const { name } = useSelector((state: RootState) => state.user);
    //const connectedUsersInReduxStore = useSelector((state: RootState) => state.connectedUsers.list);
    const {websocketRef, eventEmitter} = useWebSocket();

    const [userRows, setUserRows] = useState<UserRowProps[]>([]);

  useEffect(() => {
      const handleMessage = (data: WebSocketMessageProps) => {
        //console.log("ScoreBoard: handleMessage called with data:", data);
        if (data.message_type === "connection_established") {
          //console.log("ScoreBoard: Received connection_established message from server for user:", data.user_name);
          const others = data.other_connected_users || [];
          const all_connected = [data.user_name, ...others];
          setUserRows(all_connected.map((user_name) => ({name: user_name})));
      
        }
        else if (data.message_type === "connection_dropped") {
            //console.log("ScoreBoard: Received connection_dropped message from server for user:", data.user_name);
            const dropped_user = data.user_name;
            setUserRows((prevRows) => prevRows.filter((row) => row.name !== dropped_user));
        }
        else if (data.message_type === "student_acknowleged_live_question_number") {
            //console.log("ScoreBoard: Received student_acknowleged_live_question_number message from server for user:", data.user_name, " question number:", data.message);
            // update question number in redux store for that user
            const sender = data.user_name;
            setUserRows((prevRows) => prevRows.map((row) => {
                if (row.name === sender) {
                    return { ...row, live_question_number: Number(data.message) };
                }
                return row;
            }));
            //dispatch(updateLiveQuestionNumber({name: sender, question_number: data.message}));
        }
        else if (data.message_type === "student_acknowleged_live_quiz_id") {
            //console.log("Take Quiz Live: received acknowledge quiz id :", data.message);
             //setLiveQuizId(data.message);
             // only accept the message if you are a teacher
             if (name !== "teacher") {
                 console.log("Take Quiz Live: Ignoring quiz id acknowledge message since not a teacher.");
                 return;
             }
             setUserRows((prevRows) => prevRows.map((row) => {
                if (row.name === data.user_name) {
                    return { ...row, live_quiz_id: data.message };
                }
                return row;
            }));
         }
         else if (data.message_type === "live_score") {
            //console.log("ScoreBoard: Received live_score message from server for user:", data.user_name, " score:", data.message);
            // update live score in redux store for that user
            const sender = data.user_name;
            // first, get the total score for that user
            const user_total_score = userRows.find((row) => row.name === sender)?.total_score || 0;
            //console.log("ScoreBoard: User:", sender, " total score is:", user_total_score);
            // add live score to total score, convert to number first
            const new_total_score = user_total_score + Number(data.message);
            setUserRows((prevRows) => prevRows.map((row) => {
                if (row.name === sender) {
                    return { ...row, live_score: Number(data.message), total_score: new_total_score };
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
        /*
{
  "message_type": "connection_established",
  "user_name": "teacher",
  "other_connected_users": [
    "admin"
  ],
  "live_quiz_id": null,
  "live_question_number": null
}
  {
    "message_type": "student_acknowleged_live_question_number",
    "message": "1",
    "user_name": "admin"
}
        */
      }
      // Subscribe to the "message" event
      eventEmitter?.on("message", handleMessage);
      // Cleanup the event listener on unmount
      return () => {
        eventEmitter?.off("message", handleMessage);
      };
    }, [eventEmitter]); // Only include eventEmitter in the dependency array

    const sendDisconnect = (username: string) => {
        //console.log("sendDisconnect Quiz id: ");
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
        
        <div className="bg-green-300 p-2 mb-2">
            <div>Users online:</div>
            { userRows && userRows.length > 0 &&
                userRows.map((user, index) => (
                    <div className='flex flex-row justify-start mb-2 items-center bg-green-100 px-2' key={index}>
                     <div>
                        { name === "teacher" &&
                            <button 
                                className="bg-red-700 text-white rounded-full text-md p-1 ml-2"
                                onClick={() => sendDisconnect(user.name)}
                            >
                                X
                            </button>
                        }     
                        </div>       
                    <div>
                            { name === "teacher" && user.live_quiz_id !== undefined &&
                            <span>Quiz Id: {user.live_quiz_id}</span>
                    }
                            - {user.name}
                    </div>
                    { user.live_question_number !== undefined &&
                        <>
                    <div className="bg-amber-400 text-md text-blue-600 py-0 ml-1 px-2 rounded-full">{user.live_question_number}</div>
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
                  
                    <div className='flex flex-row justify-center items-center ml-2'>
                        <div className='p-1 mx-2'>Total:</div>
                        <div>
                            {user.total_score === undefined ?

                                <FaSpinner className="animate-spin text-blue-500" size={15} />
                                :
                                <span className="ml-2">{user.total_score}</span>
                            }
                        </div>
                    </div>
                            
                    </>
                    }
                </div>
                ))
            }
 
        </div>
        
        
        </>
      )
}

export default ScoreBoard

/*
           { connectedUser && connectedUser.length > 0 &&
            <div className="flex flex-col space-x-4">
                {connectedUser.map((user, index) => (
                    <div className="flex flex-row justify-start items-center mt-1 gap-2" key={index}>
                    <div>{user.name}</div>
                    { displayUserRow(user, index) }
                    { name === "teacher" &&
                        <button 
                            className="bg-red-500 text-white p-1 ml-2 rounded-md"
                            onClick={() => sendDisconnect(user.name)}
                        >
                            Disconnect
                        </button>
                    }
                   
                    </div>
                    
                ))}
            </div>
    }
*/

/*
      { userRows && userRows.length > 0 &&
                userRows.map((user, index) => (
                    <div className="flex flex-row justify-start items-center mt-1 gap-2" key={index}>
                         <div>
                            { name === "teacher" && user.live_quiz_id !== undefined &&
                            <span>Quiz Id: {user.live_quiz_id}</span>
                    }
                            - {user.name}
                         </div>
                    </div>
                ))
            }
*/


/*
      <div className="bg-green-300 p-2 mb-2">
            <div>Users online:</div>
            { connectedUsers && connectedUsers.length > 0 &&
                connectedUsers.map((user_name, index) => (
                    <div className="flex flex-row justify-start items-center mt-1 gap-2" key={index}>
                        <div>{user_name}</div>
                    </div>
                    
                ))  
            }
 
        </div>
*/

