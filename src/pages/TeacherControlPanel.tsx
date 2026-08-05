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
import ListUsers from "./ListUsers";

import { type QuizProps } from "../components/shared/types";



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

        // const [inputVideoSegmentNumber, setInputVideoSegmentNumber] = useState("");

        const [activeLiveQuizId, setActiveLiveQuizId] = useState<string | null>(null); 
        // track active live quiz id . Set after a live_quiz_id message is received from server,
        //  which indicates that the live quiz has been saved in the cache.
        const [showTerminateLiveQuizButton, setShowTerminateLiveQuizButton] = useState(false);

        const {userRows} = useUserConnections();

        const [liveQuiz, setLiveQuiz] = useState<QuizProps | null>(null);

        // this is used to store question numbers for all video segments of an active video quiz.
        const [allQuestionNumbers, setAllQuestionNumbers] = useState<string[]>([]); // store all question numbers for the active live quiz
         
        const [inputVideoSegmentNumber, setInputVideoSegmentNumber] = useState("");

        // A pasted image waiting to be sent to students, plus a local preview url and an in-flight flag.
        const [pastedImage, setPastedImage] = useState<File | null>(null);
        const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
        const [sendingImage, setSendingImage] = useState(false);

        // A YouTube link to push to students (they display it with a manual Play button).
        const [inputVideoLink, setInputVideoLink] = useState("");

    useEffect(() => {
        if (live_quiz_id) {
            // console.log("TeacherControlPanel: Received live_quiz_id from parent component:", live_quiz_id);
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

    useEffect(() => {
        // this useEffect only applies for video quiz
        if (liveQuiz) {
            const question_numbers: string[] = []
            let question_number = 1;
            //console.log("TeacherControlPanel: liveQuiz state updated:", liveQuiz);
            if (liveQuiz.video_segments.length > 0) {
                liveQuiz.video_segments.forEach(segment => {
                    console.log(`Segment ${segment.segment_number}: ${segment.start_time} - ${segment.end_time}, Questions: ${segment.question_ids}`);
                    segment.question_ids.split(",").forEach(() => {
                        question_numbers.push(question_number.toString());
                        question_number++;
                    });
                });
            }
            question_numbers.map(qn => console.log("Question number:", qn));
            setAllQuestionNumbers(question_numbers);
        }
    }, [liveQuiz]);

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
            // console.log("Response from server after starting live quiz:", response.data);
            setLiveQuiz(response.data.quiz as QuizProps);
            /*
{
    "id": 2,
    "name": "Video Quiz",
    "quiz_number": 3,
    "video_url": "https://www.youtube.com/watch?v=_hH1pzeIawc",
    "video_segments": [
        {
            "id": 1,
            "quiz_id": 2,
            "segment_number": 1,
            "start_time": "0:00:000",
            "end_time": "0:10:500",
            "question_ids": "2, 3, 136"
        },
        {
            "id": 2,
            "quiz_id": 2,
            "segment_number": 2,
            "start_time": "0:10:500",
            "end_time": "0:17:500",
            "question_ids": "137, 138"
        }
    ]
}
            */

            if (!response.data.quiz.id) {
                alert("Failed to start live quiz. Please check the quiz id and try again.");
                return;
            }
            setActiveLiveQuizId(response.data.quiz.id.toString());
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


    // Teacher pastes an image (Ctrl/Cmd+V) into the paste box: grab it from the clipboard,
    // keep the File for upload and show a local preview thumbnail.
    const handleImagePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (const item of items) {
            if (item.type.startsWith("image")) {
                const file = item.getAsFile();
                if (!file) continue;
                e.preventDefault();
                setPastedImage(file);
                // Replace any previous preview url and free its memory.
                setImagePreviewUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return URL.createObjectURL(file);
                });
                return;
            }
        }
    };

    const clearPastedImage = () => {
        setImagePreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
        });
        setPastedImage(null);
    };

    // Upload the pasted image to S3 (fixed per-teacher key) and broadcast its url to students.
    // Blocked while a live quiz is active so the image doesn't clobber the quiz view.
    const sendImageToStudents = async () => {
        if (!pastedImage) return;
        if (activeLiveQuizId !== null) {
            alert("Cannot send an image while a live quiz is in progress.");
            return;
        }
        if (!websocketRef.current) {
            alert("WebSocket is not connected.");
            return;
        }
        setSendingImage(true);
        try {
            const formData = new FormData();
            formData.append("image", pastedImage);
            formData.append("user_name", name);
            const res = await api.post("/api/upload-image/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const imageUrl = res.data.image_url as string;
            websocketRef.current.send(JSON.stringify({
                message_type: "live_image",
                content: imageUrl,      // students display this presigned S3 url
                user_name: name,        // identify sender, which is teacher
            }));
            toast.success("Image sent!", {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: true,
            });
            clearPastedImage();
        } catch (error) {
            console.error("Error sending image:", error);
            alert("Failed to send image.");
        } finally {
            setSendingImage(false);
        }
    };

    // Broadcast a YouTube link to students. Blocked during a live quiz (same as images),
    // since students display it in their non-live-quiz view.
    const sendVideoLink = () => {
        const url = inputVideoLink.trim();
        if (!url) return;
        if (activeLiveQuizId !== null) {
            alert("Cannot send a video while a live quiz is in progress.");
            return;
        }
        if (!websocketRef.current) {
            alert("WebSocket is not connected.");
            return;
        }
        websocketRef.current.send(JSON.stringify({
            message_type: "live_video",
            content: url,           // students extract the video id from this url
            user_name: name,        // identify sender, which is teacher
        }));
        toast.success("Video sent!", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
        });
        setInputVideoLink("");
    };

    // Free the preview object url when the panel unmounts.
    useEffect(() => {
        return () => {
            if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
        };
    }, [imagePreviewUrl]);

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

    return (
        <div className="m-10">

            <div>TeacherControlPanel

            </div>
            <div className="mt-2 bg-green-200">
                <div>
                    Active Live Quiz Id: <span className={`text-red-700 text-md font-bold border-2 border-green-400 rounded-full px-2 py-0 inline-block`}>{activeLiveQuizId === null ? "X" : activeLiveQuizId}</span>
                    {showTerminateLiveQuizButton &&
                        <button className="text-white bg-red-600 ml-10 mb-2 p-2 rounded-md hover:bg-red-800" onClick={handleTerminateLiveQuiz}>Terminate Live Quiz</button>
                    }
                </div>
                <span>
                    <input className="bg-blue-200 text-black m-2 p-2" placeholder="quiz id..."
                        value={inputLiveQuizId || ""}
                        onChange={e => { setInputLiveQuizId(e.target.value) }}
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


            </div>
            <div className="mt-10 bg-gray-200">
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


            <div>
                    <input className="bg-blue-200 text-black m-2 p-2" placeholder="video segment num (2...)"
                        value={inputVideoSegmentNumber || ""}
                        onChange={e => { setInputVideoSegmentNumber(e.target.value) }}
                        
                    />

                    <button
                        className={`text-red bg-green-400 mb-2 p-2 rounded-md hover:bg-green-400 ${inputVideoSegmentNumber ? "" : "opacity-50 cursor-not-allowed"
                            }`}
                        onClick={sendVideoSegmentNumber}
                        disabled={!inputVideoSegmentNumber} // Disable the button if inputLiveQuizId is empty
                    >
                        Send Video Segment Number
                    </button>
            </div>
            

            

            { allQuestionNumbers.length > 0 && (
                <div className="mt-10 bg-gray-200 p-2 rounded-md">
                    <h3 className="text-lg font-bold mb-2">All Question Numbers for Active Live Quiz</h3>
                    <ul className="list-disc list-inside">
                        {allQuestionNumbers.map((qn, index) => (
                            <li key={index}>
                                Question {qn}
                            </li>
                        ))}
                    </ul>
                </div>
            )
            }

            {/* Send a YouTube link to all students; they display it with a manual Play button. */}
            <div className="mt-10 bg-gray-200 p-3 rounded-md">
                <h3 className="text-lg font-bold mb-2">Send YouTube Video to Students</h3>
                <input
                    className="bg-blue-200 text-black m-2 p-2 rounded-md w-96"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={inputVideoLink}
                    onChange={(e) => setInputVideoLink(e.target.value)}
                />
                <button
                    className={`text-white bg-blue-600 mb-2 p-2 rounded-md hover:bg-blue-800 ${
                        inputVideoLink.trim() && activeLiveQuizId === null ? "" : "opacity-50 cursor-not-allowed"
                    }`}
                    onClick={sendVideoLink}
                    disabled={!inputVideoLink.trim() || activeLiveQuizId !== null}
                >
                    Send Video
                </button>
                {activeLiveQuizId !== null && (
                    <span className="text-sm text-red-700 ml-2">
                        Cannot send a video while a live quiz is in progress.
                    </span>
                )}
            </div>

            {/* Paste an image (from Google, etc.) and send it to all students over the WebSocket. */}
            <div className="mt-10 bg-gray-200 p-3 rounded-md">
                <h3 className="text-lg font-bold mb-2">Send Image to Students</h3>
                <div
                    onPaste={handleImagePaste}
                    tabIndex={0}
                    className="border-2 border-dashed border-gray-400 rounded-md p-4 text-center text-gray-600 bg-white cursor-text focus:outline-none focus:border-blue-500"
                >
                    Click here, then paste an image (Ctrl/Cmd+V)
                </div>

                {imagePreviewUrl && (
                    <div className="mt-3 flex flex-col items-start gap-2">
                        <img
                            src={imagePreviewUrl}
                            alt="Preview of image to send"
                            className="max-h-48 rounded border border-gray-400"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={sendImageToStudents}
                                disabled={sendingImage || activeLiveQuizId !== null}
                                className={`text-white bg-blue-600 p-2 rounded-md hover:bg-blue-800 ${
                                    sendingImage || activeLiveQuizId !== null ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                                {sendingImage ? "Sending..." : "Send Image to Students"}
                            </button>
                            <button
                                onClick={clearPastedImage}
                                disabled={sendingImage}
                                className="text-gray-700 bg-gray-300 p-2 rounded-md hover:bg-gray-400"
                            >
                                Clear
                            </button>
                        </div>
                        {activeLiveQuizId !== null && (
                            <span className="text-sm text-red-700">
                                Cannot send an image while a live quiz is in progress.
                            </span>
                        )}
                    </div>
                )}
            </div>

            <ListUsers userRows={userRows} onUserNameClick={onUserNameClick} />

            <ToastContainer />
        </div>
    )
}

export default TeacherControlPanel


