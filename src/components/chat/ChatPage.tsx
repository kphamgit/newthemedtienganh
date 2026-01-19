
import { useEffect, useImperativeHandle, useState } from 'react';
import ChatBody from './ChatBody';

//import { useAppSelector } from '../../redux/store';

export interface ChatPageRefProps {
  get_isChatOpen: () => boolean | undefined;
  set_isChatOpen: () => void | undefined;
}

export interface ChatPageProps {
    websocket: WebSocket | null, 
    ref: React.Ref<ChatPageRefProps>;
  }

export interface ChatMessageProps {
    message_type: string;
    message: string;
    user_name: string;
  }
  
    export const ChatPage = ({ websocket, ref }: ChatPageProps) => {

    const [messages, setMessages] = useState<ChatMessageProps[]>([]);
 
    const [isChatOpen, setIsChatOpen] = useState(true);

    //const user = useAppSelector(state => state.user.value)
    
   
    const setChatOpen = (value:boolean) => {
      setIsChatOpen(value);
    }

    useImperativeHandle(ref, () => ({
      get_isChatOpen: () => isChatOpen,
      set_isChatOpen: () => setIsChatOpen(true)
    }));

    useEffect(() => {
      if (!websocket) {
        //alert('ChatPage: WebSocket is not connected');
        return;
      }
      websocket.onmessage = (e) => {
        let data = JSON.parse(e.data);
        console.log('Received message from server:', data);
        if (data.message_type === 'chat') {
            console.log('ChatPage: Chat Message from server: ' + data.message);
            setMessages((prevMessages) => {

              return [...prevMessages, data]
            });
        }
       };
    }, [websocket]);
    

    return (
      <>
        <div className='grid grid-cols-1'  >
        {isChatOpen && 
        (
           
             <ChatBody messages={messages} />
           
        )}
        <div className='flex justify-center bg-white rounded-md p-2'>
          <button className='bg-green-300 p-2 rounded-md'  onClick={() => setChatOpen(!isChatOpen)}> {isChatOpen ? 'Close Chat' : 'Open Chat'}</button>
          </div>
        </div>
        </>
    );
  };
  
  export default ChatPage;
