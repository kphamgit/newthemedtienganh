import { useUserConnections } from '../components/context/UserConnectionsContext';

//import type { ChatProps } from '../components/chat/ChatPage';
//import { setUser } from '../redux/userSlice';
//import { setUser } from '../redux/userSlice';
//import { type LoggedInUserPendingDataProps } from '../components/shared/types';


function MessageController() {

    //const [liveQuizId, setLiveQuizId] = useState<string | null>(null);

    const {userRows,} = useUserConnections();
   
      
 // Notify the parent component whenever userRows changes
 /*
 useEffect(() => {
    if (parentCallback) {
        console.log('MessageController: userRows updated, invoking parentCallback with:', userRows);
      parentCallback(userRows, liveQuizId || '');
    }
  }, [userRows, parentCallback]);
*/

    return (
        <>
          
            <div className="flex flex-row justify-start p-2">
                {userRows && userRows.length > 0 &&
                    userRows.map((user, index) => (
                        <div className='flex flex-row justify-start items-center px-2 py-1 rounded-md bg-green-100 ' key={index}>
                            <div
                                className={`text-blue-800 font-bold ${user.is_logged_in === false ? "opacity-50" : "opacity-100"
                                    }`}
                            >
                                <span>{user.name}</span>
                            </div>
                        </div>
                    ))
                }
            </div>
        </>
    )
}

export default MessageController

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


