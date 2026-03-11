import { useEffect, useState } from "react";
import "../styles/Home.css"

//import type { WebSocketMessageProps } from "../components/shared/types";
//import ScoreBoardTeacher from "./ScoreBoardTeacher";
import { useWebSocket } from "../components/context/WebSocketContext";

import type { ReceivedConnectedUserDataProps, WebSocketMessageProps } from "../components/shared/types";
//import ManageConnections from "./ManageConnections";
//import ScoreBoard from "./ScoreBoard";
//import { useDispatch } from "react-redux";
//import { clearLiveQuestionInfo} from "../redux/connectedUsersSlice"
//import type { AppDispatch } from "../redux/store";

export interface RedisDataProps {
    // Add any props if needed
    //parentCallback: (action: string ) => void;
    users: ReceivedConnectedUserDataProps[];
    live_quiz_id: string | null;    
    live_question_number: string | null;
   
}

function HomeAdmin() {

    //const [levels, setLevels] = useState<LevelProps[]>([]);

    //const state = useSelector((state: RootState) => state);
 
    //const user_name = useSelector((state: RootState) => state.name);
    //const { name, isLoggedIn } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);
    //const rehydrated = useSelector((state: RootState) => state._persist?.rehydrated); //
   // const { name } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);
  

    //const [liveQuizId, setLiveQuizId] = useState<string | null>(null);
    
            const [redisData, setRedisData] = useState<RedisDataProps>();

    const [nameForRedisDataRequest] = useState<string>("all");

    //const chatPageRef = useRef<ChatPageRefProps>(null);
    //const [chat, setChat] = useState<{ text: string; user_name: string }>({ text: "", user_name: "" });

    const {websocketRef, eventEmitter} = useWebSocket();

    const [isIdle, setIsIdle] = useState(false);

    const [automaticDataRefreshEnabled, setAutomaticDataRefreshEnabled] = useState(false);

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
            //console.log("HomeStudent: Sending ping to Heroku's NodeJS server to keep WebSocket connection alive...");
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
        // set a interval to send request for Redis users data every 10 seconds 
        if (!automaticDataRefreshEnabled) {
            return;
        }
        const redisDataInterval = setInterval(() => {
            //console.log("HomeAdmin: Sending request to get Redis users data every 10 seconds: ");
            if (!websocketRef.current) {
                alert("WebSocket is not connected.");
                return;
            }
            websocketRef.current.send(JSON.stringify({
                message_type: "GET_REDIS_USER_DATA",
                message: "GET_REDIS_USER_DATA",  // query key
                user_name: nameForRedisDataRequest,    // identify sender, which is teacher
            }));
            setIsIdle(true);
            // Simulate waiting for response from server and then set idle to false after 2 seconds
            setTimeout(() => {
                setIsIdle(false);
            }, 9000);
        }, 10000); // every 10 seconds
        // clear the interval on component unmount
        return () => clearInterval(redisDataInterval);
    }, [websocketRef, automaticDataRefreshEnabled]);

        useEffect(() => {
              const handleMessage = (data: WebSocketMessageProps) => {
                //console.log("TeacherControl: handleMessage called with data:", data);
                if (data.message_type === "REDIS_DATA") {
                    //console.log("TeacherControl: Received REDIS DATA RESPONSE from server, data = :",data) ;
                    /*
    {
        "message_type": "REDIS_DATA",
        "content": {
            "users": [
                {
                    "name": "teacher",
                    "live_question_number": 0,
                    "live_total_score": 999,
                    "is_logged_in": "true"
                }
            ],
            "live_quiz_id": null,
            "live_question_number": null
        }
    }
                */
    
                    /*
                    console.log("REDIS_DATA content:", data.content);
                    console.log("REDIS_DATA users:", data.content.users);
                    console.log("REDIS_DATA live_quiz:", data.content.live_quiz_id);
                    console.log("REDIS_DATA live_question_number", data.content.live_question_number);
                    */
                   // the field is_logged_in is string "true" or "false", convert it to boolean true or false
                    data.content.users = data.content.users.map((user: ReceivedConnectedUserDataProps) => {
                        return {
                            ...user,
                            is_logged_in: user.is_logged_in === "true" ? true : false,
                        }
                    });
                    setRedisData(data.content);
                    
                    //setShowRedisDataModal(true);
                   // const parsedData = JSON.parse(data.content);
                    
                    //console.log("Parsed REDIS_DATA from server:", parsedData);
                    //alert("Received TEST_RESPONSE from server: " + JSON.stringify(data));
                }
                if (data.message_type === "another_user_joined") {
                    //console.log("TeacherControl: Received connection_established message from server for user:", data);
                }
      
              }
              // Subscribe to the "message" event
              eventEmitter?.on("message", handleMessage);
              // Cleanup the event listener on unmount
              return () => {
                eventEmitter?.off("message", handleMessage);
              };
            }, [eventEmitter]); // Only include eventEmitter in the dependency array
    
    

    const sendRedisUsersDataRequest = () => {
        console.log("Sending request to get Redis users data: ");
        //console.log("sendCacheQuery: ");
        if (!websocketRef.current) {
            alert("WebSocket is not connected.");
            return;
        }
        //console.log("Key for cache query:", keyForCacheQuery);
        //console.log("Requesting Redis users data for user:", testReceiver);
        websocketRef.current.send(JSON.stringify({
            message_type: "GET_REDIS_USER_DATA",
            message: "GET_REDIS_USER_DATA",  // query key
            user_name: nameForRedisDataRequest,    // identify sender, which is teacher
        }));

        
        
    };

    const clearRedisStore = () => {
        //console.log("sendCacheQuery: ");
        if (!websocketRef.current) {
            alert("WebSocket is not connected.");
            return;
        }
        //console.log("Key for cache query:", keyForCacheQuery);
        websocketRef.current.send(JSON.stringify({
            message_type: "CLEAR_REDIS_STORE",
            message: "CLEAR_REDIS_STORE",  // query key
            user_name: nameForRedisDataRequest,    // identify sender, which is teacher
        }));
        
    };


    const toggleAutomaticDataRequest = () => {
        setAutomaticDataRefreshEnabled((prev) => !prev);
    }

    return (
   
        <div className="">
            <div>Automatic Redis Data Request: <span className="text-red-700">{automaticDataRefreshEnabled.toString()}</span></div>
            { isIdle && 
            <div className="absolute top-0 left-150 w-70 h-30 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded shadow">
                    <p className="text-gray-800">Waiting to send request for Redis data...</p>
                </div>
           </div>
            }
            <ul className="bg-blue-300 ">
                { redisData &&
                    redisData.users && redisData.users.map((user, index) => (
                        <div key={index} className={`flex flex-row justify-start gap-2 p-2 m-2 ${user.is_logged_in ? "bg-green-200" : "bg-red-200"} ${isIdle ? "opacity-70" : "opacity-100"} rounded`}>
                            <div className="font-bold">{user.name}:</div>
                            <div>Live Question Number: {user.live_question_number},</div>
                            <div>Live Total Score: {user.live_total_score},</div>
                            <div>Is Logged In: {user.is_logged_in ? "Yes" : "No"}</div>
                        </div>
                    ))
                }
            </ul>
            <div className="mt-2 bg-amber-200 p-2">

                <button className="bg-green-300 p-2 m-3 hover:bg-green-500" onClick={toggleAutomaticDataRequest}>
                    {automaticDataRefreshEnabled ? "Turn OFF Automatic Data Refresh" : "Turn ON Automatic Data Refresh"}
                </button>
                <button className="bg-green-300 p-2 m-3 hover:bg-green-500" onClick={sendRedisUsersDataRequest}>GET REDIS USERS DATA</button>
                <button className="bg-green-300 p-2  m-3 hover:bg-red-400" onClick={clearRedisStore}>CLEAR REDIS STORE</button>


            </div>
        </div>
    );
}

export default HomeAdmin;

/*
   return (
   
            <div className="grid grid-cols-[2fr_1fr] bg-gray-100 mx-10 my-0 h-screen">
                <div className="col-span-8 bg-white rounded-lg shadow-md p-4 m-4 flex flex-col">
                    <TeacherControlPanel ref = {teacherControlPanelRef}/>
                    <Outlet />
                </div>
                <div className="col-span-4 bg-red-300 rounded-lg shadow-md p-4 m-4">
                    <ScoreBoard />
                
                </div>
            </div>
 
    );

*/

