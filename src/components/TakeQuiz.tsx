
import { useParams } from 'react-router-dom';
//import api from "../api";
import { useEffect, useRef, useState } from 'react';
//import { useQuiz } from '../hooks/useQuiz';
import { useQuizAttempt } from '../hooks/useQuizAttempt';
import { useQuestionAttempt } from '../hooks/useQuestionAttempt';
import QuizStartModal from './QuizStartModal';
import api from '../api';
import RedoQuestionModal from './RedoQuestionModal';
import { DynamicWordInputs } from './questions/DynamicWordInputs';
import { ButtonSelectCloze } from './questions/ButtonSelecCloze';
import { RadioQuestion } from './questions/RadioQuestion';
import { DropDowns } from './questions/DropDowns';
import { ButtonSelect } from './questions/ButtonSelect';
import { CheckboxQuestion } from './questions/CheckboxQuestion';
import DragDrop from './questions/dragdrop/DragDrop';
import { SRContinuous } from './questions/SRContinuous';
import { WordsSelect } from './questions/WordsSelect';
import { DynamicLetterInputs } from './questions/DynamicLetterInputs';
import { processQuestion } from './processQuestion';

export interface ChildRef {
    getAnswer: () => string | undefined;
  }

function TakeQuiz() {

   const {quiz_id } = useParams<{ sub_category_id: string, quiz_id: string }>();
   const [fetchQuizEnabled, setFetchQuizEnabled] = useState(true)  // only fetch quiz once
   //setNextQuestionEnabled(true)  
   const [newQuestionAttemptEnabled, setNewQuestionAttemptEnabled] = useState(false)  // only fetch next question once

    const [showStartModal, setShowStartModal] = useState<boolean|null>(false);

    const [questionData, setQuestionData] = useState<any>(null);

    const [quizAttempt, setQuizAttempt] = useState<any>(null);

    const [questionAttemptId, setQuestionAttemptId] = useState<number | null>(null);

    const [quizAttemptCreated, setQuizAttemptCreated] = useState<boolean | null>(null);
    
    const [showRedoModal, setShowRedoModal] = useState<boolean|null>(false);

    const [redoInProgress, setRedoInProgress] = useState<boolean>(false);
    // indicates whether a redo of erroneous attempts is in progress

    const childRef =  useRef<ChildRef>(null);
/*
 useQuizAttempt = (quiz_id: string, _video_url: string | null, user_id: string, enabled: boolean) => {
  const { data: quizAttemptData } = useQuizAttempt(
    quiz_id ? quiz_id : "",
    null,
    localStorage.getItem("user_id") || "",
    fetchQuizEnabled
);
 */

   // Call useQuizAttempt and destructure the response
   const { data: quizAttemptData } = useQuizAttempt(
    quiz_id ? quiz_id : "",
    null,
    "2",  // use a fixed user id for now
    fetchQuizEnabled
);

   
    const {data: questionAttemptData} = useQuestionAttempt(
        quizAttempt ? quizAttempt.id : "",
        questionData ? (questionData.question_number + 1) : 0,
        newQuestionAttemptEnabled
    );

    useEffect(() => {
        if (questionAttemptData) {
            //console.log("Next question attempt data loaded:", questionAttemptData);
            // destructure question, question_attempt_id from questionAttemptData
            setQuestionData(questionAttemptData.question);
            setQuestionAttemptId(questionAttemptData.question_attempt_id);
            setNewQuestionAttemptEnabled(false); // disable further fetching for next question attempt
        }
    }, [questionAttemptData]);

    useEffect(() => {
        if (quizAttemptData) {
            setFetchQuizEnabled(false); // disable further fetching for quiz_attempt
            //console.log("quiz_attempt loaded:", quizAttemptData);
           // Destructure the fields from quizAttemptData
            const { created } = quizAttemptData || {};           
           // if a quiz attempt already exists, show a pop up modal to ask if the user wants to continue or start over
           if (created === false) {
                //console.log(" quiz attempt already exists. Show modal to continue or start over.");
                //alert("You have already started this quiz. Do you want to continue where you left off or start over?");
                // Implement modal with options to continue or start over
                setQuizAttempt(quizAttemptData.quiz_attempt);
                setShowStartModal(true);
                setQuizAttemptCreated(false);

            } else {
                //console.log(" quiz attempt created.")
                setQuizAttemptCreated(true);
                // proceed to create quiz attempt for first question
                /*
                    return Response({
                    "quiz_attempt": serializer.data,
                    "created": True,
                    "question": first_question,
                    "question_attempt_id": question_attempt.id,
                })
                */
                // destructure question, question_attempt_id from quizAttemptData
                setQuizAttempt(quizAttemptData.quiz_attempt);
                setQuestionAttemptId(quizAttemptData.question_attempt_id);
                setQuestionData(quizAttemptData.question);
                setShowStartModal(false);
              }
            //setFetchQuizEnabled(false); // disable further fetching for quiz_attempt
            //setNewQuestionAttemptEnabled(true); // enable fetching next question attempt
        }
    }, [quizAttemptData]);

  const handleCallback = (choice: string) => {
    
    //console.log("Parent received choice from modal:", choice);
    
    // proceed based on user choice
    if (choice === "cancel") {
        // user cancelled, do nothing
        //return;
    } else if (choice === "continue") {
        // continue existing quiz attempt
        api.get(`/api/quiz_attempts/${quizAttempt.id}/continue/`)
        .then ((res) => {
            //console.log("Continuing quiz attempt:", res.data);
            // destructure question from res.data
            const { question } = res.data;
            //console.log("Next question to continue:", question);
            setQuestionData(question);
            setQuestionAttemptId(res.data.question_attempt_id);
        })
        .catch((err) => alert(err));
    } else if (choice === "start_over") {
        // reset quiz attempt on server
        api.get(`/api/quiz_attempts/${quizAttempt.id}/reset/`)
        .then((res) => {
            //console.log("Quiz attempt reset:", res.data);
            // destructure question from res.data
            const { question } = res.data;
            //console.log("First question after reset:", question);
            setQuestionData(question);
            setQuestionAttemptId(res.data.question_attempt_id);
            // proceed to create question attempt for first question
        })
        .catch((err) => alert(err));
        //
        // then, start a new question attempt for first question of this quiz
        // 
    }
    setShowStartModal(false);
  }

  const processQuestionAttempt = () => {
    //alert("here processQuestionAttempt ")
    const the_answer = childRef.current?.getAnswer()
    if (the_answer === undefined) {
        alert("Please provide an answer before submitting.");
        return;
    }
    if (the_answer.trim().length === 0) {
        alert("Answer cannot be empty. Please provide an answer before submitting.");
        return;
    }
        const result = processQuestion(questionData?.format?.toString() ?? "", questionData?.answer_key ?? "", the_answer ?? "")
        console.log("processQuestionAttempt result=", result)
       
    setQuestionData(null);
    let url = `/api/question_attempts/${questionAttemptId}/update/`;
    if (redoInProgress) {
        url = `/api/question_attempts/${questionAttemptId}/update_during_redo/`;
    }
    //console.log("Submitting answer for question attempt id=", questionAttemptId, " to url=", url, " error=", error);
    //api.post(`/api/question_attempts/${questionAttemptId}/update/`, {
    api.post(url, result)
    .then((res) => {
        setTimeout(() => {
            //setSubmitDisabled(false);
            //setShowNextButton(true);
            //console.log("Question attempt processed. Response data=", res.data);
            if (res.data.question === null) {
                //alert("Quiz completed!");
                setQuestionData(null);
                if (res.data.question == null) {
                    //alert(JSON.stringify(res.data));
                    //console.log(" ************** Message:", res.data.message);
                    if (res.data.message.includes("redo")) {
                        setShowRedoModal(true);
                    }
                    else {
                        alert("Quiz completed!");
                    }
                }
                return;
            }
            setQuestionData(res.data.question);
            setQuestionAttemptId(res.data.question_attempt_id);
        }, 200); // re-enable after 2 seconds
     
        // handle response here
    })
    .catch((err) => alert(err));
    // handle answer submission here
    
 /*
{
    "answer": "  am",
    "score": 5,
    "error_flag": false
}
        */
    

    /*
    let url = `/api/question_attempts/${questionAttemptId}/update/`;
    if (redoInProgress) {
        url = `/api/question_attempts/${questionAttemptId}/update_during_redo/`;
    }
    //console.log("Submitting answer for question attempt id=", questionAttemptId, " to url=", url, " error=", error);
    //api.post(`/api/question_attempts/${questionAttemptId}/update/`, {
    api.post(url, {
        error_flag : error, score: 5, answer: "sample answer" 
    })
    .then((res) => {
        setTimeout(() => {
            //setSubmitDisabled(false);
            //setShowNextButton(true);
            //console.log("Question attempt processed. Response data=", res.data);
            if (res.data.question === null) {
                //alert("Quiz completed!");
                setQuestionData(null);
                if (res.data.question == null) {
                    //alert(JSON.stringify(res.data));
                    //console.log(" ************** Message:", res.data.message);
                    if (res.data.message.includes("redo")) {
                        setShowRedoModal(true);
                    }
                    else {
                        alert("Quiz completed!");
                    }
                }
                return;
            }
            setQuestionData(res.data.question);
            setQuestionAttemptId(res.data.question_attempt_id);
        }, 200); // re-enable after 2 seconds
     
        // handle response here
    })
    .catch((err) => alert(err));
    // handle answer submission here
    */
  }

  /*
return Response({
                    "message": "QuestionAttempt updated successfully. No more questions available in the quiz.",
                    "question_attempt_id": pk,
                    "question": None,
                })
  */

  const handleRedo = () => {
    setShowRedoModal(false);
    // reload the page to start over
    api.get(`/api/quiz_attempts/${quizAttempt.id}/redo_errorneous_attempts/`)
    .then((res) => {
        //console.log("Quiz attempt reset:", res.data);
        // destructure question from res.data
        const { question } = res.data;
        //console.log("First question after reset:", question);
        setQuestionData(question);
        setQuestionAttemptId(res.data.question_attempt_id);
        setRedoInProgress(true); // indicate that redo is in progress
        // so that we can handle question attempts differently 
        
    })
    .catch((err) => alert(err));
  }

  return (
    <>
    <div>Redo in progress: {redoInProgress.toString()}</div>
    {
        quizAttemptCreated &&
        <div className='bg-green-200 p-5 m-5'>
            <h2>Quiz attempt created: {quizAttemptCreated.toString()}</h2>
        </div>
    }

    { showRedoModal &&
        <RedoQuestionModal closeModal={handleRedo}/>
    }
   
    { showStartModal &&
        <QuizStartModal parentCallback={handleCallback}/>
    }
          {questionData &&
              <div className='m-10 p-10 border-2 border-blue-500'>
                  <h2>Question: {questionData.question_number}, Question Id: {questionData.id}</h2>
                  <div>
                    {questionData.format === 1 &&
                         <DynamicWordInputs content={questionData.content} ref={childRef} />
                    }
                    {questionData.format === 2 &&
                        <ButtonSelectCloze content={questionData.content} choices={questionData.button_cloze_options}  ref={childRef} />
                    }
                    {questionData.format === 3 &&
                         <ButtonSelect content={questionData.content} ref={childRef} />
                    }
                    {questionData.format === 4 &&
                         <RadioQuestion content={questionData.content} ref={childRef} />
                    }
                    {questionData.format === 5 &&
                         <CheckboxQuestion content={questionData.content} ref={childRef} />
                    }
                    {questionData.format === 6 &&
                        <DragDrop content={questionData.content} ref={childRef} />
                    }
                    {questionData.format === 7 &&
                         <SRContinuous content={questionData.content} ref={childRef} />
                    }
                    {questionData.format === 8 &&
                         <WordsSelect content={questionData.content} ref={childRef} />
                    }
                    {questionData.format === 10 &&
                         <DropDowns content={questionData.content} ref={childRef} />
                    }
                    { questionData.format === 11 &&
                         <DynamicLetterInputs content={questionData.content} ref={childRef} />
                    }
                  </div>
             
                  <button className='bg-red-400 text-white mx-10 hover:bg-red-700'
                      onClick={() => processQuestionAttempt()} 
                  >Submit</button>

        

              </div>
          }
 
    </>
  )
}

export default TakeQuiz

/*
  if (question?.format === 1) {  //word scramble
            return (
                <div>
                 <DynamicWordInputs content={question.content} ref={childRef} />
                </div>
            )
        }
*/
