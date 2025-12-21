import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState } from "react";
import clsx from "clsx";

export interface ItemProps {
  id: string;
  label: string;
  disable?: boolean;
  parent_function?: (item_id: string) => void;
}

export interface SortableItemProps {
  id: string;
  label: string;
  disable?: boolean;
  parent_function?: (item_id: string) => void;
}


export function Item(props: ItemProps) {
  const { id, label, disable } = props;

  const [disableState, setDisableState] = useState(disable);

  useEffect(() => {
    setDisableState(disable);
  }, [disable]);

  const handleClick = () => {
    //console.log("in Item handleClick, item id = ", id);
    props.parent_function?.(id);
  };

  /*
  const style = {
    width: "100%",
    height: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid black",
    margin: "10px 0",
    background: "white"
  };
  //return <button className="flex flex-row justify-center bg-red-300 m-1 p-2 rounded-md" 
  */
 return <button 
   className={clsx(
    "px-4 py-2 rounded",
    disableState ? "bg-gray-400 text-gray-400 cursor-not-allowed" : "bg-green-400 hover:bg-green-500"
   )}
  //return <button className="flex flex-row justify-center bg-red-300 m-1 p-2 rounded-md" 
  
    onClick={handleClick} 
    disabled={disableState}
    >
     {label}
    </button>;
  //return <div style={style}>item id = {id} {label}</div>;
}

// return <button disabled={disable} style={style}>item id = {id} {label}</button>;


export default function SortableItem(props: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    
   
  } = useSortable({ id: props.id , disabled: props.disable});

  
  const handleItemClick = () => {
    //console.log("in SortableItem handleItemClick, item id = ", props.id);
   //console.log("in SortableItem handleItemClick, item id = ", props.id);
    //console.log("in SortableItem handleItemClick, calling parent function from container");
    //console.log("******* Playing audio for label: ", props.label);
    const audioUrl =`https://kphamazureblobstore.blob.core.windows.net/tts-audio/${props.label}.mp3`;
      const audio = new Audio(audioUrl);
      audio.play().catch((error) => {
          console.error("Error playing audio:", error);
      });
    props.parent_function?.(props.id);
    //setDestination((prev) => [...prev, item]);
    // find the item in the source array using its array index and set its isActive to false
    //setSource((prev) => prev.map((s) => (s.id === item.id ? {...s, isActive: false} : s)));
  };
  

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
  };

  return (
    <div ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      //onClick={(e) => handleAddItem()}
      className={`px-3 py-2 rounded ${
        props.disable
          ? "bg-gray-400 text-gray-500 cursor-not-allowed"
          : "bg-green-400 hover:bg-green-500"
      }`}
      >
      <button id={props.id} disabled={props.disable} onClick={handleItemClick}>{props.label}</button>
    </div>
  );
}

/*
return (
    <div ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      //onClick={(e) => handleAddItem()}
      className="flex flex-row p-1 bg-amber-500 justify-center mx-1 rounded-md"
      >
      <Item id={props.id} label={props.label} disable={props.disable} parent_function={handleItemClick} />
    </div>
  );
*/

/*
return (
    <div ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      //onClick={(e) => handleAddItem()}
      className="flex flex-row p-1 bg-amber-500 justify-center mx-1 rounded-md"
      >
      <button id={props.id} onClick={handleItemClick}>{props.label}</button>
    </div>
  );
*/

