import { useEffect, useRef } from "react";
import "../styles/Home.css"

import { Outlet } from "react-router-dom";

import TeacherControlPanel from "./TeacherControlPanel";
//import type { WebSocketMessageProps } from "../components/shared/types";
import { type TeacherControlRefProps } from "./TeacherControlPanel";
import ScoreBoardTeacher from "./ScoreBoardTeacher";
import { useWebSocket } from "../components/context/WebSocketContext";
//import { useDispatch } from "react-redux";
//import { clearLiveQuestionInfo} from "../redux/connectedUsersSlice"
//import type { AppDispatch } from "../redux/store";


function HomeTeacher() {

    //const [levels, setLevels] = useState<LevelProps[]>([]);

    //const state = useSelector((state: RootState) => state);
 
    //const user_name = useSelector((state: RootState) => state.name);
    //const { name, isLoggedIn } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);
    //const rehydrated = useSelector((state: RootState) => state._persist?.rehydrated); //
   // const { name } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);
  

    //const [liveQuizId, setLiveQuizId] = useState<string | null>(null);


    //const chatPageRef = useRef<ChatPageRefProps>(null);
    //const [chat, setChat] = useState<{ text: string; user_name: string }>({ text: "", user_name: "" });

    const teacherControlPanelRef = useRef<TeacherControlRefProps>(null);

    const { websocketRef} = useWebSocket();

    //const {eventEmitter} = useWebSocket();
    //const liveQuizInReduxStore = useSelector((state: RootState) => state.liveQuizId.value);

    //const dispatch = useDispatch<AppDispatch>();

    //const wsUrl = `${import.meta.env.VITE_WS_PROTOCOL}://${import.meta.env.VITE_WS_URL}/ws/socket-server/${name}/`;

   
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

    useEffect(() => {
        const pingInterval = setInterval(() => {
            if (!websocketRef.current) {
                alert("WebSocket is not connected.");
                return;
            }
            // if there's no quiz id passed in from props, alert and return
            console.log("HomeStudent: Sending ping to Heroku's NodeJS server to keep WebSocket connection alive...");
            websocketRef.current.send(JSON.stringify({
                message_type: "ping",
            }));
            /*
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: 'ping' }));
            }
                */
        }, 30000); // 30 seconds is the "sweet spot" for Heroku
    
        return () => clearInterval(pingInterval);
    }, []);

    
    return (
   
            <div className="grid grid-cols-[2fr_1fr] bg-gray-100 mx-10 my-0 h-screen">
                
                  
               
                <div>
                    <TeacherControlPanel ref = {teacherControlPanelRef}/>
                    <Outlet />
                </div>
                <div className="flex flex-col">
                    <div className="bg-blue-200">
                        <ScoreBoardTeacher />
                    </div>
           
                </div>
            </div>
 
    );
}

export default HomeTeacher;

/*
  <div className="flex flex-col">
                    <div className="bg-blue-200">
                        <ScoreBoard />
                        <MessageControlTeacher parent_callback={handle_callback} />
                    </div>
           
                </div>
*/

