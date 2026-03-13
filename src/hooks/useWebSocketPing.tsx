import { useEffect } from "react";

const useWebSocketPing = (websocketRef: React.MutableRefObject<WebSocket | null>, interval: number = 30000) => {
  useEffect(() => {
    if (!websocketRef.current) {
      console.warn("WebSocket is not connected.");
      return;
    }

    const pingInterval = setInterval(() => {
      //console.log("Sending ping to WebSocket server...");
      websocketRef.current?.send(
        JSON.stringify({
          message_type: "ping",
        })
      );
    }, interval);

    // Cleanup the interval on unmount
    return () => {
      clearInterval(pingInterval);
    };
  }, [websocketRef, interval]);
};

export default useWebSocketPing;