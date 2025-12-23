/*
export type QuestionProps = {
    id: number
    question_number: number,
    format: number,
    audio_src: string,
    audio_str : string,
    video_src : string,
    instruction : string,
    prompt : string,
    content : string,
    words_scramble_direction : string,
    answer_key : string,
    score : number,
    show_help : boolean,
    help1 : string,
    help2 : string,
    coding : boolean,
    quizId : number,
    radio : RadioProps,
    speech_recognition : boolean
    button_cloze_options: string,
    timeout: number
}
*/

export interface QuestionProps {
    id: number,
    question_number: number,
    content: string,
    format: string,
    answer_key: string,
    //quizzes?: QuizProps[]
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