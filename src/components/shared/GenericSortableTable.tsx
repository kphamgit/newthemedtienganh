import React, { useEffect, useImperativeHandle } from "react";

//import "./testindex.css";

import {
  type ColumnDef,
  type Row,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";


// needed for table body level scope DnD setup
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

// needed for row & cell level scope DnD setup
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ChildRef } from "../TakeQuiz";
//import NewModal from "./NewModal"


/*
interface NewQuestionModalContentProps {
  question_number: number;
  format: string;
  instruction: string | undefined;
  display_instruction: boolean;
  prompt: string;
  audio_str: string;
  content: string;
  answer_key: string;
  quiz_id: string;
  words_scramble_direction?: string; // Add this property
}
*/

interface genericItemType {
  itemId: string;
}

/*
generic type T can be any object type, e.g., ShortQuizProps, QuestionProps, UnitProps, etc.
*/

interface GenericTableProps<T extends { itemId: string }> {
    input_data: T[]; // Use the generic type for the data array
    columns: ColumnDef<T>[]; // Use the generic type for the column definitions
    ref: React.Ref<ChildRef>;
  }
//const deleteQuestion = async (question_id: string,  originals: ShortQuestionProps[]) => {
// Row Component
interface DraggableRowProps<T extends { itemId: string }> {
  row: Row<T>; // Use the generic type for the row
}

const DraggableRow = <T extends { itemId: string }>({ row }: DraggableRowProps<T>) => {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.itemId, // Use `as any` or ensure `T` has `itemId`
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform), // Let dnd-kit handle the transform
    transition: transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    position: "relative",
  };

  return (
    <tr ref={setNodeRef} style={style}>
      {row.getVisibleCells().map((cell) => (
        <td className=" text-lg" key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
};



function GenericSortableTable<T extends genericItemType>({
  input_data,
  columns,
  ref, 
}: GenericTableProps<T>) {

  useEffect(() => {
    setData(input_data);
  }, [input_data]);

  const [data, setData] = React.useState<T[]>([]);

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => (data ? data.map((row) => row.itemId) : []),
    [data]
  );

  //
 const getAnswer = () => {
  const item_ids = getColumnValues("itemId") as string[];
  //const sorted_numbers: number[] = getColumnValues("item_number") as number[];
    return item_ids.join(",");
  }

  useImperativeHandle(ref, () => ({
    getAnswer,
  }));

 const table = useReactTable({
    data,
    columns: [
      ...columns,
    ],
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.itemId,
  
  });

  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  };

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const getColumnValues = (columnId: string): unknown[] => {
    return table.getRowModel().rows.map((row) => row.getValue(columnId));
  };

  return (
    <>
      
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <div style={containerStyle} className="p-5">
          <table>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              <SortableContext
                items={dataIds}
                strategy={verticalListSortingStrategy}
              >
                {table.getRowModel().rows.map((row) => (
                  <DraggableRow key={row.id} row={row} />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </div>
      </DndContext>
    </>
  );
}
export default GenericSortableTable

/*
<NewQuestion
              modal_content={newModalContent!} onClose={closeNewModal} 
            />

             {isModalNewVisible && (
          <div className="fixed inset-50 bg-blue-700 bg-opacity-50 flex items-center justify-center z-10">
            NEW MODAL
          </div>
        )}
*/

const containerStyle = {
  backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-primary)',
};
