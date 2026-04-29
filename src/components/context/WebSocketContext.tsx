import React, { createContext, useContext, useEffect, useRef } from "react";
import { EventEmitter } from "eventemitter3"

interface WebSocketContextType {
  websocketRef: React.MutableRefObject<WebSocket | null>;
  eventEmitter?: EventEmitter;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ 
  wsUrl: string;
  //shouldConnect: boolean;
  children: React.ReactNode }> = ({ wsUrl, children }) => {
  const websocketRef = useRef<WebSocket | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const eventEmitter = useRef<EventEmitter>(new EventEmitter()).current;

  useEffect(() => {
    // Initialize WebSocket connection
   // if (!shouldConnect) {
   //   return;
   // }

    //console.log("WebSocketProvider: Establishing WebSocket connection to:", wsUrl);
    websocketRef.current = new WebSocket(wsUrl);  // make a connection to the wsUrl RIGHT HERE

    websocketRef.current.onopen = () => {
      console.log("WebSocket connection opened");
      // 2. Start the heartbeat only when the connection opens
      heartbeatTimerRef.current = setInterval(() => {
        if (websocketRef.current?.readyState === WebSocket.OPEN) {
          websocketRef.current.send(JSON.stringify({ message_type: 'ping' }));
          //console.log("Global Heartbeat Sent");
        }
      }, 30000);
    };

    websocketRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      //console.log("WebSocketProvider: Received message from server url=:", websocketRef.current?.url);
      //..from server url=:"ws://localhost:8080/teacher/" 
      // ws server has attached the user name to the url, 
      // so we can use that to determine which tab sent the message and avoid sending messages back
      // to the same tab that sent it in the first place. This is important because when a message 
      // is sent from a tab, it is broadcasted to all tabs including the sender tab. 
      // If we don't ignore messages from the sender tab, 
      // it will create an infinite loop of messages being sent back and forth between the server and the sender tab.
      //const user_name_from_url = websocketRef.current?.url.split("/").slice(-2, -1)[0]; // get the user name from the url
      
      //console.log("Received ws data:", data)
      //console.log("from websocket url:", websocketRef.current?.url);

      // transmit to other components 
      eventEmitter?.emit("message", data);
    };

    websocketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    websocketRef.current.onclose = () => {
      console.log("WebSocket connection closed");
      // 3. Clear timer if the socket closes (e.g., server goes down)
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
      }
    };

    // Cleanup WebSocket connection when the component unmounts
    
    return () => {
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      if (websocketRef.current) {
        websocketRef.current.close();
        console.log("WebSocket connection cleaned up");
      }
    };
    
   

  }, [wsUrl, eventEmitter]);

 
  return (
    <WebSocketContext.Provider value={{ websocketRef, eventEmitter }}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Custom hook to use the WebSocket context
export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};