import { type ReactNode, useEffect, useState } from 'react'
import { FaSmile } from 'react-icons/fa';
import { FaFrown } from 'react-icons/fa';
//import ReactPlayer from 'react-player';
//import { QuestionProps } from './types';
import { type QuestionAttempResultsProps} from './shared/types';
import type { QuestionProps } from './shared/types';
import QuestionHelper from './QuestionHelper';

//import  QuestionHelper from './QuestionHelper';
//import { ProcessQuestionResultsProps } from '../live/processQuestion';

 
    export function Explanations(props:
        { 
                question: QuestionProps | undefined,
                response: QuestionAttempResultsProps
            }) 
           {
        //console.log("XXXXQQQQQQQQ", question_attempt_results)
        const [displayedUserAnswer, setDisplayedUserAnswer] = useState('')
        const [displayedAnswerKey, setDisplayedAnswerKey] = useState('')
     
    //console.log("QuestionAttemptResults ENTRY, props = ", props)
     //const { data, error, isLoading } = useLiveQuestion(props.quiz_id, props.question_number)
    
   
    useEffect(() => {  
        if (props.response.answer) {
            //console.log("HERE IN useEffect user_answer = ", props.response.user_answer)
            let displayed_user_answer = props.response.answer
        
            if (props?.question?.format === '4') { //radio
                    // look for choice index in props.response.user_answer and replace with choice text
                    const choice_number = props.response.answer.charAt(props.response.answer.length - 1)
                    // content = "one/two/three/four"
                    const choice_text = props?.question?.content.split('/')[parseInt(choice_number) - 1]
                    //console.log("QuestonAttempResult: choice_number, choice_text=", choice_number, choice_text)
                    displayed_user_answer = choice_text
            }
            setDisplayedUserAnswer(displayed_user_answer)
        }

        if (props.question?.answer_key) {
            let displayed_answer_key = props.question?.answer_key
            if (props?.question?.format ==='4') { //radio
                     // look for choice index in props.response.user_answer and replace with choice text
                     //const choice_number = props.response.user_answer.charAt(props.response.user_answer.length - 1)
                     const choice_number = props.question?.answer_key.charAt(props.question?.answer_key.length - 1)
                     // content = "one/two/three/four"
                     const choice_text = props?.question?.content.split('/')[parseInt(choice_number) - 1]
                     //console.log("QuestonAttempResult: choice_number, choice_text=", choice_number, choice_text)
                     displayed_answer_key = choice_text
            }
            setDisplayedAnswerKey(displayed_answer_key)
        }

    }, [props.response.answer, props.question?.answer_key, props.question?.format])
    
    // (answer: string | undefined, answer_key: string, format: number | undefined, content: string): string | undefined => {
    const displayAnswerKey = (): ReactNode => {
      
        const result = QuestionHelper.format_answer_key(displayedAnswerKey, props?.question?.format, props?.question?.content!)
        return (
            <div>{result}</div>
        )
    }

    const displayUserAnswer = (): ReactNode => {
       
        if (displayedUserAnswer.length > 0) {
            const result = QuestionHelper.format_user_answer(displayedUserAnswer, props?.question?.answer_key!, props?.question?.format, props?.question?.content!)
            return (
                <div>{result}</div>
            )
        }
        else {
            return (
                <div>EMPTY user answer!!!</div>
            )
        }
    }

    //bg-gradient-to-b from-bgColorQuestionAttempt to-green-100
    return (
        <div>
         
            <div className='bg-gradient-to-t from-bg-bgColorQuestionResults to-white text-textColor1 p-2 m-0 rounded-md'>
                {props.response.error_flag ?
                    <>
                        <div className=' text-textColor2 mx-2'>Your answer is:</div>
                        <div className='m-2 text-textColor2'>
                            {displayUserAnswer()}
                        </div>
                        <div className=' text-textColorFaFrown mx-2'>
                            <FaFrown />
                        </div>
                        {displayedUserAnswer.length > 0 && displayedUserAnswer !== "TIMEOUT" &&
                            <div className='m-2 text-textColor2 mx-2'>The correct answer is:
                                <div className='text-textColor2 my-2'>{displayAnswerKey()}</div>
                            </div>
                        }
                    </>
                    :
                    <>
                    <div className='flex flex-row justify-center text-lg text-textColorFaSmile mx-2'>
                        <FaSmile />
                    </div>
                    <div className='text-textColor2 my-2'>{displayAnswerKey()}</div>
                    </>
                }
            </div>
        </div>
    )
}
