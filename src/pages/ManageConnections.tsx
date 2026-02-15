import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { useWebSocket } from '../components/context/WebSocketContext';
//import { FaSpinner } from "react-icons/fa";
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

function ManageConnections() {
    const { name } = useSelector((state: RootState) => state.user);
    //const connectedUsersInReduxStore = useSelector((state: RootState) => state.connectedUsers.list);
    const {websocketRef, eventEmitter} = useWebSocket();

    const [userRows, setUserRows] = useState<UserRowProps[]>([]);

    

    const getLiveQuestionNumber = (liveQuestionNumber: number | undefined) => {
        return liveQuestionNumber && liveQuestionNumber !== 0 ? Number(liveQuestionNumber) : undefined;
      };
      
    

  useEffect(() => {
      const handleMessage = (data: WebSocketMessageProps) => {
        //console.log("ScoreBoard: handleMessage called with data:", data);
        if (data.message_type === "welcome_message") {
           
          console.log("ManageUsers: Received welcome_message from server:", data);
          console.log("ScoreBoard: welcome_message other_connected_users:", data.other_connected_users);
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
        else if (data.message_type === "another_user_joined") {
          console.log("ScoreBoard: Received another_user_joined message from server for user:", data);
            // add this user to user rows, but only if not already in the list (to avoid duplicate when teacher opens multiple tabs)
            // set is_logged_in to true for this user in case they are already in the list but got disconnected before
            setUserRows((prevRows) => {
                const userExists = prevRows.some((row) => row.name === data.user_name);
                if (userExists) {
                    console.log("ScoreBoard: User already in the list, updating is_logged_in to true for user:", data.user_name);
                    return prevRows.map((row) => {
                        if (row.name === data.user_name) {
                            return { ...row, is_logged_in: true };
                        }
                        return row;
                    });
                } else {
                    console.log("ScoreBoard: Adding new user to the list:", data.user_name);
                    return [...prevRows, { name: data.user_name, is_logged_in: true }]; // add new user to the list with is_logged_in set to true
                }
            });
        }
        else if (data.message_type === "user_disconnected") {
            console.log("ScoreBoard: Received user_disconnected message from server for user:", data.user_name);
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
        <div>Manage Users:</div>
            <div className="bg-green-300 p-2 mb-2">
                
                <div>Student: {name},</div>
                {userRows && userRows.length > 0 &&
                    userRows.map((user, index) => (
                        <div className='flex flex-row justify-start mb-2 items-center bg-green-100 px-2' key={index}>
                               <div
                                className={`text-blue-800 font-bold ${user.is_logged_in === false ? "opacity-50" : "opacity-100"
                                    }`}
                            >
                                {user.name}
                            </div>
                                
                                { 
                                    user.is_logged_in !== undefined && user.is_logged_in === true && 
                                   <div>
                                  
                                        <button 
                                            className='ml-4 px-2 rounded-md hover:underline bg-red-700 text-white '
                                            onClick={() => sendDisconnect(user.name)}
                                        >
                                            X
                                        </button>
                                     
                                    
                                    </div>
                                }
                                
                            
                        </div>
                    ))
                }
            </div>
        </>
    )
}

export default ManageConnections

