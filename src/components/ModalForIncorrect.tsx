import { useEffect } from "react";
import ClozeExplanation from "./explanations/ClozeExplanation";
import Explanation from "./explanations/Explanation";
import {type QuestionAttemptAssesmentResultsProps} from "./shared/types"

export interface Props {
    parentCallback: (action: string ) => void;
    format: number;
    content: string;
    processQuestionResults?: QuestionAttemptAssesmentResultsProps;
}

/*
export interface ProcessQuestionResultsProps {
  answer: string | undefined,
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

*/


function ModalForIncorrect({ parentCallback, format, content, processQuestionResults }: Props) {

    const handleCloseModal = () => {
        // Continue the quiz from where the user left off
        parentCallback('');
    }

    useEffect(() => {
        console.log("format =", format, "content =", content, "processQuestionResults =", processQuestionResults);
    }, [format, content, processQuestionResults]);
  return (

    <div 
    className="fixed inset-80 bg-green-600 bg-opacity-50 flex items-center justify-center z-10"
>
    <div>FORMAT: {format}</div>
    <div className="bg-white rounded-lg shadow-lg p-6 w-80 h-auto text-center">
        <p className="text-lg font-bold mb-4">Please read explanation</p>
        <Explanation>
            {format === 1 && <ClozeExplanation content={content} processQuestionResults={processQuestionResults} />}
        </Explanation>
        <button 
            className="px-4 py-2 rounded-md bg-amber-400 hover:bg-amber-500 text-white font-medium"
            onClick={handleCloseModal}
        >
            Continue
        </button>
    </div>
</div>
   
  )
}

export default ModalForIncorrect