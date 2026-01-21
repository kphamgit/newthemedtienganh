import { useSelector } from "react-redux";
import { useWebSocket } from "../components/context/WebSocketContext";
import type { RootState } from "../redux/store";
import { useEffect, useState } from "react";


function TeacherControlPanel() {
     
    const {eventEmitter, websocketRef} = useWebSocket();
    const user = useSelector((state: RootState) => state.user);

    const [connectedUsers, setConnectedUsers] = useState<string[]>([]);

        const [quizId, setQuizId] = useState("");
        const [questionNumber, setQuestionNumber] = useState("");

    useEffect(() => {
      const handleMessage = (data: any) => {
        //if (data.message_type === "chat") {
          console.log("TeacherControlPanel: Received  connection message from server:", data);
          if (data.message_type === "connection_change" && data.connected_users) {
            setConnectedUsers(data.connected_users);
        }
        //}
      };
  
      // Subscribe to the "message" event
      eventEmitter?.on("message", handleMessage);
  
      // Cleanup the event listener on unmount
      return () => {
        eventEmitter?.off("message", handleMessage);
      };
    }, [eventEmitter]); // Only include eventEmitter in the dependency array

    const sendQuizId = () => {
        console.log("Sendingggg Quiz id: ");
        if (!websocketRef.current) {
            alert("WebSocket is not connected.");
            return;
        }
        websocketRef.current.send(JSON.stringify({
            message_type: "quiz_id",
            message: quizId,
            user_name: user.name,
        }));
        // clear input field
        setQuizId("");
    };

    const sendQuestionNumber = () => {
        console.log("sendQuestionNumber: ");
        if (!websocketRef.current) {
            alert("WebSocket is not connected.");
            return;
        }
        websocketRef.current.send(JSON.stringify({
            message_type: "question_number",
            message: questionNumber,
            user_name: user.name,
        }));
        // clear input field
        setQuestionNumber("");
    };
      
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
    <div>TeacherControlPanel</div>
    <div className="bg-red-300"><input className="bg-blue-300 text-black" placeholder="quiz id..." value={quizId} onChange={(e) => setQuizId(e.target.value)} /></div>
     
    <div className="bg-red-300"><input className="bg-blue-300 text-black mb-2" placeholder="question id..." value={questionNumber} onChange={(e) => setQuestionNumber(e.target.value)} /></div>

 
    <div className="mt-2 bg-amber-700">
    <button className="text-red bg-green-300 mb-2 hover:bg-green-400" onClick={sendQuizId}>Send Quiz id</button>
    <div><button className="text-red bg-green-300 mb-2" onClick={sendQuestionNumber}>Send Question Number</button></div>
    </div>
    </>
  )
}

export default TeacherControlPanel