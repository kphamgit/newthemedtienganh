
import { useParams } from 'react-router-dom';
//import api from "../api";
import { useEffect, useRef, useState } from 'react';
//import { useQuiz } from '../hooks/useQuiz';
import { useQuizAttempt } from '../hooks/useQuizAttempt';
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
import { Explanations } from './Explanations';
import SentenceScramble from './questions/SentenceScramble';

export interface ChildRef {
    getAnswer: () => string | undefined;
  }

function TakeQuiz() {

   const {quiz_id } = useParams<{ sub_category_id: string, quiz_id: string }>();
   const [fetchQuizAttemptEnabled, setFetchQuizAttemptEnabled] = useState(true)  // only fetch quiz once
   //setNextQuestionEnabled(true)  
    const [showStartModal, setShowStartModal] = useState<boolean|null>(null);

    const [questionData, setQuestionData] = useState<any>(null);

    const [quizAttempt, setQuizAttempt] = useState<any>(null);

    const [questionAttemptId, setQuestionAttemptId] = useState<number | null>(null);

    //const [_quizAttemptCreated, setQuizAttemptCreated] = useState<boolean | null>(null);
    
    const [showRedoModal, setShowRedoModal] = useState<boolean|null>(false);

    const [redoInProgress, setRedoInProgress] = useState<boolean>(false);
    const [showExplanation, setShowExplanation] = useState<boolean>(false);

    const [showSubmitButton, setShowSubmitButton] = useState<boolean>(true);

    // indicates whether a redo of erroneous attempts is in progress
    //const tempQuestionHolder = useRef<any>(null);

    const childRef =  useRef<ChildRef>(null);

   // Call useQuizAttempt and destructure the response
   const { data: quizAttemptData } = useQuizAttempt(
    quiz_id ? quiz_id : "",
    null,
    "2",  // use a fixed user id for now
    fetchQuizAttemptEnabled
);

    useEffect(() => {
        if (quizAttemptData) {
            setFetchQuizAttemptEnabled(false); // disable further fetching for quiz_attempt
            //console.log("quiz_attempt loaded:", quizAttemptData);
           // Destructure the fields from quizAttemptData
            const { created } = quizAttemptData || {};  
            setQuizAttempt(quizAttemptData.quiz_attempt);         
           // if a quiz attempt already exists, show a pop up modal to ask if the user wants to continue or start over
           if (created === false) {
                //console.log(" quiz attempt already exists. Show modal to continue or start over.");
                //alert("You have already started this quiz. Do you want to continue where you left off or start over?");
                // Implement modal with options to continue or start over
                console.log(" quiz attempt already exists. quizAttemptData:", quizAttemptData);
                // quizAttemptData contains the quiz attempt info
                // quizAttemptData ALSO contains the last question attempt ID
                // and question data if applicable (in case the server detected
                // that the last question unfinished IS the first question of the quiz)
                // check if quizAttemptData.question is present
                if (quizAttemptData.question) { // the last quesion unfinished is the first question of the quiz
                    console.log(" There is a last question to continue from. question data:", quizAttemptData.question);
                    setQuestionData(quizAttemptData.question);
                    setQuestionAttemptId(quizAttemptData.last_question_attempt_id);
                    setShowSubmitButton(true);
                    setShowStartModal(null); // no need to show start modal
                    //return; // exit here
                }
                else {
                    setShowStartModal(true);
                }
            } else {
                console.log(" quiz attempt created. First question: ", quizAttemptData.question);
                //setQuizAttemptCreated(true);
                // proceed to create quiz attempt for first question
                /*
                    return Response({
                    "quiz_attempt": serializer.data,
                    "created": True,
                    "question": first_question,
                    "question_attempt_id": question_attempt.id,
                })
                */
                setQuestionAttemptId(quizAttemptData.question_attempt_id);
                
                setQuestionData(quizAttemptData.question);
                setShowSubmitButton(true);
                setShowStartModal(null);
              }
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
            console.log("Continuing quiz attempt:", res.data);
            // destructure question from res.data
            const { question } = res.data;
            //console.log("Next question to continue:", question);
            setQuestionData(question);
            setShowSubmitButton(true);
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
            setShowSubmitButton(true);
            setQuestionAttemptId(res.data.question_attempt_id);
            // proceed to create question attempt for first question
        })
        .catch((err) => alert(err));
        //
        // then, start a new question attempt for first question of this quiz
        // 
    }
    setShowStartModal(null);
  }

  /*
 export interface QuestionAttempResultsProps {
    answer: string | undefined,
    score: number,
    error_flag: boolean,
}
  */



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
    
    console.log("processQuestionAttempt..... the_answer=", the_answer);
    //const result0 = processQuestion(questionData?.format?.toString() ?? "", questionData?.answer_key ?? "", the_answer ?? "")

    //console.log("processQuestionAttempt result0=", result0);

    //return ;
    const result = processQuestion(questionData?.format?.toString() ?? "", questionData?.answer_key ?? "", the_answer ?? "")
    console.log("processQuestionAttempt result=", result)
       /*
{
    "answer": "three",
    "score": 0,
    "error_flag": true
}
       */
    
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
            //console.log("processQuestionAttempt Response from server after submitting answer:", res.data);
            if (result?.error_flag === true) {
                //console.log(" there was an error in your answer.");
                //console.log(" New question received.", res.data.question);
                setShowExplanation(true);
                setShowSubmitButton(false);
                //tempQuestionHolder.current = res.data.question;
             }  
             else {
                //console.log(" processQuestionAttempt answer was correct. Moving to next question.");
                if (res.data.question) {
                    //console.log(" Next question data=", res.data.question);
                    setQuestionData(res.data.question);
                    setShowSubmitButton(true);
                    setQuestionAttemptId(res.data.question_attempt_id);
                }
             }
            //console.log("processQuestionAttempt Question attempt processed. Response data=", res.data);
            // check req.data.message for end of quiz message
            if (res.data.message && res.data.message.includes("No more questions")) {
                if (res.data.message.includes("there are errorneous questions")) {
                    //console.log("No more questions in quiz! However, there are erroneous questions to redo.");
                    setShowRedoModal(true);
                }
                else {
                    alert("No more questions. Quiz completed!");
                    setQuestionData(null);
                    setShowSubmitButton(false);
                }
            }
            else if (res.data.message && res.data.message.includes("completed")) {
                alert("Quiz completed!");
                setQuestionData(null);
                setShowSubmitButton(false);
            }

           
        }, 500); // re-enable after 2 seconds
     
        // handle response here
    })
    .catch((err) => alert(err));
    // handle answer submission here
  }

  const handleRedo = () => {
    setShowRedoModal(false);
    console.log("Redoing erroneous question attempts...");
    // reload the page to start over
    //redoInProgress.current = true;
    //setNewQuestionAttemptRedoEnabled(true); // trigger fetching next question attempt in redo mode
    
    api.post(`/api/quiz_attempts/${quizAttempt.id}/create_next_question_attempt_redo/`, {

    })
    .then((res) => {
        //console.log("handleRedo: res.data=", res.data);
        const { question } = res.data;
        //console.log("handleRedo, question:", question);
        //setQuestionData(null);
        setQuestionData(question);
        setQuestionAttemptId(res.data.question_attempt_id);
        setRedoInProgress(true); // indicate that redo is in progress
        // so that we can handle question attempts differently 
        
    })
    .catch((err) => alert(err));
    
  }

  const displayQuestion = (format: string) => {
        if (format === "1") {
            return <DynamicWordInputs content={questionData.content} ref={childRef} />
        }
        else if (format === "2") {
            return <ButtonSelectCloze content={questionData.content} choices={questionData.button_cloze_options}  ref={childRef} />
        }
        else if (format === "3") {
            return <ButtonSelect content={questionData.content} ref={childRef} />
        }
        else if (format === "4") {
            return <RadioQuestion content={questionData.content} ref={childRef} />
        }
        else if (format === "5") {
            return <CheckboxQuestion content={questionData.content} ref={childRef} />
        }
        else if (format === "6") {
            return <DragDrop content={questionData.content} ref={childRef} />
        }
        else if (format === "7") {
            return <SRContinuous content={questionData.content} ref={childRef} />
        }
        else if (format === "8") {
            return <WordsSelect content={questionData.content} ref={childRef} />
        }
        else if (format === "10") {
            return <DropDowns content={questionData.content} ref={childRef} />
        }
        else if (format === "11") {
            return <DynamicLetterInputs content={questionData.content} ref={childRef} />
        }
        else if (format === "12") {
            return <SentenceScramble content= {questionData.content} ref={childRef} />
        }
  }

  /*
{
    "message": "No more questions available, but there are errorneous questions to review. Let's redo them.",
    "question_attempt_id": 273,
    "question": null
}
  */

  const continueQuiz = () => {
    //console.log("Continuing quiz... Enabling new question attempt fetch.");
    setShowExplanation(false);
    api.post(`/api/quiz_attempts/${quizAttempt.id}/create_next_question_attempt/`, {
        question_number: questionData.question_number
    })
    .then((res) => {
        //console.log("continueQuiz: res.data=", res.data);
        if (res.data.message && res.data.message.includes("errorneous questions to review") ) {
            //console.log("No more questions available, but there are erroneous questions to review. Let's redo them.");
            setQuestionData(null);
            setShowRedoModal(true);
            return;
        }
        
        const { question } = res.data;
        //console.log("continueQuiz, question:", question);
        setQuestionData(question);
        setShowSubmitButton(true);
        setQuestionAttemptId(res.data.question_attempt_id);
        // so that we can handle question attempts differently 
        
    })
    .catch((err) => alert(err));
    
    //setNewQuestionAttemptEnabled(true); // 
    }
  return (
    <>
    { showRedoModal &&
        <RedoQuestionModal closeModal={handleRedo}/>
    }
   
    { (showStartModal == true) &&
        <QuizStartModal parentCallback={handleCallback}/>
    }
   
    <div className='grid grid-cols-12 mx-16'> 
        <div className='col-span-8 m-1 p-10 border-2 border-blue-500 bg-gray-100'>
        {questionData &&
        <>
            <h2 className='mb-10'>Question: {questionData.question_number}, Question Id: {questionData.id}</h2>
            <div>
                    {displayQuestion(questionData.format.toString())}
            </div>
            { showSubmitButton &&
            <button className='bg-red-400 text-white mx-10 mt-7 hover:bg-red-700'
                      onClick={() => processQuestionAttempt()} 
            >
                Submit
            </button>
            }
            </>
        }
        </div>
        
        <div className='col-span-4 m-1 p-10 border-2 bg-gray-100 border-blue-500'>
           {
            showExplanation &&
            <div>
                <Explanations 
                    question={questionData}
                    response={{
                        answer: childRef.current?.getAnswer(),
                        score: 0,
                        error_flag: true
                    }} 
                />
                <button className='bg-green-400 '
                    onClick={() => continueQuiz()}
                >Continue</button>
            </div>
                }
        </div>
    </div>
    
 
    </>
  )
}

export default TakeQuiz


