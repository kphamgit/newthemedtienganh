import { useImperativeHandle, useState } from 'react'
import { AzureButton} from '../shared/AzureButton';
import { type ChildRef } from '../TakeQuiz';

interface Props {
    content: string | undefined;
    ref: React.Ref<ChildRef>;
  }

export const ButtonSelect = ( props: Props, ) => {
  const [answer, setAnswer] = useState<string | undefined>()
  const labels = props.content?.split('/')

  const getAnswer = () => {
    return answer
  }

  const handleClick = (selected_text: string) => {
    setAnswer(selected_text)

  }
  useImperativeHandle(props.ref, () => ({
    getAnswer,
  }));

  return (
    <>
      <ul className='flex flex-row gap-3'>
        {labels?.map((label, index) =>
          <AzureButton key={index} button_text={label} parentFunc={handleClick} />
        )}
      </ul>
    </>
  )
}
