

import { useEffect, useRef, useState } from 'react';
//import {  useParams } from 'react-router-dom';
import { useWebSocket } from './context/WebSocketContext';
import type { ProcessQuestionAttemptResultsProps, QuestionAttemptAssesmentResultsProps, QuestionProps } from './shared/types';
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


function TakeQuizLive() {
    //const { quiz_id } = useParams<{  quiz_id: string }>();
    const [receivedQuizId, setReceivedQuizId] = useState<string | null>(null);
    const [receivedQuestionNumber, setReceivedQuestionNumber] = useState("");
    const [question, setQuestion] = useState<QuestionProps | null>(null);
    const childRef = useRef<ChildRef>(null);
    const {eventEmitter} = useWebSocket();
    const [showQuestion, setShowQuestion] = useState<boolean>(false); // work in conjunction with questionAttemptData 

    const [showCorrectModal, setShowCorrectModal] = useState(false);
    const [showIncorrectModal, setShowIncorrectModal] = useState(false);

    let correctModalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

     const [questionAttemptAssessmentResults, setQuestionAttemptAssessmentResults] = 
            useState<QuestionAttemptAssesmentResultsProps | null>(null);

            /*
    useEffect(() => {
        if (!websocketRef.current) {
          //alert('ChatPage: WebSocket is not connected');
          return;
        }
        websocketRef.current.onmessage = (e) => {
          let data : WebSocketMessageProps = JSON.parse(e.data);
          console.log('TakeQuizLive: Received message from server:', data);
         
          if (data.message_type === 'quiz_id') {
            console.log('TakeQuizLive: Received Quiz ID message from server:', data);
            console.log("TakeQuizLive: Quiz ID received from server: " + data.message); //note that data.message is the quiz id
            setReceivedQuizId(data.message);
            //const api_url = `/take_quiz_live/${data.message}`;
          }
          if (data.message_type === 'question_number') {
            console.log('TakeQuizLive: Received Question ID message from server:', data);
            console.log("TakeQuizLive: Question Number received from server: " + data.message); //note that data.message is the quiz id
            console.log("TakeQuizLive: showQuestion status =", showQuestion);
            setReceivedQuestionNumber(data.message);
            //const api_url = `/take_quiz_live/${data.message}`;
          }
         };
         
      }, [websocketRef.current]);
*/
      
useEffect(() => {
    const handleMessage = (data: any) => {
      if (data.message_type === "quiz_id") {
        console.log("ChatPage: Received chat message:", data.message);
        setReceivedQuizId(data.message);
      }
      if (data.message_type === "question_number") {
        setReceivedQuestionNumber(data.message);
      }
    };

    // Subscribe to the "message" event
    eventEmitter?.on("message", handleMessage);

    // Cleanup the event listener on unmount
    return () => {
      eventEmitter?.off("message", handleMessage);
    };
  }, [eventEmitter]); // Only include eventEmitter in the dependency array

    
      useEffect(() => {
         // call api to get quiz question data for quizId and questionId
         // only if both quizId and questionNumber are set
            if (!receivedQuizId ) {
                console.log("TakeQuizLive: receivedQuizId is not set.");
                return;
            }
            if (receivedQuizId === "" || receivedQuestionNumber === "") {
                return;
            }
            // if there's a current question being shown, do not fetch new question
            if (showQuestion === true) {
                console.log("TakeQuizLive: Ignoring new question fetch because user is still working on current question.");
                return;
            }
         api.get(`/api/quizzes/${receivedQuizId}/questions/${receivedQuestionNumber}/`)
            .then((res) => res.data)
            .then((data) => {
                console.log("TakeQuizLive: Quiz Question Data:", data);
                // you can set state here to store question data
                setQuestion(data);
                setShowQuestion(true);
            })
            .catch((err) => console.log("TakeQuizLive: Error fetching quiz question data:", err));

      }, [receivedQuizId, receivedQuestionNumber]);
    
    function SafeHTML({ content }: { content: string }) {
        const sanitizedContent = DOMPurify.sanitize(content, {
          USE_PROFILES: { html: true },
          ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br', 'span', 'div', 'img'],
          ALLOWED_ATTR: ['href', 'target', 'rel']
        });
        return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
      }

      const handleSubmit = () => {
            console.log("TakeQuizLive: handleSubmit called");
            setShowQuestion(false); //
            // clear quizID and questionNumber to prepare for next question
            //setQuizId("");
            setReceivedQuestionNumber("");

            // stop countdown timer
            //counterRef.current?.stop();
            //console.log("handleSubmit called for user ansswer=", childRef.current?.getAnswer());
            const url = `/api/process_live_question_attempt/`;
            //console.log("POSTing to url =", url);
            
            api.post<ProcessQuestionAttemptResultsProps>(url, { format: question?.format , user_answer: childRef.current?.getAnswer(), answer_key: question?.answer_key })
              .then((res) => {     
                const { assessment_results } = res.data;
                setQuestionAttemptAssessmentResults(assessment_results);
                //alert("Score for this question: " + JSON.stringify(assessment_results) );
               
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

      const handleCorrectModalTimeout = () => {
        //console.log("handleCorrectModalTimeout called. nextQuestionId =", nextQuestionId.current);
        setShowCorrectModal(false);
      };

      const handleInCorrectModalClose = () => {
        setShowIncorrectModal(false);
        //console.log("handleCorrectModalTimeout called. nextQuestionId =", nextQuestionId.current);
      };

      const displayHeading = () => {
        if (receivedQuizId && question) {
            return `Quiz ID: ${receivedQuizId}`;
        }
        else if (receivedQuizId) {
            return `Live Quiz. Quiz Id: ${receivedQuizId}`;
        }
     
      }

      const displayShowQuestionStattus = () => {
        // only display status if receivedQuizId is set
        if (receivedQuizId) {
            if (showQuestion) {
                return <div>Question number: {question?.question_number}</div>
            }
            else {
                return "Waiting for question ...";
            }
            
        }
      }

      /*
 { quizId &&
        <div className='flex flex-row bg-amber-100 justify-center p-2 m-2 border-2 border-gray-300 rounded-md'>
        <div>TakeQuizLive</div>
        <div>Quiz ID: {quizId}</div>
        </div>
        }
        {questionNumber && <div>Question Number: {questionNumber}</div>
        }
      */

  return (
    <div className=' bg-cyan-100  h-full w-full'>
       

        { 
        <div className='flex flex-row bg-amber-100 justify-center p-2 m-2 border-2 border-gray-300 rounded-md'>
        {displayHeading() }
        </div>
        }
  
        { displayShowQuestionStattus() }

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
      
        
        {question  && showQuestion && (
            <div className="col-span-8 mx-10 my-5 p-10 border-2 border-gray-200 rounded-md bg-grat-100">
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