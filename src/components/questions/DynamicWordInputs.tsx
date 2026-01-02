import { useState, useEffect, forwardRef, useImperativeHandle, useRef} from 'react';
import { type ChildRef } from '../TakeQuiz'
import { v4 as uuidv4 } from "uuid";


export interface InputField {  // this is used in both Cloze question,  and explanation components for Cloze questions
  id: string;
  blank_index?: number;
  type: string;
  value: string;
  blank_prompt?: string;
  error?: boolean;  // used ONLY in explanation display
}


interface Props {
    content: string | undefined;
  }
  
  export const DynamicWordInputs = forwardRef<ChildRef, Props>((props, ref) => {
 
  //const [inputFields, setInputFields] = useState<InputField[] | undefined >([])
  const [arrayOfInputFields, setArrayOfInputFields] = useState<InputField[][]>() // array of input fields 
  // each input field corresponds to a sentence
  const [maxLength, setMaxLength] = useState<number>()
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const blankIndex = useRef<number>(-1);

  // example cloze question with multiple sentences:  How [are] you?/I'm fine, [thank] you.
  useEffect(() => {
    // Split content into sentences by slash "/"
    const sentences_array = props.content?.split('/');
    //console.log("&&&&&&&&&&&&&&&&&&&&& sentences_array =", sentences_array);
  
    // Temporary array to hold all input fields
    const tempArrayOfInputFields: InputField[][] = [];
  
    // Iterate through each sentence and process it to create input fields
    sentences_array?.forEach((sentence) => {
      //console.log("*************** sentence =", sentence);
      /*
Jim [was(to be)] looking out his window. He [saw(see)] two men in his neighbor's driveway.
      */

      const regExp = /\[.*?\]/g;
      const matches = sentence.match(regExp);
      //console.log("MMMM matches =", matches);
      /*
[
    "[was(to be)]",
    "[saw(see)]"
]
      */
  
      // Determine the length of the longest word within brackets for input size
      // but first, check if the bracketed word contains a prompt in parentheses
      // if so, remove the parentheses and prompt from the length calculation
      const processed_matches = matches?.map((item) => {
        const prompt_index = item.indexOf('(');
        if (prompt_index !== -1) {
          return item.substring(0, prompt_index) + ']'; // keep up to the opening parenthesis
        }
        return item;
      });
      //console.log("MMMMM processed_matches =", processed_matches);

      let length_of_longest_word = 1;
      if (processed_matches) {
        for (let i = 0; i < processed_matches.length; i++) {
          if (processed_matches[i].length > length_of_longest_word) {
            length_of_longest_word = processed_matches[i].length;
          }
        }
        setMaxLength(length_of_longest_word);
      }
  
      const array_of_bracket_contents = matches?.map((item) => {
        return item.replace('[', '').replace(']', '');
      });
      //console.log("MMMMM array_of_bracket_contents=", array_of_bracket_contents);
  
      const array_of_sentence_parts = sentence.split(/\[|\]/);
      //console.log("MMMMMM array_of_sentence_parts=", array_of_sentence_parts);
  
      const input_fields_array: InputField[] = array_of_sentence_parts?.map((part) => {
        const found = array_of_bracket_contents?.find((match) => part === match);
        if (found) {
          //console.log("MMMMM found input part =", part);
          if (part.includes('(')) {
            const blank_prompt = part.match(/\(([^)]+)\)/)?.[1] || '';
            blankIndex.current = blankIndex.current + 1;
            return { id: uuidv4(), blank_index: blankIndex.current, type: 'input', value: "  ", blank_prompt: blank_prompt };
          }
          blankIndex.current = blankIndex.current + 1;
          return { id: uuidv4(), blank_index: blankIndex.current, type: 'input', value: "  " };
        } else {
          return { id: uuidv4(), type: 'static_text', value: part };
        }
      });
     // console.log("YYYYYYYYYYYYYYYYYYYYYYYYY------------- input_fields_array=", input_fields_array);
  
      // Add the input fields array to the temporary array
      tempArrayOfInputFields.push(input_fields_array);
    });
  
    // Update the state only once
    setArrayOfInputFields(tempArrayOfInputFields);
  }, [props.content]);



  const getAnswer = () => {
    const answer_array: string[]  = []
    //console.log("getAnswer CALLLED inputRefs.current =", inputRefs.current)
    inputRefs.current.forEach(myref => {
      if (myref) {
        //console.log(myref.getFillContent())
        answer_array.push(myref.value)
      }
    });
    return answer_array.join('/')
    
  }

  /**
   * Expose the `test` function to the parent component.
   */
  useImperativeHandle(ref, () => ({
    getAnswer,
  }));

  const handleInputChange = (id: string, value: string) => {
    //console.log("handleInputChange id=", id, " value=", value)
    if (arrayOfInputFields) {
      const updatedArrayOfInputFields = arrayOfInputFields.map((sentence_fields) =>
        sentence_fields.map((field) =>
          field.id === id ? { ...field, value: value } : field
        )
      );
      setArrayOfInputFields(updatedArrayOfInputFields);
    }
  };

    function renderField(type: string, value: string, id: string, blank_index: number,  blank_prompt: string) {
      //console.log("renderContent type=", type, " value=", value)
      if (type === 'input') {
        return (
          <div className="relative inline-block my-3">
            {blank_prompt &&
              <div className="absolute -top-7 left-0">
                <div className="relative bg-lime-300 text-lime-900 px-2 py-0 
              rounded-xl text-sm font-medium shadow border-[0.5px] border-lime-600">
                  {blank_prompt}
                  <div className="absolute left-3 -bottom-1 w-2 h-2 
                bg-lime-300 rotate-135  border-r-[0.5px]  border-t-[0.5px] border-lime-600"></div>
                </div>
              </div>
            }
            <input
              className='px-1 py-0 border-2 border-blue-400 rounded-md 
           focus:outline-none focus:ring-1 focus:ring-blue-300'
              type="text"
              value={value}
              size={maxLength}
              onChange={(e) => handleInputChange(id, e.target.value)}
              ref={(el: HTMLInputElement) => {
                inputRefs.current[blank_index] = el;
              }}
            />
          </div>
        )
      }
      else {
        return (<span style={{ marginLeft: 3, lineHeight: 2, padding: 3 }}>{value}</span>)
      }
    }

  const renderSentence = (inputFields: InputField[]) => {
    return inputFields.map((field, index) => {
      return (
        <span key={index}>
          {renderField(field.type, field.value, field.id, field.blank_index ?? -1, field.blank_prompt ?? '')}
        </span>
      );
    });
  }
  return (
    <>
    <div className=' text-textColor1'>
        { arrayOfInputFields?.length &&
        arrayOfInputFields?.map((sentence_fields, sentence_index) => 
        { return (
          <div key={sentence_index} className="mb-2">
            {renderSentence(sentence_fields)}
          </div>
        )}
      )
    }
    </div>
    </>
  );
});

/*
   if (found) { 
      // found a match for a blank input field within the filteredArray
        console.log(" found input part =", part)  // e.g. was(am)
        // if part contains parentheses, extract the blank prompt within the parentheses, using regular expression
        if (part.includes('(')) {
          const blank_prompt = part.match(/\(([^)]+)\)/)?.[1] || ''
          return { id: index.toString(),  type: 'input', value: "  ", blank_prompt: blank_prompt}
        }
        return { id: index.toString(),  type: 'input', value: "  "}
    }
    else {
      //console.log(" found static text part =", part)
      return { id: index.toString(), type: 'static_text', value: part}
    }
*/

/*
return (
    <>
    <div className=' text-textColor1'>
        { arrayOfInputFields?.length && 
          <div>{arrayOfInputFields.length} sentences</div>
        }
        { arrayOfInputFields?.length &&
        arrayOfInputFields[0]?.map((field, index) => 
        { return (
          console.log("field =", field),
          <span key={index}>
          {renderField(field.type, field.value, field.id, field.blank_prompt ?? '', index) }
          </span>
        )}
      )
    }
    </div>
    </>
  );
*/

