import { useEffect, useState } from "react";
//import { type InputField } from '../questions/DynamicWordInputs';
import { v4 as uuidv4 } from "uuid";
import type { QuestionAttemptAssesmentResultsProps } from "../shared/types";


interface InputField {  // this is used in both Cloze question,  and explanation components for Cloze questions
  id: string;
  type: string;
  value: string;
  error?: boolean;  // used ONLY in explanation display
}

interface ClozeQuestionResultsContent {
  user_answer: string,   
  answer_key: string,
  score: number,
  error_flag: boolean,
}

type Props = {
  content: string;
  processQuestionResults?: QuestionAttemptAssesmentResultsProps
};

const ClozeExplanation = ({ content,  processQuestionResults }: Props) => {
 
  const [arrayOfInputFields, setArrayOfInputFields] = useState<InputField[][]>() // array of input fields 

  
  useEffect(() => {
    const tempArrayOfInputFields: InputField[][] = [];
          //const sentence = content
          const sentences_array = content?.split('/');
          sentences_array?.forEach((sentence) => {
            const array_of_bracket_contents  = processQuestionResults?.cloze_question_results as ClozeQuestionResultsContent[] | undefined;
            const array_of_sentence_parts = sentence.split(/\[|\]/);
            
            // clean up any empty string at the beginning or end of array_of_sentence_parts caused by split
            const cleaned_array_of_sentence_parts = array_of_sentence_parts?.filter((part) => part.trim() !== '');

            const input_fields_array = cleaned_array_of_sentence_parts?.map((part) => {
              // Find the index of the matched item
              const matchIndex = array_of_bracket_contents?.findIndex((match) =>
                match.answer_key.includes(part)
              );
            
              if (matchIndex !== -1 && matchIndex !== undefined) {
                const found = array_of_bracket_contents?.[matchIndex]; // Get the matched value using the index           
                return {
                  id: uuidv4(),
                  type: "input",
                  error: found?.error_flag,
                  //value: part.split(",")[0].trim(),
                  value: found?.answer_key.replace('*','/'), // if answer_key is "who*that", display "who/that" in the input field
                };
              } else {
                return { id: uuidv4(), type: "static_text", value: part };
              }
            });
            //console.log("----- XXXXXXXXX------------- input_fields_array=", input_fields_array);
            // Add the input fields array to arrayOfInputFields state
            //setArrayOfInputFields((prevArray) => [...(prevArray || []), input_fields_array]);
            tempArrayOfInputFields.push(input_fields_array as InputField[]);
        
          setArrayOfInputFields(tempArrayOfInputFields);
          })
  }, [content, processQuestionResults ])
  
   return (
    <>
      { arrayOfInputFields?.map((sentence_array, index) => (
        <div key={index} className="mt-3 text-green-700">
          {sentence_array.map((field) => {
            if (field.type === 'input') {
              return (
                <span key={field.id} className={field.error ? 'text-red-700 font-bold' : 'text-blue-800 font-bold'}>
                  {field.value}
                </span>
              );
            } else {
              return <span key={field.id}>{field.value}</span>;
            }
          })}
        </div>
      ))
      }

  </>
  )
};
export default ClozeExplanation;

