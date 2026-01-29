
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
    chat: ChatProps | null;
    ref: React.Ref<ChatPageRefProps>;
   
  }

export interface ChatProps {
    text?: string;
    user_name: string;
  }
  
    export const ChatPage = ({ chat, ref }: ChatPageProps) => {

    const [incomingMessages, setIncomingMessages] = useState<ChatProps[]>([]);

    //get user from redux store using useAppSelector
    //const user_name = useSelector((state: RootState) => state.name);
 
    const [isChatOpen, setIsChatOpen] = useState(true);

    const [outgoingMessage, setOutgoingMessage] = useState<string>('');

    //const user = useAppSelector(state => state.user.value)

    const {websocketRef} = useWebSocket();
    
    //const { name, isLoggedIn } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);
    const { name } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);

    useImperativeHandle(ref, () => ({

      get_isChatOpen: () => isChatOpen,
      toggle_chat: () => setIsChatOpen(!isChatOpen)
    }));

    

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
       if (chat && chat.text) {
       // don't accept message from myself. See sendChatMessage function.
          console.log("ChatPage: Current user name:", name, "Sender user name:", chat.user_name);

          if (name === chat.user_name) { // ignore messages from myself. See sendChatMessage function.
            console.log("ChatPage: Ignoring chat message from myself:", chat.user_name);
            return;
          }
          if (name !== "teacher" && chat.user_name !== "teacher") {
            // students only accept messages from teacher, not from other students
            return;
          }
          console.log('ChatPage: adding chat message: ' + chat.text);
        setIncomingMessages((prevMessages) => {
          return [...prevMessages, chat]
        });
       }
    }, [chat]);
    
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

  
    return (
      <div
        className="fixed bottom-15 right-0 bg-white shadow-lg border border-gray-300 rounded-t-lg w-96 h-72 flex flex-col z-50"
      >
       
          <>
            <div className="flex flex-col h-full">
              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-4">
                <ChatBody messages={incomingMessages} />
              </div>
    
              {/* Input and Send Button */}
              <div className="p-2 border-t border-gray-300 bg-gray-100">
                <input
                  className="bg-gray-200 text-black w-full p-2 rounded-md mb-2"
                  placeholder="Type your message..."
                  value={outgoingMessage}
                  onChange={(e) => setOutgoingMessage(e.target.value)}
                />
                <button
                  className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                  onClick={sendChatMessage}
                >
                  Send Message
                </button>
              </div>
            </div>
          </>
        
      </div>
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

