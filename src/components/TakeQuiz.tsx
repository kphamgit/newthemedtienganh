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

//import CountdownTimer, { type CountdownTimerHandleProps } from "../components/CountdownTimer";
//import TimeoutModal from './TImeOutModal';



//import CountdownTimer, { type CoundownTimerHandleProps } from './CountdownTimer';

export interface ChildRef {
    getAnswer: () => string | undefined;
  }

  interface IncorrectQuestionsResponse {
    incorrect_questions: IncorrectQuestionProps[];
    quiz_attempt_id: number;
  }
  
  interface IncorrectQuestionProps {
    question: QuestionProps;
    question_attempt_id: number;
    question_attempt_number: number;
  }
  
const TakeQuiz: React.FC = () => {


  const [reviewMode, setReviewMode] = useState<boolean>(false); // State to manage the flow of reviewing incorrectly answered questions after finishing the quiz. We start in the "initial" state where we show the end of quiz screen with the final score and a button to review incorrectly answered questions. When the user clicks the button to review incorrectly answered questions, we transition to the "reviewing_incorrect" state where we load and show incorrectly answered questions one by one with a button to go to the next question until there are no more incorrectly answered questions to review, at which point we transition to the "completed" state where we show a message that the review is complete and a button to navigate back to the unit screen.
  
  //const timerRef = useRef<CountdownTimerHandleProps>(null);

  const childRef = useRef<ChildRef>(null);

  const [remainingQuestions, setRemainingQuestions] = useState<{question: QuestionProps, question_attempt_number?: number}[]>([]); // State to hold the remaining questions in the quiz attempt that have not been attempted yet. We initialize this as an empty array and populate it with the questions from the server response when we fetch or create the quiz attempt in the useEffect on component mount. When the user answers a question and clicks "Continue", we remove the next question to display from this remainingQuestions array and set it as the current question, so that we can have a smooth transition to the next question while waiting for the server response to create the next question attempt. We also use the length of this remainingQuestions array in another useEffect to determine when we are at the end of the currently loaded questions and need to fetch more questions from the server if there are more questions in the quiz (hasMoreQuestions is true).
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
 
  //const [quizHasErrors, setQuizHasErrors] = useState<boolean>(false); // state to track if there are any incorrectly answered questions in the quiz attempt, which we can use to determine whether to show the button to review incorrectly answered questions on the end of quiz screen, and also to determine whether to mark the quiz attempt as completed immediately after finishing the quiz (if there are no errors) or wait until the user finishes reviewing incorrectly answered questions and then mark the quiz attempt as completed (if there are errors).
  const quizHasErrors = useRef<boolean>(false);

  let correctModalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isFetching = useRef(false);

  useEffect(() => {
    api.post(`/api/quiz_attempts/get_or_create/${quiz_id}/`, { user_name: name, number_of_questions_to_preload: 3 })
     .then((response) => {
        //console.log("Received response from get_or_create_react_native endpoint:", response.data);
        const all_questions_loaded = response.data.questions;
        const first_question = all_questions_loaded.length > 0 ? all_questions_loaded[0] : null;
        setRemainingQuestions(all_questions_loaded.slice(1).map((q: QuestionProps) => ({ question: q })));
        setQuestion(first_question);
        setQuizAttempt(response.data.quiz_attempt);
     
     })
     .catch((error) => {
       console.error("Error fetching quiz attempt data:", error);
      
     });
 },[quiz_id])

 const createQuestionAttempt = async (quizAttemptId: number) => {
  const url = `/api/quiz_attempts/${quizAttemptId}/create_question_attempt/`;
  try {
    const response = await api.post<{ question_attempt_id: number, question_attempt_number: number }>(url, {
      question_id: question?.id, // we send the question id of the next question to createNextQuestionAttempt, which uses this to tell the server which question attempt to create next. We also use this question id to find the next question in the remainingQuestions array and set it as the current question immediately for a smooth user experience, while waiting for the server response. If test_next_question is undefined (which shouldn't happen because we should have already checked that there is a next question before showing the Continue button), we pass null to createNextQuestionAttempt, which should trigger an error response from the server that we can catch and log.
      review_state: reviewMode
    });
    if (response.data && response.data.question_attempt_id) {
      const { question_attempt_id } = response.data;
      //setQuestionAttemptId(question_attempt_id);
      //console.log("Created question attempt with id:", question_attempt_id, " for question id:", question?.id, " quiz attempt id:", quizAttemptId);
      setQuestionAttemptId(question_attempt_id);
    }
  } catch (error) {
    console.error("Error creating next question attempt:", error);
  }
    
};

 useEffect(() => {
    if (question) {
      //console.log("Question id:", question.id, " question number:", question.question_number, " content:", question.content);
      createQuestionAttempt(quizAttempt.id);
    }
 }, [question])

 useEffect(() => {
  if (!endOfQuiz) return;
  api.post(`/api/quiz_attempts/${quizAttempt.id}/mark_completed/`)
    .catch(err => console.error("Error marking quiz attempt as completed.", err));
}, [endOfQuiz]);

 const handleFeedbackModalClose = () => {
  if (showCorrectModal) {
    setShowCorrectModal(false);
  }
  if (showIncorrectModal) {
    setShowIncorrectModal(false);
  }
  //setQuestion(remainingQuestions.length > 0 ? remainingQuestions[0].question : undefined);
  // console.log("handleCorrectModalTimeout. Remaining questions length:", remainingQuestions.length);
  if (remainingQuestions.length > 0) {
        //console.log("handleCorrectModalTimeout There are remaining questions in state, showing next question immediately for a smooth user experience while waiting for the server response to create the next question attempt. Remaining questions length:", remainingQuestions.length, " Next question id:", remainingQuestions[0].question.id);
        // remove the next question to display from the remainingQuestions array and set it as the current question, so that we can have a smooth transition to the next question while waiting for the server response to create the next question attempt. We also use the length of this remainingQuestions array in another useEffect to determine when we are at the end of the currently loaded questions and need to fetch more questions from the server if there are more questions in the quiz (hasMoreQuestions is true).
        const nextQuestion = remainingQuestions[0].question;
        //console.log("handleCorrectModalTimeout Next question", nextQuestion);
        setQuestion(nextQuestion);
        //console.log(" removing next question from remaining questions")
        // remove the question we just set as current question from the remainingQuestions array, so that the next time we show the correct modal after answering the next question, we will show the following question in the remainingQuestions array (if there is one) instead of showing the same question again. We do this by slicing the remainingQuestions array from index 1 to the end, which effectively removes the first element (the question we just set as current question) from the array.
        setRemainingQuestions(prev => prev.slice(1));
        //createNextQuestionAttempt(quizAttemptData!.quiz_attempt.id, nextQuestionId.current);
        //console.log("handleCorrectModalTimeout. After removing question, remaining questions are;");
        //remainingQuestions.forEach(q => console.log("Question id:", q.question.id, " question number:", q.question.question_number, " content:", q.question.content));
        
        if (remainingQuestions.length === 1 && !isFetching.current) {
          isFetching.current = true;
      
          if (!reviewMode) {
            //console.log("\nNormal state. Remaining questions size is 1, fetching more questions from server. Remaining questions length:", remainingQuestions.length);
            const last_question_remaining = remainingQuestions[remainingQuestions.length - 1];
            api.post(`/english/quizzes/${quiz_id}/questions/${last_question_remaining?.question.question_number + 1}`,
              { quiz_attempt_id: quizAttempt?.id },
            )  // send the current question number
              .then((response) => {
                //console.log("More fetched questions from server:");
                //response.data.questions.forEach((q: QuestionProps) => console.log("Question id:", q.id, " question number:", q.question_number, " content:", q.content));
                //console.log("---- has_more flag from server:", response.data.has_more);
                setRemainingQuestions(prev => [...prev, ...response.data.questions.map((q: QuestionProps) => ({ question: q }))]);
                //setHasMoreNormalQuestions(response.data.has_more);
                isFetching.current = false;
              })
              .catch(() => { isFetching.current = false; });
            }
            else {
              //console.log("\nIn REVIEW state. Remaining questions size is 1, need to replenish more incorrectly answered questions from server if there are more to review. Remaining questions length:", remainingQuestions.length);
   
              const questionAttemptNumber = remainingQuestions[remainingQuestions.length - 1].question_attempt_number;
              //console.log("In REVIEW state. The question attempt number of the last remaining question is:", questionAttemptNumber);
              if (questionAttemptNumber !== undefined) {
                //console.log("In REVIEW state.questionAttemptNumber is NOT undefined. Calling replenishIncorrectQuestions to fetch more incorrectly answered questions from server to review, starting from question attempt number:", questionAttemptNumber);
                replenishIncorrectQuestions(questionAttemptNumber);
              } else {
                console.error("?????????? ??Question attempt number for last question in remaingingQuestion is undefined.");
              }
            }


        }



        //for a smooth user experience while waiting for the server response to create the next question attempt. Next question id:", remainingQuestions[0].question.id);
  }
  else if (remainingQuestions.length == 0) { 
      // no next question id means end of quiz reached
      //console.log("handleCorrectModalTimeout. No more remaining questions. QuizHasErrors:", quizHasErrors.current);
      if (quizHasErrors.current) {
        console.log(" No more question, but quiz has errors");
        setReviewMode(true);
        //setEndOfQuiz(true); //test only
      }
      else {
        //console.log(" NO more question, and no errors in quiz attempt, marking quiz attempt as completed in server and setting endOfQuiz to true to show end of quiz screen. Quiz attempt id:", quizAttempt.id);
         setEndOfQuiz(true);
      }
      //alert("You have completed the quiz!");
  }
  else {
      console.error("????????????? Unexpected state: remainingQuestions length is negative:", remainingQuestions.length);
  }
};


useEffect(() => {
  if (reviewMode) {
   //console.log(" Entering review state, loading incorrectly answered questions to review from server.");
   const loadQuestions = async () => {
     //console.log("Calling loadIncorrectQuestions to Load incorrectly answered questions from server to review. Quiz attempt id:", quizAttempt.id);
     const result = await loadIncorrectQuestions();
     if (result) {
       //console.log(" loadIncorrectQuestions returns a question to review. Question id:", result.question.id, " question number:", result.question.question_number, " content:", result.question.content);
       const { question } = result;
       setQuestion(question);
       //console.log(" first question to review loaded from server:", question);
     }
     else {
       console.log(" loadIncorrectQuestions returns no questions"); 
   };
  
  }
  loadQuestions();
  }
}, [reviewMode]);

 const handleSubmit = () => {
  //setShowQuestion(false); //
  //timerRef.current?.stop();
  const url = `/api/question_attempts/${questionAttemptId}/process/`;
  const uanswer = childRef.current?.getAnswer();  
  const aKey = question?.answer_key;
  
  api.post<ProcessQuestionAttemptResultsProps>(url, { format: question?.format, user_answer: uanswer, answer_key: aKey })
  .then((res) => {
    // server returns the next question id (if any), together with assessment results 
    //console.log("---->>>> Received response from server after processing question attempt:", res.data);
    setQuestion(undefined)
    const { assessment_results, quiz_attempt_has_errors } = res.data;
    //console.log("Assessment results from server:", assessment_results);
    quizHasErrors.current = quiz_attempt_has_errors;
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
      { format === 1 && <DynamicWordInputs content={content} ref={childRef} /> }
      { format === 2 && <ButtonSelectCloze content={content} choices={question?.button_cloze_options} ref={childRef} /> }
      { format === 3 && <ButtonSelect content={content} ref={childRef} /> }
      { format === 4 && <RadioQuestion content={content} ref={childRef} /> }
      { format === 5 && <CheckboxQuestion content={content} ref={childRef} /> }
      { format === 6 && <DragDrop content={content} ref={childRef} /> }
      { format === 7 && <SRNonContinuous content={content} ref={childRef} /> }
      { format === 8 && <WordsSelect content={content} ref={childRef} /> }
      { format === 10 && <DropDowns content={content} ref={childRef} /> }
      { format === 12 && <SentenceScramble content={content} ref={childRef} /> }
    </div>
  );
};

const loadIncorrectQuestions = async (): Promise<{question: QuestionProps, question_attempt_number: number} | null> => {
  isFetching.current = true;
  console.log("Fetching incorrectly answered questions from server for quiz attempt id:", quizAttempt?.id);
  try {
    const response = await api.post<IncorrectQuestionsResponse>(`/api/quiz_attempts/${quizAttempt?.id}/incorrect_questions/`, {
      starting_question_attempt_number: 1,   // start searching for incorrectly answered questions from the first question attempt in the quiz attempt. 
      number_of_questions_to_load: 2, // adjust this number to your taste
    });
    //console.log("Incorrect questions LOADED: response data:", response.data);
    // add loaded questions to remainingQuestions state, excluding the first question
    // which will be set as the current question to review, 
    // add loaded questions to remainingQuestions state.
    const first_of_all_loaded_questions = response.data.incorrect_questions.length > 0 ? response.data.incorrect_questions[0] : null;
    const all_loaded_questions_except_first = response.data.incorrect_questions.slice(1).map((item: IncorrectQuestionProps) => ({
      question: item.question,
      question_attempt_number: item.question_attempt_number,
    }));
    setRemainingQuestions(prev => [...prev, ...all_loaded_questions_except_first]);

    if (response.data.incorrect_questions.length > 0) {
      console.log("RETURN First incorrectly answered question loaded from server to review. Question id:", first_of_all_loaded_questions?.question.id, " question number:", first_of_all_loaded_questions?.question.question_number, " content:", first_of_all_loaded_questions?.question.content);
      return {
        question: first_of_all_loaded_questions?.question ?? {} as QuestionProps,
        question_attempt_number: first_of_all_loaded_questions?.question_attempt_number ?? 0,
      }
    }
    else {
      return null;
    }
    //return response.data.incorrect_questions.length > 0 ? response.data.incorrect_questions[0].question : null; // Return the first incorrectly answered question to review, or null if there are no incorrectly answered questions
    
  } catch (error) {
    console.error("Error fetching incorrectly answered questions:", error);
    return null;
  } finally {
    isFetching.current = false;
  }
}

const replenishIncorrectQuestions = async (starting_question_attempt_number: number): Promise<{question: QuestionProps, question_attempt_number: number} | null> => {
  // const replenishIncorrectQuestions = async (starting_question_attempt_number: number) => {
    //console.log("------>>>>><<<<<<<<<< replenishIncorrectQuestions <<<<called for starting question att number", starting_question_attempt_number);
    isFetching.current = true;
    //console.log("replenish_incorrect_questions incorrectly answered questions from server for quiz attempt id:", quizAttempt?.id);
    try {
      const response = await api.post<IncorrectQuestionsResponse>(`/api/quiz_attempts/${quizAttempt?.id}/replenish_incorrect_questions/`, {
        starting_question_attempt_number,   // start searching for incorrectly answered questions from the first question attempt in the quiz attempt. 
        number_of_questions_to_load: 2, // adjust this number to your taste
      });
      console.log("replenishIncorrectQuestions, Incorrect questions LOADED:");
      //response.data.incorrect_questions.forEach((item: IncorrectQuestionProps) => {
       // console.log(" Question id:", item.question.id, " Question attempt number:", item.question_attempt_number, " content:", item.question.content);
      //});
      // add loaded questions to remainingQuestions state, excluding the first question
      // which will be set as the current question to review, 
      // add loaded questions to remainingQuestions state.
      const first_of_all_loaded_questions = response.data.incorrect_questions.length > 0 ? response.data.incorrect_questions[0] : null;
      const all_loaded_questions_except_first = response.data.incorrect_questions.slice(1).map((item: IncorrectQuestionProps) => ({
        question: item.question,
        question_attempt_number: item.question_attempt_number,
      }));
      setRemainingQuestions(prev => [...prev, ...all_loaded_questions_except_first]);
  
      if (response.data.incorrect_questions.length > 0) {
        //console.log("replenishIncorrectQuestions RETURN First incorrectly answered question loaded from server to review. Question id:", first_of_all_loaded_questions?.question.id, " question number:", first_of_all_loaded_questions?.question.question_number, " content:", first_of_all_loaded_questions?.question.content);
        return {
          question: first_of_all_loaded_questions?.question ?? {} as QuestionProps,
          question_attempt_number: first_of_all_loaded_questions?.question_attempt_number ?? 0,
        }
      }
      else {
        return null;
      }
      //return response.data.incorrect_questions.length > 0 ? response.data.incorrect_questions[0].question : null; // Return the first incorrectly answered question to review, or null if there are no incorrectly answered questions
      
    } catch (error) {
      console.error("Error fetching incorrectly answered questions:", error);
      return null;
    } finally {
      isFetching.current = false;
    }
   
  }

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
    <div className="flex flex-col items-center bg-amber-100 mx-40">
   
      { question && (
          <>
          {SafeHTML({ content: question.instructions ?? "" }) }

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
            <button className='bg-green-700 text-white mx-10 mt-7 p-2 rounded-md hover:bg-red-700'
                onClick={() => handleSubmit()}
            >
                Submit
                </button>
          </>
      )}
       {showCorrectModal && <CorrectModal score={questionAttemptAssessmentResults?.score}/>}
       {showIncorrectModal && <IncorrectModal 
        parentCallback={handleFeedbackModalClose} 
        format={question?.format ?? 1}
        content={question?.content ?? ""}
        answer_key={question?.answer_key ?? ""}
        explanation={question?.explanation ?? ""}
        processQuestionResults={questionAttemptAssessmentResults as QuestionAttemptAssesmentResultsProps}
        />
      }
    </div>
  );
  };
  
  export default TakeQuiz;

  /*
          <div>Question Id: {question.id}</div>
          <div>Question Attempt Id: {questionAttemptId}</div>
   <div>Review: {reviewMode.toString()}</div>
      <div>QuizHasErrors: {quizHasErrors.current.toString()}</div>
      <div>Remaining Questions: 
        {remainingQuestions.map((q, index) => (
          <div key={index}>
            <span>Question id: {q.question.id}</span>
            <span>Question attempt number: {q.question_attempt_number}</span>
        </div>
        ))}
      </div>
  */

  
