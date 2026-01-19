import { useState, useEffect, useRef } from "react";
import api from "../api";
import { type LevelProps} from "../components/Level";
import "../styles/Home.css"
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import { type RootState } from "../redux/store";
import { useSelector } from "react-redux";
import ChatPage, { type ChatPageRefProps } from "../components/chat/ChatPage";
//import , { type ChatPageRefProps } from "../components/chat/ChatPage";


function Home() {

    const [levels, setLevels] = useState<LevelProps[]>([]);
    const user = useSelector((state: RootState) => state.user);

    const [testMessage, setTestMessage] = useState("");

    const ws_url = import.meta.env.VITE_WS_URL

    const ws_protocol = import.meta.env.VITE_WS_PROTOCOL

    const chatPageRef = useRef<ChatPageRefProps>(null);
    //const channelId = Math.floor(Math.random() * 10000);
    //console.log('Connecting to WebSocket at ws://'+ws_url+'/ws/bar/'+channelId+'/low/');
    /*
    const websocket = new WebSocket(
        `ws://${ws_url}/ws/bar/${channelId}/low/`
    );
    */
// WebSocket reference
    //let websocket: WebSocket | null = null;
    const websocketRef = useRef<WebSocket | null>(null);

    /*
    const websocket = new WebSocket(
        `ws://${ws_url}/ws/socket-server/`
    );
    */

    
//const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
//const socketUrl = `${protocol}django-with-redis-c6f7d6ccaf6e.herokuapp.com/ws/socket-server/kpham/`;
//const socket = new WebSocket(socketUrl);
    

    
    useEffect(() => {
        websocketRef.current = new WebSocket(
        `${ws_protocol}://${ws_url}/ws/socket-server/teacher/`
    );
    websocketRef.current.onopen = () => {
        console.log('WebSocket connection opened');
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

    const sendMessage = () => {
        //alert("Sendingggg message: " + testMessage);
        if (!websocketRef.current) {
            alert("WebSocket is not connected.");
            return;
        }
        websocketRef.current.send(JSON.stringify({
            message: testMessage
        }));
    };

    return (
        <>
        
        <div className="text-red-800 mx-10 my-4">Welcome <span className="font-bold">{user.name}</span> to <span className="text-blue-600">tienganhphuyen.com</span></div>
        <div><button className="text-red bg-green-300" onClick={sendMessage}>Send Message</button></div>
        <div className="bg-red-300"><input className="bg-green-300 text-black" value = {testMessage} onChange={(e) => setTestMessage(e.target.value)}/></div>
        <div className="flex flex-col bg-amber-200 py-2 px-10">
              <div className='col-span-9 bg-bgColor2 text-textColor2 text-lg m-1'>
              <Navbar role="student" levels={levels}/>
            </div>
        </div>

        <div className="fixed bottom-20 right-5 ">
        <div className="bg-blue-400 rounded-md p-0">
            <ChatPage websocket={websocketRef.current} ref={chatPageRef} />
        </div>
      </div>
     


        <Outlet />
        </>
    );
}

export default Home;