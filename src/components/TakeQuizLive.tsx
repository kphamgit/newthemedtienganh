

import { useEffect, useRef, useState } from 'react';
//import {  useParams } from 'react-router-dom';
import { useWebSocket } from './context/WebSocketContext';
import type { ProcessQuestionAttemptResultsProps, QuestionAttemptAssesmentResultsProps, QuestionProps, WebSocketMessageProps } from './shared/types';
import api from '../api';
import { DynamicWordInputs } from './questions/DynamicWordInputs';
import { ButtonSelect } from './questions/ButtonSelect';
import { RadioQuestion } from './questions/RadioQuestion';
import { CheckboxQuestion } from './questions/CheckboxQuestion';
import DragDrop from './questions/dragdrop/DragDrop';
//import WordsSelect from './explanations/WordsSelect';
import { DropDowns } from './questions/DropDowns';
import SentenceScramble from './questions/SentenceScramble';
import DOMPurify from 'dompurify';
import type { ChildRef } from './TakeQuiz';
import CorrectModal from './CorrectModal';
import ModalForIncorrect from './ModalForIncorrect';
import { updateLiveScore } from '../redux/connectedUsersSlice';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../redux/store';
import { WordsSelect } from './questions/WordsSelect';

interface TakeQuizLiveProps {
    live_quiz_id: string;
    live_question_number?: string;
    //live_total_score?: string;
    parent_callback: () => void;   // to notify parent component when a question is finished ( or the quiz is finished??)
}

function TakeQuizLive({ live_question_number,  live_quiz_id: quiz_id , parent_callback}: TakeQuizLiveProps) {
    // scenarios:
    /*
     1) if live quiz id is set, then it can be either the student receives a enable live quiz message for the teacher
     or the student is logged in while a live quiz is already in progress and there has been no questions to do yet. 
     In this case, the student should receive the current live quiz id from the server upon logging in.

    2) if both live quiz id and live question number are set, then that means the student is logged while a live quiz is in progress
    with a question being unfinished This can happens if user's connection is dropped while doing a live question.
    In this scenario, the student should receive both live quiz id and live question number from the server upon login.
    (see backend logic for handling connection_established message in consumers.py)
    */

    const [question, setQuestion] = useState<QuestionProps | null>(null);

    const [liveQuestionNumber, setLiveQuestionNumber] = useState<string | null>(null);

    const childRef = useRef<ChildRef>(null);
    const {eventEmitter, websocketRef} = useWebSocket();
    const [showQuestion, setShowQuestion] = useState<boolean>(false); // work in conjunction with questionAttemptData 


    const [showCorrectModal, setShowCorrectModal] = useState(false);
    const [showIncorrectModal, setShowIncorrectModal] = useState(false);

    //const [finishedLiveQuestion, setFinishedLiveQuestion] = useState<boolean | null>(null);
    const [finishedLiveQuestion, setFinishedLiveQuestion] = useState<{status: boolean, question_number: string}>({ status: false, question_number: '' });

    let correctModalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { name } = useSelector((state: RootState) => state.user);

     const [questionAttemptAssessmentResults, setQuestionAttemptAssessmentResults] = 
            useState<QuestionAttemptAssesmentResultsProps | null>(null);

    const dispatch = useDispatch<AppDispatch>();
        
    useEffect(() => {
      const handleMessage = (data: WebSocketMessageProps) => {
        //console.log("TakeQuizLive: handleMessage called with data:", data);
        //if (data.message_type === "chat") {
       //console.log("*********** TakeQuizLive: Received data from server:", data); 
        if (data.message_type === "question_number") {
            //console.log("TakeQuizLive: Setting live question_number to:", data.message);
            setLiveQuestionNumber(data.content);
        } 
      }
      // Subscribe to the "message" event
      eventEmitter?.on("message", handleMessage);
      // Cleanup the event listener on unmount
      return () => {
        eventEmitter?.off("message", handleMessage);
      };
    }, [eventEmitter]); // Only include eventEmitter in the dependency array

    //  useEffect(() => {
        // clear users Total Live Score in redux store when component mounts
      //  dispatch(updateLiveScore({name: name || '', live_score: 0}));
     // }, []);

      useEffect(() => {
       
         // call api to get quiz question data for quizId and questionId
         // only if both quizId and questionNumber are set
            if (!quiz_id ) {
               //console.log("TakeQuizLive: quiz_id is not set.");
                return;
            }
            if (quiz_id === "" || liveQuestionNumber === "") {
                return;
            }
            // if there's a current question being shown, do not fetch new question
            if (finishedLiveQuestion.question_number === liveQuestionNumber && finishedLiveQuestion.status === false) {
               //console.log("TakeQuizLive: Ignoring new question fetch because user is still working on current question.");
                return;
            }
            // if question_number is not set, do not fetch question
            if (!liveQuestionNumber ) {
               //console.log("TakeQuizLive: question_number is not set.");
                return;
            }

         api.get(`/api/quizzes/${quiz_id}/questions/${liveQuestionNumber}/`)
            .then((res) => res.data)
            .then((data) => {
               //console.log("TakeQuizLive: Quiz Question Data:", data);
                // you can set state here to store question data
                setQuestion(data);
                setShowQuestion(true);
                setFinishedLiveQuestion({status: false, question_number: liveQuestionNumber}); // user is now working on this question
                // send event to server to indicate question has been received and 
                // I am working on it
                if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
                    const messageToSend = {
                        message_type: 'student_acknowleged_live_question_number',
                        message: `${liveQuestionNumber}`,
                        user_name: name // sender
                      };
                     //console.log("TakeQuizLive: &&&&&&&&& Sending live_question_attempt_started message to server for question number:", question_number);
                      websocketRef.current.send(JSON.stringify(messageToSend));
                }

            })
            .catch((err) => console.log("TakeQuizLive: Error fetching quiz question data:", err));

      }, [quiz_id, liveQuestionNumber]);
    

      useEffect(() => {
             if (!live_question_number ) {
                console.log("TakeQuizLive: question_number from Props is not set.");
                return;
              }
              /*
              only get here if live_question_number (from props) has a value, which means that quiz_id also has value.
              this scenario happens when student logs in while a live quiz is in progress and there's a pending question to do.
              */

              /*
              also, when a user finishes a question and notifies the server, it will reset the live_question_number value for
              this user to NULL,
              */

          api.get(`/api/quizzes/${quiz_id}/questions/${live_question_number}/`)
             .then((res) => res.data)
             .then((data) => {
                //console.log("TakeQuizLive: Quiz Question Data:", data);
                 // you can set state here to store question data
                 setQuestion(data);
                 setShowQuestion(true);
                 setFinishedLiveQuestion({status: false, question_number: live_question_number || ''}); // user is now working on this question
                 // send event to server to indicate question has been received and 
                 // I am working on it
                 if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
                     const messageToSend = {
                         message_type: 'student_acknowleged_live_question_number',
                         message: `${live_question_number}`,
                         user_name: name // sender
                       };
                      //console.log("TakeQuizLive: &&&&&&&&& Sending live_question_attempt_started message to server for question number:", question_number);
                       websocketRef.current.send(JSON.stringify(messageToSend));
                 }
 
             })
             .catch((err) => console.log("TakeQuizLive: Error fetching quiz question data:", err));
 
       }, [live_question_number]);
/*
    useEffect(() => {
      if (live_total_score === undefined) {
        return;
      }
       console.log("TakeQuizLive: live_total_score changed. live_total_score =", live_total_score); 
    }, [live_total_score]);
*/

    function SafeHTML({ content }: { content: string }) {
        const sanitizedContent = DOMPurify.sanitize(content, {
          USE_PROFILES: { html: true },
          ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br', 'span', 'div', 'img'],
          ALLOWED_ATTR: ['href', 'target', 'rel']
        });
        return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
      }

      const handleSubmit = () => {
           //console.log("TakeQuizLive: handleSubmit called");
            setShowQuestion(false); //
            // clear quizID and questionNumber to prepare for next question
            //setQuizId("");
            // stop countdown timer
            //counterRef.current?.stop();
            //console.log("handleSubmit called for user ansswer=", childRef.current?.getAnswer());
            const url = `/api/process_live_question_attempt/`;
            //console.log("POSTing to url =", url);
            
            api.post<ProcessQuestionAttemptResultsProps>(url, { format: question?.format , user_answer: childRef.current?.getAnswer(), answer_key: question?.answer_key })
              .then((res) => {     
                const { assessment_results } = res.data;
                /*
  {'error_flag': False, 'score': 10, 'cloze_question_results': 
       [
        {'user_answer': 'have', 'answer_key': 'have', 'error_flag': False, 'score': 5},
        {'user_answer': 'seen', 'answer_key': 'seen', 'error_flag': False, 'score': 5},
       ]}
                */

                setQuestionAttemptAssessmentResults(assessment_results);
                //alert("assessment_results for this question: " + assessment_results );
                
                if (assessment_results.error_flag === false) {
                  //alert("Answer is correct.");
                  setShowCorrectModal(true);
                 
                  correctModalTimerRef.current = setTimeout(() => {
                    setShowCorrectModal(false);
                    // show next question if available by checking next_question_data
                    handleModalClose();
                    // handle end of quiz scenario here
                  }, 2000); // Close modal after 2 seconds
                }
                else {
                  //alert("Answer is incorrect. Please try again.");
                 
                  setShowIncorrectModal(true);
                }
               //console.log("TakeQuizLive: Update score, Question Attempt Assessment Results score = ", assessment_results.score);
                dispatch(updateLiveScore({name: name || '', live_score: assessment_results.score || 0}));
                // send my live score to server via websocket
                sendLiveScoreToServer(assessment_results.score?.toString() || "0");
                

            })
              .catch((error) => {
                console.error("Error processing question attempt:", error);
              });
      }

      const handleModalClose = () => {
        //console.log("handleCorrectModalTimeout called. nextQuestionId =", nextQuestionId.current);
        setShowCorrectModal(false);
        setShowIncorrectModal(false);
        setFinishedLiveQuestion({status: true, question_number: liveQuestionNumber || ''});
        // clear liveQuestionNumber to prepare for next question
        setLiveQuestionNumber(null);
        parent_callback(); // notify parent component that question is finished
      };

      const displayShowQuestionStattus = () => {
        // only display status if quiz_id is set
        if (quiz_id) {
            if (!showQuestion) {
              return "Waiting for question ...";
                //return <div>Question number: {question?.question_number}</div>
            }
        }
      }

      const sendLiveScoreToServer = (value: string) => {
        if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
          alert('ChatPage: WebSocket is not connected');
          return;
        }
       //console.log("TakeQuizLive: Sending live score to server for question number:", question_number);
        const messageToSend = {
          message_type: 'live_score',
          message: value,
          user_name: name, // sender
          live_question_number: liveQuestionNumber || '' // include question number for teacher to know which question this score is for,
        };
        websocketRef.current.send(JSON.stringify(messageToSend));
      };

  return (
    <div className=' bg-cyan-50  h-full w-full'>
       <div className='flex flex-row justify-center items-center mt-5 mb-3'>
        <span className='mx-3'>Quiz ID:</span>
        <span className={`text-red-700 text-md font-bold border-2 border-red-400 rounded-full px-2 py-0 inline-block`}>{quiz_id} </span>
       </div>
  
        { displayShowQuestionStattus() }

        {showCorrectModal && <CorrectModal score={questionAttemptAssessmentResults?.score}/>}

      {showIncorrectModal && <ModalForIncorrect 
        parentCallback={handleModalClose} 
        format={question?.format ?? 1}
        content={question?.content ?? ""}
        answer_key={question?.answer_key ?? ""}
        explanation={question?.explanation ?? ""}
        processQuestionResults={questionAttemptAssessmentResults as QuestionAttemptAssesmentResultsProps}
        />
      }
      
        {question  && showQuestion && (
            <div className="col-span-8 mx-15 my-5 p-10 border-2 border-gray-200 rounded-md bg-cyan-100">
              <div className="mb-3 text-lg text-blue-600 font-bold">
                Question: {question?.question_number}
              </div>

            {SafeHTML({ content: question.instructions ?? "" })}

            {question?.prompt && (
              <div className="mb-3 mt-5 text-amber-700">
                {question.prompt}
              </div>
            )
            }
              <div className='my-5'>
              { question?.format === 1 &&
                <DynamicWordInputs content={question.content} ref={childRef} />
              }
              { question?.format === 3 &&
                <ButtonSelect content={question.content} ref={childRef} />
              }
              { question?.format === 4 &&
                <RadioQuestion content={question.content} ref={childRef} />
              }
              { question?.format === 5 &&
                <CheckboxQuestion content={question.content} ref={childRef} />
              }
              { question?.format === 6 &&
                <DragDrop content={question.content} ref={childRef} />
              }
              { question?.format === 8 &&
                <WordsSelect content={question.content} ref={childRef} />
              }
              { question?.format === 10 &&
                <DropDowns content={question.content} ref={childRef} />
              } 
              { question?.format === 12 &&
                <SentenceScramble content={question.content} ref={childRef} />
              }
              </div>
              <button className='bg-green-600 text-white mx-10 mt-7 p-2 rounded-md hover:bg-red-700'
                onClick={() => handleSubmit()}
            >
                Submit
                </button>
            </div>
          )}
    </div>
  )
}

export default TakeQuizLive

/*
          <div>
                  Question finished: 
                  { finishedLiveQuestion.status ? " Yes" : " No" }
                  { finishedLiveQuestion.question_number !== '' &&
                  
                    <span> for question number: {finishedLiveQuestion.question_number} </span>
                  }
                  </div>
           
*/