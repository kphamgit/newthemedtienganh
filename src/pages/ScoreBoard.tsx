import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { useWebSocket } from '../components/context/WebSocketContext';
import { FaSpinner } from "react-icons/fa";

function ScoreBoard() {
    const { name } = useSelector((state: RootState) => state.user);
    const connectedUsersInReduxStore = useSelector((state: RootState) => state.connectedUsers.list);

    const {websocketRef} = useWebSocket();

    const sendDisconnect = (username: string) => {
        //console.log("sendDisconnect Quiz id: ");
         if (!websocketRef.current) {
             alert("WebSocket is not connected.");
             return;
         }
         websocketRef.current.send(JSON.stringify({
             message_type: "disconnect_user",
             message: username,  // user to be disconnected
             user_name: name,    // identify sender
         }));
     
     };

     const displayUserRow = (user: any, index: number) => {
        console.log("ScoreBoard: displayUserRow called for user:", user);
        if (user.live_question_number !== undefined ) {
            
            return (
                <div className='flex flex-row justify-start items-center bg-green-100 px-2' key={index}>

                    <div className="bg-amber-400 p-0.5 ml-1 px-2 rounded-full">{user.live_question_number}</div>
                    <div className='flex flex-row justify-center items-center ml-2'>
                        <div className='mx-2'>Score:</div>
                        <div>
                            {user.live_score === undefined ?

                                <FaSpinner className="animate-spin text-blue-500" size={17} />
                                :
                                <span className="ml-2">{user.live_score}</span>
                            }
                        </div>
                    </div>
                    <div className='flex flex-row justify-center items-center ml-2'>
                        <div className='p-1 mx-2'>Total:</div>
                        <div>
                            {user.total_score === undefined ?

                                <FaSpinner className="animate-spin text-blue-500" size={15} />
                                :
                                <span className="ml-2">{user.total_score}</span>
                            }
                        </div>
                    </div>
                </div>
            );
          
        }
     }

    return (
        <>
        {
        <div className="bg-green-300 p-2 mb-2">
            <div>Users online:</div>
            { connectedUsersInReduxStore && connectedUsersInReduxStore.length > 0 &&
            <div className="flex flex-col space-x-4">
                {connectedUsersInReduxStore.map((user, index) => (
                    <div className="flex flex-row justify-start items-center mt-1 gap-2" key={index}>
                    <div key={index}>{user.name}</div>
                    { displayUserRow(user, index) }
                    { name === "teacher" &&
                        <button 
                            className="bg-red-500 text-white p-1 ml-2 rounded-md"
                            onClick={() => sendDisconnect(user.name)}
                        >
                            Disconnect
                        </button>
                    }
                   
                    </div>
                    
                ))}
            </div>
    }
        </div>
        }
        
        </>
      )
}

export default ScoreBoard