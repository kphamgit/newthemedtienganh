
import { useEffect, useState } from "react";
import type { QuestionAttemptAssesmentResultsProps } from "../shared/types";

type Props = {
  content: string;
  answer_key: string;
  processQuestionResults?: QuestionAttemptAssesmentResultsProps
};

const CheckboxExplanation = ({ answer_key }: Props) => {

    const[answerKeyArray, setAnswerKeyArray] =  useState<string[]>([]);

  useEffect(() => {
    if (answer_key) {
      const answers = answer_key.split('/').map(ans => ans.trim());
      setAnswerKeyArray(answers);
    }
  }, [answer_key])

   return (
    <>
      <div>
        {
          answerKeyArray && answerKeyArray.length > 0 ? (
            <ul>
              {answerKeyArray.map((ans: any, index: number) => (
                <li key={index}>{ans}</li>
              ))}
            </ul>
          ) : (
            <span>{answer_key}</span>
          )
        }

      </div>
     
 
  </>
  )
 
 
};
export default CheckboxExplanation;
