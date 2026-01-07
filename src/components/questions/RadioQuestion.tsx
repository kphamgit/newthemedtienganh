import React, { forwardRef, useEffect, useImperativeHandle, useState} from "react";
//import { Radio, Label} from "flowbite-react";
//import { QuestionProps } from "./types";
import { type ChildRef } from '../TakeQuiz';


interface Props {
    //content: string | undefined;
    //question: QuestionProps
    content: string | undefined;
  }

  interface OptionProps {
    options: { value: string; label: string }[];
  }
  
/*
forwardRef is a React feature that allows a parent component to access the DOM node of a child component. 
It is used when a parent component needs to interact with a child component's DOM element, 
for example, to set focus or get its size and position.
*/

export const RadioQuestion = forwardRef<ChildRef, Props>((props, ref) => {
  
  const [selectedValue, setSelectedValue] = useState('');
  const [myOptions, setMyOptions] = useState<OptionProps>()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value);
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
  
    /*
  useEffect(() => {
     let temp = []
     temp.push({value: 'choice1', label: props.question.radio.choice_1_text})
     temp.push({value: 'choice2', label: props.question.radio.choice_2_text})
     temp.push({value: 'choice3', label: props.question.radio.choice_3_text})
     temp.push({value: 'choice4', label: props.question.radio.choice_4_text})
     setMyOptions({options: temp})
  },[props.question.radio])
*/

  const getAnswer = () => {
    return selectedValue
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
            type="radio"
            value={option.value}
            checked={selectedValue === option.value}
            onChange={handleChange}
          />
          {option.label}
        </label>
      ))}
    </div>
    </div>
  );
});
