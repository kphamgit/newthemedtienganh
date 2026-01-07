import type { QuestionAttemptAssesmentResultsProps } from "../shared/types";

interface Props {
  content: string;
  processQuestionResults?: QuestionAttemptAssesmentResultsProps
}

const WordScrambleExplanation = ({ content }: Props) => {
    return (
      
      <div>
        {content.split('/').map((word, index) => (
          <span className="m-1" key={index}>{word}</span>
        ))}
      </div>
      
    );
  };

  export default WordScrambleExplanation;