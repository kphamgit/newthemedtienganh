
import ClozeExplanation from "./explanations/ClozeExplanation";
import Explanation from "./explanations/Explanation";
import {type QuestionAttemptAssesmentResultsProps} from "./shared/types"
import ButtonSelectExplanation from "./explanations/ButtonSelectExplanation";
import RadioExplanation from "./explanations/RadioExplanation";
import CheckboxExplanation from "./explanations/CheckboxExplanation";
import WordScrambleExplanation from "./explanations/WordScrambleExplanation";
import WordsSelect from "./explanations/WordsSelect";
import DropDown from "./explanations/DropDown";
import SentenceScramble from "./explanations/SentenceScramble";
import SRExplanation from "./explanations/SRExplanation";

export interface Props {
    parentCallback: (action: string ) => void;
    format: number;
    answer_key: string;
    content: string;
    explanation?: string;
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


function ModalForIncorrect({ parentCallback, format, answer_key, content, explanation,  processQuestionResults }: Props) {

    const handleCloseModal = () => {
        // Continue the quiz from where the user left off
        parentCallback('');
    }

  return (

    <div 
    className="fixed inset-x-150 inset-y-70 bg-green-200 bg-opacity-50 flex items-center justify-center z-10"
>
    <div className="bg-white rounded-lg shadow-lg p-6 w-auto h-auto text-center">
        <div className="mb-4 text-green-900">{explanation}</div>
        <Explanation>
            {format === 1 && <ClozeExplanation content={content} processQuestionResults={processQuestionResults} />}
            {format === 3 && <ButtonSelectExplanation content={content}  processQuestionResults={processQuestionResults} />}
            {format === 4 && <RadioExplanation content={content} answer_key={answer_key} processQuestionResults={processQuestionResults} />}
            {format === 5 && <CheckboxExplanation content={content} answer_key={answer_key} processQuestionResults={processQuestionResults} />}
            {format === 6 && <WordScrambleExplanation content={content} processQuestionResults={processQuestionResults} />}
            {format === 7 && <SRExplanation content={content} answer_key={answer_key} processQuestionResults={processQuestionResults} />}
            {format === 8 && <WordsSelect content={content} answer_key={answer_key} processQuestionResults={processQuestionResults} />}
            {format === 10 && <DropDown content={content} processQuestionResults={processQuestionResults} />}
            {format === 12 && <SentenceScramble content={content} processQuestionResults={processQuestionResults} />}
        </Explanation>
        <button 
            className="px-4 py-2 mt-5 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-medium"
            onClick={handleCloseModal}
        >
            Continue
        </button>
    </div>
</div>
   
  )
}

export default ModalForIncorrect