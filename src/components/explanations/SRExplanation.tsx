
import { useEffect } from "react";
import type { QuestionAttemptAssesmentResultsProps } from "../shared/types";

type Props = {
  content: string;
  answer_key: string;
  processQuestionResults?: QuestionAttemptAssesmentResultsProps
};

const SRExplanation = ({ content, answer_key, processQuestionResults }: Props) => {
   
   useEffect(() => {
    console.log("SRExplanation useEffect called with content = ", content, " answer_key = ", answer_key, " processQuestionResults = ", processQuestionResults)
   }, [content, answer_key, processQuestionResults])

   return (
    <>
      <div>{answer_key}</div>
      <div className="mt-3 text-amber-700">Score: {processQuestionResults?.score}</div>
 
  </>
  )
 
 
};
export default SRExplanation;
