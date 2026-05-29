//import { useCallback } from "react";
//import useCountdown from "../hooks/useCountdown";

import { useState, useRef, useEffect } from 'react';
//import { type CounterHandleRefProps } from './Counter';
//import RedoQuestionModal from './RedoQuestionModal';
//import QuizStartModal from './QuizStartModal';
//import TimeoutModal from './TImeOutModal';
import CorrectModal from './CorrectModal';

import { useParams } from 'react-router-dom';
import { type ProcessQuestionAttemptResultsProps, type QuestionAttemptAssesmentResultsProps, type QuestionProps, type QuizAttemptProps } from './shared/types';
//import { processQuestion } from './processQuestion';
import { DynamicWordInputs } from './questions/DynamicWordInputs';
import IncorrectModal from './IncorrectModel';
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
//import { AzureAudioPlayer } from './shared/AzureAudioPlayer';
import OpenAIStream from './shared/OpenAIStream';
import { ButtonSelectCloze } from './questions/ButtonSelectCloze';
import ReviewPromptModal from './ReviewPromptModal';

//import CountdownTimer, { type CountdownTimerHandleProps } from "../components/CountdownTimer";
//import TimeoutModal from './TImeOutModal';



//import CountdownTimer, { type CoundownTimerHandleProps } from './CountdownTimer';

export interface ChildRef {
    getAnswer: () => string | undefined;
  }

const TakeQuiz: React.FC = () => {

  const [reviewMode, setReviewMode] = useState<boolean>(false); // State to manage the flow of reviewing incorrectly answered questions after finishing the quiz. We start in the "initial" state where we show the end of quiz screen with the final score and a button to review incorrectly answered questions. When the user clicks the button to review incorrectly answered questions, we transition to the "reviewing_incorrect" state where we load and show incorrectly answered questions one by one with a button to go to the next question until there are no more incorrectly answered questions to review, at which point we transition to the "completed" state where we show a message that the review is complete and a button to navigate back to the unit screen.
  
  //const timerRef = useRef<CountdownTimerHandleProps>(null);

  const childRef = useRef<ChildRef>(null);

  //const [remainingQuestions, setRemainingQuestions] = useState<{question: QuestionProps, question_attempt_number?: number}[]>([]); // State to hold the remaining questions in the quiz attempt that have not been attempted yet. We initialize this as an empty array and populate it with the questions from the server response when we fetch or create the quiz attempt in the useEffect on component mount. When the user answers a question and clicks "Continue", we remove the next question to display from this remainingQuestions array and set it as the current question, so that we can have a smooth transition to the next question while waiting for the server response to create the next question attempt. We also use the length of this remainingQuestions array in another useEffect to determine when we are at the end of the currently loaded questions and need to fetch more questions from the server if there are more questions in the quiz (hasMoreQuestions is true).
  const [question, setQuestion] = useState<QuestionProps | undefined>(undefined) // State to hold the current question data
  const [quizAttempt, setQuizAttempt] = useState<QuizAttemptProps>(null as any);
  const [questionAttemptId, setQuestionAttemptId] = useState<number | null>(null);

  const { quiz_id } = useParams<{ category_id: string, quiz_id: string }>();

  const { name } = useSelector((state: RootState) => state.user);

  const [showCorrectModal, setShowCorrectModal] = useState(false);
  const [showIncorrectModal, setShowIncorrectModal] = useState(false);

  const [questionAttemptAssessmentResults, setQuestionAttemptAssessmentResults] = 
  useState<QuestionAttemptAssesmentResultsProps | null>(null);

  const [endOfQuiz, setEndOfQuiz] = useState<boolean>(false);
 
  let correctModalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const incorrectModalQuestion = useRef<QuestionProps | undefined>(undefined);

  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const [incorrectCount, setIncorrectCount] = useState(0);

  useEffect(() => {
    api.post(`/api/quiz_attempts/get_or_create/${quiz_id}/`, { user_name: name, number_of_questions_to_preload: 3 })
     .then((response) => {
        //console.log("******* Received response from get_or_create:", response.data);
        //const all_questions_loaded = response.data.questions;
        //const first_question = all_questions_loaded.length > 0 ? all_questions_loaded[0] : null;
        // console.log(" First question loaded from server:", first_question);
        //setRemainingQuestions(all_questions_loaded.slice(1).map((q: QuestionProps) => ({ question: q })));
        
        setQuestion(response.data.question ? response.data.question : undefined);
        setQuestionAttemptId(response.data.question_attempt ? response.data.question_attempt.id : null);
        setQuizAttempt(response.data.quiz_attempt);
     
     })
     .catch((error) => {
       console.error("Error fetching quiz attempt data:", error);
      
     });
 },[quiz_id])

 const createNextQuestionAttempt = async () => {
  // console.log("createQuestionAttempt called. quizAttempt id:", quizAttempt.id, " current question number:", question?.question_number);
  const url = `/api/quiz_attempts/${quizAttempt.id}/create_next_question_attempt/`;
  try {
    const response = await api.post<{ 
       next_question_attempt: any,
       next_question: any
       number_of_incorrect_attempts: number,  // this flag is use only in case there is not 
       // next question attempt returned from server,
    }>(url, {
      current_question_number: question?.question_number, // we send the question id of the next question to createNextQuestionAttempt, which uses this to tell the server which question attempt to create next. We also use this question id to find the next question in the remainingQuestions array and set it as the current question immediately for a smooth user experience, while waiting for the server response. If test_next_question is undefined (which shouldn't happen because we should have already checked that there is a next question before showing the Continue button), we pass null to createNextQuestionAttempt,
    });
    if (response.data.next_question_attempt) {
      //const { question_attempt_id } = response.data;
      //setQuestionAttemptId(question_attempt_id);
      // console.log("Created next question attempt. Server response:", response.data);
      const next_question = response.data.next_question;
      if (next_question) {
        setAnswerSubmitted(false);
        setQuestion(next_question);
        setQuestionAttemptId(response.data.next_question_attempt.id);
      }
      else {
        console.log("Error: Question Attempt returned from server but found no next question in the response. This should not happen");
        return;
      }
    }
    else {  // no next question attempt returned from server 
    // means we have reached the end of the quiz attempt,
      //console.log("No next question attempt returned from server. Server response:", response.data);
      // check number_of_incorrect_attempts from server response
      const number_of_incorrect_attempts = response.data.number_of_incorrect_attempts;
      //console.log("Number of incorrect attempts in this quiz attempt:", number_of_incorrect_attempts);
      if (number_of_incorrect_attempts > 0) {
        //console.log("Reached end of quiz, but there are incorrectly answered questions in the quiz attempt, setting review mode to true to review incorrectly answered questions.");
        // setReviewMode(true);
        setIncorrectCount(number_of_incorrect_attempts);
        setShowReviewPrompt(true);
      }
      else {
        //console.log("Reached end of quiz, and there are no incorrectly answered questions in the quiz attempt, marking quiz attempt as completed and showing end of quiz screen.");
        setEndOfQuiz(true);
      }
    }
  } catch (error) {
    console.error("Error creating next question attempt:", error);
  }
    
};

/*
 useEffect(() => {
    if (question) {
      //console.log("Question id:", question.id, " question number:", question.question_number, " content:", question.content);
      createQuestionAttempt(quizAttempt.id);
    }
 }, [question])
*/

 useEffect(() => {
  if (!endOfQuiz) return;
  api.post(`/api/quiz_attempts/${quizAttempt.id}/mark_completed/`)
    .catch(err => console.error("Error marking quiz attempt as completed.", err));
}, [endOfQuiz]);

const handleFeedbackModalClose = () => {
    //console.log("handleFeedbackModalClose called. showCorrectModal:", showCorrectModal, " showIncorrectModal:", showIncorrectModal);
    setShowIncorrectModal(false);
    setShowCorrectModal(false);
  
    //createNextQuestionAttempt();
    // if not Review mode, create the next question attempt
    if (!reviewMode) {
      createNextQuestionAttempt();
    }
    else {   // get the next incorrect question attempt to review
      api.get(`/api/quiz_attempts/${quizAttempt.id}/get_incorrect_question_attempt/`)
        .then((response) => {
          //console.log("Received response from get_incorrect_question_attempt API:", response.data);
          const { question_attempt_id, question } = response.data;
          if (question_attempt_id && question) {
            setAnswerSubmitted(false);
            setQuestionAttemptId(question_attempt_id);
            setQuestion(question);
            //console.log("Next incorrectly answered question loaded for review. Question id:", question.id, " question number:", question.question_number, " content:", question.content);
          }
          else {
            //console.log("No question attempt id/question returned from get_incorrect_question_attempt API.");
            // if we can't load the next incorrectly answered question to review, we end the review session and show the end of quiz screen.
            setEndOfQuiz(true);
          }
        })
        .catch(() => {
          //console.error("Error fetching next incorrectly answered question for review:", error);
          // if there is an error fetching the next incorrectly answered question to review, we end the review session and show the end of quiz screen.
          setReviewMode(false);
          setEndOfQuiz(true);
        });


    }
  }

const handleReviewYes = () => {
  setQuestion(undefined);
    setShowReviewPrompt(false);
    setReviewMode(true);
    api.get(`/api/quiz_attempts/${quizAttempt.id}/get_incorrect_question_attempt/`)
      .then((response) => {
        //console.log("Received response from get_incorrect_question_attempt API:", response.data);
        const { question_attempt_id, question } = response.data;
        if (question_attempt_id && question) {
          setAnswerSubmitted(false);
          setQuestionAttemptId(question_attempt_id);
          setQuestion(question);
          //console.log("First incorrectly answered question loaded for review. Question id:", question.id, " question number:", question.question_number, " content:", question.content);
          // call api to set QuizAttept review mode to true
          //console.log("Setting quiz attempt review mode to true in server for quiz attempt id:", quizAttempt.id);
          api.get(`/api/quiz_attempts/${quizAttempt.id}/set_review_mode/`, )
            .then(() => {
              console.log("Quiz attempt review mode set to true in server.");
            })
            .catch((error) => {
              console.error("Error setting quiz attempt review mode in server:", error);
            });
        }
        else {
          console.error("Error: Invalid response from get_incorrect_question_attempt API. Missing question_attempt_id or question data.");
        }
      })
      .catch((error) => {
        console.error("Error fetching first incorrectly answered question for review:", error);
      });

  };

const handleReviewNo = () => {
    setShowReviewPrompt(false);
    setEndOfQuiz(true);
  };

 const handleSubmit = () => {
  setAnswerSubmitted(true);
  const url = `/api/question_attempts/${questionAttemptId}/process/`;
  const uanswer = childRef.current?.getAnswer();
  const aKey = question?.answer_key;
  
  api.post<ProcessQuestionAttemptResultsProps>(url, 
    { 
      format: question?.format, 
      user_answer: uanswer, 
      answer_key: aKey,
    })
  .then((res) => {
    // server returns the next question id (if any), together with assessment results 
    //console.log("---->>>> Received response from server after processing question attempt:", res.data);
    const { assessment_results } = res.data;

    setQuestionAttemptAssessmentResults(assessment_results);
    if (assessment_results.error_flag === false) {
      //alert("Answer is correct.");
      setShowCorrectModal(true);
      correctModalTimerRef.current = setTimeout(() => {
        setShowCorrectModal(false);
        // show next question if available by checking next_question_data
        handleFeedbackModalClose();
        // handle end of quiz scenario here
      }, 1000); // Close modal after 2 seconds
    }
    else {
      // make a snapshot of question for incorrect model because
      // question is undefined when passed as a prop to IncorrectModal.
       incorrectModalQuestion.current = question;
       setShowIncorrectModal(true);
    }
  })
  .catch((err) => {
    console.error("Error processing question attempt:", err);
  });
  
}
 const displayQuestion = (format: number, content: string) => {
  return (
    <div className='my-5'>
      { format === 1 && <DynamicWordInputs key={questionAttemptId ?? 0} content={content} ref={childRef} /> }
      { format === 2 && <ButtonSelectCloze key={questionAttemptId ?? 0} content={content} content_language={question?.content_language ?? "en"} choices={question?.button_cloze_options} submitted={answerSubmitted} ref={childRef} /> }
      { format === 3 && <ButtonSelect key={questionAttemptId ?? 0} content={content} ref={childRef} /> }
      { format === 4 && <RadioQuestion key={questionAttemptId ?? 0} content={content} ref={childRef} /> }
      { format === 5 && <CheckboxQuestion key={questionAttemptId ?? 0} content={content} ref={childRef} /> }
      { format === 6 && <DragDrop key={questionAttemptId ?? 0} content={content} content_language={question?.content_language ?? "en"} ref={childRef} /> }
      { format === 7 && <SRNonContinuous content={content} ref={childRef} /> }
      { format === 8 && <WordsSelect key={questionAttemptId ?? 0} content={content} ref={childRef} /> }
      { format === 10 && <DropDowns key={questionAttemptId ?? 0} content={content} ref={childRef} /> }
      { format === 12 && <SentenceScramble key={questionAttemptId ?? 0} content={content}  ref={childRef} /> }
    </div>
  );
};

  function SafeHTML({ content }: { content: string }) {
    const sanitizedContent = DOMPurify.sanitize(content, {
      USE_PROFILES: { html: true },
      ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br', 'span', 'div', 'img'],
      ALLOWED_ATTR: ['href', 'target', 'rel']
    });
    return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
  }
  
  if (endOfQuiz) {
    return (
      <div className='text-center mt-10'>
        <h2 className='text-2xl font-bold mb-4'>Quiz Completed!</h2>
        <p className='text-lg'>Congratulations on completing the quiz. Your final score is: {questionAttemptAssessmentResults?.score}</p>
      </div>
    );
  }

  return (
    <>
    <div className="grid grid-cols-3 bg-amber-100 gap-6 p-4 w-full">

      {/* Left: Question (2/3 width) */}
      <div className="col-span-2 flex flex-col items-center bg-green-200">
        { question && (
            <>
              <div>Question Number: {question.question_number}</div>
              <div>Incorrect Count: {incorrectCount}</div>
              {SafeHTML({ content: question.instructions ?? "" })}
              {question?.prompt && (
                <div className="mb-3 mt-5 text-amber-800 whitespace-pre-wrap">
                  {question.prompt}
                </div>
              )}
              <div>
                {(question?.audio_str && question.audio_str.trim().length > 0) &&
                  <OpenAIStream sentence={question.audio_str} />
                }
              </div>
              {displayQuestion(question.format, question.content)}
              <button className={`bg-green-700 text-white mx-10 mt-7 p-2 rounded-md hover:bg-red-700 transition-opacity duration-300 ${showCorrectModal || showIncorrectModal ? 'opacity-0' : 'opacity-100'}`}
                onClick={() => handleSubmit()}
              >
                Submit
              </button>
            </>
        )}
      </div>

      {/* Right: Feedback panel */}
      <div className="col-span-1 mt-5 bg-amber-200">
        {showCorrectModal && <CorrectModal score={questionAttemptAssessmentResults?.score}/>}
        {showIncorrectModal && <IncorrectModal
          parentCallback={handleFeedbackModalClose}
          format={incorrectModalQuestion.current?.format ?? 1}
          content={incorrectModalQuestion.current?.content ?? ""}
          answer_key={incorrectModalQuestion.current?.answer_key ?? ""}
          explanation={incorrectModalQuestion.current?.explanation ?? ""}
          processQuestionResults={questionAttemptAssessmentResults as QuestionAttemptAssesmentResultsProps}
        />}
      </div>

    </div>

    {showReviewPrompt && (
      <ReviewPromptModal onYes={handleReviewYes} onNo={handleReviewNo} incorrectCount={incorrectCount} />
    )}
    </>
  );
  };

  export default TakeQuiz;



  
