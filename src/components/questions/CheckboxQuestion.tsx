import React, { forwardRef, useEffect, useImperativeHandle, useState} from "react";
import { type ChildRef } from '../TakeQuiz';

interface Props {
    content: string | undefined;
    //question: QuestionProps
  }

  interface OptionProps {
    options: { value: string; label: string }[];
  }
  
/*
forwardRef is a React feature that allows a parent component to access the DOM node of a child component. 
It is used when a parent component needs to interact with a child component's DOM element, 
for example, to set focus or get its size and position.
*/

export const CheckboxQuestion = forwardRef<ChildRef, Props>((props, ref) => {
  
  const [myOptions, setMyOptions] = useState<OptionProps>()
  const [checkeds, setCheckeds] = useState<{[key: string]: boolean}>({})

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //setSelectedValue(event.target.value);
    setCheckeds({...checkeds, [event.target.value]: event.target.checked});
  };

  
  useEffect(() => {
     // split content by '/' to get options
      let temp = []
      let options = props.content?.split('/')
      if (options) {
        for (let i=0; i<options.length; i++) {
          temp.push({value: `choice${i+1}`, label: options[i]})
        }
      }
     setMyOptions({options: temp})
  },[props.content])

  
  const getAnswer = () => {
    //return selectedValue
    // join checked options with '/' and return
    let answers = []
    for (let key in checkeds) {
      if (checkeds[key]) {
        answers.push(key)
      }
    }
    return answers.join('/')
  }

  useImperativeHandle(ref, () => ({
    getAnswer,
  }));

  return (
    <div className="flex flex-col items-start justify-center p-4">
    <div className="flex flex-col">
      {myOptions?.options.map((option) => (
        <label key={option.value}>
          <input className="m-2"
            type="checkbox"
            value={option.value}
            checked={checkeds[option.value] || false}
            onChange={handleChange}
          />
          {option.label}
        </label>
      ))}
    </div>
    </div>
  );
});
