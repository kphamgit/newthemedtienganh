import { useState, useEffect, useRef } from "react";
import "../styles/Home.css"
import { Link } from "react-router-dom";
//import { type RootState } from "../redux/store";
//import { useSelector } from "react-redux";
import ChatPage, { type ChatPageRefProps, type ChatProps } from "../components/chat/ChatPage";
import { useWebSocket } from "../components/context/WebSocketContext";
import { useSelector } from 'react-redux';
//import MessageControl from "./MessageControl";
//import type { WebSocketMessageProps } from "../components/shared/types";
import HomeTeacher from "./HomeTeacher";
import HomeStudent from "./HomeStudent";
import AudioRecorder from "../components/shared/AudioRecorder";
import HomeAdmin from "./HomeAdmin";
import { useUserConnections } from "../components/context/UserConnectionsContext";
import MessageController from "./MessageController";
//import useWebSocketPing from "../hooks/useWebSocketPing";
import type { ReceivedConnectedUserDataProps, WebSocketMessageProps } from "../components/shared/types";



function Home() {

 

    //const state = useSelector((state: RootState) => state);
 
    //const user_name = useSelector((state: RootState) => state.name);
    //const { name, isLoggedIn } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);
    //const rehydrated = useSelector((state: RootState) => state._persist?.rehydrated); //
    const { name } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);


    const [isChatOpen, setIsChatOpen] = useState<boolean | null>(true);

    const [chatMessage, setChatMessage] = useState<ChatProps>({ text: '', user_name: '' });

    //const [liveQuestionNumber, setLiveQuestionNumber] = useState<string | undefined>(undefined);

    //const [otherConnectedUsers, setOtherConnectedUsers] = useState<any[]>([]);
    //const [liveQuizId, setLiveQuizId] = useState<string | null>(null);

    // Callback to receive updated userRows from UserConnections
   
    const chatPageRef = useRef<ChatPageRefProps>(null);

    //const {userRows, setUserRows, liveQuizId, setLiveQuizId} = useUserConnections();

    const {eventEmitter, websocketRef} = useWebSocket();
  
    const {setUserRows, setLiveQuizId, setLiveQuestionNumber} = useUserConnections();
    
    //const wsUrl = `${import.meta.env.VITE_WS_PROTOCOL}://${import.meta.env.VITE_WS_URL}/ws/socket-server/${name}/`;
    //const wsUrl = `${import.meta.env.VITE_WS_PROTOCOL}://${import.meta.env.VITE_WS_URL}/${name}/`;   

    //useWebSocketPing(websocketRef, 10000); // send ping every 30 seconds (30000 milliseconds)

    const [lastSent, setLastSent] = useState<string>('Never');
  const [status, setStatus] = useState<string>('Initializing...');

  useEffect(() => {
    const intervalId = setInterval(() => {
      const socket = websocketRef.current;

      if (!socket) {
        setStatus('Socket ref is null');
        return;
      }

      console.log("WebSocket URL ", socket.url, "readyState:", socket.readyState);
      if (socket.readyState === WebSocket.OPEN) {
        console.log("Sending ping message to WebSocket server...");
        const message = JSON.stringify({ 
          message_type: "ping",
          time: new Date().toLocaleTimeString() 
        });
        
        socket.send(message);
        
        setLastSent(new Date().toLocaleTimeString());
        setStatus('Message sent successfully');
      } else {
        // ReadyStates: 0=CONNECTING, 2=CLOSING, 3=CLOSED
        setStatus(`Socket not open (ReadyState: ${socket.readyState})`);
      }
    }, 20000);

    return () => {
      clearInterval(intervalId);
      console.log('Test interval cleared');
    };
  }, [websocketRef]);

    /*
 useEffect(() => {
        console.log("Home: Setting up WebSocket ping interval...");
        if (!websocketRef.current) {
            console.warn("WebSocket is not connected. websocketRef.current:", websocketRef.current);
            return;
        }
    
        console.log("WebSocket is connected. websocketRef.current:", websocketRef.current);
        const pingInterval = setInterval(() => {
            console.log("Sending ping to WebSocket server...");
            try {
                websocketRef.current?.send(
                    JSON.stringify({
                        message_type: "ping",
                    })
                );
            } catch (error) {
                console.error("Error sending ping:", error);
            }
        }, 5000);
    
        // Cleanup the interval on unmount
        return () => {
            console.log("Cleaning up WebSocket ping interval...");
            clearInterval(pingInterval);
        };
    }, [websocketRef]);
    */

        useEffect(() => {
            const handleMessage = (data: WebSocketMessageProps) => {
                //console.log("HOME: handleMessage called with data:", data);
                if (data.message_type === "welcome_message") {
                    //console.log("MessageController: welcome_message ALLLLLL connected_users:", data.connected_users);
                    const connectedUsersFromServer = data.connected_users as ReceivedConnectedUserDataProps[];
                    // git console.log("MessageController: welcome_message, other connected_users from server:", connectedUsersFromServer);
                    // set user rows using connectedUsersFromServer,
                    setUserRows(connectedUsersFromServer.map((user) => ({ name: user.name })));
                    if (data.live_quiz_id) {
                        //console.log("************ MessageController: welcome_message live_quiz_id:", data.live_quiz_id);
                        setLiveQuizId(data.live_quiz_id);
                    }
                    if (data.live_question_number) {
                        //console.log("************ HOME: welcome_message live_question_number:", data.live_question_number);
                        setLiveQuestionNumber?.(Number(data.live_question_number));
                    }
                } //
                else if (data.message_type === "user_disconnected") {
                    //console.log("MessageController: Received user_disconnected message from server for user:", data.user_name);
                    const dropped_user = data.user_name;
                    // remove dropped_user from userRows,
                    setUserRows((prevRows) => prevRows.filter((row) => row.name !== dropped_user));
                    
                }
                if (data.message_type === "another_user_joined") {
                    setUserRows((prevRows) => {
                            //console.log("MessageController: Adding new user to the list:", data.user_name);
                            return [...prevRows, { name: data.user_name}]; // add new user to the list with is_logged_in set to true  
                    })
                }
                if (data.message_type === "chat") {
                    //console.log("MessageController: Received chat message from server:. ");
                    setIsChatOpen((prevIsChatOpen) => {
                        if (!prevIsChatOpen) {
                            //console.log("Home: Chat box is closed. Opening chat box to display new message.");
                            return true; // Open the chat box
                        }
                        return prevIsChatOpen; // Keep the current state
                    });
                    //console.log("Home: Received chat message from server, setting chatMessage state to:", { text: data.content, user_name: data.user_name });
                    setChatMessage({ text: data.content, user_name: data.user_name });
                }
            }
            // Subscribe to the "message" event
            eventEmitter?.on("message", handleMessage);
            // Cleanup the event listener on unmount
            return () => {
                eventEmitter?.off("message", handleMessage);
            };
        }, [eventEmitter]); // Only include eventEmitter in the dependency array



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

    
    const toggleChatBox = (value?: boolean) => {
        setIsChatOpen((prev) => value !== undefined ? value : !prev);
    }

    
    const renderHomeContent = () => {
        if (name === 'admin') {
            return <HomeAdmin  />;
        }
        else if (name === "teacher") {
            return <HomeTeacher />;
        }
        else {  //name is student
            return <HomeStudent />;
        }
      };

    return (
            <>
            <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>WebSocket Periodic Test</h3>
      <p><strong>Status:</strong> {status}</p>
      <p><strong>Last Sent:</strong> {lastSent}</p>
      <div style={{ fontSize: '12px', color: '#666' }}>
        Checking every 20 seconds...
      </div>
    </div>
                <div className="text-red-800 mx-10 my-8">Welcome
                    <span className="font-bold"> {name}</span> to
                    <span className="text-blue-600"> tienganhphuyen.com</span>
                    <span className='text-md bg-amber-400 text-sm ml-3 p-2'>
                        <Link to="/logout">Log out</Link>
                    </span>
                    <span
                        className="fixed top-5 right-0 bg-white shadow-lg border border-gray-300 rounded-t-lg w-96 h-15 flex flex-col z-100"
                    >
                        <AudioRecorder />
                    </span>
                </div>
                <div className="flex flex-row justify-left mb-2 ml-10 items-center bg-cyan-200 px-2">
                    <span className="text-lg bg-green-200 text-red-800 font-bold">{name}</span>
                    <MessageController />

                </div>
             
               
      
                {renderHomeContent()

                }
                { isChatOpen === true &&  <ChatPage ref={chatPageRef} chat = {chatMessage}/>}
                <div className="fixed bottom-4 right-4">
               <button
                   className="bg-blue-300 p-2 rounded-md shadow-md hover:bg-blue-400"
                   onClick={() => toggleChatBox()}
               >
                   {isChatOpen ? 'Close Chat' : 'Open Chat'}
               </button>
           </div>

            </>
       
    );
}

export default Home;
