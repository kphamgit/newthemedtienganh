import { useWebSocket } from "../components/context/WebSocketContext";
import { useEffect, useState } from "react";


function StudentControlPanel() {
     
    const {eventEmitter} = useWebSocket();
    //const user = useSelector((state: RootState) => state.user);

    const [connectedUsers, setConnectedUsers] = useState<string[]>([]);

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
      };

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
        <ul>
            {connectedUsers.map((username, index) => (
                <li key={index}>{username}</li>
            ))}
        </ul>
}
    </div>
    }
    
    </>
  )
}

export default StudentControlPanel