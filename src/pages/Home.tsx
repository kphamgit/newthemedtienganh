import { useState, useEffect, useRef } from "react";
import api from "../api";
import { type LevelProps} from "../components/Level";
import "../styles/Home.css"
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
//import { type RootState } from "../redux/store";
//import { useSelector } from "react-redux";
import ChatPage, { type ChatPageRefProps } from "../components/chat/ChatPage";
import { WebSocketProvider } from "../components/context/WebSocketContext";
import TeacherControlPanel from "./TeacherControlPanel";
import TakeQuizLive from "../components/TakeQuizLive";
import { useSelector } from 'react-redux';
import MessageControl from "./MessageControl";
import type { WebSocketMessageProps } from "../components/shared/types";


function Home() {

    const [levels, setLevels] = useState<LevelProps[]>([]);

    //const state = useSelector((state: RootState) => state);
 
    //const user_name = useSelector((state: RootState) => state.name);
    //const { name, isLoggedIn } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);
    //const rehydrated = useSelector((state: RootState) => state._persist?.rehydrated); //
    const { name } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);
    const shouldConnect = !!name

    const [isChatOpen, setIsChatOpen] = useState<boolean | null>(null);

    //const [isLiveQuizOn, setIsLiveQuizOn] = useState(false);

    const [liveQuizId, setLiveQuizId] = useState<string | null>(null);
    const [liveQuestionNumber, setLiveQuestionNumber] = useState<string | undefined>(undefined);

    const liveQuestionNumberRef = useRef<string | undefined>(undefined);

    const chatPageRef = useRef<ChatPageRefProps>(null);
    const [chat, setChat] = useState<{ text: string; user_name: string }>({ text: "", user_name: "" });

    //const {websocketRef} = useWebSocket();

    //const navigate = useNavigate();


    //const { websocketRef } = useWebSocket();

   
// WebSocket reference
    //let websocket: WebSocket | null = null;
    //const websocketRef = useRef<WebSocket | null>(null);

    /*
    const websocket = new WebSocket(
        `ws://${ws_url}/ws/socket-server/`
    );
    */

    useEffect(() => {
        liveQuestionNumberRef.current = liveQuestionNumber;
    }, [liveQuestionNumber]);
    
    const wsUrl = `${import.meta.env.VITE_WS_PROTOCOL}://${import.meta.env.VITE_WS_URL}/ws/socket-server/${name}/`;

    //console.log("Home: WebSocket URL:", wsUrl);
    useEffect(() => {
        //console.log("Home component mounted, fetching levels...");
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

    // Listen for user logging out in other tabs. If that happends, reload this tab to reflect the logout state
    // which effectively logs out this tab as well and redirects to login page

    // KPHAM: this logic works in conjunction with ProtecedRoute component
    // in which, upon component mount, the loggedin state of the use is checked before 
    // attempting to authorize access to protected routes

    useEffect(() => {
       //console.log("Home: Setting up storage event listener for logout detection across tabs...");
        const handleStorageChange = (event: StorageEvent) => {
           //console.log("Storage event detected:", event);
            if (event.key === "persist:root") {
               //console.log("LocalStorage &&&&&& changed by redux-persist:", event.newValue);
                // this is what you see in localStorage when redux-persist saves the state
                //persist:root = `{"user":"{\"name\":null,\"isLoggedIn\":false}","_persist":"{\"version\":-1,\"rehydrated\":true}"}`;
                // Parse the new value of persist:root
                if (event.newValue) {
                    const persistedState = JSON.parse(event.newValue);
                    //console.log("Parsed persisted state:", persistedState);
                    const userState = JSON.parse(persistedState.user || "{}");
                    //console.log("Updated user state from localStorage:", userState);
                    // check isLoggedIn value, if false, meaning user logged out from another tab,
                    // then reload this tab to reflect the logout state
                    if (userState.isLoggedIn === false) {
                       //console.log("User logged out in another tab, reloading this tab...");
                        // reload the page which will redirect to login page
                        window.location.reload();
                    }

                    // You can perform additional actions here, such as updating the component state
                    // or triggering a Redux action if needed.
                }

            }
        };
        // Add the event listener
        window.addEventListener("storage", handleStorageChange);
        // Cleanup the event listener on component unmount
        return () => {
           //console.log("Home: Cleaning up storage event listener...");
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    const toggleChatBox = () => {
        chatPageRef.current?.toggle_chat();
        setIsChatOpen(chatPageRef.current?.get_isChatOpen?.() ?? null);
    }

    const handle_callback = (server_message: WebSocketMessageProps) => {
        
       //console.log("Home: Callback received from MessageControl:", server_message);
        if (!server_message) {
            console.log("Home: Invalid server message in callback:", server_message);
            return;
        }
        const { message_type, message, user_name } = server_message;
        if (message_type === 'chat') {
            // pass on to ChatPage component
           //console.log("Home: Passing chat message to ChatPage:", message);
            setChat({ text: message, user_name: user_name });
        }
        else if (message_type === 'quiz_id') {
           //console.log("Home: Setting liveQuizId to:", message);
            setLiveQuizId(message);
        }
        else if (message_type === 'question_number') {
           //console.log("Home: Receiving liveQuestionNumber:", message);
            // only set question number if liveQuestionNumber is undefined
            // otherwise, it means a question is already active
           //console.log("Home: Current liveQuestionNumber STATE is:", liveQuestionNumber);
            if (liveQuestionNumberRef.current === undefined) { // have to use ref
            //  to get latest value, because of CLOSURE property of functions in JS
            // ask copilot about this KPHAM
                setLiveQuestionNumber(message);
                return;
            }
            else {
                console.log("Home: liveQuestionNumber is already set to:", liveQuestionNumberRef.current, "ignoring new question_number message:", message);
            }
            
        }
        else if (message_type === 'live_quiz_id_and_live_question_number') {
           //console.log("Home: Setting liveQuizId and liveQuestionNumber to:", message);
            // message: "quizId/questionNumber"
            // split message by "/", first part is quiz id and second part is question number
            const parts = message.split("/");
           //console.log("Home: Parsed live_quiz_id_and_live_question_number parts:", parts);
            if (parts.length === 2) {
                setLiveQuizId(parts[0]);
                setLiveQuestionNumber(parts[1]);
            }
            else {
                console.log("Home: Invalid live_quiz_id_and_live_question_number message format:", message);
            }
            return;
        }
     
    }

    const live_question_attempt_finished = () => {
       //console.log("Home: ****************** live_question_attempt_finished called, clearing liveQuestionNumber");
        setLiveQuestionNumber(undefined);  // reset this so that the next time a new question is received, 
        // the liveQuestionNumber prop will be refreshed and TakeQuizLive) will be rendered with new question
    }

    return (
        <WebSocketProvider shouldConnect={shouldConnect} wsUrl={wsUrl}>
            <div className="grid grid-cols-[2fr_1fr] bg-gray-100 mx-10 my-0 h-screen">
                <div>
                    <div className="text-red-800 mx-10 my-4">Welcome <span className="font-bold">{name}</span> to <span className="text-blue-600">tienganhphuyen.com</span></div>
                    <div className="flex flex-col bg-amber-200 py-2 px-10">
                        <div className='col-span-9 bg-bgColor2 text-textColor2 text-lg m-1'>
                            <Navbar role="student" levels={levels} />
                        </div>
                    </div>

                    {name === "teacher" &&
                        <TeacherControlPanel />
                    }
                    {name !== "teacher" && liveQuizId &&
                        <TakeQuizLive parent_callback={live_question_attempt_finished} quiz_id={liveQuizId} question_number={liveQuestionNumber} />
                    }
                    <Outlet />
                </div>
                <div className="flex flex-col">
                    <div className="bg-blue-200">
                        <MessageControl parent_callback={handle_callback} />

                    </div>
                    <div>

                        <div className="bg-cyan-300 rounded-md p-0">
                            <ChatPage chat={chat} ref={chatPageRef} />
                        </div>
                        <div className='flex justify-center bg-white rounded-md p-2'>
                            <button className='bg-blue-300 p-2 rounded-md' onClick={() => toggleChatBox()}> {isChatOpen ? 'Open Chat' : 'Close Chat'}</button>
                        </div>
                    </div>
                </div>
            </div>
        </WebSocketProvider>
    );
}

export default Home;

/*
          <div><button className="text-red bg-green-300 mb-2" onClick={sendChatMessage}>Send Message</button></div>
            <div><button className="text-red bg-green-300 mb-2" onClick={sendQuizId}>Send Quiz Id</button></div>
            <div><button className="text-red bg-green-300 mb-2" onClick={sendQuestionId}>Send Question Id</button></div>
*/

/*
            { user.name === "teacher" ?
            <TeacherControlPanel />
            :
            <TakeQuizLive />
}
*/
