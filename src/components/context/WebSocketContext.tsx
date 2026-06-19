import React, { createContext, useContext, useEffect, useRef } from "react";
import { EventEmitter } from "eventemitter3"

interface WebSocketContextType {
  websocketRef: React.MutableRefObject<WebSocket | null>;
  eventEmitter?: EventEmitter;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{
  wsUrl: string;
  children: React.ReactNode }> = ({ wsUrl, children }) => {
  const websocketRef = useRef<WebSocket | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelayRef = useRef<number>(1000);
  const isMountedRef = useRef<boolean>(true);
  const eventEmitter = useRef<EventEmitter>(new EventEmitter()).current;

  useEffect(() => {
    isMountedRef.current = true;

    function connect() {
      if (!isMountedRef.current) return;

      websocketRef.current = new WebSocket(wsUrl);

      websocketRef.current.onopen = () => {
        console.log("WebSocket connection opened");
        reconnectDelayRef.current = 1000; // reset backoff on successful connect
        heartbeatTimerRef.current = setInterval(() => {
          if (websocketRef.current?.readyState === WebSocket.OPEN) {
            websocketRef.current.send(JSON.stringify({ message_type: 'ping' }));
            //console.log("Global Heartbeat Sent");
          }
        }, 30000);
      };

      websocketRef.current.onmessage = (e: MessageEvent) => {
        const data = JSON.parse(e.data);
        // ws server has attached the user name to the url,
        // so we can use that to determine which tab sent the message and avoid sending messages back
        // to the same tab that sent it in the first place. This is important because when a message
        // is sent from a tab, it is broadcasted to all tabs including the sender tab.
        // If we don't ignore messages from the sender tab,
        // it will create an infinite loop of messages being sent back and forth between the server and the sender tab.

        // transmit to other components
        eventEmitter?.emit("message", data);
      };

      websocketRef.current.onerror = (error: Event) => {
        console.error("WebSocket error:", error);
        websocketRef.current?.close(); // triggers onclose → reconnect
      };

      websocketRef.current.onclose = () => {
        console.log("WebSocket connection closed");
        if (heartbeatTimerRef.current) {
          clearInterval(heartbeatTimerRef.current);
          heartbeatTimerRef.current = null;
        }
        if (!isMountedRef.current) return; // don't reconnect after unmount
        const delay = reconnectDelayRef.current;
        console.log(`Reconnecting in ${delay}ms...`);
        reconnectTimerRef.current = setTimeout(() => {
          reconnectDelayRef.current = Math.min(delay * 2, 30000); // exponential backoff, max 30s
          connect();
        }, delay);
      };
    }

    connect();

    return () => {
      isMountedRef.current = false;
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
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