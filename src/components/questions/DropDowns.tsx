import {  useState, useEffect, forwardRef, useImperativeHandle} from 'react';
import { type ChildRef } from '../TakeQuiz';

interface InputField {
  id: string;
  type: string;
  value: string[] | string;
}

interface Props {
    content: string | undefined;
  }


  export const DropDowns = forwardRef<ChildRef, Props>((props, ref) => {
 
  const [inputFields, setInputFields] = useState<InputField[] | undefined >([])
  /*
  const [inputFields, setInputFields] = useState<InputField[]>([
    { id: '1', type: 'static_text', value: 'who' },
    { id: '2', type: 'static_text', value: 'are' },
  ]);
  */

  function shuffle(array:string[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  useEffect(() => {
    //console.log("in HERE DropDowns useEffect with content:", props.content);
    const regExp = /\[.*?\]/g
    const  matches = props.content?.match(regExp);
    //console.log("MATCHES:", matches)
    //matches = ["[sentence]","[square brackets]"]
    //remove the square brackets from matches
    const matches_no_brackets =  matches?.map((item) => {
        return item.replace('[', '').replace(']', '')
    })
    // Use a regular expression to split the sentence
    const array = props.content?.split(/\[|\]/);
    
    // Filter out empty strings that might result from consecutive brackets
    const filteredArray = array?.filter(item => item.trim() !== "");
  
    const cloze_content_array = filteredArray?.map((part, index) => {
      const found = matches_no_brackets?.find((match) => part === match);
      if (found) {
        let option_values = part.replace('^','').split('/')
        return { id: index.toString(),  type: 'input', value: shuffle(option_values)}
      }
      else
        return { id: index.toString(), type: 'static_text', value: part}
    })
    
    //console.log("MMMMMOOOOO", cloze_content_array)
    setInputFields(cloze_content_array)
    
  },[props.content])

  const getAnswer = () => {
    //console.log("here")
    var input_error = false
    var user_answer;
    
    var cloze_answers = document.getElementsByClassName("cloze_answer");
    //console.log("XXXXXXXXXXXX", cloze_answers)
    const marray = [];
    for (let i = 0; i < cloze_answers.length; i++) {
      var input_el = cloze_answers[i] as HTMLInputElement
      //console.log("ZZZZZZZZZZZZ"+input_el.value)
      
      if (input_el.value.length > 0 ) {
              marray.push(input_el.value);
      }
      else {
            input_error = true
      }
    }
    if (!input_error ) {
      if (marray.length > 1) {
        user_answer = marray.join('/')
      }
      else {
        user_answer = marray[0]
      }
      //return user_answer
      //props.setUserAnswer(user_answer)
    }
    //const butt = document.getElementById('submit')
    //butt?.setAttribute("disabled", "");
    //setButtonDisabled(true)
    return user_answer
  }

  /**
   * Expose the `test` function to the parent component.
   */

  useImperativeHandle(ref, () => ({
    getAnswer,
  }));

    return (
      <>
        <div className='flex flex-row flex-wrap gap-2'>
          {inputFields?.map((field) => (
            <div key={field.id}>
              {field.type === 'input' ?
                <select className='bg-blue-200 cloze_answer' defaultValue="">
                  <option value="" disabled>
                    &nbsp;
                  </option>
                  {(field.value as string[]).map((choice, index) => {
                    return (
                      <option key={index} id={index.toString()} value={choice}>
                        {choice}
                      </option>
                    );
                  })}
                </select>
                :
                <span>{field.value}</span>
              }
            </div>
          ))}
        </div>
      </>
    );
});
