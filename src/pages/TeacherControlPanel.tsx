import { useSelector } from "react-redux";
import { useWebSocket } from "../components/context/WebSocketContext";
import { useEffect, useImperativeHandle, useState } from "react";
//import useSendNotification from "../hooks/useSendNotification";
//import api from "../api";
//import type { RootState } from "../redux/store";
import type { WebSocketMessageProps } from "../components/shared/types";
import api from "../api";
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUserConnections } from "../components/context/UserConnectionsContext";
import DisplayRecordings from "./DisplayRecordings";


export interface TeacherControlRefProps {
    terminate_live_quiz: () => void;
}

interface Props {
    live_quiz_id?: string | null; // Define the type of the liveQuizId prop
    ref: React.Ref<TeacherControlRefProps>;
}

export const TeacherControlPanel = ({ref, live_quiz_id }: Props) => {
//function TeacherControlPanel() {
     
    //const user_name = useSelector((state: { name: string }) => state.name);
    const { name } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);
    
        const [questionNumber, setQuestionNumber] = useState("");

        const [targetUserName, setTargetUserName] = useState("");

       
        const {websocketRef, eventEmitter} = useWebSocket();

        const [inputLiveQuizId, setInputLiveQuizId] = useState("");

        const [inputVideoSegmentNumber, setInputVideoSegmentNumber] = useState("");

        const [activeLiveQuizId, setActiveLiveQuizId] = useState<string | null>(null); 
        // track active live quiz id . Set after a live_quiz_id message is received from server,
        //  which indicates that the live quiz has been saved in the cache.
        const [showTerminateLiveQuizButton, setShowTerminateLiveQuizButton] = useState(false);

        const {userRows} = useUserConnections();
         

    useEffect(() => {
        if (live_quiz_id) {
            console.log("TeacherControlPanel: Received live_quiz_id from parent component:", live_quiz_id);
            setActiveLiveQuizId(live_quiz_id || null);
            setShowTerminateLiveQuizButton(true);
        }
      
    }, [live_quiz_id]);

    useEffect(() => {
          const handleMessage = (data: WebSocketMessageProps) => {
            //console.log("TeacherControl: handleMessage called with data:", data);
            if (data.message_type === "live_quiz_terminated") {
                //console.log("TeacherControl: Received live_quiz_terminated message from server, data = :", data);
                setActiveLiveQuizId(null);
                setShowTerminateLiveQuizButton(false);
            }
          }
  
          // Subscribe to the "message" event
          eventEmitter?.on("message", handleMessage);
          // Cleanup the event listener on unmount
          return () => {
            eventEmitter?.off("message", handleMessage);
          };
        }, [eventEmitter]); // Only include eventEmitter in the dependency array


    useImperativeHandle(ref, () => ({
        terminate_live_quiz: () => {
            //console.log("terminateLiveQuiz: ");
            if (!websocketRef.current) {
                alert("WebSocket is not connected.");
                return;
            }
            websocketRef.current.send(JSON.stringify({
                message_type: "terminate_live_quiz",
                message: "terminate",
                user_name: name,    // identify sender, which is teacher
            }));
        }
    }));

    const sendQuizId = () => {
        console.log("live quiz id: ");
        api.get(`/api/start_live_quiz/${inputLiveQuizId}`)
        .then(response => {
            console.log("Response from server after starting live quiz:", response.data);
            setActiveLiveQuizId(inputLiveQuizId);
            /*
            const liveQuizIdFromServer = response.data.live_quiz_id;
            if (!liveQuizIdFromServer) {
                alert("Failed to start live quiz. Please check the quiz id and try again.");
                return;
            }
                */

            setShowTerminateLiveQuizButton(true);
        }
        )
        .catch(error => {
            //console.error("Error starting live quiz:", error);
            alert("Error starting live quiz. " + error.response?.data.error);
            // clear the input field
            setInputLiveQuizId("");
            /*

            */
           
        });   
    };

    const sendVideoSegmentNumber = () => {
        if (!websocketRef.current) {
            alert("WebSocket is not connected.");
            return;
        }
        websocketRef.current.send(JSON.stringify({
            message_type: "video_segment_number",
            content: inputVideoSegmentNumber,  // query key
            user_name: name,    // identify sender, which is teacher
        }));
          toast.success('Okay!', {
                position: 'top-right',
                autoClose: 2000, // Auto close after 2 seconds
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
    };

    const sendQuestionNumber = () => {
        console.log("Sending live question number: ");
        if (activeLiveQuizId === null) {
            alert("No active live quiz. Please start a live quiz first.");
            // clear the question number input field
            setQuestionNumber("");
            return;
        }
        // if question number is empty, alert and return
        if (questionNumber === "") {
            alert("Please enter question number.");
            return;
        }
        // if target user is empty, alert and return
        if (targetUserName === "") {
            alert("Please enter target user name.");
            return;
        }
        /*
        websocketRef.current.send(JSON.stringify({
            message_type: "live_question_number",
            content: questionNumber,
            user_name: targetUserName,    // identify sender, which is teacher
        }));
        */
        api.post(`/api/send_live_question_number/${questionNumber}/`, {
            live_quiz_id: activeLiveQuizId,
            target_user_name: targetUserName,
        })      
        .then(response => {
            console.log("Response from server after sending live question number:", response.data);
            console.log("Live question number sent successfully.");
            //alert("Live question number sent successfully.");
        })
        .catch(error => {
            alert("Error sending live question number. " + error.response?.data.error);
            //console.error("Error sending live question number:", error);
            //alert("Error sending live question number. " + error.response?.data.error);
        });
        setQuestionNumber("");
    };

    const handleTerminateLiveQuiz = () => {
        websocketRef.current?.send(JSON.stringify({
            message_type: "terminate_live_quiz",
            content: inputLiveQuizId,
            user_name: name,    // identify sender, which is teacher
        }));
    }
    
    const onUserNameClick = (userName: string) => {
        console.log("User name clicked:", userName);
        setTargetUserName(userName);
    }

  return (
    <div className="m-10">
  
    <div>TeacherControlPanel
      
    </div>
    <div className="mt-2 bg-green-200">
        <div>
            Active Live Quiz Id: <span className={`text-red-700 text-md font-bold border-2 border-green-400 rounded-full px-2 py-0 inline-block`}>{activeLiveQuizId === null ? "X" : activeLiveQuizId}</span>
            { showTerminateLiveQuizButton &&
            <button className="text-white bg-red-600 ml-10 mb-2 p-2 rounded-md hover:bg-red-800" onClick={handleTerminateLiveQuiz}>Terminate Live Quiz</button>
        }
        </div>
        <span>
        <input className="bg-blue-200 text-black m-2 p-2" placeholder="quiz id..." 
        value={inputLiveQuizId || ""} 
        onChange={e => {setInputLiveQuizId(e.target.value)}} 
        readOnly={activeLiveQuizId !== null}
        />
     
              <button
                  className={`text-red bg-green-400 mb-2 p-2 rounded-md hover:bg-green-400 ${inputLiveQuizId ? "" : "opacity-50 cursor-not-allowed"
                      }`}
                  onClick={sendQuizId}
                  disabled={!inputLiveQuizId} // Disable the button if inputLiveQuizId is empty
              >
                  Send Quiz id
              </button>
              </span>

              <span>
                  <input className="bg-blue-200 text-black m-2 p-2" placeholder="video segment num (2...)"
                      value={inputVideoSegmentNumber || ""}
                      onChange={e => { setInputVideoSegmentNumber(e.target.value) }}
                      readOnly={activeLiveQuizId === null}
                  />

                  <button
                      className={`text-red bg-green-400 mb-2 p-2 rounded-md hover:bg-green-400 ${inputVideoSegmentNumber ? "" : "opacity-50 cursor-not-allowed"
                          }`}
                      onClick={sendVideoSegmentNumber}
                      disabled={!inputVideoSegmentNumber} // Disable the button if inputLiveQuizId is empty
                  >
                      Send Video Segment Number
                  </button>
              </span>
        </div>
    <div className="mt-2 bg-gray-200">
        <input className="bg-blue-200 text-black m-2 p-2 rounded-md" placeholder="question number..." value={questionNumber} onChange={(e) => setQuestionNumber(e.target.value)} />
              <button
                  className={`text-white bg-green-600 mb-2 p-1 rounded-md hover:bg-green-800 ${questionNumber ? "" : "opacity-50 cursor-not-allowed"
                      }`}
                  onClick={sendQuestionNumber}
                  disabled={!questionNumber} // Disable the button if questionNumber is empty
              >
                  Send Question Number
              </button>
        <span>
            <input className="bg-blue-200 text-black m-2 p-1 rounded-md" placeholder="target user name..."
            onChange={e => setTargetUserName(e.target.value)} value={targetUserName} 
            />
        </span>
        <div className='flex flex-row justify-end gap-2 mt-2'>
    </div>
   </div>

   <div className="bg-green-300 p-2 mb-2">
                <div><button className='bg-amber-700 text-white hover:bg-amber-900 p-1 rounded-md mb-2'
                 onClick={() => {onUserNameClick('everybody')}}>Everybody</button></div>
                {userRows && userRows.length > 0 &&
                    userRows.map((user, index) => (
                        <div className='flex flex-row justify-start mb-2 items-center bg-green-100 px-2' key={index}>
                               <div
                                className={`text-blue-800 font-bold ${user.is_logged_in === false ? "opacity-50" : "opacity-100"
                                    }`}
                            >    
                                <button className='bg-green-700 text-white hover:bg-green-900 p-1 rounded-md'
                                    onClick={() => { onUserNameClick(user.name)} }
                                >{user.name}
                                </button>
                            </div>
                        </div>
                    ))
                }
                <DisplayRecordings />
            </div>

      <ToastContainer />
    </div>
  )
}

export default TeacherControlPanel


