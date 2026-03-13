
import { useWebSocket } from '../components/context/WebSocketContext';
//import { FaSpinner } from "react-icons/fa";
import { useEffect } from 'react';
import type {  WebSocketMessageProps } from '../components/shared/types';
import { useUserConnections } from '../components/context/UserConnectionsContext';
//import { setUser } from '../redux/userSlice';
//import { setUser } from '../redux/userSlice';
//import { type LoggedInUserPendingDataProps } from '../components/shared/types';



function DisplayRecordings() {
   
    //const connectedUsersInReduxStore = useSelector((state: RootState) => state.connectedUsers.list);
    const {eventEmitter} = useWebSocket();

    const {userRows, setUserRows} = useUserConnections();
   
    

  useEffect(() => {
      const handleMessage = (data: WebSocketMessageProps) => {
        //console.log("ScoreBoard: handleMessage called with data:", data);
        if (data.message_type === "recording_received") {
            //console.log("TeacherControl: Received recording_received message from server, data = :", data);
            console.log("ManageConnection: Recording received. Presigned S3 URL = ", data.content); 
            // split by '_' and get the first part as user name, which is student2 in this example
            
           
            // search user rows for this user and add a property to indicate their recording has been received
            setUserRows((prevRows) => prevRows.map((row) => {
                if (row.name === data.user_name) {
                    return { ...row, recording_received: true, recording_presigned_url: data.content }; // add a highlight property to the user row
                }
                return row;
            }));
        }
      }
      // Subscribe to the "message" event
      eventEmitter?.on("message", handleMessage);
      // Cleanup the event listener on unmount
      return () => {
        eventEmitter?.off("message", handleMessage);
      };
    }, [eventEmitter]); // Only include eventEmitter in the dependency array

    return (
        <>
        <div>Recordings:</div>
            <div className="bg-green-300 p-2 mb-2">
                {userRows && userRows.length > 0 &&
                    userRows.map((user, index) => (
                        <div className='flex flex-row justify-start mb-2 items-center bg-green-100 px-2' key={index}>
                               <div
                                className={`text-blue-800 font-bold ${user.is_logged_in === false ? "opacity-50" : "opacity-100"
                                    }`}
                            >   
                                <span>{user.name}</span> 
                                { user.recording_received && 
                                <>
                                    {/* kpham: use key to make sure audio element is 
                                    re-rendered when a new recording is received for the same user 
                                    without the key, the audio element is UN-reactive to change in src value */}
                                    <audio key={user.recording_presigned_url} controls className='ml-2'>
                                        <source src={user.recording_presigned_url} type="audio/webm" />
                                        Your browser does not support the audio element.
                                    </audio>
                                    </>

                                }
                            </div>
                        </div>
                    ))
                }
            </div>
        </>
    )
}

export default DisplayRecordings

/*
   { user.recording_received && 
                                    <span className='ml-2 text-sm text-green-700'>(Recording Received)
                                    <audio controls className='ml-2'>
                                        <source src={user.recording_presigned_url} type="audio/webm" />
                                        Your browser does not support the audio element.
                                    </audio>
                                    </span>
                                }
*/


