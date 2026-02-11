

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

/*
{
  "live_quiz_id": "1",
  "live_question_number": "1",
  "total_live_score": null,
  "students_live_question_numbers": [
    {
      "key": "student1_live_question_number",
      "value": "1"
    },
    {
      "key": "student2_live_question_number",
      "value": "1"
    }
  ]
}
*/

export interface LoggedInUserPendingDataProps {
  live_quiz_id: string,
  live_question_number: string,
  total_live_score: string,
  //students_live_question_numbers: { [key: string]: string } 
  students_live_question_numbers?: { key: string; value: string }[]; // Ensure this is typed as an array of objects
  // key is something like "student1_live_question_number", value is their live question number 
}
//live_question_retrieved
interface BaseWebSocketMessageProps {
  message_type: 
  "user_disconnected" |
  "chat" | 
  "live_score" |
  "live_quiz_id" | 
  "live_question_number" | 
  "live_quiz_id_and_live_question_number" |
  "student_acknowleged_live_question_number" |
  "live_question_retrieved" | 
  "student_acknowleged_live_quiz_id" |
  "disconnect_user" |
  "cache_query_response" | 
  "live_quiz_terminated" |
  "welcome_message" |
  "another_user_joined" |
  "terminate_live_quiz";
  content: any;
  user_name: string;  // identify sender, except for questin_number message where user_name is target user
}

export interface WebSocketMessageProps extends BaseWebSocketMessageProps {
  other_connected_users?: string[];
  pending_data?: LoggedInUserPendingDataProps| null;
  live_total_score?: string; // only for live_total_score message type
  queried_value?: string; // only for cache_query_response message type
  quiz_name: string; // 
}
/*
export interface WebSocketMessageProps {
  message_type: 
  "user_disconnected" |
  "chat" | 
  "live_score" |
  "live_quiz_id" | 
  "live_question_number" | 
  "live_quiz_id_and_live_question_number" |
  "student_acknowleged_live_question_number" |
  "student_acknowleged_live_quiz_id" |
  "disconnect_user" |
  "cache_query_response" | 
  "live_quiz_terminated" |
  "welcome_message" |
  "another_user_joined" |
  "terminate_live_quiz";
 
  content: any;
  user_name: string;  // identify sender, except for questin_number message where user_name is target user
  other_connected_users?: string[];
  pending_data: {live_quiz_id: string, live_question_number: string, total_live_score: string} | null;
  live_total_score?: string; // only for live_total_score message type
  queried_value?: string; // only for cache_query_response message type
  quiz_name: string; // 
}
*/

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

/*
{
    "quiz_attempt": {
        "id": 356,
        "quiz_id": 3,
        "user_id": "2",
        "score": 0,
        "created_at": "2026-01-03T13:42:56.031874Z",
        "updated_at": "2026-01-03T13:42:56.031906Z",
        "completion_status": "uncompleted",
        "errorneous_questions": ""
    },
    "created": true,
    "question": {
        "id": 16,
        "quiz_id": 3,
        "question_number": 1,
        "content": "Jim [was(to be)] looking out his window.",
        "format": 1,
        "answer_key": "was",
        "instructions": "<p>instruction</p>",
        "prompt": "Dung thi qua khu don",
        "audio_str": "",
        "score": 0,
        "button_cloze_options": "",
        "timeout": 15000
    },
    "question_attempt_id": 758
}
*/
