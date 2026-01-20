import { useState, useEffect, useRef } from "react";
import api from "../api";
import { type LevelProps} from "../components/Level";
import "../styles/Home.css"
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import { type RootState } from "../redux/store";
import { useSelector } from "react-redux";
import ChatPage, { type ChatPageRefProps } from "../components/chat/ChatPage";
import { WebSocketProvider } from "../components/context/WebSocketContext";


function Home() {

    const [levels, setLevels] = useState<LevelProps[]>([]);
    const user = useSelector((state: RootState) => state.user);

    const shouldConnect = !!user.name 

    const [isChatOpen, setIsChatOpen] = useState<boolean | null>(null);

    const [questionId, setQuestionId] = useState("");
    const [quizId, setQuizId] = useState("");


    const chatPageRef = useRef<ChatPageRefProps>(null);



    //const { websocketRef } = useWebSocket();

    //const channelId = Math.floor(Math.random() * 10000);
    //console.log('Connecting to WebSocket at ws://'+ws_url+'/ws/bar/'+channelId+'/low/');
    /*
    const websocket = new WebSocket(
        `ws://${ws_url}/ws/bar/${channelId}/low/`
    );
    */
// WebSocket reference
    //let websocket: WebSocket | null = null;
    //const websocketRef = useRef<WebSocket | null>(null);

    /*
    const websocket = new WebSocket(
        `ws://${ws_url}/ws/socket-server/`
    );
    */
    
    const wsUrl = `${import.meta.env.VITE_WS_PROTOCOL}://${import.meta.env.VITE_WS_URL}/ws/socket-server/${user.name}/`;

    //console.log("Home: WebSocket URL:", wsUrl);

/*
    useEffect(() => {
        websocketRef.current = new WebSocket(
            `${ws_protocol}://${ws_url}/ws/socket-server/${user.name}/`
        );
        websocketRef.current.onopen = () => {
            console.log('WebSocket connection opened');
        };

        websocketRef.current.onmessage = (e) => {
            let data = JSON.parse(e.data);
            console.log('Received message from server:', data);
            
            if (data.message_type === 'chat') {
                console.log('Home: Chat Message from server: ' + data.message);
                setReceivedChatMessage({
                    text: data.message,
                    user_name: data.user_name,
                });
            } else if (data.message_type === 'question_id') {
                console.log('Home: Question ID from server: ' + data.message);
              

                //handle question id message
                const api_url = `/take_quiz_live?question_id=${data.message}`
                //console.log("Navigating to:", api_url);
                navigate(api_url)
            }
            
             if (data.message_type === 'quiz_id') {
                console.log('Home: Quiz ID received from server: ' + data.message)
                // message is quiz id
                const api_url = `/take_quiz_live/${data.message}`
                console.log("HOME Navigating to:", api_url);
                navigate(api_url)
            }
           };

        //clean up the WebSocket connection when the component unmounts
        // kpham: make sure you clean up upon logout as well

        return () => {
            if (websocketRef.current) {
                websocketRef.current.close();
                console.log('WebSocket connection closed');
            }
        };

    }, []);

*/

/*
    useEffect(() => {
        if (websocketRef.current) {
            websocketRef.current.onmessage = (e) => {
                const data = JSON.parse(e.data);
                console.log("Received message from server:", data);

                if (data.message_type === "quiz_id") {
                    console.log("Home: Quiz ID received from server: " + data.message);
                    const api_url = `/take_quiz_live/${data.message}`;
                    console.log("HOME Navigating to:", api_url);
                    navigate(api_url);
                }
            };
        }
    }, [websocketRef]);
*/

    useEffect(() => {
        getLevels();
    }, []);  // empty dependency array to run only once on mount

    const getLevels = () => {
        //console.log("Fetching categories...");
        api
            .get("/api/levels/")
            .then((res) => res.data)
            .then((data) => {
                //console.log("categories", data);
                setLevels(data);
                //console.log("categories", data);
            })
            .catch((err) => alert(err));
    };

    /*
    const sendChatMessage = () => {
        //alert("Sendingggg message: " + testMessage);
        if (!websocketRef.current) {
            alert("WebSocket is not connected.");
            return;
        }
        websocketRef.current.send(JSON.stringify({
            message_type: "chat",
            message: chatMessage,
            user_name: user.name,
        }));
    };

    const sendQuestionId = () => {
        console.log("Sendingggg question id: " + questionId);
        if (!websocketRef.current) {
            alert("WebSocket is not connected.");
            return;
        }
        websocketRef.current.send(JSON.stringify({
            message_type: "question_id",
            message: questionId,
            user_name: user.name,
        }));
    };

    const sendQuizId = () => {
        console.log("Sendingggg Quiz id: " + questionId);
        if (!websocketRef.current) {
            alert("WebSocket is not connected.");
            return;
        }
        websocketRef.current.send(JSON.stringify({
            message_type: "quiz_id",
            message: quizId,
            user_name: user.name,
        }));
    };
*/

    const toggleChatBox = () => {
        chatPageRef.current?.toggle_chat();
        setIsChatOpen(chatPageRef.current?.get_isChatOpen?.() ?? null);
    }

    return (
        <WebSocketProvider shouldConnect={shouldConnect} wsUrl={wsUrl}>
            <div className="text-red-800 mx-10 my-4">Welcome <span className="font-bold">{user.name}</span> to <span className="text-blue-600">tienganhphuyen.com</span></div>
  
  
            <div className="bg-red-300"><input className="bg-blue-300 text-black mb-2" placeholder="question id..." value={questionId} onChange={(e) => setQuestionId(e.target.value)} /></div>

            <div className="bg-red-300"><input className="bg-blue-300 text-black" placeholder="quiz id..." value={quizId} onChange={(e) => setQuizId(e.target.value)} /></div>

            <div className="flex flex-col bg-amber-200 py-2 px-10">
                <div className='col-span-9 bg-bgColor2 text-textColor2 text-lg m-1'>
                    <Navbar role="student" levels={levels} />
                </div>
            </div>

            <div className="fixed bottom-20 right-5 ">
                <div className="bg-blue-400 rounded-md p-0">
                    <ChatPage ref={chatPageRef} />
                </div>
                <div className='flex justify-center bg-white rounded-md p-2'>
                    <button className='bg-green-300 p-2 rounded-md' onClick={() => toggleChatBox()}> {isChatOpen ? 'Close Chat' : 'Open Chat'}</button>
                </div>
            </div>

            <Outlet />
        </WebSocketProvider>
    );
}

export default Home;

/*
          <div><button className="text-red bg-green-300 mb-2" onClick={sendChatMessage}>Send Message</button></div>
            <div><button className="text-red bg-green-300 mb-2" onClick={sendQuizId}>Send Quiz Id</button></div>
            <div><button className="text-red bg-green-300 mb-2" onClick={sendQuestionId}>Send Question Id</button></div>
*/
