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
    
    const [keyForCacheQuery, setKeyForCacheQuery] = useState("quiz_id");

        const [questionNumber, setQuestionNumber] = useState("");

        const [targetUserName, setTargetUserName] = useState("");

        //const connectedUsersInReduxStore = useSelector((state: RootState) => state.connectedUsers.list); 
        
        const [showStudentSelectForCacheQuery, setShowStudentSelectForCacheQuery] = useState(false);

        const [connectedUsers, setConnectedUsers] =  useState<ReceivedConnectedUserDataProps[]>([]);
        const {websocketRef, eventEmitter} = useWebSocket();

        const [inputLiveQuizId, setInputLiveQuizId] = useState("");

        const [activeLiveQuizId, setActiveLiveQuizId] = useState<string | null>(null); 
        // track active live quiz id . Set after a live_quiz_id message is received from server,
        //  which indicates that the live quiz has been saved in the cache.

        const [cacheQueryResult, setCacheQueryResult] = useState<string>("");

        const [showTerminateLiveQuizButton, setShowTerminateLiveQuizButton] = useState(false);

        //const { sendNotification, isSending, error } = useSendNotification();
        //const { sendNotification,  } = useSendNotification();

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
            else if (data.message_type === "another_user_joined") {
              //console.log("TeacherControl: Received connection_established message from server for user:", data.user_name);
              const others = data.other_connected_users || [];
              const all_connected = [...others, { user_name: data.user_name, live_question_number: null }]; // combine the user who just joined and the other already connected users 
              setConnectedUsers(all_connected as ReceivedConnectedUserDataProps[]);
            }
            else if (data.message_type === "user_disconnected") {
                //console.log("TeacherControl: Received connection_dropped message from server for user:", data.user_name);
                const dropped_user = data.user_name;
                setConnectedUsers((prevUsers) => prevUsers.filter((user) => user.name !== dropped_user));
            }
            else if (data.message_type === "cache_query_response") {
                //console.log("TeacherControl: Received cache_query_responsefrom server for user, data = :", data);
                //console.log(`Cache Query Response for key "${data.message_type}": ${data.message}`);
                if (name !== "teacher") {
                    return;
                  }
                //console.log("Queried value:", data.queried_value);
                setCacheQueryResult(JSON.stringify(data.queried_value));
                  //alert("Cache query response from server: " + data.message_type + " " +  data.message + " = " + data.queried_value);
/*
{
    "message_type": "cache_query_response",
    "message": "students_room_users",
    "queried_value": [
        "teacher"
    ]
}
*/
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
            
            /*

            */
           
        });   
    };

    const sendQuestionNumber = () => {
        console.log("Sending live question number: ");
        if (activeLiveQuizId === null) {
            alert("No active live quiz. Please start a live quiz first.");
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

    const sendCacheQuery = () => {
         //console.log("sendCacheQuery: ");
         if (!websocketRef.current) {
             alert("WebSocket is not connected.");
             return;
         }
         //console.log("Key for cache query:", keyForCacheQuery);
         websocketRef.current.send(JSON.stringify({
             message_type: "cache_query",
             message: keyForCacheQuery,  // query key
             user_name: name,    // identify sender, which is teacher
         }));
         
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

    const handleNameClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const selectedName = e.currentTarget.innerText;
        setTargetUserName(selectedName);
    }

    const handleNameClickForCacheQuery = (e: React.MouseEvent<HTMLButtonElement>) => {
        const selectedName = e.currentTarget.innerText;
        //console.log(keyForCacheQuery);  //should be "_live_question_number"
        //setTargetUserNameForCacheQuery(selectedName);
        setKeyForCacheQuery(selectedName + "_live_question_number");
    }

    const handleSelectCacheQuery = (value: string) => {
        // if selected value is "live_question_number", show panel for select student for cache query  
        if (value === "live_question_number") {
            setKeyForCacheQuery("_live_question_number");
            setShowStudentSelectForCacheQuery(true);
        } else {
            setShowStudentSelectForCacheQuery(false);
            setKeyForCacheQuery(value);
        }
    }

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
        <input className="bg-blue-200 text-black m-2 p-2" placeholder="quiz id..." 
        value={inputLiveQuizId || ""} 
        onChange={e => {setInputLiveQuizId(e.target.value)}} 
        readOnly={activeLiveQuizId !== null}
        />
        { inputLiveQuizId !== "" &&
        <button className="text-red bg-green-300 mb-2 p-2 rounded-md hover:bg-green-400" onClick={sendQuizId}>Send Quiz id</button>
        }
    
        </div>
    <div className="mt-2 bg-gray-200">
        <input className="bg-blue-200 text-black m-2 p-2 rounded-md" placeholder="question number..." value={questionNumber} onChange={(e) => setQuestionNumber(e.target.value)} />
        <button className="text-white bg-green-600 mb-2 p-1 rounded-md hover:bg-green-800" onClick={sendQuestionNumber}>Send Question Number</button>
   
        <span>
            <input className="bg-blue-200 text-black m-2 p-1 rounded-md" placeholder="target user name..."
            onChange={e => setTargetUserName(e.target.value)} value={targetUserName} 
            />
        </span>

        <div className='flex flex-row justify-end gap-2 mt-2'>
        {connectedUsers &&
            connectedUsers.map((user, index) => (
                <div key={index} >
                <button className='bg-bgColor2 text-textColor1 p-1 rounded-md' onClick={handleNameClick}>{user.name}</button>
                </div>
            ))
        }
        <button className='bg-blue-600 text-white p-1 rounded-md' onClick={handleNameClick}>everybody</button>
    </div>
        
   
   </div>
   <div className="mt-2 bg-amber-200 p-2">
   <div>Key for cache query: {keyForCacheQuery}</div>
            <button className="text-white bg-blue-600 mb-2 p-1 rounded-md hover:bg-blue-400" onClick={sendCacheQuery}>Query Cache</button>
            <div className="ml-10">
                    <select className="bg-gray-300 text-black p-2 rounded-md" onChange={(e) => {handleSelectCacheQuery(e.target.value) }}>
                        <option value="live_quiz_id">live_quiz_id</option>
                        <option value="live_question_number">live_question_number</option>
                        <option value="students_room_users">students in room</option>
                    </select>
                   
            </div>
           
            { showStudentSelectForCacheQuery &&
            <>
            <span>Select user name:</span>
              <div className="flex flex-row justify-start ml-10 text text-gray-600">
                  {connectedUsers &&
                      connectedUsers.map((user, index) => (
                          <div key={index} >
                              <button className='bg-green-500 text-white p-1 m-1 rounded-md' onClick={handleNameClickForCacheQuery}>{user.name}</button>
                          </div>
                      ))
                  }
              </div>          
              </>   
            }
            { cacheQueryResult &&
                    <div className="mt-4">{cacheQueryResult}</div>
            }
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

/*
  <span>
            
            liveQuiz : {liveQuizIsOn ? "ON" : "OFF"}
            
   
        { liveQuizIsOn  &&
     <button className="text-white bg-red-600 ml-10 mb-2 p-2 rounded-md hover:bg-red-400" onClick={terminateLiveQuiz}>Terminate Live Quiz</button>
        }
        </span>
*/

/*
return (
    <>
    {
    <div className="bg-green-300 p-2 mb-2">
        <div>Connected Users:</div>
        { connectedUsers && connectedUsers.length > 0 &&
        <ul>
            {connectedUsers.map((user, index) => (
                <li key={index}>{user.name}
                     <span className="ml-2 text-sm text-gray-600">
                        { user.name !== "teacher" &&
                        <button className="bg-red-800 text-white px-2 py-1 rounded hover:bg-amber-600 m-1" onClick={() => sendDisconnect(user.name)}>Disconnect</button>
                        }
                        </span>
                </li>
            ))}
        </ul>
}
    </div>
    }
    <div>TeacherControlPanel</div>
    <div className="mt-2 bg-amber-700">
        <input className="bg-blue-200 text-black m-2" placeholder="quiz id..." value={quizId} onChange={(e) => setQuizId(e.target.value)} />
        <button className="text-red bg-green-300 mb-2 hover:bg-green-400" onClick={sendQuizId}>Send Quiz id</button>
    </div>
    <div className="mt-2 bg-amber-700">
        <input className="bg-blue-200 text-black m-2" placeholder="question id..." value={questionNumber} onChange={(e) => setQuestionNumber(e.target.value)} />
        <button className="text-red bg-green-300 mb-2 hover:bg-green-400" onClick={sendQuestionNumber}>Send Question Number</button>
    </div>
    </>
  )
*/
