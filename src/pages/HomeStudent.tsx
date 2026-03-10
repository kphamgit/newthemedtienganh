import { useState, useEffect } from "react";
import api from "../api";
import { type LevelProps} from "../components/Level";
import "../styles/Home.css"
import Navbar from "../components/Navbar";
//import { Outlet } from "react-router-dom";
//import { type RootState } from "../redux/store";
import TakeQuizLive from "../components/TakeQuizLive";
import { useSelector } from 'react-redux';
//import type { WebSocketMessageProps } from "../components/shared/types";
//import ScoreBoard from "./ScoreBoard";
//import { clearLiveQuestionInfo} from "../redux/connectedUsersSlice";
//import type { AppDispatch } from "../redux/store";
import { useWebSocket } from "../components/context/WebSocketContext";
import type { WebSocketMessageProps } from "../components/shared/types";
import { useUserConnections } from "../components/context/UserConnectionsContext";
import { Outlet } from "react-router-dom";
//import UserConnections from "./UserConnections";
//import AudioRecorder from "../components/shared/AudioRecorder";
//import OpenAI_TTS from "../components/shared/OpenAI_TTS";
//import OpenAIStream from "../components/shared/OpenAIStream";

function HomeStudent() {

    const [levels, setLevels] = useState<LevelProps[]>([]);
 
    const {liveQuizId, myLiveQuestionNumber, setLiveQuizId} = useUserConnections();

    const {eventEmitter, websocketRef} = useWebSocket();

    const { name } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);


// send a ping every 30 seconds to keep the WebSocket connection alive, which is especially important for hosting services like Heroku that may terminate idle connections after 55 seconds
// Heroku has a 55 seconds timeout for idle connections, so sending a ping every 30 seconds is a common strategy to keep the connection alive without overwhelming the server with too many pings. This way, even if there's no activity from the user, the WebSocket connection will remain open and responsive. 
useEffect(() => {
        //const socket = new WebSocket(SOCKET_URL);
    
        const pingInterval = setInterval(() => {
            if (!websocketRef.current) {
                alert("WebSocket is not connected.");
                return;
            }
            // if there's no quiz id passed in from props, alert and return
            // console.log("HomeStudent: Sending ping to Heroku's NodeJS server to keep WebSocket connection alive...");
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

 useEffect(() => {
      const handleMessage = (data: WebSocketMessageProps) => {
        //console.log("HomeStudent: handleMessage called with data:", data);
    
        if (data.message_type === "live_quiz_id") {
            //console.log("HomeStudent: received live_quiz_id message from server, quiz id:", data.content);
            setLiveQuizId(data.content);
            // send acknowledgement back to server that student received the quiz id
            if (!websocketRef.current) {
                alert("WebSocket is not connected.");
                return;
            }
            // if there's no quiz id passed in from props, alert and return
            websocketRef.current.send(JSON.stringify({
                message_type: "student_acknowleged_live_quiz_id",
                message: data.content,  // should contain quiz id
                user_name: name,    // identify sender, which is teacher
            }));
        }
        else if (data.message_type === "live_quiz_terminated") {
            //console.log("HomeStudent: Received terminate_live_quiz message from server.");
             // reset live quiz state
             setLiveQuizId(null);
             
             //setLiveQuestionNumber(undefined);
        }
      }
    
      // Subscribe to the "message" event
      eventEmitter?.on("message", handleMessage);
      // Cleanup the event listener on unmount
      return () => {
        eventEmitter?.off("message", handleMessage);
      };
    }, [eventEmitter]); // Only include eventEmitter in the dependency array
   
 
    
    //const wsUrl = `${import.meta.env.VITE_WS_PROTOCOL}://${import.meta.env.VITE_WS_URL}/ws/socket-server/${name}/`;

    //console.log("HomeStudent: WebSocket URL:", wsUrl);
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
                setLevels(data as LevelProps[]);
                //console.log("categories", data);
            })
            .catch((err) => alert(err));
    };

    // Listen for user logging out in other tabs. If that happends, reload this tab to reflect the logout state
    // which effectively logs out this tab as well and redirects to login page

    // KPHAM: this logic works in conjunction with ProtecedRoute component
    // in which, upon component mount, the loggedin state of the use is checked before 
    // attempting to authorize access to protected routes
/*
    useEffect(() => {
       //console.log("HomeStudent: Setting up storage event listener for logout detection across tabs...");
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
           //console.log("HomeStudent: Cleaning up storage event listener...");
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);
*/
    const live_question_attempt_finished = () => {
       //console.log("HomeStudent: ****************** live_question_attempt_finished called, clearing liveQuestionNumber");
       // setLiveQuestionNumber(undefined);  // reset this so that the next time a new question is received, 
        // the liveQuestionNumber prop will be refreshed and TakeQuizLive) will be rendered with new question
    }
//https://www.youtube.com/watch?v=ivg_Yc-YDYo
// const wsUrl = `${import.meta.env.VITE_WS_PROTOCOL}://${import.meta.env.VITE_WS_URL}/`;
    
   
    return (

        <div className="bg-cyan-300 h-full w-full">
            <div className="opacity-20">HOME STUDENT</div>
            <div>
                {liveQuizId ?
                    <div>
                        
                        <div className=" bg-amber-500 py-2">
                            <TakeQuizLive
                                parent_callback={live_question_attempt_finished}
                                live_quiz_id={liveQuizId}
                                live_question_number={myLiveQuestionNumber?.toString()}
                            />
                        </div>
                    </div>
                    :
                    <div className="flex flex-col bg-cyan-200 py-2 px-10">
                        <div className='col-span-9 text-lg m-1'>
                            <Navbar role="student" levels={levels} />
                        </div>
                    </div>
                }
            
            </div>
                <Outlet />
        </div>

    );
}

export default HomeStudent;

/*
return (
       
            <div className="grid grid-cols-[2fr_1fr] bg-gray-100 mx-10 my-0 h-screen">
                <div>
   
                    <div className="flex flex-col bg-amber-200 py-2 px-10">
                        <div className='col-span-9 bg-bgColor2 text-textColor2 text-lg m-1'>
                            <Navbar role="student" levels={levels} />
                        </div>
                    </div>
                    <VidStack />

            
                    {liveQuizId &&
                        <TakeQuizLive parent_callback={live_question_attempt_finished} quiz_id={liveQuizId} question_number={liveQuestionNumber} />
                    }
                    <Outlet />
                </div>
                <div className="flex flex-col">
                    <div className="bg-blue-200">
                        <ScoreBoard  />
                        <MessageControlStudent parent_callback={handle_callback} />

                    </div>
     
                </div>
            </div>

    );
*/
