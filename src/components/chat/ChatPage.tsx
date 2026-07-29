
import { useEffect, useImperativeHandle, useState } from 'react';
import ChatBody from './ChatBody';
import { useWebSocket } from '../context/WebSocketContext';
import { useSelector } from 'react-redux';
import VoiceAnswerRecorder from './VoiceAnswerRecorder';
import { FaAngleDoubleRight } from 'react-icons/fa';
//import type { WebSocketMessageProps } from '../shared/types';
//import type { RootState } from '../../redux/store';
//import type { WebSocketMessageProps } from '../shared/types';

//import { useAppSelector } from '../../redux/store';
//import { v4 as uuidv4 } from "uuid";

export interface ChatPageRefProps {
  get_isChatOpen: () => boolean | undefined;
  toggle_chat: () => void | undefined;
}

export interface ChatPageProps {
    ref: React.Ref<ChatPageRefProps>;
    chat: ChatProps;
    onClose?: () => void; // collapse/close the chat window
  }

export interface ChatProps {
    text?: string;
    user_name: string;
    audio_url?: string; // presigned S3 url of a recorded voice answer (for the teacher to replay)
  }
  
    export const ChatPage = ({ ref, chat, onClose }: ChatPageProps) => {

    const [incomingMessages, setIncomingMessages] = useState<ChatProps[]>([]);

    //get user from redux store using useAppSelector
    //const user_name = useSelector((state: RootState) => state.name);
 
    const [isChatOpen, setIsChatOpen] = useState(true);

    const [outgoingMessage, setOutgoingMessage] = useState<string>('');

    // When the teacher sends a message beginning with "SR", the student must answer by voice:
    // the text input is disabled until they respond.
    const [inputDisabled, setInputDisabled] = useState<boolean>(false);
    // The mic is locked after the student submits one recorded answer (no retries), and re-opens
    // when the teacher sends a new message.
    const [micDisabled, setMicDisabled] = useState<boolean>(false);

    const {websocketRef} = useWebSocket();
    
    //const { name, isLoggedIn } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);
    const { name } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);

    useImperativeHandle(ref, () => ({

      get_isChatOpen: () => isChatOpen,
      toggle_chat: () => setIsChatOpen(!isChatOpen)
    }));
  
    useEffect(() => {
      // check for duplicate message id before adding to incomingMessages



      if (chat.text) {
        const chatMessage: ChatProps = { text: chat.text, user_name: chat.user_name };
        // ignore messages from myself. 
        if (name === chatMessage.user_name) {
          return;
        }
        if (name !== "teacher" && chatMessage.user_name !== "teacher") {
          // students only accept messages from teacher, not from other students
          return;
        }

        setIncomingMessages((prevMessages) => {
          return [...prevMessages, chat]
          });

        // Student side: a new teacher message opens a fresh answer opportunity.
        if (name !== "teacher") {
          const isSR = chatMessage.text?.trim().startsWith("SR") ?? false;
          setInputDisabled(isSR); // SR => force voice (disable typing); otherwise allow typing
          setMicDisabled(false);  // re-open the mic for the new question
        }

      }
    }, [chat])

    /*
    useEffect(() => {
      const handleMessage = (data: WebSocketMessageProps) => {
        //console.log("MessageControl: handleMessage called with data:", data);
        //if (data.message_type === "chat") {
       //console.log("*********** MessageControl: Received data from server:", data); 
        if (data.message_type === "chat") {
          // console.log('ChatPage: Received CHAT message from server:', data, "isChatOpen:", isChatOpen);

          const chat: ChatProps = { text: data.content, user_name: data.user_name };

          if (name === chat.user_name) { // ignore messages from myself. See sendChatMessage function.
            //console.log("ChatPage: Ignoring chat message from myself:", chat.user_name);
            return;
          }
          if (name !== "teacher" && chat.user_name !== "teacher") {
            // students only accept messages from teacher, not from other students
            return;
          }
          //console.log('ChatPage: adding chat message: ' + chat.text);
          setIncomingMessages((prevMessages) => {
          return [...prevMessages, chat]
          });

          }
      }
    

      // Subscribe to the "message" event
      eventEmitter?.on("message", handleMessage);
      // Cleanup the event listener on unmount
      return () => {
        eventEmitter?.off("message", handleMessage);
      };
    }, [eventEmitter]); // Only include eventEmitter in the dependency array
    */
    
    // Send an arbitrary piece of text as a chat message. `audioUrl` (optional) is the S3 link of a
    // recorded voice answer, so the teacher can replay it. `echoLocally` controls whether the sender
    // also sees the message in their own chat body.
    const sendText = (text: string, echoLocally: boolean = true, audioUrl?: string) => {
      if (!text || text.trim().length === 0) return;
      if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
        alert('ChatPage: WebSocket is not connected');
        return;
      }
      const messageToSend = {
        message_type: 'chat',
        content: text,
        user_name: name, // You can replace this with the actual user name from your state
        audio_url: audioUrl, // forwarded verbatim by the ws-server's general broadcast
      };
      websocketRef.current.send(JSON.stringify(messageToSend));
      if (echoLocally) {
        setIncomingMessages((prevMessages) => [
          ...prevMessages,
          { text, user_name: name, audio_url: audioUrl },
        ]);
      }
    };

    // Everyone who isn't the teacher is treated as a student.
    const isStudent = name !== "teacher";

    // Reset the composer after a message is sent.
    const clearComposer = () => {
      setOutgoingMessage('');
      setInputDisabled(false); // re-enable typing after the student has responded
    };

    const sendChatMessage = () => {
      sendText(outgoingMessage);
      clearComposer();
    };

    // Teacher-only: prepend "SR" so the student is forced to answer by voice.
    const sendSRMessage = () => {
      const srText = outgoingMessage.trim() ? `SR ${outgoingMessage.trim()}` : 'SR';
      sendText(srText);
      clearComposer();
    };

    // Student: a recorded answer has been saved to S3 and transcribed on the server. Show the
    // transcript to the student (echoed into the chat) and send it to the teacher, then LOCK the
    // mic so they can't re-record. (audioUrl is the S3 link, available for future use e.g. replay.)
    const handleVoiceTranscribed = (transcript: string, audioUrl?: string) => {
      // Empty/failed transcription: leave the mic available AND keep the input disabled, so the
      // student must re-record (they can't type a "fake" transcription while the mic is open).
      if (!transcript || transcript.trim().length === 0) return;
      // Send transcript + audio url; echoed to the student too so they see their transcription.
      sendText(transcript, true, audioUrl);
      setMicDisabled(true);    // one attempt only — no retrying for a better transcription
      setInputDisabled(false); // answer accepted → re-enable typing
    };

  
    return (
      <div
        className="fixed bottom-15 right-0 bg-white shadow-lg border border-gray-300 rounded-t-lg w-96 h-72 flex flex-col z-20"
      >
          {/* Close arrow — sticks to the right edge of the chat window */}
          <button
            onClick={onClose}
            aria-label="Close chat"
            title="Close chat"
            className="absolute top-1 right-1 z-30 p-1 text-gray-500 hover:text-gray-800"
          >
            <FaAngleDoubleRight />
          </button>

          <>
            <div className="flex flex-col h-full">
              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-4">
                <ChatBody messages={incomingMessages} />
              </div>

              {/* Input, voice recorder, and Send button */}
              <div className="p-2 border-t border-gray-300 bg-gray-100">
                <div className="flex items-center gap-2">
                  <button
                    className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                    onClick={sendChatMessage}
                  >
                    Send
                  </button>
                  <input
                    disabled={inputDisabled}
                    className={`flex-1 bg-gray-200 text-black p-2 rounded-md ${inputDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder={inputDisabled ? 'Typing disabled — please speak your reply' : 'Type or speak your message...'}
                    value={outgoingMessage}
                    onChange={(e) => setOutgoingMessage(e.target.value)}
                  />
                  {/* Student: record a spoken answer; it's transcribed on the server and sent to the teacher.
                      Locked after one attempt (micDisabled) until the teacher sends a new message. */}
                  {isStudent && (
                    <VoiceAnswerRecorder
                      onTranscribed={handleVoiceTranscribed}
                      userName={name}
                      disabled={micDisabled}
                      highlight={inputDisabled && !micDisabled}
                    />
                  )}
                  {/* Teacher-only: send a message that forces the student to answer by voice */}
                  {!isStudent && (
                    <button
                      className="bg-purple-600 text-white p-2 rounded-md hover:bg-purple-700"
                      onClick={sendSRMessage}
                    >
                      Send SR
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        
      </div>
    );
  };
  
  export default ChatPage;

