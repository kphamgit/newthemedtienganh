import { useSelector } from "react-redux";
import { useWebSocket } from "../components/context/WebSocketContext";
import { useState } from "react";




function TeacherControlPanel() {
     
    const {websocketRef} = useWebSocket();
    //const user_name = useSelector((state: { name: string }) => state.name);
    const { name } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);
    

        const [quizId, setQuizId] = useState("");
        const [questionNumber, setQuestionNumber] = useState("");

    const sendQuizId = () => {
        console.log("Sendingggg Quiz id: ");
        if (!websocketRef.current) {
            alert("WebSocket is not connected.");
            return;
        }
        websocketRef.current.send(JSON.stringify({
            message_type: "quiz_id",
            message: quizId,
            user_name: name,   // identify sender
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
            user_name: name,    // identify sender, which is teacher
        }));
        // clear input field
        setQuestionNumber("");
    };
      
  return (
    <>
  
    <div>TeacherControlPanel</div>
    <div className="mt-2 bg-amber-700">
        <input className="bg-blue-200 text-black m-2" placeholder="quiz id..." value={quizId} onChange={(e) => setQuizId(e.target.value)} />
        <button className="text-red bg-green-300 mb-2 hover:bg-green-400" onClick={sendQuizId}>Send Quiz id</button>
    </div>
    <div className="mt-2 bg-amber-700">
        <input className="bg-blue-200 text-black m-2" placeholder="question id..." value={questionNumber} onChange={(e) => setQuestionNumber(e.target.value)} />
        <button className="text-red bg-green-300 mb-2 hover:bg-green-400" onClick={sendQuestionNumber}>Send Question Number</button>
    </div>
    </>
  )
}

export default TeacherControlPanel

/*
return (
    <>
    {
    <div className="bg-green-300 p-2 mb-2">
        <div>Connected Users:</div>
        { connectedUsers && connectedUsers.length > 0 &&
        <ul>
            {connectedUsers.map((user, index) => (
                <li key={index}>{user.name}
                     <span className="ml-2 text-sm text-gray-600">
                        { user.name !== "teacher" &&
                        <button className="bg-red-800 text-white px-2 py-1 rounded hover:bg-amber-600 m-1" onClick={() => sendDisconnect(user.name)}>Disconnect</button>
                        }
                        </span>
                </li>
            ))}
        </ul>
}
    </div>
    }
    <div>TeacherControlPanel</div>
    <div className="mt-2 bg-amber-700">
        <input className="bg-blue-200 text-black m-2" placeholder="quiz id..." value={quizId} onChange={(e) => setQuizId(e.target.value)} />
        <button className="text-red bg-green-300 mb-2 hover:bg-green-400" onClick={sendQuizId}>Send Quiz id</button>
    </div>
    <div className="mt-2 bg-amber-700">
        <input className="bg-blue-200 text-black m-2" placeholder="question id..." value={questionNumber} onChange={(e) => setQuestionNumber(e.target.value)} />
        <button className="text-red bg-green-300 mb-2 hover:bg-green-400" onClick={sendQuestionNumber}>Send Question Number</button>
    </div>
    </>
  )
*/
