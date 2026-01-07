
import type { QuestionAttemptAssesmentResultsProps } from "../shared/types";

type Props = {
  content: string;
  processQuestionResults?: QuestionAttemptAssesmentResultsProps
};

const ButtonSelectExplanation = ({ processQuestionResults }: Props) => {
 
   
   return (
    <>
      <div>Score: {processQuestionResults?.score}</div>
 
  </>
  )
 
 
};
export default ButtonSelectExplanation;
