
import type { QuestionAttemptAssesmentResultsProps } from "../shared/types";

type Props = {
  content: string;
  answer_key: string;
  processQuestionResults?: QuestionAttemptAssesmentResultsProps
};

const RadioExplanation = ({ answer_key,  processQuestionResults }: Props) => {
   
   return (
    <>
      <div>{answer_key}</div>
      <div>Score: {processQuestionResults?.score}</div>
 
  </>
  )
 
 
};
export default RadioExplanation;
