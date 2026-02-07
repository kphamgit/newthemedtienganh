

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
import { updateLiveScore } from '../redux/connectedUsersSlice';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../redux/store';
import { WordsSelect } from './questions/WordsSelect';

interface TakeQuizLiveProps {
    quiz_id: string;
    question_number?: string;
    parent_callback: () => void;   // to notify parent component when a question is finished ( or the quiz is finished??)
}

function TakeQuizLive({ quiz_id, question_number , parent_callback}: TakeQuizLiveProps) {
    //const { quiz_id } = useParams<{  quiz_id: string }>();
    //const [quiz_id, setReceivedQuizId] = useState<string | null>(null);

    const [question, setQuestion] = useState<QuestionProps | null>(null);
    const childRef = useRef<ChildRef>(null);
    const {websocketRef} = useWebSocket();
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
        // clear users Total Live Score in redux store when component mounts
        dispatch(updateLiveScore({name: name || '', live_score: 0}));
      }, []);

      useEffect(() => {
       //console.log("TakeQuizLive: quiz_id or question_number changed. quiz_id =", quiz_id, " question_number =", question_number);
         // call api to get quiz question data for quizId and questionId
         // only if both quizId and questionNumber are set
            if (!quiz_id ) {
               //console.log("TakeQuizLive: quiz_id is not set.");
                return;
            }
            if (quiz_id === "" || question_number === "") {
                return;
            }
            // if there's a current question being shown, do not fetch new question
            if (finishedLiveQuestion.question_number === question_number && finishedLiveQuestion.status === false) {
               //console.log("TakeQuizLive: Ignoring new question fetch because user is still working on current question.");
                return;
            }
            // if question_number is not set, do not fetch question
            if (!question_number ) {
               //console.log("TakeQuizLive: question_number is not set.");
                return;
            }

         api.get(`/api/quizzes/${quiz_id}/questions/${question_number}/`)
            .then((res) => res.data)
            .then((data) => {
               //console.log("TakeQuizLive: Quiz Question Data:", data);
                // you can set state here to store question data
                setQuestion(data);
                setShowQuestion(true);
                setFinishedLiveQuestion({status: false, question_number: question_number}); // user is now working on this question
                // send event to server to indicate question has been received and 
                // I am working on it
                if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
                    const messageToSend = {
                        message_type: 'live_question_attempt_started',
                        message: `${question_number}`,
                        user_name: name // sender
                      };
                     //console.log("TakeQuizLive: &&&&&&&&& Sending live_question_attempt_started message to server for question number:", question_number);
                      websocketRef.current.send(JSON.stringify(messageToSend));
                }

            })
            .catch((err) => console.log("TakeQuizLive: Error fetching quiz question data:", err));

      }, [quiz_id, question_number]);
    
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
                    handleCorrectModalTimeout();
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

      const handleCorrectModalTimeout = () => {
        //console.log("handleCorrectModalTimeout called. nextQuestionId =", nextQuestionId.current);
        setShowCorrectModal(false);
        setFinishedLiveQuestion({status: true, question_number: question_number || ''});
        parent_callback(); // notify parent component that question is finished
      };

      const handleInCorrectModalClose = () => {
       //console.log("***** handleInCorrectModalClose called.");
        setShowIncorrectModal(false);
        setFinishedLiveQuestion({status: true, question_number: question_number || ''});
        parent_callback(); // notify parent component that question is finished
        //console.log("handleCorrectModalTimeout called. nextQuestionId =", nextQuestionId.current);
      };

      const displayHeading = () => {
        if (quiz_id && question) {
            return `Quiz ID: ${quiz_id}`;
        }
        else if (quiz_id) {
            return `Live Quiz. Quiz Id: ${quiz_id}`;
        }
     
      }

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
          live_question_number: question_number,
        };
        websocketRef.current.send(JSON.stringify(messageToSend));
      };

  return (
    <div className=' bg-cyan-50  h-full w-full'>
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