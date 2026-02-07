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

function MessageControlStudent({ parent_callback }: ConnectedUsersControlProps) {
 
    const { name } = useSelector((state: RootState) => state.user);
    const connectedUsersInReduxStore = useSelector((state: RootState) => state.connectedUsers.list);
    const dispatch = useDispatch<AppDispatch>();

    const {eventEmitter} = useWebSocket();

    /*
[Log] *********** MessageControl: Received data from server: – {message_type: "live_question_attempt_started", 
message: "Question 1 for Quiz 1", user_name: "kpham"} (MessageControl.tsx, line 18)
    */

useEffect(() => {
  const handleMessage = (data: WebSocketMessageProps) => {
    console.log("MessageControl: handleMessage called with data:", data);
    //if (data.message_type === "chat") {
   //console.log("*********** MessageControl: Received data from server:", data); 
    //if (data.message_type === "chat") {
      //  parent_callback(data);
    //}
  if (data.message_type === "disconnect_user") {
       console.log("MessageControl: Received disconnect_user message:", data);
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
    else if (data.message_type === "terminate_live_quiz") {
      parent_callback(data);
    }
  }

  // Subscribe to the "message" event
  eventEmitter?.on("message", handleMessage);
  // Cleanup the event listener on unmount
  return () => {
    eventEmitter?.off("message", handleMessage);
  };
}, [eventEmitter, connectedUsersInReduxStore]); // Only include eventEmitter in the dependency array

  return (
    null
  )
}

export default MessageControlStudent