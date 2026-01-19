import { useRef, useEffect } from 'react';
//import { MessageProps } from './ChatPage';
import { v4 as uuidv4 } from "uuid";
import { type ChatMessageProps } from './ChatPage';


const ChatBody = (props: {messages: ChatMessageProps[]}) => {

    const messagesEndRef = useRef<null | HTMLDivElement>(null); 
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ block: 'nearest', inline: 'start'  })
    }    
    
  useEffect(() => {
    console.log("ChatBody: messages updated=", props.messages)
    scrollToBottom()
  }, [props.messages])

  // {{console.log("message in ChatBody=", message)}}
  return (
    <>
      {/*This shows messages sent from you*/}
      <div className='m-1 h-40 bg-bgColor2 text-textColor2 overflow-scroll'>
      <div>
        {props.messages.map((message) => {
          
           return (
           <div key={uuidv4()} className='m-1'>
                <p ref={messagesEndRef}>{message.user_name}: {message.message}</p>
            </div> )
          }
        )}
      </div>
      </div>
    </>
  );
};

export default ChatBody
