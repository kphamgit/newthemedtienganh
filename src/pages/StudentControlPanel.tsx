import { useWebSocket } from "../components/context/WebSocketContext";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
//import { type RootState}  from "../redux/store";
import { logout } from "../redux/userSlice";


function StudentControlPanel() {
     
    const {eventEmitter} = useWebSocket();
    //const user = useSelector((state: RootState) => state.user);
    const { name } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);

    const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
    const dispatch = useDispatch();

    useEffect(() => {
      const handleMessage = (data: any) => {
        //if (data.message_type === "chat") {
        console.log("StudentControlPanel: Received data from server:", data);
        /*
{
    "message_type": "connection_established",
    "message": "WebSocket connection established.",
    "connected_users": [
        "admin"
    ]
}
        */

      if (data.message_type === "connection_change" && data.connected_users) {
          console.log("TeacherControlPanel: Received  connecttion message from server:", data);
            setConnectedUsers(data.connected_users);
        //}
      }
      else if (data.message_type === "disconnect_user" && data.message) {
          console.log("StudentControlPanel: Received dis_connection message:", data);
            //setConnectedUsers(data.connected_users);
            // is it for me?
            // user name to be disconnected is in data.message
            //console.log(" user name in redux store:", name);
            if (data.message === name ) {
                //alert("You will be disconnected by the teacher.");
                dispatch(logout());
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                //localStorage.clear();
               //window.location.reload();
            }
           
        }
      }

      /*
{
    "message_type": "connection_changed",
    "message": "WebSocket connection established for user:admin",
    "connected_users": [
        "admin"
    ]
}
      */
     
  
      // Subscribe to the "message" event
      eventEmitter?.on("message", handleMessage);
  
      // Cleanup the event listener on unmount
      return () => {
        eventEmitter?.off("message", handleMessage);
      };
    }, [eventEmitter]); // Only include eventEmitter in the dependency array

  
  return (
    <>
    {
    <div className="bg-green-300 p-2 mb-2">
        <div>Connected Users:</div>
        { connectedUsers && connectedUsers.length > 0 &&
        <div className="flex flex-row justify-start space-x-4">
            {connectedUsers.map((username, index) => (
                <div key={index}>{username}</div>
                
            ))}
        </div>
}
    </div>
    }
    
    </>
  )
}

export default StudentControlPanel