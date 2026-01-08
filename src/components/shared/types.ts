

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
