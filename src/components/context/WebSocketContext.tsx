import React, { createContext, useContext, useEffect, useRef } from "react";

interface WebSocketContextType {
  websocketRef: React.MutableRefObject<WebSocket | null>;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ 
  wsUrl: string;
  shouldConnect: boolean;
  children: React.ReactNode }> = ({ wsUrl,shouldConnect, children }) => {
  const websocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    if (!shouldConnect) {
      return;
    }
    websocketRef.current = new WebSocket(wsUrl);

    websocketRef.current.onopen = () => {
      console.log("WebSocket connection opened");
    };

    websocketRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log("Received data:", data);
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
  }, [wsUrl]);

  return (
    <WebSocketContext.Provider value={{ websocketRef }}>
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