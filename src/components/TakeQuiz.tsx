import { useCallback } from "react";
import useCountdown from "../hooks/useCountdown";

import { useState, useRef, useEffect } from 'react';
//import { type CounterHandleRefProps } from './Counter';
//import RedoQuestionModal from './RedoQuestionModal';
//import QuizStartModal from './QuizStartModal';
//import TimeoutModal from './TImeOutModal';
import CorrectModal from './CorrectModal';
import { useQuizAttempt } from '../hooks/useQuizAttempt';
import { useParams } from 'react-router-dom';
import { type ProcessQuestionAttemptResultsProps, type QuestionAttemptAssesmentResultsProps, type QuestionProps } from './shared/types';
//import { processQuestion } from './processQuestion';
import { DynamicWordInputs } from './questions/DynamicWordInputs';
import ModalForIncorrect from './ModalForIncorrect';
import api from '../api';


export interface ChildRef {
    getAnswer: () => string | undefined;
  }

const TakeQuiz: React.FC = () => {

    //const [questionAttemptData, setQuestionAttemptData] = useState<QuestionAttemptDataProps>();
    const [showQuestion, setShowQuestion] = useState(false); // work in conjunction with questionAttemptData 
    // to control when to show question. Start with true to show question when quiz starts
    const [question, setQuestion] = useState<QuestionProps | null>(null);
    const [questionAttemptId, setQuestionAttemptId] = useState<number | null>(null);

    //const [nextQuestionId, setNextQuestionId] = useState<number | null>(null);
    const nextQuestionId = useRef<number | null>(null);

    const [showCorrectModal, setShowCorrectModal] = useState(false);
    //const [counterKey, setCounterKey] = useState(0); // Key to force Counter re-render
    //const counterRef = useRef<CounterHandleRefProps>(null);
    const [fetchQuizAttemptEnabled, setFetchQuizAttemptEnabled] = useState(true)  // only fetch quiz once
    const { quiz_id } = useParams<{ category_id: string, quiz_id: string }>();
    const [showIncorrectModal, setShowIncorrectModal] = useState(false);
    //const [showStartModal, setShowStartModal] = useState<boolean | null>(null); // null means no need to show start modal

    // this state helps to fix a bug where handleTimerComplete event fires at the very begining of quiz attempt
    //const [quizAttemptInProgress, setQuizAttemptInProgress] = useState<boolean>(false);
    //const [endOfQuiz, setEndOfQuiz] = useState<boolean>(false);
    const endOfQuiz = useRef<boolean>(false);

    const childRef = useRef<ChildRef>(null);

    const [questionAttemptAssessmentResults, setQuestionAttemptAssessmentResults] = 
        useState<QuestionAttemptAssesmentResultsProps | null>(null);

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
            console.log("***** quiz_attempt loaded:", quizAttemptData);
           // Destructure the fields from quizAttemptData
            const { created } = quizAttemptData || {};  
            //setQuizAttempt(quizAttemptData.quiz_attempt);         
           // if a quiz attempt already exists, show a pop up modal to ask if the user wants to continue or start over
           if (created === false) {
                //console.log(" quiz attempt already exists. Show modal to continue or start over.");
                console.log(" Existing quiz attempt. quizAttemptData:", quizAttemptData);
                //alert("You have already started this quiz. Do you want to continue where you left off or start over?");
                // Implement modal with options to continue or start over
                //console.log(" quiz attempt already exists. quizAttemptData:", quizAttemptData);
                // quizAttemptData contains the quiz attempt info
                // quizAttemptData ALSO contains the last question attempt ID
                // and question data if applicable (in case the server detected
                // that the last question unfinished IS the first question of the quiz)
                // check if quizAttemptData.question is present
                if (quizAttemptData.question) { // the last quesion unfinished is the first question of the quiz
                  console.log(" Continuing from quizAttemptData:", quizAttemptData);
                    //console.log(" There is a last question to continue from. question data:", quizAttemptData.question);
                    //setShowStartModal(null); // no need to show start modal
                    //setQuestionAttemptData({question_attempt_id: quizAttemptData.question_attempt_id, question: quizAttemptData.question});
                    setQuestion(quizAttemptData.question);
                    setQuestionAttemptId(quizAttemptData.question_attempt_id);
                    setShowQuestion(true);
                    //start_question_attempt(quizAttemptData.question, quizAttemptData.question_attempt_id);
                    //return; // exit here
                }
                else {
                    alert(" Existing quiz attempt found but no question to continue from.");
                }
            } else {
                console.log("useEffect quizAttemptData CREATED:", quizAttemptData);
                setQuestion(quizAttemptData.question);
                setQuestionAttemptId(quizAttemptData.question_attempt_id);
                setShowQuestion(true); // show question when quiz attempt is created
                //alert("New quiz attempt started. First question loaded.");
                //alert("Quiz attempt started. First question loaded.");
               
                //counterRef.current?.start(); // start counter for first question
            }
            // start counter using timeout as 5000 miliseconds
    
        }
        //console.log("Starting 5 second timer for question display.");
    }, [quizAttemptData]);


    const createNextQuestionAttempt = async (quizAttemptId: number, questionId: number | null) => {
      const url = `/api/quiz_attempts/${quizAttemptId}/create_next_question_attempt/`;
      console.log("fetchNextQuestion POSTing to url =", url);
    
      try {
        const response = await api.post<{ question_attempt_id: number; question: QuestionProps }>(url, {
          question_id: questionId,
        });
        console.log("Received response from create_next_question_attempt:", response.data);
    
        const { question_attempt_id, question } = response.data;
        setQuestion(question);
        setQuestionAttemptId(question_attempt_id);
        setShowQuestion(true); // Show the next question
        nextQuestionId.current = null; // Reset nextQuestionId
      } catch (error) {
        console.error("Error creating next question attempt:", error);
      }
    };

    const handleInCorrectModalClose = () => {
        setShowIncorrectModal(false);
        console.log("handleCorrectModalTimeout called. nextQuestionId =", nextQuestionId.current);
        if (nextQuestionId.current !== null) {
            createNextQuestionAttempt(quizAttemptData!.quiz_attempt.id, nextQuestionId.current);
        }
        else {
            // no next question id means end of quiz reached
            endOfQuiz.current = true;
            alert("You have completed the quiz!");
        }
      };

    const handleCorrectModalTimeout = () => {
        console.log("handleCorrectModalTimeout called. nextQuestionId =", nextQuestionId.current);
        setShowCorrectModal(false);
        if (nextQuestionId.current !== null) {
            createNextQuestionAttempt(quizAttemptData!.quiz_attempt.id, nextQuestionId.current);
        }
        else {
            // no next question id means end of quiz reached
            endOfQuiz.current = true;
            alert("You have completed the quiz!");
        }
      };

    const handleSubmit = () => {
        setShowQuestion(false); //
        const url = `/api/question_attempts/${questionAttemptId}/process/`;
        console.log("POSTing to url =", url);
        api.post<ProcessQuestionAttemptResultsProps>(url, { format: question?.format , user_answer: childRef.current?.getAnswer(), answer_key: question?.answer_key })
          .then((res) => {
            // destructure properties from res.data
            //const { assessment_results, next_question_attempt_data,  quiz_attempt } = res.data;
            console.log("Received response from process question attempt:", res.data);
            
            const { assessment_results, next_question_id } = res.data;
           // setNextQuestionId(next_question_id ?? null)   // set next question id no question_id is returned from server
                                                          // which means end of quiz reached
            setQuestionAttemptAssessmentResults(assessment_results);
            nextQuestionId.current = next_question_id ?? null;
            if (assessment_results.error_flag === false) {
              //alert("Answer is correct. timer stopped");
              setShowCorrectModal(true);
              correctModalTimerRef.current = setTimeout(() => {
              setShowCorrectModal(false);
              // show next question if available by checking next_question_data
              handleCorrectModalTimeout();
                  // handle end of quiz scenario here
              }, 2000); // Close modal after 2 seconds
          }
          else {
              //alert("Answer is incorrect. Please try again.");
              setShowIncorrectModal(true);
          }
        })
    }
//

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
      {showIncorrectModal && <ModalForIncorrect 
        parentCallback={handleInCorrectModalClose} 
        format={question?.format ?? 1}
        content={question?.content ?? ""}
        processQuestionResults={questionAttemptAssessmentResults as QuestionAttemptAssesmentResultsProps}
        />
      }
     
      <div className="grid grid-cols-12 mx-16">
      {nextQuestionId &&
        <div>Next Question Id: {nextQuestionId.current}
        </div>
}
        <div className="col-span-8 m-1 p-10 border-2 border-gray-200 rounded-md bg-gray-100">
          {question && questionAttemptId && showQuestion && (
            <>
              <h2 className="mb-10">
                Question: {question?.question_number}, Question Id: {question?.id} Question Attempt Id: {questionAttemptId}
              </h2>
              <div>Question content goes here...
              <DynamicWordInputs content={question.content} ref={childRef} />
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
export interface Props {
    parentCallback: (action: string ) => void;
    format: number;
    content: string;
    processQuestionResults?: ProcessQuestionResultsProps;
}
  */

/*
/*
export interface ProcessQuestionResultsProps {
  answer: string | undefined,
  score: number,
  error_flag: boolean,
  cloze_question_results?: ClozeAnswerResultsProps[] | undefined,
}

type ClozeAnswerResultsProps = {
  user_answer: string,
  answer_key: string,
  score: number,
  error_flag: boolean,
}

*/
