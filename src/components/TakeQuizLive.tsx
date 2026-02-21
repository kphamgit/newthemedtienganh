

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
import SRNonContinuous from './questions/SRNonContinuous';

interface TakeQuizLiveProps {
    live_quiz_id: string;
    live_question_number?: string;
    //live_total_score?: string;
    //onLiveQuestionLoaded: (questionNumber: string) => void; // callback function to notify parent component when a live question is loaded
    parent_callback: () => void;   // to notify parent component when a question is finished ( or the quiz is finished??)
}

function TakeQuizLive({ live_quiz_id , live_question_number,  parent_callback}: TakeQuizLiveProps) {
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
    const {eventEmitter } = useWebSocket();
    const [showQuestion, setShowQuestion] = useState<boolean>(false); // work in conjunction with questionAttemptData 


    const [showCorrectModal, setShowCorrectModal] = useState(false);
    const [showIncorrectModal, setShowIncorrectModal] = useState(false);

    const [pendingQuestionAttempt, setPendingQuestionAttempt] = useState<boolean>(false); // to track if a question attempt is being processed by the server. This is important to prevent multiple submissions of the same question attempt when user clicks submit button multiple times before receiving a response from the server.

    //const [finishedLiveQuestion, setFinishedLiveQuestion] = useState<{status: boolean, question_number: string}>({ status: false, question_number: '' });

    let correctModalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { name } = useSelector((state: RootState) => state.user);

     const [questionAttemptAssessmentResults, setQuestionAttemptAssessmentResults] = 
            useState<QuestionAttemptAssesmentResultsProps | null>(null);

    const dispatch = useDispatch<AppDispatch>();
    
    
    useEffect(() => {
        if (live_question_number) {
          //console.log("TakeQuizLive: live_question_number prop is set to:", live_question_number);
          //console.log("TakeQuizLive: This happens when user logs in while a live quiz is in progress with an unfinished question.");
          setLiveQuestionNumber(live_question_number);
        }
    }, [live_question_number]);
  

    useEffect(() => {
      const handleMessage = (data: WebSocketMessageProps) => {
        if (data.message_type === "live_question_number") {
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

    useEffect(() => {
         // call api to get quiz question 
         // data for quizId and questionId
         // only if both quizId and questionNumber are set
         //console.log("TakeQuizLive: useEffect for fetching quiz question triggered. live_quiz_id =", live_quiz_id, "liveQuestionNumber =", liveQuestionNumber, "pendingQuestionAttempt =", pendingQuestionAttempt);
            if (!live_quiz_id ) {
                console.log("TakeQuizLive: quiz_id is not set.");
                return;
            }
            //if (live_quiz_id === "" || liveQuestionNumber === "") {
              //  return;
           // }
            // if there's a current question being shown, do not fetch new question
            if (pendingQuestionAttempt) {
               //console.log("TakeQuizLive: Ignoring new question fetch because user is still working on current question.");
                return;
            }
            // if question_number is not set, do not fetch question
            if (!liveQuestionNumber ) {
                console.log("TakeQuizLive: question_number is not set.");
                return;
            }
            api.post(`/api/quizzes/${live_quiz_id}/questions/${liveQuestionNumber}/live/`, {
                user_name: name || '',
            })
            .then((res) => res.data)
            .then((data) => {
                console.log("TakeQuizLive: Quiz Question Data:", data);
                // you can set state here to store question data
                setQuestion(data);
                setShowQuestion(true);
                setPendingQuestionAttempt(true); // set pending question attempt status to true
            })
      }, [live_quiz_id, liveQuestionNumber]);
    
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
            // stop countdown timer
            //counterRef.current?.stop();
            //console.log("handleSubmit called for user ansswer=", childRef.current?.getAnswer());
            const url = `/api/process_live_question_attempt/`;
            //console.log("POSTing to url =", url);
            
            api.post<ProcessQuestionAttemptResultsProps>(url, { user_name: name, format: question?.format , user_answer: childRef.current?.getAnswer(), answer_key: question?.answer_key })
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
                //const message_content = `${liveQuestionNumber}: ${assessment_results.score}`;
                //const message_content = {live_question_number: liveQuestionNumber, score: assessment_results.score};
                //sendLiveScoreToServer(message_content);
                

            })
              .catch((error) => {
                console.error("Error processing question attempt:", error);
              });
      }

      const handleModalClose = () => {
        //console.log("handleCorrectModalTimeout called. nextQuestionId =", nextQuestionId.current);
        setShowCorrectModal(false);
        setShowIncorrectModal(false);
        setPendingQuestionAttempt(false); // reset pending question attempt status when question attempt is finished
        // clear liveQuestionNumber to prepare for next question
        setLiveQuestionNumber(null);
        parent_callback(); // notify parent component that question is finished
      };

      const displayShowQuestionStatus = () => {
        // only display status if quiz_id is set
        if (live_quiz_id) {
            if (!showQuestion) {
              return "Waiting for question ...";
                //return <div>Question number: {question?.question_number}</div>
            }
        }
      }

  const displayQuestion = (format: number) => {
    switch(format) {
      case 1:
        return <DynamicWordInputs content={question?.content ?? ""} ref={childRef} />;
      case 3:
        return <ButtonSelect content={question?.content ?? ""} ref={childRef} />;
      case 4:
        return <RadioQuestion content={question?.content ?? ""} ref={childRef} />;
      case 5:
        return <CheckboxQuestion content={question?.content ?? ""} ref={childRef} />;
      case 6:
        return <DragDrop content={question?.content ?? ""} ref={childRef} />;
      case 7:
        return <SRNonContinuous content={question?.content ?? ""} ref={childRef} />
      case 8:
        return <WordsSelect content={question?.content ?? ""} ref={childRef} />;
      case 10:
        return <DropDowns content={question?.content ?? ""} ref={childRef} />;
      case 12:
        return <SentenceScramble content={question?.content ?? ""} ref={childRef} />;
      default:
        return null;
    }
  }


  return (
    <div className=' bg-green-200  h-full w-full'>
      <div>Pending question attempt: {pendingQuestionAttempt.toString()}</div>
      <div className='bg-cyan-300 flex flex-row justify-center items-center mt-5 mb-3'>
        <span className='mx-3'>Quiz ID:</span>
        <span className={`text-red-700 text-md font-bold border-2 mr-5  border-red-400 rounded-full px-2 py-0 inline-block`}>{live_quiz_id} </span>
        {displayShowQuestionStatus()}
      </div>
      <div className='grid grid-cols-12 border-4 border-blue-600 rounded-md mx-10 my-5 p-5 bg-white'>
      {question && showQuestion && (
        <div className="col-span-8 mx-15 my-5 p-10 rounded-md bg-cyan-200">
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
            {displayQuestion(question.format)}
          </div>
          <button className='bg-green-600 text-white mx-10 mt-7 p-2 rounded-md hover:bg-red-700'
            onClick={() => handleSubmit()}
          >
            Submit
          </button>
        </div>
      )}
      </div>
      {showCorrectModal && <CorrectModal score={questionAttemptAssessmentResults?.score} />}

      {showIncorrectModal && <ModalForIncorrect
        parentCallback={handleModalClose}
        format={question?.format ?? 1}
        content={question?.content ?? ""}
        answer_key={question?.answer_key ?? ""}
        explanation={question?.explanation ?? ""}
        processQuestionResults={questionAttemptAssessmentResults as QuestionAttemptAssesmentResultsProps}
      />
      }
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