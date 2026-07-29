import { useRef, useEffect } from 'react';
//import { MessageProps } from './ChatPage';
import { v4 as uuidv4 } from "uuid";
import { type ChatProps } from './ChatPage';


const ChatBody = (props: { messages: ChatProps[] }) => {

    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ block: 'nearest', inline: 'start'  })
    }

  useEffect(() => {
    //console.log("ChatBody: messages updated=", props.messages)
    scrollToBottom()
  }, [props.messages])

  // {{console.log("message in ChatBody=", message)}}
  return (
    <>
      {/*This shows messages sent from you*/}
      <div className='m-1 h-40 bg-bgColor2 text-textColor2 overflow-scroll'>
      <div>
        {props.messages.map((message) => {
           // Messages beginning with "SR" are speech-recognition prompts: hide the "SR" marker
           // and show them in a distinct color.
           const isSR = message.text?.trim().startsWith("SR") ?? false;
           const displayText = isSR ? message.text!.trim().replace(/^SR\s*/, '') : message.text;

           return (
           <div key={uuidv4()} className='m-1'>
                <p ref={messagesEndRef} className={isSR ? 'text-purple-700 font-semibold' : ''}>
                  {message.user_name}: {displayText}
                </p>
            </div> )
          }
        )}
      </div>
      </div>
    </>
  );
};

export default ChatBody
