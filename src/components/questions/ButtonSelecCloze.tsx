import { useState, useEffect, forwardRef, useImperativeHandle, useRef} from 'react';
import { AnimatedButton } from '../shared/AnimatedButton';
import { type ChildRef } from '../TakeQuiz'

interface InputFieldProps {
  id: string;
  type: string;
  value: string;
}


interface ComponentProps {
    content: string | undefined;
    choices: string | undefined;
   
  }
 
  export type DOMRectPropsType = {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface DropBoxProps {
  id: string;
  value: string;
  available: boolean;
  animatedButtonId: string | null ;
  rect: DOMRectPropsType;
}

 
  //const labels = ['one', 'two']

  // make a dropbox component that takes in a width and height and renders a div with blue background
  const DropBox = (props: { width: number; height: number; id: string, parentFunc: (dropbox: DropBoxProps) => void }) => {

    const dropBoxDivRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      // Get the bounding rectangle when the component mounts
      if (dropBoxDivRef.current) {
        const rect = dropBoxDivRef.current.getBoundingClientRect();
        //console.log(`DropBox: Bounding rectangle for DropBox ${props.id}:`, rect);
        /*
{
    "x": 398.03125,
    "y": 287.5,
    "width": 134.2578125,
    "height": 30,
    "top": 287.5,
    "right": 532.2890625,
    "bottom": 317.5,
    "left": 398.03125
}
        */
       //console.log(" calling parentFunc from DropBox with rect=", rect)
        props.parentFunc({rect: rect, id: props.id, value: '', available: true, animatedButtonId: null} );
      }
    }, []); // Empty dependency array ensures this runs only once on mount
  


    return (
      <div
        ref={dropBoxDivRef} // Attach the ref to the div
        className='bg-red-400 rounded-md cloze_answer p-1 m-1 text-center'
        style={{ width: props.width, height: props.height }}
        id={props.id}
      >
      </div>
    );
  }


  export const ButtonSelectCloze = forwardRef<ChildRef, ComponentProps>((props, ref) => {
 
  const [inputFields, setInputFields] = useState<InputFieldProps[] | undefined >([])

  const [buttonLabels, setButtonLabels] = useState<string[] | undefined>([])

  const [largestDropBoxWidth, setLargestDropBoxWidth] = useState<number>(0);  

  const animatedButtonWidths = useRef<number[]>([]);
  
  const [ready, setReady] = useState<boolean>(false);

  const dropBoxRefs = useRef<DropBoxProps[]>([]);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
     if (!props.choices) {
      console.error("No choices provided in props");
      return;
    }
    //console.log("ButtonSelectCloze...props.choices=", props.choices)
    setButtonLabels(props.choices?.split('/').map((item) => item.trim()) || []);
  }, [props.choices]);

useEffect(() => {

  /*
  const regExp = /\[.*?\]/g
  const  matches = props.content?.match(regExp);
  //console.log("aaaa matches =", matches)
  //
  //remove the square brackets from matches
  const bracketed_strings =  matches?.map((item) => {
      return item.replace('[', '').replace(']', '')
  })
  console.log("MMMMMMMMMMMMM matches no brackets=", bracketed_strings)
  // Use a regular expression to split the sentence
  // use regular expression to split the content by square brackets and by whitespace
  // and also by new line tags
  */
  const content_array = props.content?.split(/(\[.*?\])|(\s+)|(#)/).filter(Boolean);
  //console.log("XXXXXXXYYYYYYYYY array=", content_array)
  /*
  [ "In",    " ", "Vietnam,"," ","students"," ","[usually wear]"," ","uniforms"," ","to"," ","[go to school]"," ","on"," " "Monday."
  ]
  */
  let drop_boxes_count = 0;
  let words_count = 0;
  const input_fields_array: InputFieldProps[] | undefined = content_array?.map((part) => {
    // if part contains a left and right square bracket, then it is a dropbox
    if (part.startsWith('[') && part.endsWith(']')) {
      drop_boxes_count++;
      return { id: 'dropbox_' + drop_boxes_count.toString(), type: 'dropbox', value: '  ' };
    }
    words_count++;
    return { id: 'word_' + words_count.toString(), type: 'static_text', value: part };
  })
  //console.log("YYYYYYYYYXXXXXXXXXX input_fields_array1=", input_fields_array)
  
  setInputFields(input_fields_array)
  
},[props.content])

//useEffect(() => {
 // console.log("****************** inputFields changed: ", inputFields)
//}, [inputFields]);

  const getAnswer = () => {
    // iterate through dropboxRefs and get the values 
   let answer = '';
    dropBoxRefs.current.forEach((dropBox, index) => {
      answer += dropBox.value;
      if (index < dropBoxRefs.current.length - 1) {
        answer += '/';
      }
    }
    );
    //console.log(" ButtonSelectCloze: getAnswer called... user answer =", answer)
   return answer
  }

  /**
   * Expose the `test` function to the parent component.
   */
  useImperativeHandle(ref, () => ({
    getAnswer,
  }));
 
    function renderContent(type: string, value: string, id: string) {
     // console.log(" in renderContent...xxxxxxxxx..type=", type, "value=", value, "id=", id, "index=", index)
      if (type === 'dropbox') {
        return (
         <DropBox
          width={largestDropBoxWidth > 0 ? largestDropBoxWidth : 50}
          height={30}
          id={id}
          parentFunc={(dropbox: DropBoxProps) => {
            //console.log(" ^^^^^^^^^ DropBox parentFunc called... width =", width)
            //console.log(" ********** A DropBox component finished mounting,  dropbox=", dropbox)
            //console.log(" push it to dropBoxComponentRefs.current")
            dropBoxRefs.current.push(dropbox);
          }}
         />)
        }
      else if (type === "newline_tag") {
        if (value === '#') {
          return (<span><br /></span>)
        }
        else {
          return (<span><br />&nbsp;&nbsp;&nbsp;&nbsp;</span>)
        }
      }
      else {  // type = 'static_text'
        return (<span style={{ color: 'black',  marginLeft: 2, lineHeight : 2, padding: 3 }}>{value}</span>)
      }
    }

    const resetDropBox = (dropBoxId: string) => {
      dropBoxRefs.current.map((dropBox) => {
        if (dropBox.id === dropBoxId) {
          //console.log("resetting dropBox ", index);
          dropBox.animatedButtonId = null;
          dropBox.available = true;
          dropBox.value = '';
        }
      });
    }

    const handleAnimatedButtonClicked = (selectedAnimatedButtonId: string, selected_text: string) => {
     // console.log(" in handleAnimatedButtonClicked... dropBoxComponentRefs array=", dropBoxComponentRefs.current)
      //console.log(" ButtonSeleceCloze: handleAnimatedButtonClicked.. selectedText = ", selected_text)
      //console.log("ButtonSeleceCloze: handleAnimatedButtonClicked.. selectedText = ", selected_text, " droppedIndex=", droppedIndex)
      const availableDropBox = dropBoxRefs.current.find(dropBox => dropBox.available);
      // also get the index withing dropBoxComponentRefs.current array of availableDropBox
      //const availableDropBoxIndex = dropBoxComponentRefs.current.findIndex(dropBox => dropBox.available);
      if (availableDropBox) {
        //console.log("available dropbox found", availableDropBox);
        // set animatedButton id in the dropboxes array to the id of this component
        // get dropbox id
        dropBoxRefs.current.map((dropBox) => {
          if (dropBox.id === availableDropBox.id) {
            //console.log("setting dropBox ", index, " animatedButtonId id to ", selectedAnimatedButtonId);
            dropBox.animatedButtonId = selectedAnimatedButtonId;
            dropBox.available = false;
            dropBox.value = selected_text;
          }
        });
      }
      const audioUrl =`https://kphamazureblobstore.blob.core.windows.net/tts-audio/${selected_text}.mp3`;
      const audio = new Audio(audioUrl);
      audio.play().catch((error) => {
          console.error("Error playing audio:", error);
      });
      // return the bounding reactangle of the available dropbox to the AzureAnimatedButton component
      // so that it can animate to that position
      // check dropBoxComponentRefs.current to see if all dropboxes are filled
      //const allFilled = dropBoxRefs.current.every(dropBox => !dropBox.available);
     
      
      return { droppedBoxId: availableDropBox?.id, rect: availableDropBox?.rect };
      /*
      //console.log("targetInput=", targetInput)
      //const audioUrl =`https://kphamazureblobstore.blob.core.windows.net/tts-audio/${word}.mp3`; // Replace with your audio file URL
      //`https://kphamazureblobstore.blob.core.windows.net/tts-audio/${word}.mp3`
      /*
   
      */
   
  }

  const animatedButtonMounted = (width: number) => {
    //console.log(" ButtonSelectCloze: animatedButtonMounted... button width =", width)
     animatedButtonWidths.current.push(width);
     if (animatedButtonWidths.current.length === (buttonLabels?.length || 0)) {
      // all buttons have mounted
      // find the max width
      const max_width = Math.max(...animatedButtonWidths.current);
      //console.log(" ButtonSelectCloze: animatedButtonMounted... max button width =", max_width)
      setLargestDropBoxWidth(max_width);
      timerRef.current = window.setTimeout(() => {
        setReady(true);
      }, 200);
      
     }
  }

  // clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

    return (
      <>  
          <div className='bg-cyan-300 p-2 flex flex-col justify-center items-center flex-wrap m-3'>
            { ready  &&
            <div className='flex flex-row justify-start bg-blue-200 flex-wrap'>
              {inputFields?.map((field, index) => {
                return (
                  <div key={index}>
                    {renderContent(field.type, field.value, field.id)}
                  </div>
                );
              })}
            </div>
            }
           
            <div className='flex flex-row justify-center items-center bg-orange-200 m-10'>
              <ul className='flex flex-row gap-5 m-3'>
                {buttonLabels && buttonLabels.map((label, index) => (
                  <li key={label}>
                    <AnimatedButton
                      id={`azure-button-${index}`}
                      voice_text={label}
                      button_text={label}
                      parentFunc={handleAnimatedButtonClicked}
                      parentFunc1={animatedButtonMounted} 
                      parentFuncResetDropBox={resetDropBox}
                      />
                  </li>
                )
                )}
              </ul>
            </div>
          
          </div>
    
      </>
    );

});