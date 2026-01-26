import { useWebSocket } from "../components/context/WebSocketContext";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { type RootState, type AppDispatch}  from "../redux/store";
import { addUser, removeUser } from "../redux/connectedUsersSlice";


interface connectionChangeProps {
    message_type: string;
    user: string;
    other_connected_users?: string[];
}


function ConnectedUsersControl() {
 
    const { name } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);
    const connectedUsersInReduxStore = useSelector((state: RootState) => state.connectedUsers.list);
    const dispatch = useDispatch<AppDispatch>();

    const {eventEmitter, websocketRef} = useWebSocket();

  useEffect(() => {
    const handleMessage = (data: any) => {
      //if (data.message_type === "chat") {
      //console.log("ConnectedUsersControl: Received data from server:", data); 
      if (data.message_type === "connection_established") {
        const conn_message: connectionChangeProps = data;
        console.log("ConnectedUsersControl: Received connection establish data from server:", conn_message);
        // add user to redux store
        dispatch(addUser({id: 1, name: conn_message.user}));
        const other_connected_users = conn_message.other_connected_users || [];
        console.log("ConnectedUsersControl: Other connected users received from server:", other_connected_users);
        console.log("ConnectedUsersControl: Connected users in redux store before adding others:", connectedUsersInReduxStore);
        // go through connected users and add the one who are not in there
        other_connected_users.forEach((user_name) => {
            const user_exists = connectedUsersInReduxStore.some((user) => user.name === user_name);
            if (!user_exists) {
                console.log("ConnectedUsersControl: Adding other connected user to redux store:", user_name);
                dispatch(addUser({id: 1, name: user_name}));
            }
        });
      
        //}
      }
      else if (data.message_type === "connection_dropped") {
        const disconnection_message = data;
        console.log("ConnectedUsersControl: Received connection_dropped message:", disconnection_message);
        dispatch(removeUser(disconnection_message.user));
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
        <div>Connected Users Control:</div>
        { connectedUsersInReduxStore && connectedUsersInReduxStore.length > 0 &&
        <div className="flex flex-row justify-start space-x-4">
            {connectedUsersInReduxStore.map((user, index) => (
                <div key={index}>{user.name}
                { name === "teacher" && user.name !== "teacher" && 
                <span>
                  <button className="bg-red-800 text-white px-2 py-1 rounded hover:bg-amber-600 m-1" onClick={() => sendDisconnect(user.name)}>Disconnect</button>
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

export default ConnectedUsersControl