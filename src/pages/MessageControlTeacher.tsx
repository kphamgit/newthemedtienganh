import { useWebSocket } from "../components/context/WebSocketContext";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { type RootState, type AppDispatch}  from "../redux/store";
import { addUser, removeUser, updateLiveScore, updateLiveQuestionNumber } from "../redux/connectedUsersSlice";
import type { WebSocketMessageProps } from "../components/shared/types";

//const handle_callback = (server_message: WebSocketMessageProps) => {
interface ConnectedUsersControlProps {
   parent_callback: ( server_message: WebSocketMessageProps) => void;
}

function MessageControlTeacher({ parent_callback }: ConnectedUsersControlProps) {
 
    const { name } = useSelector((state: RootState) => state.user);
    const connectedUsersInReduxStore = useSelector((state: RootState) => state.connectedUsers.list);
    const dispatch = useDispatch<AppDispatch>();

    const {eventEmitter} = useWebSocket();

    /*
[Log] *********** MessageControlTeacher: Received data from server: – {message_type: "live_question_attempt_started", 
message: "Question 1 for Quiz 1", user_name: "kpham"} (MessageControlTeacher.tsx, line 18)
    */

useEffect(() => {
  const handleMessage = (data: WebSocketMessageProps) => {
    console.log("MessageControlTeacher: handleMessage called with data:", data);
    //if (data.message_type === "chat") {
   //console.log("*********** MessageControlTeacher: Received data from server:", data); 
    //if (data.message_type === "chat") {
      //  parent_callback(data);
   // }
   
    if (data.message_type === "connection_established") {
      //const conn_message: connectionChangeProps = data;
     //console.log("MessageControlTeacher:******* Received connection establish message from server for user:", data.user_name);
      // add user to redux store
      dispatch(addUser({id: 1, name: data.user_name}));
      const other_connected_users = data.other_connected_users || [];
     //console.log("MessageControlTeacher: Other connected users received from server:", other_connected_users);
     //console.log("MessageControlTeacher: Connected users in redux store before adding others:", connectedUsersInReduxStore);
      // go through connected users and add the one who are not in there
      // note: other_connected_users does not include self
      other_connected_users.forEach((user_name) => {
          const user_exists = connectedUsersInReduxStore.some((user) => user.name === user_name);
          if (!user_exists) {
             //console.log("MessageControlTeacher: Adding other connected user to redux store:", user_name);
              dispatch(addUser({id: 1, name: user_name}));
          }
      });
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

export default MessageControlTeacher