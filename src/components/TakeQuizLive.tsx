

import {  useParams } from 'react-router-dom';

function TakeQuizLive() {
    const { quiz_id } = useParams<{  quiz_id: string }>();
    /*
    const location = useLocation();
    
    useEffect(() => {
        if (web_socket) {
            console.log('TakeQuizLive: WebSocket connection established. websocket:', web_socket);
            console.log('TakeQuizLive: WebSocket connection exists for quiz ID:', quiz_id);
            // You can add more logic here to handle incoming messages specific to the quiz

            if (web_socket.readyState === WebSocket.OPEN) {
                web_socket.onmessage = (e: any) => {
                    let data = JSON.parse(e.data);
                    console.log('TakeQuizLive, Received message from server:', data);
                }
            }
        }
        else {
            console.log('TakeQuizLive: No WebSocket connection for quiz ID:', quiz_id);
        }
    }, [web_socket]);
    */

  return (
    <div className='flex flex-row justify-center bg-cyan-100 items-center h-full w-full'>
        TakeQuizLive
        <div>Quiz ID: {quiz_id}</div>
    </div>
  )
}

export default TakeQuizLive