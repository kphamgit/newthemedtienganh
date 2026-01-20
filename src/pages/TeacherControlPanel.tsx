import { useSelector } from "react-redux";
import { useWebSocket } from "../components/context/WebSocketContext";
import type { RootState } from "../redux/store";
import { useState } from "react";


function TeacherControlPanel() {
     
    const {websocketRef} = useWebSocket();
    const user = useSelector((state: RootState) => state.user);

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