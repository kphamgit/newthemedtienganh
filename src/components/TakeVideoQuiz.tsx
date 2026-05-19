import React, { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../api';
import {  MediaPlayer, MediaProvider, useMediaRemote, useMediaStore, type MediaPlayerInstance } from '@vidstack/react';
//import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import type { ProcessQuestionAttemptResultsProps, QuestionAttemptAssesmentResultsProps, QuestionProps, QuizAttemptProps } from './shared/types';
import { useSelector } from 'react-redux';
import type { ChildRef } from './TakeQuiz';

import { DynamicWordInputs } from './questions/DynamicWordInputs';
import IncorrectModal from './IncorrectModel';
import { ButtonSelect } from "./questions/ButtonSelect";
import { RadioQuestion } from "./questions/RadioQuestion";
import { CheckboxQuestion } from "./questions/CheckboxQuestion";
import DragDrop from "./questions/dragdrop/DragDrop";
import { WordsSelect } from "./questions/WordsSelect";
import SentenceScramble from "./questions/SentenceScramble";
import { DropDowns } from "./questions/DropDowns";
import CorrectModal from './CorrectModal';
import SRNonContinuous from './questions/SRNonContinuous';
import OpenAIStream from './shared/OpenAIStream';
import { ButtonSelectCloze } from './questions/ButtonSelectCloze';



interface VideoSegment {
    id: number,
    quiz_id: number,
    segment_number: number,
    start_time: string,
    end_time: string,
    question_numbers: string
}

/*
{
  "id": 1,
  "quiz_id": 2,
  "segment_number": 1,
  "start_time": "0:00:000",
  "end_time": "0:10:500",
  "question_numbers": "2, 3, 136"
}
*/

interface QuestionsBankProps extends QuestionProps {
  finished: boolean; // whether the question has been attempted and processed by the server. Defaults to false.
}

export default function TakeVideoQuiz() {
    const location = useLocation();
    const { video_url, quiz_id, video_segments } = location.state || {};
    const playerRef = React.useRef<MediaPlayerInstance>(null);

    //const stopTime = useRef<number>(0);
    const [stopTime, setStopTime] = useState<number>(0);

    const { name } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);

    const remote = useMediaRemote(playerRef);
    // this hook acts aa "remote control" to control the video player (play, pause, seek, etc.)

    //const quizAttempt = useRef<QuizAttemptProps | null>(null);
    const [quizAttempt, setQuizAttempt] = useState<QuizAttemptProps | null>(null);

    const [activeSegmentNumber, setActiveSegmentNumber] = useState<number | undefined>(1) // 
   
    const [question, setQuestion] = useState<QuestionProps | undefined>()
    const [questionAttemptId, setQuestionAttemptId] = useState<number | null>(null);

    const [showQuestion, setShowQuestion] = useState<boolean>(false);
    const childRef = useRef<ChildRef>(null);

    const [showCorrectModal, setShowCorrectModal] = useState(false);
    const [showIncorrectModal, setShowIncorrectModal] = useState(false);

    const [questionAttemptAssessmentResults, setQuestionAttemptAssessmentResults] = 
            useState<QuestionAttemptAssesmentResultsProps | null>(null);
    
    let correctModalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
    //const [remainingQuestions, setRemainingQuestions] = useState<{question: QuestionProps, question_attempt_number?: number}[]>([]); // State to hold the remaining questions in the quiz attempt that have not been attempted yet. We initialize this as an empty array and populate it with the questions from the server response when we fetch or create the quiz attempt in the useEffect on component mount. When the user answers a question and clicks "Continue", we remove the next question to display from this remainingQuestions array and set it as the current question, so that we can have a smooth transition to the next question while waiting for the server response to create the next question attempt. We also use the length of this remainingQuestions array in another useEffect to determine when we are at the end of the currently loaded questions and need to fetch more questions from the server if there are more questions in the quiz (hasMoreQuestions is true).

    const [questionsBank, setQuestionsBank] = useState<QuestionsBankProps[]>([]); // State to hold all questions in the quiz attempt, including those that have been attempted and those that have not been attempted yet. We use this to keep track of which questions have been attempted and which questions are remaining, and to determine when we are at the end of the quiz attempt.


    const [endOfQuiz, setEndOfQuiz] = useState<boolean>(false);

    // Subscribes to the state (paused/playing) to update the UI
    // This hook "listens" for changes in the media state (i.e, play is ongoing or has been paused) and re-renders the 
    // component when it changes
    //const { paused } = useMediaStore(playerRef);
    //const { paused, started } = useMediaStore(playerRef);
    const { paused } = useMediaStore(playerRef);

    const [showVideoPlayer, setShowVideoPlayer] = useState<boolean>(true);

    /*
    useEffect(() => {
        api.
        post(`/api/video_quiz_attempts/`, {
            user_name: name,
            quiz_id: quiz_id
        })
        .then((res) => res.data)
        .then((data) => {
            console.log("TakeVideoQuiz: quiz attempt created", data);
            setQuizAttempt(data.quiz_attempt);
            // play the first video segment, start from beginning of segment 1
            // look up segment 1 start time
            const segment1 = video_segments.find((seg: VideoSegment) => seg.segment_number === 1);
            console.log("TakeVideoQuiz: segment 1 data", segment1);
            if (segment1) {
                const [minutes_start, seconds_start, milliseconds_start] = segment1.start_time.split(":").map(Number); // Split and convert to numbers
                const [minutes_end, seconds_end, milliseconds_end] = segment1.end_time.split(":").map(Number); // Split and convert to numbers
        
                const startTimeInSeconds = (minutes_start * 60 + seconds_start + milliseconds_start / 1000);
                const stopTimeInSeconds = (minutes_end * 60 + seconds_end + milliseconds_end / 1000);
                
                console.log("TakeVideoQuiz: segment 1 startTimeInSeconds =", startTimeInSeconds);
                console.log("TakeVideoQuiz: segment 1 stopTimeInSeconds =", stopTimeInSeconds);
                
            } else {
                
                //console.warn("TakeVideoQuiz: segment 1 not found, seeking to 0");
                //remote.seek(0);
                //remote.play();
                
            }
          
           
        })
        .catch((err) => {
            console.error("TakeVideoQuiz: error creating quiz attempt", err);
            alert("Error creating quiz attempt");
        });
    }, [quiz_id]);
    */

    useEffect(() => {

      // load all questions in first video segment
      console.log("************************ TakeVideoQuiz: useEffect on component mount, video_segments =", video_segments);
/*
[
  {
    "id": 1,
    "quiz_id": 2,
    "segment_number": 1,
    "start_time": "0:00:000",
    "end_time": "0:10:500",
    "question_numbers": "2, 3, 136"
  },
  {
    "id": 2,
    "quiz_id": 2,
    "segment_number": 2,
    "start_time": "0:10:500",
    "end_time": "0:17:500",
    "question_numbers": ""
  },
  {
    "id": 4,
    "quiz_id": 2,
    "segment_number": 3,
    "start_time": "0:17:500",
    "end_time": "0:24:500",
    "question_numbers": ""
  },
  {
    "id": 5,
    "quiz_id": 2,
    "segment_number": 4,
    "start_time": "0:24:700",
    "end_time": "0:28:200",
    "question_numbers": ""
  },
  {
    "id": 6,
    "quiz_id": 2,
    "segment_number": 5,
    "start_time": "0:28:300",
    "end_time": "0:31:800",
    "question_numbers": ""
  },
  {
    "id": 7,
    "quiz_id": 2,
    "segment_number": 6,
    "start_time": "0:31:900",
    "end_time": "0:39:000",
    "question_numbers": ""
  },
  {
    "id": 8,
    "quiz_id": 2,
    "segment_number": 7,
    "start_time": "0:39:000",
    "end_time": "0:46:000",
    "question_numbers": ""
  }
]
*/

      const first_video_segment = video_segments.find((seg: VideoSegment) => seg.segment_number === 1);
      console.log("TakeVideoQuiz: first_video_segment =", first_video_segment);
      const question_numbers = first_video_segment ? first_video_segment.question_numbers.split(",").map((num: string) => parseInt(num.trim())) : [];
      const number_of_questions = question_numbers.length;

      api.post(`/api/video_quiz_attempts/create/`, { 
          quiz_id: quiz_id, 
          user_name: name, 
          number_of_questions_to_preload: number_of_questions
        })
       .then((response) => {
          console.log("Received response from get_or_create_react_native endpoint:", response.data);
          //const all_questions_loaded = response.data.questions;

          /*
          setRemainingQuestions(response.data.questions.map((q: QuestionProps) => ({ question: q })));
          */

          // console.log(" First question loaded from server:", first_question);
          //setRemainingQuestions(all_questions_loaded.slice(1).map((q: QuestionProps) => ({ question: q })));
          //setQuestion(first_question);
          setQuizAttempt(response.data.quiz_attempt);
          const segment1 = video_segments.find((seg: VideoSegment) => seg.segment_number === 1);
          console.log("TakeVideoQuiz: segment 1 data", segment1);
          if (segment1) {
              const [minutes_start, seconds_start, milliseconds_start] = segment1.start_time.split(":").map(Number); // Split and convert to numbers
              const [minutes_end, seconds_end, milliseconds_end] = segment1.end_time.split(":").map(Number); // Split and convert to numbers
      
              const startTimeInSeconds = (minutes_start * 60 + seconds_start + milliseconds_start / 1000);
              const stopTimeInSeconds = (minutes_end * 60 + seconds_end + milliseconds_end / 1000);
              
              console.log("TakeVideoQuiz: segment 1 startTimeInSeconds =", startTimeInSeconds);
              console.log("TakeVideoQuiz: segment 1 stopTimeInSeconds =", stopTimeInSeconds);
              
          } else {
              console.warn("TakeVideoQuiz: segment 1 not found ");
              //remote.seek(0);
              //remote.play();
          }
        
       
       })
       .catch((error) => {
         console.error("Error fetching quiz attempt data:", error);
        
       });
   },[quiz_id, video_segments, name])
   
    const fetchQuestionAttempt = useCallback(async (question: QuestionProps): Promise<boolean> => {
        if (!quizAttempt) {
            console.error("Quiz attempt is null.");
            return false;
        }
        const url = `/api/quiz_attempts/${quizAttempt.id}/create_question_attempt/`;
        try {
            const response = await api.post<{ question_attempt_id: number, question_attempt_number: number }>(url, {
                question_id: question.id,
            });
            if (response.data && response.data.question_attempt_id) {
                setQuestionAttemptId(response.data.question_attempt_id);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error creating next question attempt:", error);
            return false;
        }
    }, [quizAttempt]);

    const onPaused = useEffectEvent(async () => {
        console.log(" ****** video paused. Active segment number:", activeSegmentNumber);
        const unfinished_questions = questionsBank.filter(q => q.finished === false);
        if (unfinished_questions.length === 0 && quizAttempt) {
            console.log("TakeVideoQuiz: video is paused and no remaining questions in state. Fetching questions for current segment from server.");
            const current_segment = video_segments.find((seg: VideoSegment) => seg.segment_number === activeSegmentNumber);
            console.log("TakeVideoQuiz: >>>>>>>>>>>>>>>>>>>>>>>>> current_segment =", current_segment);
            if (current_segment) {
                const url = `/api/video_segments/${current_segment.id}/get_questions/`;
                try {
                    const response = await api.get<{ questions: QuestionProps[] }>(url);
                    console.log("TakeVideoQuiz: Received response from server for questions in current segment:", response.data);
                    const questions_in_segment = response.data.questions;
                    setQuestionsBank(prev => [...prev, ...questions_in_segment.map(q => ({ ...q, finished: false }))]);
                    if (questions_in_segment.length > 0) {
                        const first_question = questions_in_segment[0];
                        const success = await fetchQuestionAttempt(first_question);
                        if (success) {
                            setQuestion(first_question);
                            setQuestionsBank(prev => prev.map(q => q.id === first_question.id ? { ...q, finished: false } : q));
                            setShowQuestion(true);
                        }
                    }
                } catch (error) {
                    console.error("TakeVideoQuiz: Error fetching questions for current segment:", error);
                }
            }
        } else if (unfinished_questions.length > 0) {
            const nextQuestion = unfinished_questions[0];
            const success = await fetchQuestionAttempt(nextQuestion);
            if (success) {
                setQuestion(nextQuestion);
                setQuestionsBank(prev => prev.map(q => q.id === nextQuestion.id ? { ...q, finished: false } : q));
                setShowQuestion(true);
            }
        }
    });

    useEffect(() => {
        if (paused) {
            onPaused();
        }
    }, [paused]);


  const handleTimeUpdate = (event:any) => {
    const currentTime = event.currentTime;
    //console.log("TakeVideoQuiz: Time update event, currentTime =", currentTime);
    //console.log("TakeVideoQuiz: handleTimeUpdate called currentTime=", currentTime);
    //console.log(`Current Time: ${currentTime.toFixed(2)}s`);
    //console.log("TakeVideoQuiz: current stop time =", stopTime);
    //if (currentTime > stopTime.current) {
    
    if (currentTime >= stopTime) {
        //console.log("TakeVideoQuiz: Current time has reached or exceeded stop time. Pausing and seeking back.");
        remote.pause();
        remote.seek(stopTime);
    }
        
       
    /*
    const tolerance = 0.01; // Allow a small margin of error
    if (Math.abs(currentTime - stopTime.current) <= tolerance || currentTime > stopTime.current) {
      console.log("TakeVideoQuiz: Current time has reached or exceeded stop time. Pausing and seeking back.");
      remote.pause();
      remote.seek(stopTime.current);
    }
        */
 }

  const handlePlay = () => {
    console.log("TakeVideoQuiz: Play button clicked active video segment: ", video_segments.find((seg: VideoSegment) => seg.segment_number === activeSegmentNumber));
    const active_segment = video_segments.find((seg: VideoSegment) => seg.segment_number === activeSegmentNumber);
    //const start_time = video_segments.find((seg: VideoSegment) => seg.segment_number === activeSegmentNumber)?.start_time ?? "00:00:00";
    //console.log("TakeVideoQuiz: start_time to seek to =", start_time);

    const [minutes_start, seconds_start, milliseconds_start] = active_segment.start_time.split(":").map(Number); // Split and convert to numbers
    const [minutes_end, seconds_end, milliseconds_end] = active_segment.end_time.split(":").map(Number); // Split and convert to numbers
  
    const startTimeInSeconds = (minutes_start * 60 + seconds_start + milliseconds_start / 1000);
    const stopTimeInSeconds = (minutes_end * 60 + seconds_end + milliseconds_end / 1000);

    console.log("TakeVideoQuiz: seeking to start time in seconds =", startTimeInSeconds);
    console.log("TakeVideoQuiz: setting stop time to =", stopTimeInSeconds);

    //stopTime.current = parseFloat(stopTimeInSeconds);
    setStopTime(stopTimeInSeconds);
 
    // set stop time for later use in handleTimeUpdate
    
    remote.seek(startTimeInSeconds);
    console.log("TakeVideoQuiz: Playing video from segment start time");
    // set showQuestion to false. No questions should be shown while video is playing. Questions will only be shown when video is paused (handleTimeUpdate will set showQuestion to true when video is paused)
    setShowQuestion(false);
    remote.play();
 
  }


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
      const { assessment_results } = res.data;
      //console.log("Assessment results from server:", assessment_results);
      //quizHasErrors.current = quiz_attempt_has_errors;
      setQuestionAttemptAssessmentResults(assessment_results);
      // search questionsBank and set the question with the same id as the current question as finished = true, 
      setQuestionsBank(prev => prev.map(q => q.id === question?.id ? { ...q, finished: true } : q));
      if (assessment_results.error_flag === false) {
        //alert("Answer is correct.");
        setShowCorrectModal(true);
        correctModalTimerRef.current = setTimeout(() => {
          setShowCorrectModal(false);
          // show next question if available by checking next_question_data
          handleModalClose();
          // handle end of quiz scenario here
        }, 1000); // Close modal after 2 seconds
      }
      else {
        // make a snapshot of question for incorrect model because
        // question is undefined when passed as a prop to IncorrectModal.
         //incorrectModalQuestion.current = question;
         setShowIncorrectModal(true);
      }
    })
    .catch((err) => {
      console.error("Error processing question attempt:", err);
    });
    
  }

const handleModalClose = useEffectEvent(async () => {
  console.log("handleModalCloze")
  if (showCorrectModal) {
    setShowCorrectModal(false);
  }
  if (showIncorrectModal) {
    setShowIncorrectModal(false);
  }
  //setQuestion(remainingQuestions.length > 0 ? remainingQuestions[0].question : undefined);
  //console.log("handleModalClose. Remaining questions length:", remainingQuestions.length);
  const unfinished_questions = questionsBank.filter(q => q.finished === false);
  console.log("handleModalClose. Unfinished questions:");
  unfinished_questions.forEach(q => console.log(`Question id: ${q.id}, finished: ${q.finished}`));
  //if (remainingQuestions.length > 0) {
  if (unfinished_questions.length > 0) {
        //console.log("handleCorrectModalTimeout There are remaining questions in state, showing next question immediately for a smooth user experience while waiting for the server response to create the next question attempt. Remaining questions length:", remainingQuestions.length, " Next question id:", remainingQuestions[0].question.id);
        // remove the next question to display from the remainingQuestions array and set it as the current question, so that we can have a smooth transition to the next question while waiting for the server response to create the next question attempt. We also use the length of this remainingQuestions array in another useEffect to determine when we are at the end of the currently loaded questions and need to fetch more questions from the server if there are more questions in the quiz (hasMoreQuestions is true).
        // const nextQuestion = remainingQuestions[0].question;
        const nextQuestion = unfinished_questions[0];
        console.log(" handleModalCloze next question to attempt:", nextQuestion);
        const success = await fetchQuestionAttempt(nextQuestion);
        if (success) {
            setQuestion(nextQuestion);
            // setRemainingQuestions(prev => prev.slice(1));
            // setQuestionsBank(prev => prev.map(q => q.id === nextQuestion.id ? { ...q, finished: true } : q));
            setShowQuestion(true);
        }

        //for a smooth user experience while waiting for the server response to create the next question attempt. Next question id:", remainingQuestions[0].question.id);
  }
  else if (unfinished_questions.length == 0 ) { // else if (remainingQuestions.length == 0) { 
      // no next question id means end of quiz reached
      console.log("handleModalTimeout. No more remaining questions:");
      // play the next video segment if there is one, otherwise end the quiz and show alert
        const current_segment = video_segments.find((seg: VideoSegment) => seg.segment_number === activeSegmentNumber);
        console.log("TakeVideoQuiz: current_segment =", current_segment);
        const isLastSegment = activeSegmentNumber === video_segments.length;
        if (!isLastSegment) {
            // increment active segment number to move to next segment
            console.log("TakeVideoQuiz: ******* ********* Moving to next segment.");
            const nextSegmentNumber = (activeSegmentNumber ?? 1) + 1;
            console.log("TakeVideoQuiz: Moving to next segment, nextSegmentNumber =", nextSegmentNumber);
            setActiveSegmentNumber(nextSegmentNumber);
            // play next segment
            const next_segment = video_segments.find((seg: VideoSegment) => seg.segment_number === nextSegmentNumber);
            console.log("TakeVideoQuiz: next_segment =", next_segment);
            if (next_segment) {
                setShowCorrectModal(false)
                const [minutes_start, seconds_start, milliseconds_start] = next_segment.start_time.split(":").map(Number); // Split and convert to numbers
                const [minutes_end, seconds_end, milliseconds_end] = next_segment.end_time.split(":").map(Number); // Split and convert to numbers
        
                const startTimeInSeconds = (minutes_start * 60 + seconds_start + milliseconds_start / 1000);
                const stopTimeInSeconds = (minutes_end * 60 + seconds_end + milliseconds_end / 1000);
                
                console.log("TakeVideoQuiz: next segment startTimeInSeconds =", startTimeInSeconds);
                console.log("TakeVideoQuiz: next segment stopTimeInSeconds =", stopTimeInSeconds);
                
                setStopTime(stopTimeInSeconds);
                remote.seek(startTimeInSeconds);
                remote.play();
            }
        }
        else {
            console.log("TakeVideoQuiz: This was the last segment. Quiz completed.");
           
            setShowCorrectModal(false);
            setShowVideoPlayer(false);
            if (quizAttempt) {
            api.post(`/api/quiz_attempts/${quizAttempt.id}/mark_completed/`)
              .then(() => {
                  console.log("Quiz attempt marked as completed on server.");
                  setEndOfQuiz(true);
              })
            .catch(err => console.error("Error marking quiz attempt as completed.", err));
            }
        }
      //alert("You have completed the quiz!");
  }
  else {
      console.error("handleModalClose: This should not happen. No remaining questions but also no end of quiz?");
  }
});

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
 {/* 1. The Parent defines the max size and shape */}
{ showVideoPlayer &&
<>
 <div className="w-full max-w-[800px] aspect-video bg-blue-200 relative overflow-hidden rounded-lg">
  <MediaPlayer 
    ref = {playerRef}
    src={video_url}
    aspectRatio="16/9"
    onTimeUpdate={(handleTimeUpdate)}
    className="w-full h-full relative 
             [&_[data-media-provider]]:!w-full [&_[data-media-provider]]:!h-full
             [&_video]:!w-full [&_video]:!h-full [&_video]:!object-cover
             [&_iframe]:!w-full [&_iframe]:!h-full [&_iframe]:!absolute"
  >
    <MediaProvider>
     
    </MediaProvider>

  
  </MediaPlayer>
</div>

    <button
    onClick={() => (paused ? handlePlay() : remote.pause())}
    className="flex items-center gap-2 bg-blue-600 px-6 py-2 mt-3 text-white rounded-full hover:bg-blue-500 transition-colors"
  >
    {paused ? (
      <span>Play</span>
    ) : (
      <span> Pause Video</span>
    )}
  </button>
  </>
}
<div>questions: {JSON.stringify(questionsBank)}</div>
  {showCorrectModal && <CorrectModal score={questionAttemptAssessmentResults?.score}/>}
      {showIncorrectModal && <IncorrectModal 
        parentCallback={handleModalClose} 
        format={question?.format ?? 1}
        content={question?.content ?? ""}
        answer_key={question?.answer_key ?? ""}
        explanation={question?.explanation ?? ""}
        processQuestionResults={questionAttemptAssessmentResults as QuestionAttemptAssesmentResultsProps}
        />
      }
  {showQuestion &&
                <div className='flex flex-col items-center bg-gray-300'>
                    <div className='flex flex-row justify-start items-center  mx-10 bg-cyan-200 px-20 py-1  rounded-md'>
                    <div className='mb-2'>Question: {question?.question_number}</div>
                    </div>
                    <div className='text-textColor2 m-2' dangerouslySetInnerHTML={{ __html: question?.instructions ?? '' }}></div>
                    <div className='m-2 text-amber-800 whitespace-pre-wrap'>{question?.prompt}</div>
                
                    <div>
                        {(question?.audio_str && question.audio_str.trim().length > 0) &&
                             <OpenAIStream sentence={question.audio_str} />
                        }                 
                    </div>


                    <div className='bg-cyan-200 flex flex-col rounded-md justify-center'>
                   
                    <div className='my-5'>
              { question?.format === 1 &&
                 <DynamicWordInputs content={question.content}  ref={childRef} />
              }
              { question?.format === 2 &&
                  <ButtonSelectCloze 
                  content={question.content} 
                  content_language={question.content_language}
                  choices={question.button_cloze_options} 
                  ref={childRef} />
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
                <DragDrop content={question.content} content_language={question.content_language} ref={childRef} />
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
                </div>
                <button className='bg-green-700 text-white mx-10 mt-7 p-2 rounded-md hover:bg-red-700'
                onClick={() => handleSubmit()}
            >
                Submit
                </button>
                </div>
            }

  </>
  )
}


/*
<MediaPlayer title="Sprite Fight" src={video_url}
    ref={playerRef}
    onTimeUpdate={(event) => handleTimeUpdate(event)}
    aspectRatio="16/9"
    className="w-full rounded-lg overflow-hidden"
    >
    <MediaProvider />
    <DefaultVideoLayout thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt" icons={defaultLayoutIcons} />
  </MediaPlayer>
*/

/*


<div className="mt-10 w-3/4 aspect-video bg-green-500 overflow-hidden relative">
  <MediaPlayer
    src={video_url}
    ref={playerRef}
    //  Disable controls and aspect ratio to take manual control 
    controls={false}
   
    className="w-full h-full block"
  >
    <MediaProvider className="w-full h-full">
      <style>{`
        // 1. Force the provider component to fill the player
        media-provider {
          width: 100%;
          height: 100%;
          display: block;
        }
        // 2. Force the actual video element to fill the provider 
        video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
        }
      `}`</style>
    </MediaProvider>
  </MediaPlayer>
</div>

*/

