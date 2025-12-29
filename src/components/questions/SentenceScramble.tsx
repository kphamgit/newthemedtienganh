//import { useAxiosFetch } from '../components/services/useAxiosFetch';

import { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { type ColumnDef} from '@tanstack/table-core';
import { useSortable } from '@dnd-kit/sortable';
import GenericSortableTable from '../shared/GenericSortableTable';
import type { ChildRef } from '../TakeQuiz';
//import { type SubCategoryProps} from './SubCategory';


interface SentenceScrambleItemProps {
    itemId: string;
    sentence: string;
  }

  interface SentenceScrambleProps {
    content: string;  // a string of sentences separated by '/'
    ref: React.Ref<ChildRef>;
  }

 export default function SentenceScramble(props: SentenceScrambleProps) {
  
  const [sentences, setSentences] = useState<SentenceScrambleItemProps[]>([]);

const childRef =  useRef<ChildRef>(null);

useEffect(() => {
  if (!props.content) return;
  const sentenceArray = props.content.split('/').map((sentence, index) => ({
    itemId: `${index + 1}`,
    sentence: sentence.trim(),
  }));
  setSentences(scrambleArray(sentenceArray));
}, [props.content]);

 const getAnswer = () => {
    //console.log("getAnswer called in SentenceScramble");  
    const childAnswer = childRef.current?.getAnswer();
    return childAnswer
  }

  
  useImperativeHandle(props.ref, () => ({
    getAnswer,
  }));


  const scrambleArray = (array: SentenceScrambleItemProps[]) => {
    const scrambled = [...array]; // Create a copy to avoid mutating the original array
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Random index
      [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]]; // Swap elements
    }
    return scrambled;
  };

 // const [sentences, setSentences] = useState<SentenceScrambleItemProps[]>(scrambleArray());

const RowDragHandleCell = ({ rowId }: { rowId: string }) => {
  const { attributes, listeners } = useSortable({
    id: rowId,
  });
  return (
    // Alternatively, you could set these attributes on the rows themselves
    <button {...attributes} {...listeners}>
      🟰
    </button>
  );
};

const columns = useMemo<ColumnDef<SentenceScrambleItemProps>[]>(
  () => [
 
    {
      accessorKey: "itemId",
      header: "ID",
      cell: info => (
        <span className='text-red-500 opacity-50'>{info.row.original.itemId}</span>
      )
    },
    {
      accessorKey: "sentence",
      header: "Name",
      cell: info => (
        <div className='my-1 bg-green-200 mr-4'>{info.row.original.sentence}</div>
      )
    },
  
    {
      id: "drag-handle",
      header: "Move",
      cell: ({ row }) => <RowDragHandleCell rowId={row.id} />,
      size: 60,
    },
  ],
  [] // No dependencies, so the columns are memoized once
);
  
  return (
    <>
          <div>
              <GenericSortableTable 
                input_data={sentences || []} 
                columns={columns}
                ref={childRef}
              />
          </div>
    </>
  )
      
}
