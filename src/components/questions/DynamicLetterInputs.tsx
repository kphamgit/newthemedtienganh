import { useState, useEffect, forwardRef, useImperativeHandle, useRef} from 'react';
import { type ChildRef } from '../TakeQuiz';
import { type InputLetterRef } from '../shared/types'
import { InputLetter } from './InputLetter';


interface InputField {
  id: string;
  type: string;
  value: string;
  part_of_word: boolean
  blank_letter_index: number
}

interface Props {
    content: string | undefined;
  }


  export const DynamicLetterInputs = forwardRef<ChildRef, Props>((props, ref) => {
 
  const [inputFields, setInputFields] = useState<InputField[] | undefined >([])

  const inputLetterRefs = useRef<InputLetterRef[]>([]);

  useEffect(() => {
    //example sentence: Ha[ve] a nice day.
    //check if a word is broken by square bracket(s)
    const cloze_content_array: InputField[] = []
    let index: number = 0
    let blank_letter_index = 0
    //let blank_letter_found = false
    // Ha[ve] a nice day.
    const doAWord = (word:string) => {
     
      if (word.includes('[')) {
        //blank_letter_found = true
      const regExp = /\[.*?\]/g
      const  matches = word.match(regExp);
      //console.log("MMMM", matches)  /* array: ["ve"]  */
      const matches_no_brackets =  matches?.map((item) => {
          return item.replace('[', '').replace(']', '')
      })
      //console.log("NNNN matches no_brackets", matches_no_brackets)
      if (matches_no_brackets && matches_no_brackets.length > 0) {
        //const first_match = matches_no_brackets[0]
      //console.log("....first match", first_match)  // ve
      //const parts = first_match.split('')
      //console.log("...parts", parts)  // array: ["v", "e"]
      const array = word.split(/\[|\]/);
      //console.log("xxxxYYYYYY  array", array)
      // Filter out empty strings that might result from consecutive brackets
      const filteredArray = array?.filter(item => item.trim() !== "");
      //console.log(".....QQQQ filtered array", filteredArray)
      
        //let blank_count = 0
        filteredArray?.forEach( (part) => {
          const found = matches_no_brackets?.find((match) => part === match);
          if (found) {
              //console.log("found", found)
              const letters = found.split('')
              //console.log("letters=", letters)
              letters.forEach((letter) => {
                //console.log(" pushing letter", letter)
                 cloze_content_array.push({ id: index.toString(),  type: 'input', value: letter, part_of_word: true, blank_letter_index: blank_letter_index} as InputField)
                 index = index + 1
                 //blank_count = blank_count + 1
                 blank_letter_index = blank_letter_index + 1
              })
          }
          else {
            //console.log(" pushing text", part)
            cloze_content_array.push({ id: index.toString(), type: 'static_text', value: part, part_of_word: true} as InputField)
            index = index + 1
          }
        })

          //console.log("......PPPPP cloze_content_array", cloze_content_array)
          //console.log("......QQQQQ blank count", blank_count)

      }
      else {
        console.log("undefined matches no brackets")
      }
    }
    else {
     // console.log("herereeee")
      cloze_content_array.push({ id: index.toString(), type: 'static_text', value: word, part_of_word: false} as InputField)
      index = index + 1
    }
    //console.log("calling.... cloze content array1", cloze_content_array)
    setInputFields(cloze_content_array)
    }

    const my_words = props.content?.split(' ')
       //console.log("EEEEEEE my_words", my_words)
       my_words?.forEach(word => {
        //if (word.includes('[')) {
          //console.log("HHHHH word", word)
            doAWord(word)
        //}
       })

  },[props.content])

  const getAnswer = () => {
    //console.log("getAnser here")
    //getAnswer from InputWord
    //var user_answer = inputWordRef.current?.getFillContent()
    
    const answer_array: string[]  = []
    inputLetterRefs.current.forEach(myref => {
      if (myref) {
        //console.log("UUUUU", myref.getFillContent())
        answer_array.push(myref.getFillContent()!)
      }
    });
    
    //var user_answer = inputLetterRefs.current[0].getFillContent()
   // console.log(" user_answer", user_answer)
    //var input_error = false
    return answer_array.join('/')
    
  }

  /**
   * Expose the `test` function to the parent component.
   */
  useImperativeHandle(ref, () => ({
    getAnswer,
  }));

  function renderContent(type: string,  value: string,  part_of_word: boolean, blank_letter_index: number) {
    if (type === 'input') {
      return <InputLetter word={value} my_id={blank_letter_index}
      ref={(el: InputLetterRef) => {
        inputLetterRefs.current[blank_letter_index] = el;
      }}
      />
    } else if (part_of_word) {
      return <span className='text-3xl ml-0 mr-0'>{value}</span>
    }
    else {
      
      return <span className='text-3xl mx-2'>{value}</span>
    }
  }

  return (
    <>
    <div className='flex flex-row flex-wrap'>
       { inputFields?.map((field, index) => (
          <div key={index}>
            {renderContent(field.type, field.value, field.part_of_word, field.blank_letter_index)}
          </div>
       ))}
    </div>
    
    </>
  );
});
