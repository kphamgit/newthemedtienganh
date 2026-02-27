

export interface ProcessQuestionAttemptResultsProps {
  assessment_results: QuestionAttemptAssesmentResultsProps,
  quiz_attempt: {
      completed: boolean,
      score: number,
  }
  next_question_id? : number,
}

export interface QuestionAttemptAssesmentResultsProps {
  answer?: string 
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

export type CurrentStudentLiveQuestionNumberProps = {
  key: string;
  value: string;
}

export interface ReceivedConnectedUserDataProps { 
  name: string, 
  live_question_number: string | null,
  live_total_score: string | null,
  is_logged_in: string | null,  // note that Redis store doesn't have boolean type, any "boolean" 
  // value is stored as string, so this will have to be converted to Javascript boolean type when used in the frontend
  // such as in ScoreBoard or RedisDataModal components
}

//live_question_retrieved
interface BaseWebSocketMessageProps {
  message_type: 
  "user_disconnected" |
  "chat" | 
  "live_score" |
  "live_quiz_id" | 
  "live_question_number" | 
  "video_segment_number" |
  "live_quiz_id_and_live_question_number" |
  "student_acknowleged_live_question_number" |
  "live_question_retrieved" | 
  "student_acknowleged_live_quiz_id" |
  "disconnect_user" |
  "cache_query_response" | 
  "live_quiz_terminated" |
  "welcome_message" |
  "another_user_joined" |
  "REDIS_DATA" |
  "terminate_live_quiz";
  content: any;
  user_name: string;  // identify sender, except for questin_number message where user_name is target user
}

export interface VideoSegment {
  segment_number: number,
  start_time: string,
  end_time: string,
}

export interface WebSocketMessageProps extends BaseWebSocketMessageProps {
  other_connected_users?: ReceivedConnectedUserDataProps[];
  queried_value?: string; // only for cache_query_response message type
  quiz_name?: string; // 
  live_quiz_id: string; // for quiz host to identify which quiz the message is related to, and for students to identify which quiz to join  
  live_question_number: string; // for quiz host to identify which question the message is related to, and for students to identify which question to answer
}

export interface QuestionProps {
    id: number,
    quiz_id: number,
    question_number: number,
    content: string,
    format: number,
    answer_key: string,
    instructions?: string,
    prompt?: string,
    audio_str?: string,
    score: number,
    button_cloze_options?: string,
    hint?: string,
    explanation?: string,
    timeout: number,
  }

  export interface QuizAttemptProps {
    id: number,
    quiz_id: number,
    user_name: string,
    score: number,
    created_at: string,
    updated_at: string,
    completion_status: string,
  }

  export interface QuizAttemptCreatedProps {
    question: QuestionProps,
    question_attempt_id: number,
    created: boolean
    quiz_attempt: QuizAttemptProps,
  }
  
export type RadioProps =
  {
    id: number
    choice_1_text: string
    choice_2_text: string
    choice_3_text: string
    choice_4_text: string
    selected: string
    questionId: number
  }

  export interface InputLetterRef {
    getFillContent: () => string | undefined;
  }

  export interface QuestionAttempResultsProps {
    answer: string | undefined,
    score: number,
    error_flag: boolean,
}
