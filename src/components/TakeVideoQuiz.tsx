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
import ReviewPromptModal from './ReviewPromptModal';
import RewatchPromptModal from './RewatchPromptModal';



interface VideoSegment {
    id: number,
    quiz_id: number,
    segment_number: number,
    start_time: string,
    end_time: string,
    question_numbers: string
}

// Max number of times a student may replay the video segment for a single question.
const MAX_REPLAYS = 3;

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

export default function TakeVideoQuiz() {
    const location = useLocation();
    const { video_url, quiz_id, video_segments } = location.state || {};
    const playerRef = React.useRef<MediaPlayerInstance>(null);

    // A ref (not state) so handleTimeUpdate always reads the latest value with no async/closure
    // race — important because the native YouTube play button sets it via onPlay after playback
    // has already begun.
    const stopTimeRef = useRef<number>(0);
    // True only when the pause was caused by reaching the segment's end (not a manual pause),
    // so onPaused knows whether to run the segment-end flow or ignore the pause.
    const segmentEndedRef = useRef<boolean>(false);

    const { name } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);

    const remote = useMediaRemote(playerRef);
    // this hook acts aa "remote control" to control the video player (play, pause, seek, etc.)

    //const quizAttempt = useRef<QuizAttemptProps | null>(null);
    const [quizAttempt, setQuizAttempt] = useState<QuizAttemptProps | null>(null);

    const [activeSegmentNumber, setActiveSegmentNumber] = useState<number | undefined>(1) // 
   
    const [question, setQuestion] = useState<QuestionProps | undefined>()
    const [questionAttemptId, setQuestionAttemptId] = useState<number | null>(null);

    const [showQuestion, setShowQuestion] = useState<boolean>(false);
    const [showRewatchPrompt, setShowRewatchPrompt] = useState<boolean>(false); // "rewatch the segment?" prompt, shown after a segment finishes (before its first question)
    const [hasStarted, setHasStarted] = useState<boolean>(false); // whether the video has begun playing at least once (controls the initial Play button)
    const [replayCount, setReplayCount] = useState<number>(0); // replays used for the current question
    const childRef = useRef<ChildRef>(null);

    const [showCorrectModal, setShowCorrectModal] = useState(false);
    const [showIncorrectModal, setShowIncorrectModal] = useState(false);

    const [questionAttemptAssessmentResults, setQuestionAttemptAssessmentResults] = 
            useState<QuestionAttemptAssesmentResultsProps | null>(null);
    
    let correctModalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Snapshot of the question for the IncorrectModal, since `question` is set to undefined
    // before the modal renders.
    const incorrectModalQuestion = useRef<QuestionProps | undefined>(undefined);
  
    //const [remainingQuestions, setRemainingQuestions] = useState<{question: QuestionProps, question_attempt_number?: number}[]>([]); // State to hold the remaining questions in the quiz attempt that have not been attempted yet. We initialize this as an empty array and populate it with the questions from the server response when we fetch or create the quiz attempt in the useEffect on component mount. When the user answers a question and clicks "Continue", we remove the next question to display from this remainingQuestions array and set it as the current question, so that we can have a smooth transition to the next question while waiting for the server response to create the next question attempt. We also use the length of this remainingQuestions array in another useEffect to determine when we are at the end of the currently loaded questions and need to fetch more questions from the server if there are more questions in the quiz (hasMoreQuestions is true).

    const [endOfQuiz, setEndOfQuiz] = useState<boolean>(false);
    const [showVideoPlayer, setShowVideoPlayer] = useState<boolean>(true);

    // Redo flow: after the last segment, if there are wrong answers, prompt to redo them
    // (replaying each wrong question's video segment) or finish the quiz.
    const [showRedoPrompt, setShowRedoPrompt] = useState<boolean>(false);
    const [redoCount, setRedoCount] = useState<number>(0);
    const [redoMode, setRedoMode] = useState<boolean>(false);

    const mediaStore = useMediaStore(playerRef);
    const paused = showVideoPlayer ? mediaStore.paused : false;

    useEffect(() => {
      // console.log("************************ TakeVideoQuiz: useEffect on component mount, video_segments =", video_segments);
      const first_video_segment = video_segments.find((seg: VideoSegment) => seg.segment_number === 1);
      // console.log("TakeVideoQuiz: first_video_segment =", first_video_segment);
      const question_numbers = first_video_segment ? first_video_segment.question_numbers.split(",").map((num: string) => parseInt(num.trim())) : [];
      const number_of_questions = question_numbers.length;

      api.post(`/api/video_quiz_attempts/create/`, { 
          quiz_id: quiz_id, 
          user_name: name, 
          number_of_questions_to_preload: number_of_questions
        })
       .then((response) => {
          setQuizAttempt(response.data.quiz_attempt);
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

    // Ask the server for the next unfinished question in a segment (server owns progress state).
    const loadNextSegmentQuestion = useCallback(
        async (segmentId: number, quizAttemptId: number): Promise<QuestionProps | null> => {
            try {
                const res = await api.get<{ next_question: QuestionProps | null }>(
                    `/api/video_segments/${segmentId}/next_question/`,
                    { params: { quiz_attempt_id: quizAttemptId } }
                );
                return res.data.next_question;
            } catch (error) {
                console.error("TakeVideoQuiz: Error fetching next segment question:", error);
                return null;
            }
        },
        []
    );

    const onPaused = useEffectEvent(async () => {
        // Only react to a pause caused by the segment ending — ignore manual pauses (the student
        // pausing mid-segment), which should just pause the video without advancing the flow.
        if (!segmentEndedRef.current) return;
        segmentEndedRef.current = false;
        // A rewatch just finished: ask again whether to rewatch (until they say No or run out).
        if (isReplayingRef.current) {
            isReplayingRef.current = false;
            setShowRewatchPrompt(true);
            return;
        }
        // In redo mode the wrong question is already loaded; the replayed segment just paused,
        // so show that question instead of fetching the segment's next question.
        if (redoMode) {
            if (question) setShowQuestion(true);
            return;
        }
        const current_segment = video_segments.find((seg: VideoSegment) => seg.segment_number === activeSegmentNumber);
        if (!current_segment || !quizAttempt) return;
        const nextQuestion = await loadNextSegmentQuestion(current_segment.id, quizAttempt.id);
        if (nextQuestion) {
            const success = await fetchQuestionAttempt(nextQuestion);
            if (success) {
                // Segment finished: load its first question but DON'T show it yet — first ask
                // whether the student wants to rewatch the segment.
                setQuestion(nextQuestion);
                setReplayCount(0); // fresh rewatch budget for this question
                setShowRewatchPrompt(true);
            }
        }
    });

    useEffect(() => {
        if (paused) {
            onPaused();
        }
    }, [paused]);

    // Mark the quiz attempt complete on the server and show the end screen.
    const finishQuiz = useEffectEvent(() => {
        setShowCorrectModal(false);
        setShowVideoPlayer(false);
        if (quizAttempt) {
            api.post(`/api/quiz_attempts/${quizAttempt.id}/mark_completed/`)
                .then(() => setEndOfQuiz(true))
                .catch(err => console.error("Error marking quiz attempt as completed.", err));
        }
    });

    // Fetch the next wrong question to redo, then replay its video segment. The question is
    // shown when the replayed segment pauses (handled in onPaused's redo branch). If there are
    // no more wrong questions, finish the quiz.
    const loadNextWrongAndReplay = useEffectEvent(async () => {
        if (!quizAttempt) return;
        try {
            const res = await api.get<{ question?: QuestionProps, question_attempt_id?: number }>(
                `/api/quiz_attempts/${quizAttempt.id}/get_incorrect_question_attempt/`
            );
            const wrongQuestion = res.data.question;
            if (wrongQuestion && res.data.question_attempt_id) {
                setQuestion(wrongQuestion);
                setReplayCount(0); // fresh replay budget for the redo question
                setQuestionAttemptId(res.data.question_attempt_id);
                setShowQuestion(false);
                const segment = video_segments.find((seg: VideoSegment) => seg.id === wrongQuestion.video_segment_id);
                if (segment) {
                    const [m1, s1, ms1] = segment.start_time.split(":").map(Number);
                    const [m2, s2, ms2] = segment.end_time.split(":").map(Number);
                    stopTimeRef.current = m2 * 60 + s2 + ms2 / 1000;
                    setShowVideoPlayer(true);
                    remote.seek(m1 * 60 + s1 + ms1 / 1000);
                    remote.play();
                }
            } else {
                // No more wrong questions to redo.
                setRedoMode(false);
                finishQuiz();
            }
        } catch (error) {
            console.error("Error loading next wrong question for redo:", error);
            setRedoMode(false);
            finishQuiz();
        }
    });

    const handleRedoYes = useEffectEvent(async () => {
        setShowRedoPrompt(false);
        setRedoMode(true);
        if (quizAttempt) {
            // Put the quiz attempt in review state so the server marks corrected answers.
            await api.get(`/api/quiz_attempts/${quizAttempt.id}/set_review_mode/`).catch(() => {});
        }
        await loadNextWrongAndReplay();
    });

    const handleRedoNo = useEffectEvent(() => {
        setShowRedoPrompt(false);
        finishQuiz();
    });


  const handleTimeUpdate = (event:any) => {
    const currentTime = event.currentTime;
    // stopTimeRef.current === 0 means "not configured yet" (e.g. playback just started via the
    // native YouTube button before onPlay set it). Don't pause, or we'd rewind to 0 immediately.
    if (stopTimeRef.current <= 0) return;
    if (currentTime >= stopTimeRef.current) {
        //console.log("TakeVideoQuiz: Current time has reached or exceeded stop time. Pausing and seeking back.");
        segmentEndedRef.current = true; // this pause is the segment ending (not a manual pause)
        remote.pause();
        remote.seek(stopTimeRef.current);
    }
 }

  // If playback starts WITHOUT going through handlePlay (e.g. the native YouTube play button),
  // stopTime is still 0, so handleTimeUpdate would immediately pause and rewind. Configure the
  // active segment's stop time on the first play so the segment can play through. Set the ref
  // synchronously so the very next timeupdate already sees it (no async race).
  const handlePlayEvent = () => {
    setHasStarted(true);
    // Clear any stale "segment ended" flag (a stray timeupdate after the end-of-segment seek can
    // re-set it); while the video is playing we're mid-segment, so a later pause is manual.
    segmentEndedRef.current = false;
    if (stopTimeRef.current === 0) {
      const seg = video_segments.find((s: VideoSegment) => s.segment_number === activeSegmentNumber);
      if (seg) {
        const [m2, s2, ms2] = seg.end_time.split(":").map(Number);
        stopTimeRef.current = m2 * 60 + s2 + ms2 / 1000;
      }
    }
  }

  const handlePlay = () => {
    //console.log("TakeVideoQuiz: Play button clicked active video segment: ", video_segments.find((seg: VideoSegment) => seg.segment_number === activeSegmentNumber));
    const active_segment = video_segments.find((seg: VideoSegment) => seg.segment_number === activeSegmentNumber);
    const [minutes_start, seconds_start, milliseconds_start] = active_segment.start_time.split(":").map(Number); // Split and convert to numbers
    const [minutes_end, seconds_end, milliseconds_end] = active_segment.end_time.split(":").map(Number); // Split and convert to numbers
  
    const startTimeInSeconds = (minutes_start * 60 + seconds_start + milliseconds_start / 1000);
    const stopTimeInSeconds = (minutes_end * 60 + seconds_end + milliseconds_end / 1000);

    //console.log("TakeVideoQuiz: seeking to start time in seconds =", startTimeInSeconds);
    //console.log("TakeVideoQuiz: setting stop time to =", stopTimeInSeconds);

    stopTimeRef.current = stopTimeInSeconds;
 
    // set stop time for later use in handleTimeUpdate
    
    remote.seek(startTimeInSeconds);
    //console.log("TakeVideoQuiz: Playing video from segment start time");
    // set showQuestion to false. No questions should be shown while video is playing. Questions will only be shown when video is paused (handleTimeUpdate will set showQuestion to true when video is paused)
    setShowQuestion(false);
    remote.play();
  }

  // Replay the current question's video segment without advancing the flow. The flag tells
  // onPaused to just re-show the same question (rather than fetch/create a new attempt) when
  // the replayed segment pauses again.
  const isReplayingRef = useRef(false);
  const handleReplay = () => {
    if (replayCount >= MAX_REPLAYS) return; // no replays left for this question
    const seg = question?.video_segment_id
      ? video_segments.find((s: VideoSegment) => s.id === question.video_segment_id)
      : video_segments.find((s: VideoSegment) => s.segment_number === activeSegmentNumber);
    if (!seg) return;
    setReplayCount((c) => c + 1);
    const [m1, s1, ms1] = seg.start_time.split(":").map(Number);
    const [m2, s2, ms2] = seg.end_time.split(":").map(Number);
    isReplayingRef.current = true;
    stopTimeRef.current = m2 * 60 + s2 + ms2 / 1000;
    setShowQuestion(false);
    remote.seek(m1 * 60 + s1 + ms1 / 1000);
    remote.play();
  };

  // Rewatch prompt: "Yes" replays the segment (then the prompt shows again via onPaused);
  // "No" dismisses the prompt and shows the question (with no rewatch button).
  const handleRewatchYes = () => {
    if (replayCount >= MAX_REPLAYS) return;
    setShowRewatchPrompt(false);
    handleReplay();
  };

  const handleRewatchNo = () => {
    setShowRewatchPrompt(false);
    setShowQuestion(true);
  };


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
      // The server marks the QuestionAttempt completed in /process/, so no local progress tracking is needed.
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
        // Snapshot the question because `question` state is set to undefined above, but the
        // IncorrectModal needs the question's format/content/answer_key/explanation.
         incorrectModalQuestion.current = question;
         setShowIncorrectModal(true);
      }
    })
    .catch((err) => {
      console.error("Error processing question attempt:", err);
    });
    
  }

const handleModalClose = useEffectEvent(async () => {
  if (showCorrectModal) {
    setShowCorrectModal(false);
  }
  if (showIncorrectModal) {
    setShowIncorrectModal(false);
  }

  // In redo mode we don't follow the segment flow: just move on to the next wrong question
  // (replaying its segment), or finish when there are none left.
  if (redoMode) {
    await loadNextWrongAndReplay();
    return;
  }

  // Ask the server for the next unfinished question in the current segment.
  const current_segment = video_segments.find((seg: VideoSegment) => seg.segment_number === activeSegmentNumber);
  const nextQuestion = (current_segment && quizAttempt)
    ? await loadNextSegmentQuestion(current_segment.id, quizAttempt.id)
    : null;

  if (nextQuestion) {
        const success = await fetchQuestionAttempt(nextQuestion);
        if (success) {
            setQuestion(nextQuestion);
            setReplayCount(0); // fresh replay budget for the new question
            setShowQuestion(true);
        }
  } else {
        // No more questions in this segment -> advance to the next segment, or end the quiz.
        const isLastSegment = activeSegmentNumber === video_segments.length;
        if (!isLastSegment) {
            const nextSegmentNumber = (activeSegmentNumber ?? 1) + 1;
            setActiveSegmentNumber(nextSegmentNumber);
            // play next segment
            const next_segment = video_segments.find((seg: VideoSegment) => seg.segment_number === nextSegmentNumber);
            if (next_segment) {
                setShowCorrectModal(false)
                setShowQuestion(false); // hide the question panel so the video frame is visible while the next segment plays
                const [minutes_start, seconds_start, milliseconds_start] = next_segment.start_time.split(":").map(Number); // Split and convert to numbers
                const [minutes_end, seconds_end, milliseconds_end] = next_segment.end_time.split(":").map(Number); // Split and convert to numbers

                const startTimeInSeconds = (minutes_start * 60 + seconds_start + milliseconds_start / 1000);
                const stopTimeInSeconds = (minutes_end * 60 + seconds_end + milliseconds_end / 1000);

                stopTimeRef.current = stopTimeInSeconds;
                remote.seek(startTimeInSeconds);
                remote.play();
            }
        }
        else {
            // Last segment done. If there are wrong answers, offer to redo them; otherwise finish.
            setShowCorrectModal(false);
            let wrongCount = 0;
            if (quizAttempt) {
                try {
                    const res = await api.get<{ count: number }>(`/api/quiz_attempts/${quizAttempt.id}/incorrect_count/`);
                    wrongCount = res.data.count;
                } catch (err) {
                    console.error("Error fetching incorrect count:", err);
                }
            }
            if (wrongCount > 0) {
                setRedoCount(wrongCount);
                setShowRedoPrompt(true);
            } else {
                finishQuiz();
            }
        }
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
<div className="flex flex-col items-center w-full">
 {/* Video frame — kept mounted (so replay preserves player position/state) but hidden while a
     question is shown, so the question takes its place. */}
 <div className={`w-full max-w-[800px] aspect-video bg-blue-200 relative overflow-hidden rounded-lg ${showQuestion ? 'hidden' : ''}`}>
  <MediaPlayer
    ref = {playerRef}
    src={video_url}
    aspectRatio="16/9"
    onTimeUpdate={(handleTimeUpdate)}
    onPlay={handlePlayEvent}
    className="w-full h-full relative
             [&_[data-media-provider]]:!w-full [&_[data-media-provider]]:!h-full
             [&_video]:!w-full [&_video]:!h-full [&_video]:!object-cover
             [&_iframe]:!w-full [&_iframe]:!h-full [&_iframe]:!absolute"
  >
    <MediaProvider>

    </MediaProvider>


  </MediaPlayer>
  {/* Full-cover overlay: blocks native YouTube interaction (links + native play button, which
      fights vidstack) and gives us controlled play/pause. Clicking the video toggles play/pause
      while watching; the very first start seeks to the segment start via handlePlay. */}
  <div
    className="absolute inset-0 z-10"
    style={{ cursor: showQuestion || showRewatchPrompt ? 'default' : 'pointer' }}
    onClick={() => {
      if (showQuestion || showRewatchPrompt) return;
      if (!paused) {
        remote.pause();              // pause while watching
      } else if (hasStarted) {
        remote.play();               // resume from the current position (no seek)
      } else {
        handlePlay();                // initial start: seek to the segment start, then play
      }
    }}
  />
</div>

    {/* Pause / Resume button, below the video frame and left-aligned. */}
    {hasStarted && !showQuestion && !showRewatchPrompt && (
      <div className="w-full max-w-[800px] flex justify-start">
        <button
          onClick={() => (paused ? remote.play() : remote.pause())}
          className="mt-3 bg-gray-700 hover:bg-gray-800 text-white text-sm px-5 py-2 rounded-md"
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>
    )}

    {/* Question shown in place of the (hidden) video frame */}
    {showQuestion &&
      <div className='flex flex-col items-center bg-gray-300 w-full max-w-[800px] rounded-lg p-2'>
        {question &&
        <div className='flex flex-row justify-start items-center mx-10 bg-cyan-200 px-20 py-1 rounded-md'>
          <div className='mb-2'>Question: {question?.question_number}</div>
        </div>
        }
        <div className='text-textColor2 m-2' dangerouslySetInnerHTML={{ __html: question?.instructions ?? '' }}></div>
        <div className='m-2 text-amber-800 whitespace-pre-wrap'>{question?.prompt}</div>

        <div>
          {(question?.audio_str && question.audio_str.trim().length > 0) &&
            <OpenAIStream sentence={question.audio_str} />
          }
        </div>

        <div className='bg-cyan-200 flex flex-col rounded-md justify-center'>
          <div className='my-5'>
            { question?.format === 1 && <DynamicWordInputs content={question.content} ref={childRef} /> }
            { question?.format === 2 && <ButtonSelectCloze content={question.content} content_language={question.content_language} choices={question.button_cloze_options} ref={childRef} /> }
            { question?.format === 3 && <ButtonSelect content={question.content} ref={childRef} /> }
            { question?.format === 4 && <RadioQuestion content={question.content} ref={childRef} /> }
            { question?.format === 5 && <CheckboxQuestion content={question.content} ref={childRef} /> }
            { question?.format === 6 && <DragDrop content={question.content} content_language={question.content_language} ref={childRef} /> }
            { question?.format === 7 && <SRNonContinuous content={question.content} ref={childRef} /> }
            { question?.format === 8 && <WordsSelect content={question.content} ref={childRef} /> }
            { question?.format === 10 && <DropDowns content={question.content} ref={childRef} /> }
            { question?.format === 12 && <SentenceScramble content={question.content} ref={childRef} /> }
          </div>
        </div>
        {question &&
        <button className='bg-green-700 text-white mx-10 mt-7 p-2 rounded-md hover:bg-red-700'
          onClick={() => handleSubmit()}
        >
          Submit
        </button>
        }
      </div>
    }

    {/* Initial Play button — only before the video has ever started. After that, the student
        toggles play/pause by clicking the video itself. */}
    {!hasStarted && paused && !showQuestion && !showRewatchPrompt && (
      <button
        onClick={() => handlePlay()}
        className="flex items-center gap-2 bg-blue-600 px-6 py-2 mt-3 text-white rounded-full hover:bg-blue-500 transition-colors"
      >
        <span>Play</span>
      </button>
    )}
  </div>
}

  {showRewatchPrompt && (
        <RewatchPromptModal
          onYes={handleRewatchYes}
          onNo={handleRewatchNo}
          rewatchesLeft={MAX_REPLAYS - replayCount}
        />
      )}
  {showRedoPrompt && (
        <ReviewPromptModal
          onYes={handleRedoYes}
          onNo={handleRedoNo}
          incorrectCount={redoCount}
        />
      )}
  {showCorrectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <CorrectModal score={questionAttemptAssessmentResults?.score}/>
        </div>
      )}
      {showIncorrectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-h-[90vh] overflow-y-auto">
            <IncorrectModal
              parentCallback={handleModalClose}
              format={incorrectModalQuestion.current?.format ?? 1}
              content={incorrectModalQuestion.current?.content ?? ""}
              answer_key={incorrectModalQuestion.current?.answer_key ?? ""}
              explanation={incorrectModalQuestion.current?.explanation ?? ""}
              processQuestionResults={questionAttemptAssessmentResults as QuestionAttemptAssesmentResultsProps}
            />
          </div>
        </div>
      )}

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

