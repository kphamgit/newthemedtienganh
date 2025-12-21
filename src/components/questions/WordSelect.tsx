import {type MouseEventHandler, useRef, useState} from 'react'
//import { useAppDispatch } from '../../redux/store';
//import { MyProps } from './WordsSelect';
//import { setAnswerArray } from '../../redux/answerarray.js'
//import classNames from 'classnames';

interface WordSelectProps {
   // pair: MyProps //{word: string, next_word: string}
    group_id: number
    pair: {word: string, next_word: string}
    addWordToAnswer: (word: string) => void
    removeWordFromAnswer: (word: string) => void
}

function WordSelect(props: WordSelectProps ) {
   // function WordSelect({pair: , addWordToAnswer, removeWordFromAnswer} ) {
    const [clickCount, setClickCount] = useState(0)
    const [oddClickCount, setOddClickCount] = useState<boolean>(false)
    const [isHovered, setIsHovered] = useState<boolean>(false);
 
   const handleMouseEnter:MouseEventHandler<HTMLSpanElement> = () => {
      setIsHovered(true);
   };
   const handleMouseLeave:MouseEventHandler<HTMLSpanElement> = () => {
      setIsHovered(false);
   };
   const spanRef = useRef<HTMLSpanElement>(null);

   let btnClass = 'btn m-0 px-1 rounded-md py-0 ';

   let btnClass1 = 'btn mx-0 px-0 py-0 rounded-md';

   let btnClass2 = 'btn mx-0 pl-1 pr-0 rounded-md ';
	
   if (props.pair.word === '.' || props.pair.word === '?') {
    btnClass = btnClass1; // Use btnClass1 if the word is a dot or question mark
  } 
  else if (props.pair.next_word === '.' || props.pair.next_word === '?') {
    btnClass = btnClass2; // Use btnClass2 if the next word is a dot or question mark (i.e, word is at end of sentence)
  }

  //else {
   // if (isHovered) btnClass += ' underline';
   // if (oddClickCount) btnClass += ' bg-blue-300';
 // }
 //useEffect(() => {
// console.log('props.group_id', props.group_id)
//}, [props.group_id])

    //if (props.group_id === 1) {
         if (isHovered) { 
            btnClass += ' underline';
         }
         if (oddClickCount) btnClass += ' bg-blue-300';
   //;}

    const handleClick: MouseEventHandler<HTMLSpanElement> = (event) => {
        
        const clicked_el = event.target as HTMLSpanElement
        //console.log("WORD SELECT clicked word =****",clicked_el.textContent,"***")
        let new_clickCount = clickCount + 1
        setClickCount(new_clickCount)
        
        if (clickCount%2 === 1) {
            setOddClickCount(false)
            props.removeWordFromAnswer(clicked_el.textContent!)
        }
        else {
            setOddClickCount(true)
            props.addWordToAnswer(clicked_el.textContent!)
            
        }
        // play microsoft speech audio for the clicked word
        const audioUrl =`https://kphamazureblobstore.blob.core.windows.net/tts-audio/${clicked_el.textContent}.mp3`;
        const audio = new Audio(audioUrl);
        audio.play().catch((error) => {
            console.error("Error playing audio:", error);
        });
        
    }
    
    return (
        <>
           
            <span className={btnClass} 
                ref={spanRef}
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
              {props.pair.word}
            </span> 
            { ((props.pair.next_word !== '.') && (props.pair.next_word !== ',') 
            && (props.pair.next_word !== '!')  
             && (props.pair.next_word !== '?') )  
                && <span>&nbsp;</span>} 
        </>
    )
    
   
}

export default WordSelect
/*
<span className='bg-blue-400 hover:underline p-1' onClick={handleClick}

className={classNames(
                    'text-white',
                    !buttonDisabled && 'bg-green-600',
                    buttonDisabled && 'bg-red-700',
                    'rounded-t-md'
                )}

return (
        <>

            <span onClick={() => handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {pair.word}
            </span>
            {((pair.next_word !== '.') && (pair.next_word !== ',')
                && (pair.next_word !== '!')
                && (pair.next_word !== '?'))
                && <span>&nbsp;</span>}
        </>
    )
*/