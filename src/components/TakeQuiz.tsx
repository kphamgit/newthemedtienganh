import { useCallback } from "react";
import useCountdown from "../hooks/useCountdown";

import { useState, useRef, useEffect } from 'react';
import { type CounterHandleRefProps } from './Counter';
//import RedoQuestionModal from './RedoQuestionModal';
//import QuizStartModal from './QuizStartModal';
//import TimeoutModal from './TImeOutModal';
import CorrectModal from './CorrectModal';
import { useQuizAttempt } from '../hooks/useQuizAttempt';
import { useParams } from 'react-router-dom';
import { type QuestionProps } from './shared/types';
//import { processQuestion } from './processQuestion';
import { DynamicWordInputs } from './questions/DynamicWordInputs';
import ModalForIncorrect from './ModalForIncorrect';
import api from '../api';


export interface ChildRef {
    getAnswer: () => string | undefined;
  }

interface QuestionAttemptDataProps {
    question_attempt_id: number,
    question: QuestionProps,
}

interface ProcessQuestionAttemptResultsProps {
    next_question_attempt_data? : {
        question: QuestionProps,
        question_attempt_id: number,
        is_review: boolean,     // is this a review of an erroneous attempt?
    }
    question_attempt_results: { 
        score: number,
        error_flag: boolean,
    }
    quiz_attempt: {
        completed: boolean,
        errorneous_question_ids?: string,
    }
}


const TakeQuiz: React.FC = () => {

    const [questionAttemptData, setQuestionAttempData] = useState<QuestionAttemptDataProps>();
    const [showQuestion, setShowQuestion] = useState(false); // work in conjunction with questionAttemptData 
    // to control when to show question. Start with true to show question when quiz starts

    const [showCorrectModal, setShowCorrectModal] = useState(false);
    //const [counterKey, setCounterKey] = useState(0); // Key to force Counter re-render
    const counterRef = useRef<CounterHandleRefProps>(null);
    const [fetchQuizAttemptEnabled, setFetchQuizAttemptEnabled] = useState(true)  // only fetch quiz once
    const { quiz_id } = useParams<{ category_id: string, quiz_id: string }>();
    const [showIncorrectModal, setShowIncorrectModal] = useState(false);

    // this state helps to fix a bug where handleTimerComplete event fires at the very begining of quiz attempt
    //const [quizAttemptInProgress, setQuizAttemptInProgress] = useState<boolean>(false);
    //const [endOfQuiz, setEndOfQuiz] = useState<boolean>(false);
    const endOfQuiz = useRef<boolean>(false);

    const childRef = useRef<ChildRef>(null);

    let correctModalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { data: quizAttemptData } = useQuizAttempt(
        quiz_id ? quiz_id : "",
        null,
        "2",  // use a fixed user id for now
        fetchQuizAttemptEnabled
    );
    


    const handleComplete = useCallback(() => {
      console.log("Countdown finished!");
      //alert("Countdown finished!");
    }, []);
  
    const { seconds, isRunning, start, stop, reset } = useCountdown(10000, handleComplete);
  
    useEffect(() => {
        if (quizAttemptData) {
            setFetchQuizAttemptEnabled(false); // disable further fetching for quiz_attempt
            //console.log("quiz_attempt loaded:", quizAttemptData);
           // Destructure the fields from quizAttemptData
            const { created } = quizAttemptData || {};  
            //setQuizAttempt(quizAttemptData.quiz_attempt);         
           // if a quiz attempt already exists, show a pop up modal to ask if the user wants to continue or start over
           if (created === false) {
                //console.log(" quiz attempt already exists. Show modal to continue or start over.");
            } else {
                console.log("useEffect quizAttemptData CREATED:", quizAttemptData);
                setQuestionAttempData({
                    question_attempt_id: quizAttemptData?.question_attempt_id ?? 0, // placeholder, replace with actual question attempt id
                    question: quizAttemptData.question,
                });
                //alert("New quiz attempt started. First question loaded.");
                //alert("Quiz attempt started. First question loaded.");
                setShowQuestion(true); // show question when quiz attempt is created
                counterRef.current?.start(); // start counter for first question
            }
            // start counter using timeout as 5000 miliseconds
    
        }
        //console.log("Starting 5 second timer for question display.");
    }, [quizAttemptData]);

    const handleInCorrectModalClose = () => {
        setShowIncorrectModal(false);
        setShowQuestion(true); // right now, assuming questionData has question info
        counterRef.current?.start(); // restart counter for the same question
        // Simulate fetching new question data
      };

    const handleCorrectModalTimeout = (next_question_data: any) => {
        setShowCorrectModal(false);
      
        if (next_question_data && next_question_data.question && next_question_data.question_attempt_id) {
          setQuestionAttempData({
            question_attempt_id: next_question_data.question_attempt_id,
            question: next_question_data.question,
          });
          setShowQuestion(true);
          counterRef.current?.start();
        } 
        else if ( endOfQuiz.current === true ) {
            alert("Quiz is completed! No more questions.");
            // Handle end of quiz scenario here, e.g., show summary or redirect
        }
      };

    const handleSubmit = () => {
        // First thing to do is stop the counter
        counterRef.current?.stop();
        setShowQuestion(false); // Hide question while processing answer
      
        console.log("Submitting answer for question attempt id =", questionAttemptData?.question_attempt_id);
        const url = `/api/question_attempts/${questionAttemptData?.question_attempt_id}/process/`;
        console.log("POSTing to url =", url);
      
        // Specify the type of the API response
        api.post<ProcessQuestionAttemptResultsProps>(url, { user_answer: childRef.current?.getAnswer(), answer_key: questionAttemptData?.question.answer_key })
          .then((res) => {
            // destructure properties from res.data
            console.log("Received response from process question attempt:", res.data);
            const { question_attempt_results, next_question_attempt_data: next_question_data } = res.data;
            // regardless of error flag, we need to set next question data
            // if there is next_question_data returned, set it to state
            if (res.data.next_question_attempt_data) {
                setQuestionAttempData({
                    question_attempt_id: res.data.next_question_attempt_data.question_attempt_id ?? 0,
                    question: res.data.next_question_attempt_data.question ?? {} as QuestionProps,
                });
            }
            else { // there's no next question data sent back from server.
                // check for end of quiz scenario
                if (res.data.quiz_attempt.completed === true) {
                    //alert("Setting endOfQuiz to true! ");
                    //setEndOfQuiz(true);
                    endOfQuiz.current = true;
                }
            }
    
    
            if (question_attempt_results.error_flag === false) {
                //alert("Answer is correct. timer stopped");
                setShowCorrectModal(true);
    
                correctModalTimerRef.current = setTimeout(() => {
                setShowCorrectModal(false);
                // show next question if available by checking next_question_data
                handleCorrectModalTimeout(next_question_data);
                    // handle end of quiz scenario here
                }, 3000); // Close modal after 2 seconds
            }
            else {
                //alert("Answer is incorrect. Please try again.");
                setShowIncorrectModal(true);
            }
          })
          .catch((err) => {
            console.error("Error processing question attempt:", err);
          });
      };

    return (
    <>
      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Countdown Timer: {seconds}s</h2>
        <p>Status: {isRunning ? 'Running' : 'Stopped'}</p>
        <button onClick={start} disabled={isRunning || seconds === 0}>
          Start
        </button>
        <button onClick={stop} disabled={!isRunning}>
          Stop
        </button>
        <button onClick={reset}>
          Reset
        </button>
      </div>


      {showCorrectModal && <CorrectModal />}
      {showIncorrectModal && <ModalForIncorrect parentCallback={handleInCorrectModalClose} />}
     
      <div className="grid grid-cols-12 mx-16">
        <div className="col-span-8 m-1 p-10 border-2 border-gray-200 rounded-md bg-gray-100">
          {questionAttemptData && showQuestion && (
            <>
              <h2 className="mb-10">
                Question: {questionAttemptData.question.question_number}, Question Id: {questionAttemptData.question.id}
              </h2>
              <div>Question content goes here...
              {questionAttemptData &&
              <DynamicWordInputs content={questionAttemptData.question.content} ref={childRef} />
}
              </div>

              <button className='bg-red-400 text-white mx-10 mt-7 hover:bg-red-700'
                onClick={() => handleSubmit()}
            >
                Submit
                </button>
            </>
          )}
        </div>
      </div>

      
      </>
    );
  };
  
  export default TakeQuiz;
  

  /*
 {showIncorrectModal && <IncorrectModal parentCallback={handleInCorrectModalClose} />}
  */
