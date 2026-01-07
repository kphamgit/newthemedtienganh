import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import WordSelect from './WordSelect';
import { type ChildRef } from '../TakeQuiz';

interface Props {
    content: string | undefined;
  }

 
  export interface MyProps {group_id: number, word: string, next_word: string}

export const WordsSelect = forwardRef<ChildRef, Props>((props, ref) => {
   
    const [words, setWords] = useState<MyProps[]>([])
    const [answerarray, setAnswerArray] = useState<string[]>([])
    //const livequizflag = useAppSelector((state) => state.livequizflag.value)

    useEffect(() => {
    const temp_arr = props.content?.split(' ');
    let my_arr: string[] = []
    
    temp_arr?.forEach( word => { 
        if(word.indexOf('.') >= 0 ) { 
                my_arr.push(word.slice(0, -1))
                my_arr.push('.') 
        }
        else if (word.indexOf(',') >= 0) {
            my_arr.push(word.slice(0, -1))
            my_arr.push(',') 
        }
        else if (word.indexOf('?') >= 0) {
            my_arr.push(word.slice(0, -1))
            my_arr.push('?') 
        }
        else if (word.indexOf('!') >= 0) {
            my_arr.push(word.slice(0, -1))
            my_arr.push('!') 
        }
        else {
                my_arr.push(word)
        }
    })

    let my_arr1 = []
    for (var i=0; i < my_arr.length; i++) { 
        let word = my_arr[i]
        // if i is even, then group_id is 0, else group_id is 1
        let group_id = (i % 2 === 0) ? 0 : 1
        let pair: MyProps = {group_id: group_id, word: '', next_word: ''}
        if (i < (my_arr.length-1)) {
            pair.word = word
            pair.next_word = my_arr[i+1]
        }
        else {
            pair.word = word
            //pair.next_word = "non"
        }
        my_arr1.push(pair)
    }
    
    setWords(my_arr1)
    },[props.content])
    

    function addWordToAnswer(word: string) {
        //console.log("addWord ", word)
        setAnswerArray([...answerarray, word])
     }

     function removeWordFromAnswer(word: string) {
        //console.log("remove a word", word)
       let word_index = answerarray.findIndex(e => e === word )
       setAnswerArray(answerarray.filter((_word, idx) => idx !== word_index))
     }
     

     const getAnswer = () => {
        //alert(" WordsSelect getAnswer called " + JSON.stringify(answerarray))
        return answerarray.join('/')
     }

     useImperativeHandle(ref, () => ({
        getAnswer,
      }));

    return (
        <>
            
            {
                words.map((pair, index) => {
                    return <WordSelect key = {index} group_id={pair.group_id} pair ={pair} addWordToAnswer={addWordToAnswer} removeWordFromAnswer={removeWordFromAnswer} />
                })
            }
        </>
    )
})
