import { useSelector } from "react-redux";
import { useWebSocket } from "../components/context/WebSocketContext";
import { useEffect, useImperativeHandle, useState } from "react";
//import useSendNotification from "../hooks/useSendNotification";
//import api from "../api";
//import type { RootState } from "../redux/store";
import type { ReceivedConnectedUserDataProps, WebSocketMessageProps } from "../components/shared/types";
import api from "../api";
import RedisDataModal from "../components/RedisDataModal";
import { type RedisDataProps } from "../components/RedisDataModal";
import ManageConnections from "./ManageConnections";


export interface TeacherControlRefProps {
    terminate_live_quiz: () => void;
}

interface Props {
    ref: React.Ref<TeacherControlRefProps>;
}

export const TeacherControlPanel = ({ref }: Props) => {
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

        const [testReceiver, setTestReceiver] = useState("all");

        const [showRedisDataModal, setShowRedisDataModal] = useState(false);

        const [redisData, setRedisData] = useState<RedisDataProps>();

    useEffect(() => {
          const handleMessage = (data: WebSocketMessageProps) => {
            //console.log("TeacherControl: handleMessage called with data:", data);
            if (data.message_type === "welcome_message") {
                      console.log("TeacherControlPanel: Received welcome_message from server for user:", data.user_name);
                      //console.log("TeacherControlPanel: welcome_message pending data:", data.pending_data);
               }
            else if (data.message_type === "live_quiz_terminated") {
                //console.log("TeacherControl: Received live_quiz_terminated message from server, data = :", data);
                setActiveLiveQuizId(null);
                setShowTerminateLiveQuizButton(false);
            }
            if (data.message_type === "REDIS_DATA") {
                console.log("TeacherControl: Received REDIS DATA RESPONSE from server, data = :",data) ;
                /*
{
    "message_type": "REDIS_DATA",
    "content": {
        "users": [
            {
                "name": "teacher",
                "live_question_number": 0,
                "live_total_score": 999,
                "is_logged_in": "true"
            }
        ],
        "live_quiz_id": null,
        "live_question_number": null
    }
}
            */

                /*
                console.log("REDIS_DATA content:", data.content);
                console.log("REDIS_DATA users:", data.content.users);
                console.log("REDIS_DATA live_quiz:", data.content.live_quiz_id);
                console.log("REDIS_DATA live_question_number", data.content.live_question_number);
                */
               // the field is_logged_in is string "true" or "false", convert it to boolean true or false
                data.content.users = data.content.users.map((user: ReceivedConnectedUserDataProps) => {
                    return {
                        ...user,
                        is_logged_in: user.is_logged_in === "true" ? true : false,
                    }
                });
                setRedisData(data.content);
                setShowRedisDataModal(true);
               // const parsedData = JSON.parse(data.content);
                
                //console.log("Parsed REDIS_DATA from server:", parsedData);
                //alert("Received TEST_RESPONSE from server: " + JSON.stringify(data));
            }
            if (data.message_type === "another_user_joined") {
                //console.log("TeacherControl: Received connection_established message from server for user:", data);
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


     const sendTest = () => {
        //console.log("sendCacheQuery: ");
        if (!websocketRef.current) {
            alert("WebSocket is not connected.");
            return;
        }
        //console.log("Key for cache query:", keyForCacheQuery);
        websocketRef.current.send(JSON.stringify({
            message_type: "TEST",
            message: "TEST only",  // query key
            user_name: testReceiver,    // identify sender, which is teacher
        }));
        
    };

    const clearRedisStore = () => {
        //console.log("sendCacheQuery: ");
        if (!websocketRef.current) {
            alert("WebSocket is not connected.");
            return;
        }
        //console.log("Key for cache query:", keyForCacheQuery);
        websocketRef.current.send(JSON.stringify({
            message_type: "CLEAR_REDIS_STORE",
            message: "TEST only",  // query key
            user_name: testReceiver,    // identify sender, which is teacher
        }));
        
    };

    const handleTerminateLiveQuiz = () => {
        websocketRef.current?.send(JSON.stringify({
            message_type: "terminate_live_quiz",
            content: inputLiveQuizId,
            user_name: name,    // identify sender, which is teacher
        }));
    }
    
    const closeRedisDataModal = () => {
        setShowRedisDataModal(false);
    }

    const onUserNameClick = (userName: string) => {
        setTargetUserName(userName);
    }

    //   { inputLiveQuizId !== "" &&
//  <input className="bg-blue-200 text-black m-2 p-2" placeholder="quiz id..." value={quizId} onChange={(e) => setQuizId(e.target.value)} />
  return (
    <div className="m-10">
  
    <div>TeacherControlPanel
      
    </div>
    <div className="mt-2 bg-gray-200">
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
        <ManageConnections parentCallback={onUserNameClick} />
        <div className='flex flex-row justify-end gap-2 mt-2'>
       
    </div>
        
   
   </div>
   <div className="mt-2 bg-amber-200 p-2"> 
            <div className="flex flex-row justify-start mt-4">
                <input className="bg-blue-200 text-black m-2 p-1 rounded-md" placeholder="all" value={testReceiver} onChange={(e) => setTestReceiver(e.target.value)} />
            </div>
            <div className="bg-green-300 p-2 flex flex-row justify-start m-3 hover:bg-green-500" onClick={sendTest}>GET REDIS USERS DATA</div>
            <div className="bg-green-300 p-2 flex flex-row justify-start m-3 hover:bg-red-400" onClick={clearRedisStore}>CLEAR REDIS STORE</div>

            { showRedisDataModal && 
                <RedisDataModal content={redisData as RedisDataProps} parentCallback={closeRedisDataModal}
                /> 
            }
   </div>
      
    </div>
  )
}

export default TeacherControlPanel
