
import { useEffect, useRef, useState } from "react";
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

function IncorrectModal({ parentCallback, format, answer_key, content, explanation,  processQuestionResults }: Props) {

    const [_timeLeft, setTimeLeft] = useState(10);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    parentCallback('');
                    return 0;
                }
                return prev - 1;
            });
        }, 2000);
        return () => clearInterval(timerRef.current!);
    }, []);

    const handleCloseModal = () => {
        clearInterval(timerRef.current!);
        parentCallback('');
    }

  return (

    <div
      className="p-4"
>
    <div className="bg-gray-200 rounded-lg shadow-lg p-11 w-auto h-auto text-center">
        <div className="mb-4 font-bold text-lg text-green-900">Score: {processQuestionResults?.score}</div>
        <Explanation>
            {(format === 1 || format == 2 ) && 
                <ClozeExplanation  content={content} processQuestionResults={processQuestionResults} />}
            {format === 3 && <ButtonSelectExplanation content={content} answer_key={answer_key} processQuestionResults={processQuestionResults} />}
            {format === 4 && <RadioExplanation content={content} answer_key={answer_key} processQuestionResults={processQuestionResults} />}
            {format === 5 && <CheckboxExplanation content={content} answer_key={answer_key} processQuestionResults={processQuestionResults} />}
            {format === 6 && <WordScrambleExplanation content={content} processQuestionResults={processQuestionResults} />}
            {format === 7 && <SRExplanation content={content} answer_key={answer_key} processQuestionResults={processQuestionResults} />}
            {format === 8 && <WordsSelect content={content} answer_key={answer_key} processQuestionResults={processQuestionResults} />}
            {format === 10 && <DropDown content={content} processQuestionResults={processQuestionResults} />}
            {format === 12 && <SentenceScramble content={content} processQuestionResults={processQuestionResults} />}
            { explanation &&
            <div className="bg-cyan-200 mt-3 p-2">{explanation}</div>
          }
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

export default IncorrectModal