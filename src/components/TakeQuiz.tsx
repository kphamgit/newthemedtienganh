//import { useCallback } from "react";
//import useCountdown from "../hooks/useCountdown";

import { useState, useRef, useEffect } from 'react';
//import { type CounterHandleRefProps } from './Counter';
//import RedoQuestionModal from './RedoQuestionModal';
//import QuizStartModal from './QuizStartModal';
//import TimeoutModal from './TImeOutModal';
import CorrectModal from './CorrectModal';

import { useParams } from 'react-router-dom';
import { type ProcessQuestionAttemptResultsProps, type QuestionAttemptAssesmentResultsProps, type QuestionProps, type QuizAttemptCreatedProps } from './shared/types';
//import { processQuestion } from './processQuestion';
import { DynamicWordInputs } from './questions/DynamicWordInputs';
import ModalForIncorrect from './ModalForIncorrect';
import api from '../api';
import { ButtonSelect } from "./questions/ButtonSelect";
import { RadioQuestion } from "./questions/RadioQuestion";
import { CheckboxQuestion } from "./questions/CheckboxQuestion";
import DragDrop from "./questions/dragdrop/DragDrop";
import { WordsSelect } from "./questions/WordsSelect";
import SentenceScramble from "./questions/SentenceScramble";
import { DropDowns } from "./questions/DropDowns";
import { useSelector } from 'react-redux';
//import type { RootState } from '../redux/store';
import DOMPurify from 'dompurify';
import type { RootState } from '../redux/store';
// import { SRContinuous } from './questions/SRContinuous';
import SRNonContinuous from './questions/SRNonContinuous';

//import CountdownTimer, { type CoundownTimerHandleProps } from './CountdownTimer';


export interface ChildRef {
    getAnswer: () => string | undefined;
  }

const TakeQuiz: React.FC = () => {

    //const [questionAttemptData, setQuestionAttemptData] = useState<QuestionAttemptDataProps>();
    const [showQuestion, setShowQuestion] = useState(false); // work in conjunction with questionAttemptData 
    // to control when to show question. Start with true to show question when quiz starts
    const [question, setQuestion] = useState<QuestionProps | null>(null);
    const [questionAttemptId, setQuestionAttemptId] = useState<number | null>(null);

    const nextQuestionId = useRef<number | null>(null);

    const [showCorrectModal, setShowCorrectModal] = useState(false);
    //const [counterKey, setCounterKey] = useState(0); // Key to force Counter re-render
    //const counterRef = useRef<CounterHandleRefProps>(null);
    //const [fetchQuizAttemptEnabled, setFetchQuizAttemptEnabled] = useState(true)  // only fetch quiz once
    const { quiz_id } = useParams<{ category_id: string, quiz_id: string }>();
    const [showIncorrectModal, setShowIncorrectModal] = useState(false);
    //const [showStartModal, setShowStartModal] = useState<boolean | null>(null); // null means no need to show start modal

    // this state helps to fix a bug where handleTimerComplete event fires at the very begining of quiz attempt
    //const [quizAttemptInProgress, setQuizAttemptInProgress] = useState<boolean>(false);
    const [endOfQuiz, setEndOfQuiz] = useState<boolean>(false);
    //const endOfQuiz = useRef<boolean>(false);


    const childRef = useRef<ChildRef>(null);

    const [quizAttemptData, setQuizAttemptData] = useState<QuizAttemptCreatedProps>(null as any);

    const [quizStarted, setQuizStarted] = useState(false);

    const [questionAttemptAssessmentResults, setQuestionAttemptAssessmentResults] = 
        useState<QuestionAttemptAssesmentResultsProps | null>(null);

    let correctModalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { name } = useSelector((state: RootState) => state.user);

    //const [timerDuration, setTimerDuration] = useState<number>(0); // default 20 seconds
    //const counterRef = useRef<CoundownTimerHandleProps>(null);

    /*
    const { data: quizAttemptData } = useQuizAttempt(
        quiz_id ? quiz_id : "",
        null,
        "2",  // use a fixed user id for now
        fetchQuizAttemptEnabled
    );
    */

    useEffect(() => {
      const baseURL = import.meta.env.VITE_API_URL
      const url = `${baseURL}/api/quiz_attempts/get_or_create/${quiz_id}/`;
      //console.log("Fetching quiz attempt data from url =", url);
      api.post(url, { user_name: name })  // use a fixed user id for now
        .then((response) => {
          //console.log("Fetched quiz attempt data:", response.data);
          setQuizAttemptData(response.data);
        })
        .catch((error) => {
          console.error("Error fetching quiz attempt data:", error);
        });

    },[quiz_id])


 
    //const { seconds, isRunning, start, stop, reset } = useCountdown(10000, handleComplete);
  
    useEffect(() => {
        if (quizAttemptData && quizStarted === false) {
            //setFetchQuizAttemptEnabled(false); // disable further fetching for quiz_attempt
            setQuizStarted(true); // mark quiz as started to prevent re-entry
           // Destructure the fields from quizAttemptData
            const { created } = quizAttemptData || {};  
            //setQuizAttempt(quizAttemptData.quiz_attempt);         
           // if a quiz attempt already exists, show a pop up modal to ask if the user wants to continue or start over
           if (created === false) {
                //console.log(" quiz attempt already exists. Show modal to continue or start over.");
                //console.log(" Existing quiz attempt. quizAttemptData:", quizAttemptData);
                //alert("You have already started this quiz. Do you want to continue where you left off or start over?");
                // Implement modal with options to continue or start over
                //console.log(" quiz attempt already exists. quizAttemptData:", quizAttemptData);
                // quizAttemptData contains the quiz attempt info
                // quizAttemptData ALSO contains the last question attempt ID
                // and question data if applicable (in case the server detected
                // that the last question unfinished IS the first question of the quiz)
                // check if quizAttemptData.question is present
                if (quizAttemptData.question) { // the last quesion unfinished is the first question of the quiz
                  //console.log(" Continuing from quizAttemptData:", quizAttemptData);
                    //console.log(" There is a last question to continue from. question data:", quizAttemptData.question);
                    //setShowStartModal(null); // no need to show start modal
                    //setQuestionAttemptData({question_attempt_id: quizAttemptData.question_attempt_id, question: quizAttemptData.question});
                    
                    setQuestion(quizAttemptData.question);
                    setQuestionAttemptId(quizAttemptData.question_attempt_id);
                    setShowQuestion(true);
                    //setTimerDuration(quizAttemptData.question.timeout);
                    
                    //start_question_attempt(quizAttemptData.question, quizAttemptData.question_attempt_id);
                    //return; // exit here
                }
                else {
                    alert(" Existing quiz attempt found but no question to continue from.");
                }
            } else {
                //console.log("useEffect quizAttemptData CREATED:", quizAttemptData);
                
                setQuestion(quizAttemptData.question);
                setQuestionAttemptId(quizAttemptData.question_attempt_id);
                setShowQuestion(true); // show question when quiz attempt is created
                //setTimerDuration(quizAttemptData.question.timeout);
                
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
      //console.log("fetchNextQuestion POSTing to url =", url);
    
      try {
        const response = await api.post<{ question_attempt_id: number; question: QuestionProps }>(url, {
          question_id: questionId,
        });
        //onsole.log("Received response from create_next_question_attempt:", response.data);
    
        const { question_attempt_id, question } = response.data;
        setQuestion(question);
        setQuestionAttemptId(question_attempt_id);
        setShowQuestion(true); // Show the next question
        //setTimerDuration(question.timeout);
        //counterRef.current?.start(); // Start the countdown timer for the next question
        nextQuestionId.current = null; // Reset nextQuestionId
      } catch (error) {
        console.error("Error creating next question attempt:", error);
      }
    };

    const handleInCorrectModalClose = () => {
        setShowIncorrectModal(false);
        if (nextQuestionId.current !== null) {
            createNextQuestionAttempt(quizAttemptData!.quiz_attempt.id, nextQuestionId.current);
        }
        else {
            // no next question id means end of quiz reached
            setEndOfQuiz(true);
            //alert("You have completed the quiz!");
        }
      };

    const handleCorrectModalTimeout = () => {
        setShowCorrectModal(false);
        if (nextQuestionId.current !== null) {
            createNextQuestionAttempt(quizAttemptData!.quiz_attempt.id, nextQuestionId.current);
        }
        else {
            // no next question id means end of quiz reached
            setEndOfQuiz(true);
            //alert("You have completed the quiz!");
        }
      };
    
      useEffect(() => {

        return () => {
          // Cleanup on unmount
          if (correctModalTimerRef.current) {
            clearTimeout(correctModalTimerRef.current);
          }
        };
      }, [endOfQuiz]);

    const handleSubmit = () => {
        setShowQuestion(false); //
        // stop countdown timer
        //counterRef.current?.stop();
        //console.log("handleSubmit called for user ansswer=", childRef.current?.getAnswer());
        const url = `/api/question_attempts/${questionAttemptId}/process/`;
        const uanswer = childRef.current?.getAnswer();  
        const aKey = question?.answer_key;
        
        api.post<ProcessQuestionAttemptResultsProps>(url, { format: question?.format , user_answer: uanswer, answer_key: aKey})
          .then((res) => {     
            // server returns the next question id (if any), together with assessment results 
            const { assessment_results, next_question_id } = res.data;
            // update quizAttemptData.quiz_attempt
            setQuizAttemptData((prevData) => ({
              ...prevData,
              quiz_attempt: {
                ...prevData.quiz_attempt,
                score: res.data.quiz_attempt.score,
              },
            }));

          
            setQuestionAttemptAssessmentResults(assessment_results);
            //alert("Score for this question: " + JSON.stringify(assessment_results) );
            nextQuestionId.current = next_question_id ?? null;
            if (assessment_results.error_flag === false) {
              //alert("Answer is correct.");
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
          .catch((error) => {
            console.error("Error processing question attempt:", error);
          });
        
    }
//

    
    /*
  <div className='flex flex-row justify-center mb-3'>
      <CountdownTimer initialSeconds={timerDuration} onComplete={handdleTimerComplete} ref={counterRef} />
      </div>
  
    */

    function SafeHTML({ content }: { content: string }) {
        const sanitizedContent = DOMPurify.sanitize(content, {
          USE_PROFILES: { html: true },
          ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br', 'span', 'div', 'img'],
          ALLOWED_ATTR: ['href', 'target', 'rel']
        });
        return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
      }
//<div className='text-textColor2 m-2' dangerouslySetInnerHTML={{ __html: question?.instruction ?? '' }}></div>
    return (
    <div className="mx-20 my-5 bg-cyan-200">
     
      {showCorrectModal && <CorrectModal score={questionAttemptAssessmentResults?.score}/>}
      {showIncorrectModal && <ModalForIncorrect 
        parentCallback={handleInCorrectModalClose} 
        format={question?.format ?? 1}
        content={question?.content ?? ""}
        answer_key={question?.answer_key ?? ""}
        explanation={question?.explanation ?? ""}
        processQuestionResults={questionAttemptAssessmentResults as QuestionAttemptAssesmentResultsProps}
        />
      }
   
      { quizStarted && (
        <div className='mb-1 text-center'>
          <div>Total score: <span className='text-blue-200 font-bold'>{quizAttemptData.quiz_attempt.score}</span></div>
          { endOfQuiz && 
              <div className='text-green-600 text-lg'>End Of Quiz</div>
          }
          </div>
      )
      }
          {question && questionAttemptId && showQuestion && (
            <div className="col-span-8 mx-10 my-5 p-10 border-2 border-gray-400 rounded-md ">
              <div className="mb-3 text-lg font-bold">
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
              { question?.format === 7 &&
                <SRNonContinuous content={question.content} ref={childRef} />
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

              <button className='bg-green-700 text-white mx-10 mt-7 p-2 rounded-md hover:bg-red-700'
                onClick={() => handleSubmit()}
            >
                Submit
                </button>
            </div>
          )}
        
  
      </div>
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
