import React, { createContext, useContext, useEffect, useRef } from "react";
import { EventEmitter } from "eventemitter3"

interface WebSocketContextType {
  websocketRef: React.MutableRefObject<WebSocket | null>;
  eventEmitter?: EventEmitter;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ 
  wsUrl: string;
  shouldConnect: boolean;
  children: React.ReactNode }> = ({ wsUrl,shouldConnect, children }) => {
  const websocketRef = useRef<WebSocket | null>(null);
  const eventEmitter = useRef<EventEmitter>(new EventEmitter()).current;

  useEffect(() => {
    // Initialize WebSocket connection
    if (!shouldConnect) {
      return;
    }
    websocketRef.current = new WebSocket(wsUrl);  // make a connection to the wsUrl RIGHT HERE

    websocketRef.current.onopen = () => {
      console.log("WebSocket connection opened");
    };

    websocketRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      //console.log("Received data:", data);
      eventEmitter?.emit("message", data);
    };

    websocketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    websocketRef.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    // Cleanup WebSocket connection when the component unmounts
    
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
        console.log("WebSocket connection cleaned up");
      }
    };
    
   

  }, [wsUrl, shouldConnect, eventEmitter]);

 
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