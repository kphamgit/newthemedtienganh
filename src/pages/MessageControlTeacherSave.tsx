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

function MessageControlTeacherSave({ parent_callback }: ConnectedUsersControlProps) {
 
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
    if (data.message_type === "student_acknowleged_live_question_number") {
       //console.log("MessageControlTeacher: ************ Received live_question_attempt_started message from server.");
        //parent_callback("live_question_attempt_started", {question_number: data.message});
        const sender = data.user_name;
        // update question number in redux store for that user
        dispatch(updateLiveQuestionNumber({name: sender, question_number: data.message}));
    }
    else if (data.message_type === "quiz_id") {
     //teacher waits for this acknowledge from server before setting live QUIZ number for its view
        console.log("MessageControlTeacher: Received ACK of quiz_id message from server.");
        parent_callback(data);
    }
    else if (data.message_type === "question_number") {
       //teacher waits for this acknowledge from server before setting live QUESTION number for its view
        const user_name_target = data.user_name; // target user is in user_name field for question_number message
       //console.log("MessageControlTeacher: question_number target user is:", user_name_target, " current user is:", name);
        // is it for everybody? then accept it
        if (user_name_target === "all") {
           //console.log("MessageControlTeacher: question_number message is for all users, accepting.");
            parent_callback(data);
            return;
        }
        else if (user_name_target.trim() === name) { // is it for me?
           //console.log("MessageControlTeacher: question_number message is for self, accepting.");
              parent_callback(data);
              return;
        }
      
    }
    else if (data.message_type === "connection_established") {
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
      // is there live_quiz_id and live_question_number in the connection established message?
      if (data.live_quiz_id && data.live_question_number) {
        //console.log("MessageControlTeacher:  LIVE quiz_id and live question number found in connection_established message data:", data);
          parent_callback({message_type: "live_quiz_id_and_live_question_number", message: data.live_quiz_id + '/' + data.live_question_number, user_name: data.user_name} );
      }
      else if (data.live_quiz_id) {
         //console.log("MessageControlTeacher: !!!!!! LIVE quiz_id found in connection_established message data:", data);
          parent_callback({message_type: "quiz_id", message: data.live_quiz_id, user_name: data.user_name} );
      }
    }
    else if (data.message_type === "connection_dropped") {
      const disconnection_message = data;
     //console.log("MessageControlTeacher: Received connection_dropped message:", disconnection_message);
      dispatch(removeUser(disconnection_message.user_name));
    }
    else if (data.message_type === "live_score") {
        const live_score = parseInt(data.message);
        // update live score in redux store
        //console.log("MessageControlTeacher: Updating live score for user:", live_score_message.user, "to", live_score);
        // don't update score for me because I update it myself when I submit answer to the question
        // see onSubmit in TakeQuizLive.tsx
        if (data.user_name === name) {
            return;
        }
        dispatch(updateLiveScore({name: data.user_name, live_score: live_score}));
    }
    else if (data.message_type === "cache_query_response") {
     //console.log("MessageControlTeacher: Received error message from server:", data.message);
      //console.log("Cache query response from server: " + data);
      parent_callback(data);
      /*
  "message_type": "cache_query_response",
                "message": message,  // this is the queried key
                "queried_value": queried_value,
            }))
      */
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

export default MessageControlTeacherSave