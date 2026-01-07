import type { QuestionAttemptAssesmentResultsProps } from "../shared/types";

interface Props {
  content?: string;
  answer_key: string;
  processQuestionResults?: QuestionAttemptAssesmentResultsProps
}

const WordsSelect = ({ answer_key }: Props) => {
    return (
      
      <div>
        {answer_key.split('/').map((word, index) => (
          <span className="m-1 bg-amber-400 p-1" key={index}>{word}</span>
        ))}
      </div>
      
    );
  };

  export default WordsSelect;