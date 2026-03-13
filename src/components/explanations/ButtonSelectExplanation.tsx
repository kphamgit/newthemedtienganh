
import type { QuestionAttemptAssesmentResultsProps } from "../shared/types";

type Props = {
  content: string;
  answer_key: string;
  processQuestionResults?: QuestionAttemptAssesmentResultsProps
};

const ButtonSelectExplanation = ({ answer_key }: Props) => {
 
   
   return (
    <>
      <div>{answer_key}</div>
   
 
  </>
  )
 
 
};
export default ButtonSelectExplanation;
