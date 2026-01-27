
import { useEffect, useImperativeHandle, useState } from 'react';
import ChatBody from './ChatBody';
import { useWebSocket } from '../context/WebSocketContext';
import { useSelector } from 'react-redux';
//import type { RootState } from '../../redux/store';
//import type { WebSocketMessageProps } from '../shared/types';

//import { useAppSelector } from '../../redux/store';

export interface ChatPageRefProps {
  get_isChatOpen: () => boolean | undefined;
  toggle_chat: () => void | undefined;
}

export interface ChatPageProps {
    
    //chat_message?: ChatMessageProps,
    ref: React.Ref<ChatPageRefProps>;
  }

export interface ChatMessageProps {
    text?: string;
    user_name: string;
  }
  
    export const ChatPage = ({ ref }: ChatPageProps) => {

    const [incomingMessages, setIncomingMessages] = useState<ChatMessageProps[]>([]);

    //get user from redux store using useAppSelector
    //const user_name = useSelector((state: RootState) => state.name);
 
    const [isChatOpen, setIsChatOpen] = useState(true);

    const [outgoingMessage, setOutgoingMessage] = useState<string>('');

    //const user = useAppSelector(state => state.user.value)

    const {websocketRef, eventEmitter} = useWebSocket();
    
    //const { name, isLoggedIn } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);
    const { name } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);

    useImperativeHandle(ref, () => ({

      get_isChatOpen: () => isChatOpen,
      toggle_chat: () => setIsChatOpen(!isChatOpen)
    }));

    /*
    useEffect(() => {
        console.log('ChatPage: New Chat Message received: ' + chat_message?.text);
        if (chat_message && chat_message.text) {
            setMessages((prevMessages) => {
              return [...prevMessages, chat_message]
            });
        }
    }, [chat_message]);
*/

    /*
    useEffect(() => {
      if (!websocketRef.current) {
        //alert('ChatPage: WebSocket is not connected');
        return;
      }
      console.log('ChatPage: Setting up WebSocket onmessage handler');
      websocketRef.current.onmessage = (e) => {
        let data : WebSocketMessageProps = JSON.parse(e.data);
        console.log('ChatPage: Received message from server:', data);
       
        if (data.message_type === 'chat') {
          console.log('Received CHAT message from server:', data, "isChatOpen:", isChatOpen);
          // if chatbox is closed, open it
          if (isChatOpen === false) {
            //alert('New chat message received, opening chat box.');
            setIsChatOpen(true);
          }
            setIncomingMessages((prevMessages) => {

              return [...prevMessages, {text: data.message, user_name: data.user_name}]
            });
        }
       };
    }, [websocketRef.current]);
    */

    useEffect(() => {
      const handleMessage = (data: any) => {
        if (data.message_type === "chat") {
          //console.log("ChatPage: Received chat message:", data);
          // if name is not "teacher", only accept messages from teacher
          // don't accept message from myself. See sendChatMessage function.
          //console.log("ChatPage: Current user name:", name, "Message user name:", data.user_name);
          if (name === data.user_name) { // ignore messages from myself
            //console.log("ChatPage: Ignoring chat message from myself:", data.user_name);
            return;
          }
          if (name !== "teacher" && data.user_name !== "teacher") {
            // students only accept messages from teacher, not from other students
            //console.log("ChatPage: Ignoring chat message from non-teacher user:", data.user_name);
            return;
          }

          setIncomingMessages((prevMessages) => [
            ...prevMessages,
            { text: data.message, user_name: data.user_name },
          ]);
        }
      };
  
      // Subscribe to the "message" event
      eventEmitter?.on("message", handleMessage);
  
      // Cleanup the event listener on unmount
      return () => {
        eventEmitter?.off("message", handleMessage);
      };
    }, [eventEmitter]); // Only include eventEmitter in the dependency array

    const sendChatMessage = () => {
      if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
        alert('ChatPage: WebSocket is not connected');
        return;
      }
      const messageToSend = {
        message_type: 'chat',
        message: outgoingMessage,
        user_name: name // You can replace this with the actual user name from your state
      };
      websocketRef.current.send(JSON.stringify(messageToSend));
      // add the sent message to incomingMessages so it shows up in chat body
      setIncomingMessages((prevMessages) => [
        ...prevMessages,
        { text: outgoingMessage, user_name: name },
      ]);
      setOutgoingMessage(''); // Clear the input field after sending
      //console.log('ChatPage: Sent message to server:', messageToSend);
    };

    const displayChatBox = () => {
      if (isChatOpen) {
        return (
          <>
          <ChatBody messages={incomingMessages} />
          <div><input className="bg-gray-200 text-black w-80 p-2" placeholder="chat message" value={outgoingMessage} onChange={(e) => setOutgoingMessage(e.target.value)} /></div>
          <div><button className=" bg-amber-300 p-2 m-2" onClick={sendChatMessage}>Send Message</button></div>
          </>
        );
        
      }
      return null;
    }

    return (
      <>
        <div className='grid grid-cols-1'  >
        {displayChatBox()}
    
        </div>
        </>
    );
  };
  
  export default ChatPage;

  /*
 <>
        <div className='grid grid-cols-1'  >
        {isChatOpen && messages && messages.length > 0 &&
        (
          messages.map((message, index) => (
            <div key={index}><span>{message.user_name}</span>: <span>{message.text}</span></div>
          ))
           
        )}
   
        <div><button className="text-red bg-green-300 mb-2" onClick={sendChatMessage}>Send Message</button></div>
  
        <div className='flex justify-center bg-white rounded-md p-2'>
          <button className='bg-green-300 p-2 rounded-md'  onClick={() => setChatOpen(!isChatOpen)}> {isChatOpen ? 'Close Chat' : 'Open Chat'}</button>
          </div>
        </div>
        </>
  */

