import { useWebSocket } from "../components/context/WebSocketContext";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { type RootState, type AppDispatch}  from "../redux/store";
import { addUser, removeUser, updateLiveScore, updateLiveQuestionNumber } from "../redux/connectedUsersSlice";
import { logout } from "../redux/userSlice";
import { clear } from '../redux/connectedUsersSlice';
import type { WebSocketMessageProps } from "../components/shared/types";


//type messageValueProps = {
  //quiz_id?: string;
  //question_number?: string;
//}

//const handle_callback = (server_message: WebSocketMessageProps) => {
interface ConnectedUsersControlProps {
   parent_callback: ( server_message: WebSocketMessageProps) => void;
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
  const handleMessage = (data: WebSocketMessageProps) => {
   //console.log("MessageControl: handleMessage called with data:", data);
    //if (data.message_type === "chat") {
   //console.log("*********** MessageControl: Received data from server:", data); 
    if (data.message_type === "chat") {
        parent_callback(data);
    }
    else if (data.message_type === "live_question_attempt_started") {
       //console.log("MessageControl: ************ Received live_question_attempt_started message from server.");
        //parent_callback("live_question_attempt_started", {question_number: data.message});
        const sender = data.user_name;
        // update question number in redux store for that user
        dispatch(updateLiveQuestionNumber({name: sender, question_number: data.message}));
    }
    else if (data.message_type === "quiz_id") {
     //console.log("MessageControl: Received quiz_id message from server.");
        //parent_callback({quiz_id: data.message});
        parent_callback(data);
    }
    else if (data.message_type === "question_number") {
       //console.log("MessageControl: Received question_number message from server.");

        //parent_callback({question_number: data.message});
        const user_name_target = data.user_name; // target user is in user_name field for question_number message
       //console.log("MessageControl: question_number target user is:", user_name_target, " current user is:", name);
        // is it for everybody? then accept it
        if (user_name_target === "all") {
           //console.log("MessageControl: question_number message is for all users, accepting.");
            parent_callback(data);
            return;
        }
        else if (user_name_target.trim() === name) { // is it for me?
           //console.log("MessageControl: question_number message is for self, accepting.");
              parent_callback(data);
              return;
        }
      
    }
    else if (data.message_type === "connection_established") {
      //const conn_message: connectionChangeProps = data;
     //console.log("MessageControl:******* Received connection establish message from server for user:", data.user_name);
      // add user to redux store
      dispatch(addUser({id: 1, name: data.user_name}));
      const other_connected_users = data.other_connected_users || [];
     //console.log("MessageControl: Other connected users received from server:", other_connected_users);
     //console.log("MessageControl: Connected users in redux store before adding others:", connectedUsersInReduxStore);
      // go through connected users and add the one who are not in there
      // note: other_connected_users does not include self
      other_connected_users.forEach((user_name) => {
          const user_exists = connectedUsersInReduxStore.some((user) => user.name === user_name);
          if (!user_exists) {
             //console.log("MessageControl: Adding other connected user to redux store:", user_name);
              dispatch(addUser({id: 1, name: user_name}));
          }
      });
      // is there live_quiz_id and live_question_number in the connection established message?
      if (data.live_quiz_id && data.live_question_number) {
        //console.log("MessageControl:  LIVE quiz_id and live question number found in connection_established message data:", data);
          parent_callback({message_type: "live_quiz_id_and_live_question_number", message: data.live_quiz_id + '/' + data.live_question_number, user_name: data.user_name} );
      }
      else if (data.live_quiz_id) {
         //console.log("MessageControl: !!!!!! LIVE quiz_id found in connection_established message data:", data);
          parent_callback({message_type: "quiz_id", message: data.live_quiz_id, user_name: data.user_name} );
      }
    }
    else if (data.message_type === "connection_dropped") {
      const disconnection_message = data;
     //console.log("MessageControl: Received connection_dropped message:", disconnection_message);
      dispatch(removeUser(disconnection_message.user_name));
    }
    else if (data.message_type === "disconnect_user") {
     //console.log("MessageControl: Received disconnect_user message:", data);
      // is this message for me?
      // data.message contains the username to be disconnected
      const username_to_disconnect = data.message;
      if (username_to_disconnect === name) {
         //console.log("MessageControl: Disconnecting self as per server instruction.");
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
        const live_score = parseInt(data.message);
       //console.log("MessageControl: Received live_score message:", data);
        // update live score in redux store
        //console.log("MessageControl: Updating live score for user:", live_score_message.user, "to", live_score);
        // don't update score for me because I update it myself when I submit answer to the question
        // see onSubmit in TakeQuizLive.tsx
        if (data.user_name === name) {
           //console.log("MessageControl: live_score message is for self, not updating redux store.");
            return;
        }
        dispatch(updateLiveScore({name: data.user_name, live_score: live_score}));
        
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
    {
    <div className="bg-green-300 p-2 mb-2">
        <div>Users online:</div>
        { connectedUsersInReduxStore && connectedUsersInReduxStore.length > 0 &&
        <div className="flex flex-col space-x-4">
            {connectedUsersInReduxStore.map((user, index) => (
                <div key={index}>{user.name}
 
                { user.live_question_number !== undefined &&
                  <span className="bg-red-300 p-0.5 pl-1 ml-1 rounded-md">{user.live_question_number}</span>
                }
                { user.live_score !== undefined &&
                  <span className="ml-2">Score: {user.live_score},</span>
                }
                { user.total_score !== undefined &&
                  <span className="ml-3">Total: {user.total_score}</span>
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