import { useState, useEffect, forwardRef, useImperativeHandle, useRef} from 'react';
import { type ChildRef } from '../TakeQuiz'

interface InputField {
  id: string;
  type: string;
  value: string;
}


interface Props {
    content: string | undefined;
  }
  
  export const DynamicWordInputs = forwardRef<ChildRef, Props>((props, ref) => {
 
  const [inputFields, setInputFields] = useState<InputField[] | undefined >([])
  const [maxLength, setMaxLength] = useState<number>()
  const inputRefs = useRef<HTMLInputElement[]>([]);

  // example cloze sentence:  How [are] you? # I'm fine, [thank] you.

useEffect(() => {
  const regExp = /\[.*?\]/g
  const  matches = props.content?.match(regExp);
  //console.log("aaaa matches =", matches)
  //[ "[are]", "[thank]"]

  let length_of_longest_word = 1;
  if (matches) {
    for (var i = 0; i < matches.length; i++) {
      if (matches[i].length > length_of_longest_word) {
        //console.log(" longest", (matches[i].length + 1))
        length_of_longest_word = matches[i].length + 1
        
      }
    }
    //console.log(" longest",length_of_longest_word)
    setMaxLength(length_of_longest_word)
  }

  //

  //remove the square brackets from matches
  const matches_no_brackets =  matches?.map((item) => {
      return item.replace('[', '').replace(']', '')
  })
  //console.log("MMMM matches no brackets=", matches_no_brackets)
  // ["are", "thank"]
  //[ "are","<br />","thank"]

  // Use a regular expression to split the sentence
  const array = props.content?.split(/\[|\]/);
  //console.log("NNN array=", array)
  // ["How ", "are", " you? # I'm fine, ", "thank"," you." ]
  //[ "How ","are", " you? ", "<br />", " I'm fine, ","thank", " you." ]

  // Filter out empty strings that might result from consecutive brackets
  const filteredArray = array?.filter(item => item.trim() !== "");
  //console.log("OOO filteredArray=", filteredArray)
  //["How ", "are", " you? # I'm fine, ", "thank"," you." ]
  //[ "How ","are", " you? ", "<br />", " I'm fine, ","thank", " you." ]


  const cloze_content_array = filteredArray?.map((part, index) => {
    const found = matches_no_brackets?.find((match) => part === match);
    if (found) {
      if (part.includes('#')) {
        //console.log(" found new line tag =", part)
        return { id: index.toString(),  type: 'newline_tag', value: part,}
      }
      else {
        return { id: index.toString(),  type: 'input', value: "  ",}
      }
    }
    else {
      //console.log(" found static text part =", part)
      return { id: index.toString(), type: 'static_text', value: part}
    }
  })
 // console.log("XXXX cloze_content_array=", cloze_content_array)
  /*
{id: '0', type: 'static_text', value: 'How '}
{id: '1', type: 'input', value: '  '}
{id: '2', type: 'static_text', value: " you? # I'm fine, "}
{id: '3', type: 'input', value: '  '}
  */
  setInputFields(cloze_content_array)
  
},[props.content])

  const getAnswer = () => {
    const answer_array: string[]  = []
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
    setInputFields((prevFields) =>
      prevFields?.map((field) => (field.id === id ? { ...field, value } : field))
    );
  };

    function renderContent(type: string, value: string, id: string, index: number) {
      if (type === 'input') {
        return (
          <div className="relative inline-block">
            <div className="absolute -top-7 left-0">
              <div className="relative bg-lime-300 text-lime-900 px-2 py-0 
              rounded-xl text-sm font-medium shadow border-[0.5px] border-lime-600">
                draw
                <div className="absolute left-3 -bottom-1 w-2 h-2 
                bg-lime-300 rotate-135  border-r-[0.5px]  border-t-[0.5px] border-lime-600"></div>
              </div>
            </div>

            <input
              className='px-4 py-0 border-2 border-blue-400 rounded-md 
           focus:outline-none focus:ring-2 focus:ring-blue-300'
              type="text"
              value={value}
              size={maxLength}
              onChange={(e) => handleInputChange(id, e.target.value)}
              ref={(el: HTMLInputElement) => {
                inputRefs.current[index] = el;
              }}
            />
          </div>
        )
      }
      else if (type === "newline_tag") {
        if (value === '#') {
          return (<span><br /></span>)
        }
        else {
          return (<span><br />&nbsp;&nbsp;&nbsp;&nbsp;</span>)
        }
      }
      else {
        return (<span style={{  marginLeft: 3, lineHeight : 2, padding: 3 }}>{value}</span>)
      }
    }

  return (
    <>
    <div className=' text-textColor1'>
        {inputFields?.map((field, index) => (
          <span key={index}>
          {renderContent(field.type, field.value, field.id, index) }
          </span>
        ))
    }
    </div>
    </>
  );
});

/*

 if (type === 'input') {
        return (
        <>
        <input
          className='bg-green-300 rounded-md cloze_answer'
          type="text"
          value={value}
          size={maxLength}
          onChange={(e) => handleInputChange(id, e.target.value)}
          ref={(el: HTMLInputElement) => {
            inputRefs.current[index] = el;
          }}
        />


<div className="relative inline-block">
  <div className="absolute -top-7 left-3 bg-lime-200 text-lime-800 
              px-3 py-1 rounded-full text-sm font-medium shadow">
    draw
  </div>
  <input
    type="text"
    className="w-64 px-4 py-3 border-2 border-blue-400 rounded-md 
           focus:outline-none focus:ring-2 focus:ring-blue-300"
    placeholder=""
  />
</div>
*/
