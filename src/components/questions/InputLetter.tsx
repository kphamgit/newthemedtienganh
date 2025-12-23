import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
//import styles from "./input_letter_style.module.css";
import { type InputLetterRef } from '../shared/types';
//import { color } from 'framer-motion';

  interface Props {
    word: string | undefined;
    my_id: number
  }


export const InputLetter= forwardRef<InputLetterRef, Props>((_props, ref) => {
    const [inputVal, setInputVal] = useState<string>()
    const input_box_ref = useRef<HTMLInputElement>(null)

      const getFillContent = () => {
         return inputVal
      }

      useImperativeHandle(ref, () => ({
        getFillContent,
      }));

   
    return (
        <>
          <div>
          <input className='letter-input text-textColor3'  type="text" maxLength={1} 
            ref={input_box_ref}
            onChange={(e) => setInputVal(e.target.value)}
          />
          </div>
        </>
      );
})

/*
return (
    <>
    
    <div className='flex flex-row flex-wrap gap-2'>
      {inputFields?.map((field) => (
        <div key={field.id}>
          { field.type === 'input' ?
          <input
          className='bg-red-200 rounded-md cloze_answer'
            type="text"
            value={field.value}
            size={maxLength}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          />
          :
          <span>{field.value}</span>
          }
        </div>
      ))}
     
    </div>
    
    </>
  );
*/