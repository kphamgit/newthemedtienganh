import { useState, useEffect } from "react";
import api from "../api";
import { type LevelProps} from "../components/Level";
import "../styles/Home.css"
import Navbar from "../components/Navbar";
//import { type RootState } from "../redux/store";
import TakeQuizLive from "../components/TakeQuizLive";
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
//import type { WebSocketMessageProps } from "../components/shared/types";
//import ScoreBoard from "./ScoreBoard";
//import { clearLiveQuestionInfo} from "../redux/connectedUsersSlice";
//import type { AppDispatch } from "../redux/store";
import { useWebSocket } from "../components/context/WebSocketContext";
import type { WebSocketMessageProps, VideoSegment } from "../components/shared/types";
import { useUserConnections } from "../components/context/UserConnectionsContext";
import { Outlet } from "react-router-dom";
import AssignmentModal from "../components/AssignmentModal";
import CardReview from "../components/CardReview";
import TakeVideoQuizLive from "../components/TakeVideoQuizLive";

function HomeStudent() {
    const [levels, setLevels] = useState<LevelProps[]>([]);
    const pendingAssignments = useSelector((state: RootState) => state.pendingAssignments.assignments);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [showVocabReview, setShowVocabReview] = useState(false);

    const {liveQuizId, liveQuestionNumber, setLiveQuizId} = useUserConnections();

    const {eventEmitter, websocketRef} = useWebSocket();

    // true of live quiz is a video quiz
    const [isLiveVideoQuiz, setIsLiveVideoQuiz] = useState(false);
    const [liveQuizVideoUrl, setLiveQuizVideoUrl] = useState<string | null>(null);
    const [liveQuizVideoSegments, setLiveQuizVideoSegments] = useState<VideoSegment[]>([]);

    const { name } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);
 
 useEffect(() => {
      const handleMessage = (data: WebSocketMessageProps) => {
        //console.log("HomeStudent: handleMessage called with data:", data);
    
        if (data.message_type === "live_quiz_id") {
            console.log("HomeStudent: received live_quiz_id message from server, quiz id:", data.content);
            setLiveQuizId(data.content);
            // send acknowledgement back to server that student received the quiz id
            if (!websocketRef.current) {
                alert("WebSocket is not connected.");
                return;
            }
            // if there's no quiz id passed in from props, alert and return
            websocketRef.current.send(JSON.stringify({
                message_type: "student_acknowleged_live_quiz_id",
                message: data.content,  // should contain quiz id
                user_name: name,    // identify sender, which is teacher
            }));
        }
        else if (data.message_type === "live_quiz_terminated") {
            //console.log("HomeStudent: Received terminate_live_quiz message from server.");
             setLiveQuizId(null);
             setIsLiveVideoQuiz(false);
             //setLiveQuestionNumber(undefined);
        }
      }
      // Subscribe to the "message" event
      eventEmitter?.on("message", handleMessage);
      // Cleanup the event listener on unmount
      return () => {
        eventEmitter?.off("message", handleMessage);
      };
    }, [eventEmitter]); // Only include eventEmitter in the dependency array
   
    useEffect(() => {
        //console.log("Home component mounted, fetching levels...");
        getLevels();
    }, []);  // empty dependency array to run only once on mount

    const getLevels = () => {
        //console.log("Fetching categories...");
        api
            .get("/api/levels/")
            .then((res) => res.data)
            .then((data) => {
                setLevels(data as LevelProps[]);
                //console.log("categories", data);
            })
            .catch((err) => alert(err));
    };

    // Listen for user logging out in other tabs. If that happends, reload this tab to reflect the logout state
    // which effectively logs out this tab as well and redirects to login page

    // KPHAM: this logic works in conjunction with ProtecedRoute component
    // in which, upon component mount, the loggedin state of the use is checked before 
    // attempting to authorize access to protected routes
    const live_question_attempt_finished = () => {
       //console.log("HomeStudent: ****************** live_question_attempt_finished called, clearing liveQuestionNumber");
       // setLiveQuestionNumber(undefined);  // reset this so that the next time a new question is received, 
        // the liveQuestionNumber prop will be refreshed and TakeQuizLive) will be rendered with new question
    }
//https://www.youtube.com/watch?v=ivg_Yc-YDYo
// const wsUrl = `${import.meta.env.VITE_WS_PROTOCOL}://${import.meta.env.VITE_WS_URL}/`;
   
    useEffect(() => {
        // call api to retrieve the current live quiz
        if (liveQuizId) {
            api.get(`/api/quizzes/${liveQuizId}/`)
            .then((res) => res.data)
            .then((data) => {
                console.log("in HomeStudent: Quiz  Data:", data);
                if (data.video_url && data.video_segments) {
                    console.log("TakeQuizLive: Quiz has video segments, video url:", data.video_url);
                    setIsLiveVideoQuiz(true);
                    setLiveQuizVideoUrl(data.video_url);
                    setLiveQuizVideoSegments(data.video_segments);
                }
            })
        }   
    }, [liveQuizId]);  // empty dependency array to run only once on mount
   
    return (
        <div className="bg-amber-300 h-full w-full">       
            <div>
                {liveQuizId ?
                    <div>
                        { (isLiveVideoQuiz && liveQuizVideoUrl) ?
                            <div>{isLiveVideoQuiz.toString()}
                                <TakeVideoQuizLive 
                                    user_name={name} 
                                    live_quiz_id={liveQuizId} 
                                    video_url={liveQuizVideoUrl} 
                                    video_segments={liveQuizVideoSegments} 
                                    playKey={1} 
                                    parent_callback={live_question_attempt_finished}
                                    />
                            </div>
                        :
                        <div className="bg-amber-200 py-2 min-h-screen">
                            <TakeQuizLive
                                parent_callback={live_question_attempt_finished}
                                live_quiz_id={liveQuizId}
                                live_question_number={liveQuestionNumber?.toString()}
                            />
                        </div>
                        }
                    </div>
                    :
                    <>
                    <div className="flex flex-col bg-cyan-200 py-2 px-10">
                        <div className='col-span-9 text-lg m-1'>
                            <Navbar
                                role="student"
                                levels={levels}
                                onShowAssignments={() => setShowAssignmentModal(true)}
                            />
                        </div>
                        <div className="m-1 flex justify-center">
                            <button
                                disabled={false}
                                onClick={() => setShowVocabReview(true)}
                                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-purple-700 text-white font-medium"
                            >
                                Review My Vocabulary
                            </button>
                        </div>
                    </div>
                    {showAssignmentModal && pendingAssignments.length > 0 && (
                        <AssignmentModal
                            assignments={pendingAssignments}
                            onClose={() => setShowAssignmentModal(false)}
                        />
                    )}
                    {showVocabReview ? (
                        <CardReview
                            userName={name ?? ''}
                            onComplete={() => setShowVocabReview(false)}
                        />
                    ) : (
                        <Outlet />
                    )}
                    </>
                }
            
            </div>
           
        </div>

    );
}

export default HomeStudent;

/*
return (
       
            <div className="grid grid-cols-[2fr_1fr] bg-gray-100 mx-10 my-0 h-screen">
                <div>
   
                    <div className="flex flex-col bg-amber-200 py-2 px-10">
                        <div className='col-span-9 bg-bgColor2 text-textColor2 text-lg m-1'>
                            <Navbar role="student" levels={levels} />
                        </div>
                    </div>
                    <VidStack />

            
                    {liveQuizId &&
                        <TakeQuizLive parent_callback={live_question_attempt_finished} quiz_id={liveQuizId} question_number={liveQuestionNumber} />
                    }
                    <Outlet />
                </div>
                <div className="flex flex-col">
                    <div className="bg-blue-200">
                        <ScoreBoard  />
                        <MessageControlStudent parent_callback={handle_callback} />

                    </div>
     
                </div>
            </div>

    );
*/
