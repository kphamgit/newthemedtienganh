import { useEffect, useState } from "react";
import { type InputField } from '../questions/DynamicWordInputs';
import { v4 as uuidv4 } from "uuid";
import type { QuestionAttemptAssesmentResultsProps } from "../shared/types";

type Props = {
  content: string;
  processQuestionResults?: QuestionAttemptAssesmentResultsProps
};

const ClozeExplanation = ({ content, processQuestionResults }: Props) => {
 
  const [arrayOfInputFields, setArrayOfInputFields] = useState<InputField[][]>() // array of input fields 
  

  /*
{
    "error_flag": true,
    "score": 0,
    "cloze_question_results": [
        {
            "user_answer": "nn",
            "answer_key": "am",
            "error_flag": true,
            "score": 0
        },
        {
            "user_answer": "zz",
            "answer_key": "are",
            "error_flag": true,
            "score": 0
        }
    ]
}
  */
  
   useEffect(() => {
      // retrieve cloze question results from processQuestionResults prop
      const cloze_question_results = processQuestionResults?.cloze_question_results;
      //console.log("ClozeExplanation cloze_question_results =", cloze_question_results);
     // search content for bracketed words and replace each bracketed word with corresponding user answer and error flag
     const regExp = /\[.*?\]/g;
      let result_index = 0;
      
      let processed_content = content;
      const matches = content.match(regExp);
      // replace bracketed words with answers and error flags
      matches?.forEach((match) => {
        const answer_key = match.replace('[', '').replace(']', '');
        const question_result = cloze_question_results ? cloze_question_results[result_index] : undefined;
        //const user_answer = question_result ? question_result.user_answer : '';
        const error_flag = question_result ? question_result.error_flag : false;
        //console.log("XXXX answer_key =", answer_key, " user_answer =", user_answer, " error_flag =", error_flag);
        // replace the first occurrence of match in processed_content with user_answer
        processed_content = processed_content.replace(match, `[${answer_key}, ${error_flag}]`);
        //is, true   (KPHAM: use a comma to separate user answer and error flag, don't use a slash 
        //because slash is used to separate sentences)
        result_index += 1;
      });
  
      //console.log("ClozeExplanation processed_content =", processed_content);
      // set the processed content as the new content for further processing
      ///content = processed_content;
  
      const sentences_array = processed_content?.split('/');
      //console.log(" ClozeExplanation sentences_array =", sentences_array);
  
      // Temporary array to hold all input fields
      const tempArrayOfInputFields: InputField[][] = [];
      // Iterate through each sentence and process it to create input fields
      sentences_array?.forEach((sentence) => {
        // console.log("*************** sentence =", sentence);
        const regExp = /\[.*?\]/g;
        const matches = sentence.match(regExp);
        // console.log("MMMM matches =", matches);
        const array_of_bracket_contents = matches?.map((item) => {
          return item.replace('[', '').replace(']', '');
        });
        const array_of_sentence_parts = sentence.split(/\[|\]/);
        //console.log("MMMMMM array_of_sentence_parts=", array_of_sentence_parts);
        const input_fields_array: InputField[] = array_of_sentence_parts?.map((part) => {
          const found = array_of_bracket_contents?.find((match) => part === match);
          if (found) {
            // console.log("MMMMM found input part =", part);
            // part is a string separated by a comma: "is, true" OR "see, false" , in general: "user_answer, error_flag"
            const user_answer = part.split(',')[0].trim();
            const error_flag_string = part.split(',')[1]?.trim();
            const error_flag = error_flag_string === 'true' ? true : false;
            if (part.includes('(')) {
              const blank_prompt = part.match(/\(([^)]+)\)/)?.[1] || '';
              // get the part before the parentheses
              const part_before_parentheses = part.split('(')[0];
              return { id: uuidv4(),  type: 'input', value: part_before_parentheses, error: error_flag, blank_prompt: blank_prompt };
            }
            return { id: uuidv4(),  type: 'input', error: error_flag, value: user_answer };
          } else {
            return { id: uuidv4(), type: 'static_text', value: part };
          }
        });
        //console.log("----- XXXXXXXXX------------- input_fields_array=", input_fields_array);
        // Add the input fields array to arrayOfInputFields state
        //setArrayOfInputFields((prevArray) => [...(prevArray || []), input_fields_array]);
        tempArrayOfInputFields.push(input_fields_array);
      });
      setArrayOfInputFields(tempArrayOfInputFields);
   }, [content, processQuestionResults]);
  
   return (
    <>
    {arrayOfInputFields?.map((inputFields, sentenceIndex) => (
      <div key={sentenceIndex} style={{ marginBottom: '1em' }}>
        {inputFields.map((field) => {
          if (field.type === 'static_text') {
            return (
              <span key={field.id} >
                {field.value}
              </span>
            );
          } else if (field.type === 'input') {
            return (
              <span key={field.id} className={field.error ? "text-red-500 " : "text-green-600" } > 
              {field.value}
            </span>
            );
          }
          return null;
        })}
      </div>
    ))}
  </>
  )
 
 
};
export default ClozeExplanation;
