import { useWebSocket } from "../components/context/WebSocketContext";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { type RootState}  from "../redux/store";
import type { WebSocketMessageProps } from "../components/shared/types";

//const handle_callback = (server_message: WebSocketMessageProps) => {
interface ConnectedUsersControlProps {
   parent_callback: ( server_message: WebSocketMessageProps) => void;
}

function MessageControl({ parent_callback }: ConnectedUsersControlProps) {
 
    const connectedUsersInReduxStore = useSelector((state: RootState) => state.connectedUsers.list);

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
    if (data.message_type === "chat") {
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

export default MessageControl