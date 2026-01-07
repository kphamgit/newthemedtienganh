import { useEffect, useState } from "react";
import type { QuestionAttemptAssesmentResultsProps } from "../shared/types";

interface Props {
  content: string;
  processQuestionResults?: QuestionAttemptAssesmentResultsProps
}

interface DisplayProps {
  text: string,
  type: 'normal_text' | 'bracketed_text',
}

const DropDown = ({ content }: Props) => {

  const [displayArray, setDisplayArray] =  useState<DisplayProps[]>([]);

  useEffect(() => {
    //console.log("DropDown content:", content);
    // using regex, search for bracketed words with slashes, keep the words without the "hat" symbol 
    // and remove those without the "hat" symbol
    const new_string = content.replace(/\[\^([^\]]*?)\/([^\]]*?)\]/g, '[$1]');
    //console.log("DropDown processed content:", new_string);
    // I [am] a farmer and they [are] teachers.
    // split new_string into array of DisplayProps using spaces as delimiter
    const display_array: DisplayProps[] = new_string.split(' ').map((word) => {
      //console.log("DropDown word:", word);
      if (word.startsWith('[') && word.endsWith(']')) {
        return {
          text: word.slice(1, -1),
          type: 'bracketed_text',
        }
      } else {
        return {
          text: word,
          type: 'normal_text',
        }
      }
    });
    //console.log("DropDown display_array:", display_array);
    setDisplayArray(display_array);
  }, [content])

    return (
      
      <div>
    
        { displayArray && displayArray.length > 0 ? (
          displayArray.map((item, index) => (
            <span 
              key={index} 
              className={item.type === 'bracketed_text' ? 'm-1 text-amber-700 p-1' : 'm-1'}
            >
              {item.text}
            </span>
          ))
        ) : (
          <span>{content}</span>
        )
        }
      </div>
      
    );
  };

  export default DropDown;