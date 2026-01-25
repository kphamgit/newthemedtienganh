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
import StudentControlPanel from "./StudentControlPanel";

import { useSelector } from 'react-redux';


function Home() {

    const [levels, setLevels] = useState<LevelProps[]>([]);

    //const state = useSelector((state: RootState) => state);
 
    //const user_name = useSelector((state: RootState) => state.name);
    //const { name, isLoggedIn } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);
    //const rehydrated = useSelector((state: RootState) => state._persist?.rehydrated); //
    const { name } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);
    const shouldConnect = !!name

    const [isChatOpen, setIsChatOpen] = useState<boolean | null>(null);

    //const [questionId, setQuestionId] = useState("");



    const chatPageRef = useRef<ChatPageRefProps>(null);

    //const {websocketRef} = useWebSocket();

    //const navigate = useNavigate();


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
    
    const wsUrl = `${import.meta.env.VITE_WS_PROTOCOL}://${import.meta.env.VITE_WS_URL}/ws/socket-server/${name}/`;

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

/*
    useEffect(() => {
        if (!name) {
            // User is not logged in, redirect to login page
            //console.log("User not logged in, redirecting to login page...");
            //navigate("/login");
        }
    }, [name]); // Only run when 'name' changes
   */
    useEffect(() => {
        //console.log("Home component mounted, fetching levels...");
        getLevels();
    }, []);  // empty dependency array to run only once on mount

    const getLevels = async () => {
        try {
            await api.get("/api/levels/").then((res) => {
                const data = res.data;
                //console.log("levels", data);
                setLevels(data);
                //console.log("levels", data);
            });
        } catch (err) {
            alert(err);
        }
    };
    /*
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
*/
    // Listen for user logging out in other tabs. If that happends, reload this tab to reflect the logout state
    // which effectively logs out this tab as well and redirects to login page

    // KPHAM: this logic works in conjunction with ProtecedRoute component
    // in which, upon component mount, the loggedin state of the use is checked before 
    // attempting to authorize access to protected routes

    useEffect(() => {
        console.log("Home: Setting up storage event listener for logout detection across tabs...");
        const handleStorageChange = (event: StorageEvent) => {
            console.log("Storage event detected:", event);
            if (event.key === "persist:root") {
                console.log("LocalStorage &&&&&& changed by redux-persist:", event.newValue);
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
                        console.log("User logged out in another tab, reloading this tab...");
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
            console.log("Home: Cleaning up storage event listener...");
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    const toggleChatBox = () => {
        chatPageRef.current?.toggle_chat();
        setIsChatOpen(chatPageRef.current?.get_isChatOpen?.() ?? null);
    }

    return (
        <WebSocketProvider shouldConnect={shouldConnect} wsUrl={wsUrl}>
            <div className="mx-10">
            <div className="text-red-800 mx-10 my-4">Welcome <span className="font-bold">{name}</span> to <span className="text-blue-600">tienganhphuyen.com</span></div>
            <div className="flex flex-col bg-amber-200 py-2 px-10">
                <div className='col-span-9 bg-bgColor2 text-textColor2 text-lg m-1'>
                    <Navbar role="student" levels={levels} />
                </div>
            </div>

            <div className="fixed bottom-20 right-10 w-80 space-y-2 z-50">
                <div className="bg-cyan-200 rounded-md p-0">
                    <ChatPage ref={chatPageRef} />
                </div>
                <div className='flex justify-center bg-white rounded-md p-2'>
                    <button className='bg-blue-300 p-2 rounded-md' onClick={() => toggleChatBox()}> {isChatOpen ? 'Open Chat' : 'Close Chat'}</button>
                </div>

            </div>

            {name === "teacher" ?
                <TeacherControlPanel />
                :
                <div >
                <StudentControlPanel />
                <TakeQuizLive />
                </div>
            }
          

            <Outlet />
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
