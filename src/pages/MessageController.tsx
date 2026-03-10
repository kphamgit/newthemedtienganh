import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { useWebSocket } from '../components/context/WebSocketContext';
//import { FaSpinner } from "react-icons/fa";
import { useEffect } from 'react';
import type { ReceivedConnectedUserDataProps, WebSocketMessageProps } from '../components/shared/types';
import { useUserConnections } from '../components/context/UserConnectionsContext';
import type { ChatProps } from '../components/chat/ChatPage';
//import { setUser } from '../redux/userSlice';
//import { setUser } from '../redux/userSlice';
//import { type LoggedInUserPendingDataProps } from '../components/shared/types';


type Props = {
    parentCallback: (chat: ChatProps) => void;
}

function MessageController({ parentCallback }: Props) {
    const { name } = useSelector((state: RootState) => state.user);
    //const connectedUsersInReduxStore = useSelector((state: RootState) => state.connectedUsers.list);
    const {eventEmitter} = useWebSocket();

    //const [liveQuizId, setLiveQuizId] = useState<string | null>(null);

    const {userRows, setUserRows, setLiveQuizId, setMyLiveQuestionNumber} = useUserConnections();
    const getLiveQuestionNumber = (liveQuestionNumber: number | undefined) => {
        return liveQuestionNumber && liveQuestionNumber !== 0 ? Number(liveQuestionNumber) : undefined;
      };
      
 // Notify the parent component whenever userRows changes
 /*
 useEffect(() => {
    if (parentCallback) {
        console.log('MessageController: userRows updated, invoking parentCallback with:', userRows);
      parentCallback(userRows, liveQuizId || '');
    }
  }, [userRows, parentCallback]);
*/

    useEffect(() => {
        const handleMessage = (data: WebSocketMessageProps) => {
            //console.log("MessageController: handleMessage called with data:", data);
            if (data.message_type === "welcome_message") {
                //console.log("MessageController: welcome_message ALLLLLL connected_users:", data.connected_users);
                const connectedUsersFromServer = data.connected_users as ReceivedConnectedUserDataProps[];

                // search for myself in the connected users list from server  
                const me_in_connected_users = connectedUsersFromServer.find((user) => user.name === name);
                // see if I have a pending question number (which means I log out or got disconnected before I finished answering the question
                if (me_in_connected_users) {
                    //console.log("MessageController: Found myself in the connected users list from server, my data:", me_in_connected_users);
                    const my_live_question_number = getLiveQuestionNumber(Number(me_in_connected_users.live_question_number));
                    if (setMyLiveQuestionNumber && my_live_question_number) {
                        setMyLiveQuestionNumber(my_live_question_number);
                        //console.log("MessageController: Set myLiveQuestionNumber to:", my_live_question_number);
                    }
                } else {
                    alert("MessageController: Did not find myself in the connected users list from server");
                }

                setUserRows(
                    connectedUsersFromServer.map((user) => ({
                        name: user.name,
                        live_question_number: getLiveQuestionNumber(Number(user.live_question_number)),
                        live_total_score: user.live_total_score ? Number(user.live_total_score) : undefined,
                        is_logged_in: user.is_logged_in === "true" ? true : user.is_logged_in === "false" ? false : undefined, // convert string to boolean, if it's not "true" or "false", set to undefined
                    }))
                );
                if (data.live_quiz_id) {
                    //console.log("************ MessageController: welcome_message live_quiz_id:", data.live_quiz_id);
                    setLiveQuizId(data.live_quiz_id);
                }

            } //

            if (data.message_type === "another_user_joined") {
                //console.log("MessageController: Received another_user_joined message from server for user:", data);
                // add this user to user rows, but only if not already in the list (to avoid duplicate when teacher opens multiple tabs)
                // set is_logged_in to true for this user in case they are already in the list but got disconnected before
                setUserRows((prevRows) => {
                    const userExists = prevRows.some((row) => row.name === data.user_name);
                    if (userExists) {
                        //console.log("MessageController: User already in the list, updating is_logged_in to true for user:", data.user_name);
                        return prevRows.map((row) => {
                            if (row.name === data.user_name) {
                                return { ...row, is_logged_in: true };
                            }
                            return row;
                        });
                    } else {
                        //console.log("MessageController: Adding new user to the list:", data.user_name);
                        return [...prevRows, { name: data.user_name, is_logged_in: true }]; // add new user to the list with is_logged_in set to true
                    }
                });
            }
            else if (data.message_type === "user_disconnected") {
                //console.log("MessageController: Received user_disconnected message from server for user:", data.user_name);
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
            else if (data.message_type === "chat") {
                //console.log("MessageController: Received chat message from server:. ");
                parentCallback({ text: data.content, user_name: data.user_name });
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
        <div className='opacity-45'>MessageController- Connected Users:</div>
            <div className="flex flex-row justify-start bg-green-300 p-2 mb-2">
                {userRows && userRows.length > 0 &&
                    userRows.map((user, index) => (
                        <div className='flex flex-row justify-start mb-2 items-center bg-green-100 px-2' key={index}>
                               <div
                                className={`text-blue-800 font-bold ${user.is_logged_in === false ? "opacity-50" : "opacity-100"
                                    }`}
                            >    
                                <span>{user.name}</span>
                            </div>
                        </div>
                    ))
                }
            </div>
        </>
    )
}

export default MessageController

/*
   { user.recording_received && 
                                    <span className='ml-2 text-sm text-green-700'>(Recording Received)
                                    <audio controls className='ml-2'>
                                        <source src={user.recording_presigned_url} type="audio/webm" />
                                        Your browser does not support the audio element.
                                    </audio>
                                    </span>
                                }
*/


