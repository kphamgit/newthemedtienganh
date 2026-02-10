import { useCallback, useState } from "react";
import api from "../api";

const useSendNotification = () => {
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    const sendNotification = useCallback(
      async (message_type: string, content: string, name: string, onSuccess?: () => void) => {
        setIsSending(true);
        setError(null);
  
        try {
          const response = await api.post("/api/send-notification/", {
            message_type: message_type,
            content: content,
            user_name: name,
          });
  
          if (response.status === 200) {
            console.log("Notification sent successfully:", response.data);
            if (onSuccess) onSuccess(); // Call the success callback
          } else {
            console.error("Failed to send notification:", response.data);
            setError("Failed to send notification. Please try again.");
          }
        } catch (err) {
          console.error("Error sending notification:", err);
          setError("An error occurred while sending the notification.");
        } finally {
          setIsSending(false);
        }
      },
      []
    );
  
    return { sendNotification, isSending, error };
  };

export default useSendNotification;