import { useWebSocket } from "../components/context/WebSocketContext";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { type RootState, type AppDispatch}  from "../redux/store";
import { addUser, removeUser, updateLiveScore, updateLiveQuestionNumber } from "../redux/connectedUsersSlice";
import { logout } from "../redux/userSlice";
import { clear } from '../redux/connectedUsersSlice';


interface connectionChangeProps {
    message_type: string;
    user: string;
    other_connected_users?: string[];
}

interface messageProps {
  message_type: string;
  message: string;
  user_name: string;
}

type messageValueProps = {
  quiz_id?: string;
  question_number?: string;
}

interface ConnectedUsersControlProps {
   parent_callback: ( value: messageValueProps) => void;
}

function MessageControl({ parent_callback }: ConnectedUsersControlProps) {
 
    const { name } = useSelector((state: RootState) => state.user);
    const connectedUsersInReduxStore = useSelector((state: RootState) => state.connectedUsers.list);
    const dispatch = useDispatch<AppDispatch>();

    const {eventEmitter, websocketRef} = useWebSocket();

    /*
[Log] *********** MessageControl: Received data from server: – {message_type: "live_question_attempt_started", 
message: "Question 1 for Quiz 1", user_name: "kpham"} (MessageControl.tsx, line 18)
    */

  useEffect(() => {
    const handleMessage = (data: any) => {
      //if (data.message_type === "chat") {
      console.log("*********** MessageControl: Received data from server:", data); 
      
      if (data.message_type === "live_question_attempt_started") {
          console.log("MessageControl: Received live_question_attempt_started message from server.");
          //parent_callback("live_question_attempt_started", {question_number: data.message});
          const sender = data.user_name;
          // update question number in redux store for that user
          dispatch(updateLiveQuestionNumber({name: sender, question_number: data.message}));

      }
      else if (data.message_type === "quiz_id") {
        console.log("MessageControl: Received quiz_id message from server.");
          parent_callback({quiz_id: data.message});
      }
      if (data.message_type === "question_number") {
          console.log("MessageControl: Received question_number message from server.");
          parent_callback({question_number: data.message});
      }
      else if (data.message_type === "connection_established") {
        const conn_message: connectionChangeProps = data;
        console.log("MessageControl:******* Received connection establish message from server for user:", conn_message.user);
        // add user to redux store
        dispatch(addUser({id: 1, name: conn_message.user}));
        const other_connected_users = conn_message.other_connected_users || [];
        console.log("MessageControl: Other connected users received from server:", other_connected_users);
        console.log("MessageControl: Connected users in redux store before adding others:", connectedUsersInReduxStore);
        // go through connected users and add the one who are not in there
        // note: other_connected_users does not include self
        other_connected_users.forEach((user_name) => {
            const user_exists = connectedUsersInReduxStore.some((user) => user.name === user_name);
            if (!user_exists) {
                console.log("MessageControl: Adding other connected user to redux store:", user_name);
                dispatch(addUser({id: 1, name: user_name}));
            }
        });
        // if the connnection_established message is for me, check if the message has a key called 'quiz_id'
         if (conn_message.user === name) {
            console.log("MessageControl: Connection established message is for self.");
            if (data.live_quiz_id) {
                console.log("MessageControl: !!!!!! LIVE quiz_id found in connection_established message data:", data);
                parent_callback({quiz_id: data.live_quiz_id, question_number: data.live_question_number} );
            }
         }
      }
      else if (data.message_type === "connection_dropped") {
        const disconnection_message = data;
        console.log("MessageControl: Received connection_dropped message:", disconnection_message);
        dispatch(removeUser(disconnection_message.user));
      }
      else if (data.message_type === "disconnect_user") {
        const disconnect_message = data;
        console.log("MessageControl: Received disconnect_user message:", disconnect_message);
        // is this message for me?
        // data.message contains the username to be disconnected
        const username_to_disconnect = disconnect_message.message;
        if (username_to_disconnect === name) {
            console.log("MessageControl: Disconnecting self as per server instruction.");
            // close websocket connection
            dispatch(logout());
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            //hasLoggedOut.current = true; // Ensure logout is only dispatched once
            // clear access and refresh tokens from localStorage
            dispatch(clear()); // clear list of connected users in redux store
        }
        //dispatch(removeUser(disconnect_message.message)); // message contains the username to be disconnected
      }

      else if (data.message_type === "live_score") {
         // message = live score
          const live_score_message: messageProps = data;
          const live_score = parseInt(live_score_message.message);
          console.log("MessageControl: Received live_score message:", live_score_message);
          // update live score in redux store
          //console.log("MessageControl: Updating live score for user:", live_score_message.user, "to", live_score);
          // don't update score for me because I update it myself when I submit answer to the question
          // see onSubmit in TakeQuizLive.tsx
          if (live_score_message.user_name === name) {
              console.log("MessageControl: live_score message is for self, not updating redux store.");
              return;
          }
          dispatch(updateLiveScore({name: live_score_message.user_name, live_score: live_score}));
      }
    }
    // Subscribe to the "message" event
    eventEmitter?.on("message", handleMessage);
    // Cleanup the event listener on unmount
    return () => {
      eventEmitter?.off("message", handleMessage);
    };
  }, [eventEmitter, connectedUsersInReduxStore]); // Only include eventEmitter in the dependency array


  const sendDisconnect = (username: string) => {
    console.log("sendDisconnect Quiz id: ");
    if (!websocketRef.current) {
        alert("WebSocket is not connected.");
        return;
    }
    websocketRef.current.send(JSON.stringify({
        message_type: "disconnect_user",
        message: username,  // user to be disconnected
        user_name: name,    // identify sender
    }));
    // clear input field
    //setQuizId("");
};

  return (
    <>
    {
    <div className="bg-green-300 p-2 mb-2">
        <div>Online users:</div>
        { connectedUsersInReduxStore && connectedUsersInReduxStore.length > 0 &&
        <div className="flex flex-col space-x-4">
            {connectedUsersInReduxStore.map((user, index) => (
                <div key={index}>{user.name}
 
                { user.live_question_number !== undefined &&
                  <span> {user.live_question_number} </span>
                }
                { user.live_score !== undefined &&
                  <span> (Score: {user.live_score}) </span>
                }
                { user.total_score !== undefined &&
                  <span> (Total: {user.total_score}) </span>
                }
                { name === "teacher" && user.name !== "teacher" && 
                <span>
                  <button className="bg-red-500 text-white p-1 rounded hover:bg-red-700 m-1" onClick={() => sendDisconnect(user.name)}>X</button>
                  </span>
                }
                </div>
                
            ))}
        </div>
}
    </div>
    }
    
    </>
  )
}

export default MessageControl