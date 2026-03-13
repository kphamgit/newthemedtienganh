
import { useEffect, useState } from "react";
import type { QuestionAttemptAssesmentResultsProps } from "../shared/types";

type Props = {
  content: string;
  processQuestionResults?: QuestionAttemptAssesmentResultsProps
};

const SentenceScramble = ({ content }: Props) => {

  const [contentArray, setContentArray] = useState<string[]>([]);

  useEffect(() => {
    if (content) {
      const content_arrays = content.split('/').map(ans => ans.trim());
      setContentArray(content_arrays);
    }
  }, [content])

   return (
    <>
      <div>
        {
          contentArray && contentArray.length > 0 ? (
            <ul>
              {contentArray.map((content: any, index: number) => (
                <li key={index}>{content}</li>
              ))}
            </ul>
          ) : (
            <span>{content}</span>
          )
        }

      </div>
    
 
  </>
  )
 
 
};
export default SentenceScramble;
