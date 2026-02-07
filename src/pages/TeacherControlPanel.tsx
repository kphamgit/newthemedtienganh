import { useSelector } from "react-redux";
import { useWebSocket } from "../components/context/WebSocketContext";
import { useEffect, useImperativeHandle, useState } from "react";
import api from "../api";
import type { RootState } from "../redux/store";
import type { WebSocketMessageProps } from "../components/shared/types";



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

        const [connectedUsers, setConnectedUsers] =  useState<string[]>([]);
        const {websocketRef, eventEmitter} = useWebSocket();

        //const liveQuizId = useSelector((state: RootState) => state.liveQuizId.value);
        const [liveQuizId, setLiveQuizId] = useState("");

        const [cacheQueryResult, setCacheQueryResult] = useState<string>("");

    useEffect(() => {
          const handleMessage = (data: WebSocketMessageProps) => {
            console.log("TeacherControl: handleMessage called with data:", data);
            if (data.message_type === "connection_established") {
              console.log("TeacherControl: Received connection_established message from server for user:", data.user_name);
              const others = data.other_connected_users || [];
              const all_connected = [data.user_name, ...others];
              setConnectedUsers(all_connected);
            }
            else if (data.message_type === "connection_dropped") {
                console.log("TeacherControl: Received connection_dropped message from server for user:", data.user_name);
                const dropped_user = data.user_name;
                setConnectedUsers((prevUsers) => prevUsers.filter((user) => user !== dropped_user));
            }
            else if (data.message_type === "cache_query_response") {
                console.log("TeacherControl: Received cache_query_responsefrom server for user, data = :", data);
                console.log(`Cache Query Response for key "${data.message_type}": ${data.message}`);
                if (name !== "teacher") {
                    return;
                  }
                console.log("Queried value:", data.queried_value);
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
       //console.log("Sendingggg Quiz id: ");
        if (!websocketRef.current) {
            alert("WebSocket is not connected.");
            return;
        }
        // verify from server that there's a quiz with that id?
        // english/quizzes/retrieve/<int:pk>/
        const url = `/english/quizzes/retrieve/${liveQuizId}/`;
        console.log("Verifying quiz id from server with url:", url);
        
        api.get(url)
            .then((response) => {
                if (response) {
                    websocketRef.current?.send(JSON.stringify({
                        message_type: "quiz_id",
                        message: liveQuizId,
                        user_name: name,   // identify sender
                    }));
                    

                    // clear input field
                    // disable input field after sending quiz id
                    // clear input field
                    setLiveQuizId("");
                    //setQuizId("");
                } else {
                    //console.log("Quiz id NOT found on server.");
                    alert("Quiz id NOT found on server.");
                    return;
                }
            })
        .catch((error) => {
            console.error("Error verifying quiz id from server:", error);
            alert("Error verifying quiz id from server.");
            return;
        });
        
    };

    const sendQuestionNumber = () => {
       //console.log("sendQuestionNumber: ");
        if (!websocketRef.current) {
            alert("WebSocket is not connected.");
            return;
        }
        // if there's no quiz id passed in from props, alert and return
      
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
        websocketRef.current.send(JSON.stringify({
            message_type: "question_number",
            message: questionNumber,
            user_name: targetUserName,    // identify sender, which is teacher
        }));
        // clear input field
        setQuestionNumber("");
    };

    const sendCacheQuery = () => {
         console.log("sendCacheQuery: ");
         if (!websocketRef.current) {
             alert("WebSocket is not connected.");
             return;
         }

         websocketRef.current.send(JSON.stringify({
             message_type: "cache_query",
             message: keyForCacheQuery,  // query key
             user_name: name,    // identify sender, which is teacher
         }));
         
     };

    const handleNameClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const selectedName = e.currentTarget.innerText;
        setTargetUserName(selectedName);
    }

    const handleNameClickForCacheQuery = (e: React.MouseEvent<HTMLButtonElement>) => {
        const selectedName = e.currentTarget.innerText;
        console.log(keyForCacheQuery);  //should be "_live_question_number"
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
    
//  <input className="bg-blue-200 text-black m-2 p-2" placeholder="quiz id..." value={quizId} onChange={(e) => setQuizId(e.target.value)} />
  return (
    <div className="m-10">
  
    <div>TeacherControlPanel
      
    </div>
    <div className="mt-2 bg-gray-200">
        <input className="bg-blue-200 text-black m-2 p-2" placeholder="quiz id..." 
        value={liveQuizId || ""} 
        onChange={e => {setLiveQuizId(e.target.value)}} 
        />
        { liveQuizId !== "" &&
        <button className="text-red bg-green-300 mb-2 p-2 rounded-md hover:bg-green-400" onClick={sendQuizId}>Send Quiz id</button>
        }
        </div>
    <div className="mt-2 bg-gray-200">
        <input className="bg-blue-200 text-black m-2 p-2 rounded-md" placeholder="question number..." value={questionNumber} onChange={(e) => setQuestionNumber(e.target.value)} />
        <button className="text-white bg-green-600 mb-2 p-1 rounded-md hover:bg-green-400" onClick={sendQuestionNumber}>Send Question Number</button>
   
        <span>
            <input className="bg-blue-200 text-black m-2 p-1 rounded-md" placeholder="target user name..."
            onChange={e => setTargetUserName(e.target.value)} value={targetUserName} 
            />
        </span>

        <div className='flex flex-row justify-end gap-2 mt-2'>
        {connectedUsers &&
            connectedUsers.map((user, index) => (
                <div key={index} >
                <button className='bg-bgColor2 text-textColor1 p-1 rounded-md' onClick={handleNameClick}>{user}</button>
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
                        <option value="quiz_id">quiz_id</option>
                        <option value="live_question_number">live_question_number</option>
                        <option value="students_room_users">students in room</option>
                    </select>
                   
            </div>
           
            { showStudentSelectForCacheQuery &&
            <>
            <span>Select user name:</span>
              <div className="flex flex-row justify-start ml-10 text text-gray-600">
                  {connectedUsers &&
                      connectedUsers.map((name, index) => (
                          <div key={index} >
                              <button className='bg-green-500 text-white p-1 m-1 rounded-md' onClick={handleNameClickForCacheQuery}>{name}</button>
                          </div>
                      ))
                  }
              </div>          
              </>   
            }
            { cacheQueryResult &&
                    <div className="mt-4">{cacheQueryResult}</div>
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
