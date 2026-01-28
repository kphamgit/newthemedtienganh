import { useSelector } from "react-redux";
import { useWebSocket } from "../components/context/WebSocketContext";
import { useState } from "react";
import api from "../api";




function TeacherControlPanel() {
     
    const {websocketRef} = useWebSocket();
    //const user_name = useSelector((state: { name: string }) => state.name);
    const { name } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);
    

        const [quizId, setQuizId] = useState("");
        const [liveQuizIsOn, setLiveQuizIsOn] = useState(false);
        const [questionNumber, setQuestionNumber] = useState("");

    const sendQuizId = () => {
       //console.log("Sendingggg Quiz id: ");
        if (!websocketRef.current) {
            alert("WebSocket is not connected.");
            return;
        }
        // verify from server that there's a quiz with that id?
        // english/quizzes/retrieve/<int:pk>/
        const url = `/english/quizzes/retrieve/${quizId}/`;
       //console.log("Verifying quiz id from server with url:", url);
        api.get(url)
            .then((response) => {
                if (response) {
                    console.log("Quiz id found on server:", response.data.id);
                    /*
                     – {id: 1, unit_id: 1, name: "Quiz 1", …} (
                    */

                    //console.log("Quiz id verified from server:", response.data);

                    // proceed to send quiz id via websocket
                    //console.log("sendQuizId:-------->>> ");
                    websocketRef.current?.send(JSON.stringify({
                        message_type: "quiz_id",
                        message: quizId,
                        user_name: name,   // identify sender
                    }));
                    // clear input field
                    setLiveQuizIsOn(true);
                    setQuizId("");
                } else {
                    //console.log("Quiz id NOT found on server.");
                    alert("Quiz id NOT found on server.");
                    return;
                }
            })
        .catch((error) => {
            console.error("Error verifying quiz id from server:", error);
            alert("Error verifying quiz id from server.");
            return;
        });

     
    };

    const sendQuestionNumber = () => {
       //console.log("sendQuestionNumber: ");
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

    const terminateLiveQuiz = () => {
       //console.log("terminateLiveQuiz: ");
        if (!websocketRef.current) {
            alert("WebSocket is not connected.");
            return;
        }
        websocketRef.current.send(JSON.stringify({
            message_type: "terminate_live_quiz",
            message: "terminate",
            user_name: name,    // identify sender, which is teacher
        }));
    };
      
  return (
    <div className="m-10">
  
    <div>TeacherControlPanel
        <span>
            
            liveQuiz : {liveQuizIsOn ? "ON" : "OFF"}
            
        { liveQuizIsOn && quizId !== "" &&
           <span> current Quiz id: {quizId} </span>
        }
        { liveQuizIsOn  &&
        <button className="text-white bg-red-600 ml-10 mb-2 p-2 rounded-md hover:bg-red-400" onClick={terminateLiveQuiz}>Terminate Live Quiz</button>
        }
        </span>
    </div>
    <div className="mt-2 bg-gray-200">
        <input className="bg-blue-200 text-black m-2 p-2" placeholder="quiz id..." value={quizId} onChange={(e) => setQuizId(e.target.value)} />
        { quizId !== "" &&
        <button className="text-red bg-green-300 mb-2 p-2 rounded-md hover:bg-green-400" onClick={sendQuizId}>Send Quiz id</button>
        }
        </div>
    <div className="mt-2 bg-gray-200">
        <input className="bg-blue-200 text-black m-2 p-2 rounded-md" placeholder="question id..." value={questionNumber} onChange={(e) => setQuestionNumber(e.target.value)} />
        <button className="text-red bg-green-300 mb-2 hover:bg-green-400" onClick={sendQuestionNumber}>Send Question Number</button>
    </div>
   
    </div>
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
