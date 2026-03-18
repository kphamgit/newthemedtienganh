import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { useWebSocket } from '../components/context/WebSocketContext';
import { useEffect } from 'react';
import type { WebSocketMessageProps } from '../components/shared/types';
import { useUserConnections } from '../components/context/UserConnectionsContext';
import StudentScoreRow from './StudentScoreRow';
import { type UserRowProps } from '../components/context/UserConnectionsContext';

//import { setUser } from '../redux/userSlice';
//import { setUser } from '../redux/userSlice';
//import { type LoggedInUserPendingDataProps } from '../components/shared/types';

//interface Props {
  // myLiveScore: {question_number: number | undefined, score: number | undefined, total_score: number | undefined};
//}
/*
export type UserRowProps = {
  name: string;
  is_logged_in?: boolean;
  live_score?: number;
  live_total_score?: number;
  live_question_number?: number;
  live_user_answer?: string;
  recording_received?: boolean;
  recording_presigned_url?: string;
};
*/

interface ScoreBoardProps {
    my_row: UserRowProps | null; // Expecting an array of UserRowProps
  }

  const ScoreBoard: React.FC<ScoreBoardProps> = ({ my_row}) => {
//function ScoreBoard( {name: string, live_question_number: number, live_score: number,  live_total_score: number }) : UserRowProps{
    const { name: myName } = useSelector((state: RootState) => state.user);
    //const connectedUsersInReduxStore = useSelector((state: RootState) => state.connectedUsers.list);
    const {eventEmitter} = useWebSocket();

    //const [userRows, setUserRows] = useState<UserRowProps[]>([]);
     const {userRows, setUserRows} = useUserConnections();

    
    //const [quizName, setQuizName] = useState<string>("");

 useEffect(() => {
    console.log("ScoreBoard: useEffect my_row:", my_row);
    // update myTotalScore whenever my_row.live_total_score changes
    if (my_row) {
        console.log("ScoreBoard: my_row is not null, my score is:", my_row.live_score);
    }
 }, [my_row]);

  useEffect(() => {
      const handleMessage = (data: WebSocketMessageProps) => {
        //console.log("ScoreBoard: handleMessage called with data:", data);
        if (data.message_type === "live_question_retrieved") {
            //console.log("ScoreBoard: Received live_question_retrieved message from server for user:", data.user_name, " content:", data.content);
            // update question number in score board
            const sender = data.user_name;
            //console.log("ScoreBoard: live_question_retrieved updating live question number for user:", sender, " to ", data.content);
            
            setUserRows((prevRows) => prevRows.map((row) => {
                if (row.name === sender) {
                    return { ...row, live_question_number: Number(data.content), live_score: undefined }; // reset live score when question number is updated
                }
                return row;
            }));
            
      
        }
        else if (data.message_type === "student_acknowleged_live_question_number") {
            //console.log("ScoreBoard: Received student_acknowleged_live_question_number message from server for user:", data.user_name, " question number:", data.message);
            // update question number in redux store for that user
            const sender = data.user_name;
            
            setUserRows((prevRows) => prevRows.map((row) => {
                if (row.name === sender) {
                    return { ...row, live_question_number: Number(data.content), live_score: undefined }; // reset live score and total score when question number is updated
                }
                return row;
            }));
            

            //dispatch(updateLiveQuestionNumber({name: sender, question_number: data.content}));
        }
         else if (data.message_type === "live_score") {
            console.log("ScoreBoard: live_score received. Data:", data);
            /*
{
    "message_type": "live_score",
    "content": {
        "score": 5,
        "live_total_score": 5
    },
    "user_name": "student1",
    "user_answer": "  are"
}
            */

            const sender = data.user_name;
            
            setUserRows((prevRows) => prevRows.map((row) => {
                if (row.name === sender) {
                    console.log("ScoreBoard: Updating live score for user:", sender, " to ", data.content.score, " and live total score to ", data.content.live_total_score, " with user answer:", data.content.live_user_answer);
                    return { ...row, live_score: Number(data.content.score), live_total_score: data.content.live_total_score, live_user_answer: data.content.live_user_answer };
                }
                return row;
            }));
           
        }
        else if (data.message_type === "live_quiz_terminated") {
            //console.log("ScoreBoard: Received live_quiz_terminated message from server.");
            // reset all user rows
            
            setUserRows((prevRows) => prevRows.map((row) => ({
                ...row,
                live_quiz_id: undefined,
                live_score: undefined,
                total_score: undefined,
                live_question_number: undefined,
            })));
            
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
        {my_row && <StudentScoreRow user={my_row} />}
       
            <div className="bg-green-300 p-0 mt-10 mb-2">  
                { userRows && userRows.length > 0 &&
                    userRows.map((user, index) => (
                        user.name !== "teacher" && user.name !== "admin" ) && (
                            <>
                            <StudentScoreRow key={index} user={user} />
                            { myName === "teacher" && user.live_user_answer !== undefined &&
                                <div className='flex flex-row justify-center items-center ml-2'>
                                    <div>
                                        <span className="ml-2">{user.live_user_answer}</span>

                                    </div>

                                 </div>
                            }
                            </>
                        
                        
                    ))
                }
                   
            </div>
        </>
    )
}

export default ScoreBoard

/*
     
                     <div className='flex flex-row justify-start mb-2 items-center bg-cyan-300 px-2'>
                            <div
                                className={`text-red-900 font-bold `}
                            >
                                {name}
                            </div>
                            {myLiveScore.question_number !== undefined &&
                                <>
                                    <div
                                        className={`${myLiveScore.score === undefined ? "bg-amber-600" : "bg-green-600"
                                            } py-0 ml-1 px-2 rounded-full text-md text-white`}
                                    >{myLiveScore.question_number}
                                    </div>

                                    <div className='flex flex-row justify-center items-center ml-2'>
                                        <div className='mx-2'>Score:</div>
                                        <div>
                                            {myLiveScore.score === undefined ?

                                                <FaSpinner className="animate-spin text-blue-500" size={17} />
                                                :
                                                <span className="ml-2">{myLiveScore.score}</span>
                                            }
                                        </div>
                                    </div>
                                </>
                            }
                            {myLiveScore.total_score !== undefined && myLiveScore.total_score !== 999 &&
                                <div className='flex flex-row justify-center items-center ml-2'>
                                    
                                    <div className='p-1 mx-2'>Total:</div>
                                    <div>
                                        <span className="ml-2">{myLiveScore.total_score}</span>

                                    </div>

                                </div>
                            }

                        </div>
  
*/


