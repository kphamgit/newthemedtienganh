import { useState, useEffect, useRef } from "react";
import "../styles/Home.css"
import { Link } from "react-router-dom";
//import { type RootState } from "../redux/store";
//import { useSelector } from "react-redux";
import ChatPage, { type ChatPageRefProps } from "../components/chat/ChatPage";
import { WebSocketProvider } from "../components/context/WebSocketContext";
import { useSelector } from 'react-redux';
//import MessageControl from "./MessageControl";
//import type { WebSocketMessageProps } from "../components/shared/types";
import HomeTeacher from "./HomeTeacher";
import HomeStudent from "./HomeStudent";


function Home() {

 

    //const state = useSelector((state: RootState) => state);
 
    //const user_name = useSelector((state: RootState) => state.name);
    //const { name, isLoggedIn } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);
    //const rehydrated = useSelector((state: RootState) => state._persist?.rehydrated); //
    const { name } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);
    const shouldConnect = !!name

    const [isChatOpen, setIsChatOpen] = useState<boolean | null>(true);

    //const [liveQuestionNumber, setLiveQuestionNumber] = useState<string | undefined>(undefined);

   

    const chatPageRef = useRef<ChatPageRefProps>(null);

    //useEffect(() => {
      //  liveQuestionNumberRef.current = liveQuestionNumber;
    //}, [liveQuestionNumber]);
    
    //const wsUrl = `${import.meta.env.VITE_WS_PROTOCOL}://${import.meta.env.VITE_WS_URL}/ws/socket-server/${name}/`;
    const wsUrl = `${import.meta.env.VITE_WS_PROTOCOL}://${import.meta.env.VITE_WS_URL}/${name}/`;

    //console.log("Home: WebSocket URL:", wsUrl);
   
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
        //chatPageRef.current?.toggle_chat();
        //setIsChatOpen(chatPageRef.current?.get_isChatOpen?.() ?? null);
        setIsChatOpen(prev => prev === false ? true : false);
    }

    return (
        <WebSocketProvider shouldConnect={shouldConnect} wsUrl={wsUrl}>
            <div className="fixed bottom-4 right-4">
                <button
                    className="bg-blue-300 p-2 rounded-md shadow-md hover:bg-blue-400"
                    onClick={() => toggleChatBox()}
                >
                    {isChatOpen ? 'Close Chat' : 'Open Chat'}
                </button>
            </div>

            <div className="text-red-800 mx-10 my-8">Welcome
                <span className="font-bold"> {name}</span> to
                <span className="text-blue-600"> tienganhphuyen.com</span>
                <span className='text-md bg-amber-400 text-sm ml-3 p-2'>
                    <Link to="/logout">Log out</Link>
                </span>
            </div>

            { name === "teacher" ?
                <HomeTeacher />
                :
                <HomeStudent />
            }
            {isChatOpen !== false &&
                <ChatPage ref={chatPageRef} />
            }
        </WebSocketProvider>
    );
}

export default Home;