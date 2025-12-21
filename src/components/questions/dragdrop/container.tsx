
import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";
import {
    horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";

import SortableItem from "./SortableItem"
import { type SortableItemProps } from "./SortableItem";

interface ContainerProps {
  id: string;
  items: SortableItemProps[];
  parent_function?: (item_id: string, container_id: string) => void;
}

export default function Container(props: ContainerProps) {
  const { id, items, parent_function } = props;
 

  const { setNodeRef } = useDroppable({
    id
  });

  const handdleSortableItemClick = (item_id: string) => {
   // console.log("in container, handdleSortableItemClick item id=", item_id);
   // console.log("in handdleSortableItemClick container  id=", id);
    //look for item in items array
    //const the_item = items.find((item) => item.id === item_id);
    //console.log("found item =", the_item, "in container");
    //console.log("in container, handdleSortableItemClick calling parent function from App.tsx");
    parent_function?.(item_id, id);
  };

  return (
    <SortableContext
      id={id}
      items={items}
      strategy={horizontalListSortingStrategy}
    >
     
      <div ref={setNodeRef} 
        className={clsx(
            "flex flex-row m-10 p-1 flex-wrap justify-items-start gap-1",
            id === 'container1' ? "bg-gray-100" : "bg-cyan-100"
          )}
        >
        
        {items.map((item) => { 
          //console.log("container id = ", id, "key = item id=", item.id);
          return (
          <SortableItem key={item.id} id={item.id} label={item.label} disable={item.disable} parent_function={handdleSortableItemClick} />
        )}
        
        )
        }
      </div>
    </SortableContext>
  );
}

//<SortableItem key={id} id={id} label='my lab' />