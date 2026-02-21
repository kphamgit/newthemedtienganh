import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../api';
import {  MediaPlayer, MediaProvider, useMediaRemote, useMediaStore } from '@vidstack/react';
//import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import type { ProcessQuestionAttemptResultsProps, QuestionAttemptAssesmentResultsProps, QuestionProps, QuizAttemptProps } from './shared/types';
import { useSelector } from 'react-redux';
import type { ChildRef } from './TakeQuiz';

import { DynamicWordInputs } from './questions/DynamicWordInputs';
import ModalForIncorrect from './ModalForIncorrect';
import { ButtonSelect } from "./questions/ButtonSelect";
import { RadioQuestion } from "./questions/RadioQuestion";
import { CheckboxQuestion } from "./questions/CheckboxQuestion";
import DragDrop from "./questions/dragdrop/DragDrop";
import { WordsSelect } from "./questions/WordsSelect";
import SentenceScramble from "./questions/SentenceScramble";
import { DropDowns } from "./questions/DropDowns";
import CorrectModal from './CorrectModal';
import SRNonContinuous from './questions/SRNonContinuous';



interface VideoSegment {
    id: number,
    quiz_id: number,
    segment_number: number,
    start_time: string,
    end_time: string,
    question_numbers: string
}


export default function TakeVideoQuiz() {
    const location = useLocation();
    const { video_url, quiz_id, video_segments } = location.state || {};
    const playerRef = React.useRef(null);

    //const stopTime = useRef<number>(0);
    const [stopTime, setStopTime] = useState<number>(0);

    const { name } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);

    const remote = useMediaRemote(playerRef);
    // this hook acts aa "remote control" to control the video player (play, pause, seek, etc.)

    //const quizAttempt = useRef<QuizAttemptProps | null>(null);
    const [quizAttempt, setQuizAttempt] = useState<QuizAttemptProps | null>(null);

    const [activeSegmentNumber, setActiveSegmentNumber] = useState<number | undefined>(1) // 
    const [activeSegmentQuestionIds, setActiveSegmentQuestionIds] = useState<number[]>([]); // question ids associated with the active video segment

    const [question, setQuestion] = useState<QuestionProps | undefined>()
    const [questionAttemptId, setQuestionAttemptId] = useState<number | null>(null);

    const [showQuestion, setShowQuestion] = useState<boolean>(false);
    const childRef = useRef<ChildRef>(null);

    const nextQuestionId = useRef<number | null>(null);

    const [showCorrectModal, setShowCorrectModal] = useState(false);
    const [showIncorrectModal, setShowIncorrectModal] = useState(false);

    const [questionAttemptAssessmentResults, setQuestionAttemptAssessmentResults] = 
            useState<QuestionAttemptAssesmentResultsProps | null>(null);
    
            let correctModalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
    // Subscribes to the state (paused/playing) to update the UI
    // This hook "listens" for changes in the media state (i.e, play is ongoing or has been paused) and re-renders the 
    // component when it changes
    //const { paused } = useMediaStore(playerRef);
    const { paused, started } = useMediaStore(playerRef);

    useEffect(() => {
        api.
        post(`/api/video_quiz_attempts/`, {
            user_name: name,
            quiz_id: quiz_id
        })
        .then((res) => res.data)
        .then((data) => {
            console.log("TakeVideoQuiz: quiz attempt created", data);
           //quizAttempt.current = data;
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
                
                //console.log("TakeVideoQuiz: seeking to segment 1 start time", start_time, "stop time =", stop_time);
                //remote.seek(0);
                //remote.seek(startTimeInSeconds);
                //stopTime.current = stopTimeInSeconds;
                //remote.play();
                
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

 // path("quiz_attempts/<int:pk>/create_next_question_attempt/", views.create_question_attempt),  #
    /*
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
    */
   
    useEffect( () => {
        if (paused) {
           console.log("TakeVideoQuiz: video is paused ");
           // console.log("TakeVideoQuiz: &&&&& quizAttempt =", quizAttempt);
        }
        if (paused && quizAttempt && started) {
            console.log("TakeVideoQuiz: VVVVVvideo is paused");
            console.log("TakeVideoQuiz: quizAttempt =", quizAttempt);
            // fetch the next question attempt
            
          
            const current_segment = video_segments.find((seg: VideoSegment) => seg.segment_number === activeSegmentNumber); 
            console.log("TakeVideoQuiz: current_segment =", current_segment);
            setActiveSegmentQuestionIds(current_segment ? current_segment.question_numbers.split(",").map((id: string) => parseInt(id)) : []);
            const questionId = current_segment ? parseInt(current_segment.question_numbers.split(",")[0]) : null;
            console.log("TakeVideoQuiz: questionId to send =", questionId);
            const url = `/api/quiz_attempts/${quizAttempt.id}/create_next_question_attempt/`;
            console.log("TakeVideoQuiz: POSTing to url =", url);
            api.post<{ question_attempt_id: number; question: QuestionProps }>(url, {
                question_id: questionId,
            })
            .then((response) => {
                console.log("TakeVideoQuiz: Received response from create_next_question_attempt:", response.data);
                const { question_attempt_id, question } = response.data;
                console.log("TakeVideoQuiz: next question to display:", question);
                console.log("TakeVideoQuiz: question_attempt_id =", question_attempt_id);
                setQuestion(question);
                setShowQuestion(true); // Show the next question
                setQuestionAttemptId(question_attempt_id);
             
                //nextQuestionId.current = null; // Reset nextQuestionId
            })
            .catch((error) => {
                console.error("TakeVideoQuiz: Error creating next question attempt:", error);
            });
            

        }
    }, [paused, quizAttempt, started]);

    useEffect(() => {
        console.log("TakeVideoQuiz: activeSegmentQuestionIds updated:", activeSegmentQuestionIds);
    },[activeSegmentQuestionIds]);

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
    remote.play();
 
  }

  const handleSubmit = () => {
    console.log("TakeVideoQuiz: Submitting answer for question id =", question?.id);
    const url = `/api/video_question_attempts/${questionAttemptId}/process/`;
   
    setShowQuestion(false); //
    
    api.post<ProcessQuestionAttemptResultsProps>(url, {
        active_segment_question_ids: JSON.stringify(activeSegmentQuestionIds),
        format: question?.format , 
        user_answer: childRef.current?.getAnswer(), 
        answer_key: question?.answer_key 
    })
      .then((res) => {     
        // server returns the next question id (if any), together with assessment results 
        //console.log("TakeVideoQuiz: Received response from process question attempt:", res.data);
        const { assessment_results, next_question_id } = res.data;
        console.log(" TakeVideoQuiz: res.data =", res.data);
        if (next_question_id) {
            console.log("TakeVideoQuiz: Next question id =", next_question_id);
            //nextQuestionId.current = next_question_id;
            nextQuestionId.current = next_question_id;
        }
        else {
        
            nextQuestionId.current = null;
        }
        // update quizAttemptData.quiz_attempt
        setQuestionAttemptAssessmentResults(assessment_results);
        console.log("Assessment results for this question: ", assessment_results);
      
          if (assessment_results.error_flag === false) {
              console.log("Answer is correct.");
              setShowCorrectModal(true);
              correctModalTimerRef.current = setTimeout(() => {
                  setShowCorrectModal(false);
                  // show next question if available by checking next_question_data
                  handleModalClose();
                  // handle end of quiz scenario here
              }, 2000); // Close modal after 2 seconds
          }
          else {
              console.log("Answer is incorrect. Please try again.");
              setShowIncorrectModal(true);
          }
    })
      .catch((error) => {
        console.error("Error processing question attempt:", error);
      });
    

}


const handleModalClose = async () => {
    setShowIncorrectModal(false);
    setShowCorrectModal(false);

    if (nextQuestionId.current === null) {
        console.log("TakeVideoQuiz: No more questions. Either End of Segment or End of quiz!");
        
        console.log("TakeVideoQuiz: activeSegmentNumber =", activeSegmentNumber, "total segments =", video_segments.length);
        const isLastSegment = activeSegmentNumber === video_segments.length;
        if (isLastSegment) {
            console.log("TakeVideoQuiz: This was the last segment. Quiz completed.");
            alert("You have completed the quiz!");
            setShowCorrectModal(false);
            return;
        }
        else {
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
        return;
    }
    if (nextQuestionId.current !== null) {
        console.log("TakeVideoQuiz: Moving to next question after incorrect answer, nextQuestionId =", nextQuestionId.current);
        //createNextQuestionAttempt(quizAttempt!.id, nextQuestionId.current);
        const url = `/api/quiz_attempts/${quizAttempt?.id}/create_next_question_attempt/`;
        console.log("TakeVideoQuiz: POSTing to url =", url);
        api.post<{ question_attempt_id: number; question: QuestionProps }>(url, {
            question_id: nextQuestionId.current,
        })
        .then((response) => {
            console.log("TakeVideoQuiz: Received response from create_next_question_attempt:", response.data);
            const { question_attempt_id, question } = response.data;
            console.log("TakeVideoQuiz: next question to display:", question);
            console.log("TakeVideoQuiz: question_attempt_id =", question_attempt_id);
            setQuestion(question);
            setShowQuestion(true); // Show the next question
            setQuestionAttemptId(question_attempt_id);

            setShowCorrectModal(false)
        })
        .catch((error) => {
            console.error("TakeVideoQuiz: Error creating next question attempt:", error);
        });
    }
    
  };

  return (
    <>
 {/* 1. The Parent defines the max size and shape */}

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
  {showCorrectModal && <CorrectModal score={questionAttemptAssessmentResults?.score}/>}
      {showIncorrectModal && <ModalForIncorrect 
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
                    <div className='m-2 text-textColorQuestionPrompt'>{question?.prompt}</div>
                
                    <div className='bg-cyan-200 flex flex-col rounded-md justify-center'>
                   
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

