import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  TouchSensor
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { v4 as uuidv4 } from "uuid";
import Container from "./container";
import { Item, type ItemProps } from "./SortableItem";
import DestinationContainer from "./DestContainer";
//import Announcements from "./announcements";

//https://codesandbox.io/p/sandbox/dnd-kit-sortable-example-yhwz3f?file=%2Fsrc%2FApp.jsx

const wrapperStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "row"
};


interface Props {
  content: string | undefined;
}


export interface DragAndDropRefProps {
  getAnswer: () => string | undefined;
}

const DragDrop = forwardRef<DragAndDropRefProps, Props>((props, ref) => {

//export default function DragDrop() {
 
const [allItems, setAllItems] = useState<{ [key: string]: ItemProps[] }>({
  root: [],
  destination_container: []
});

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);


  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 200, tolerance: 1000 }
      //kpham: keep these number big like this. If they are too small, the sensor sometimes will not detect the mouse click on the draggable item
      //Many trials and errors to get the sensor to work
  }),
  useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 1000 }
    //kpham: keep these number big like this. If they are too small, the sensor sometimes will not detect the mouse click on the draggable item
    //Many trials and errors to get the sensor to work
}),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );


  useEffect(() => {
    //console.log("in WordScrambler")
    function shuffle(array: any) {
      for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
        [array[i], array[j]] = [array[j], array[i]];
      }
    }  // { id: uuidv4(), label: "Item 2", disable: false }, 
      let myArray = props.content?.split('/').map((str) => ({ id: uuidv4(), label: str, disable: false }));
      //console.log(" myArray : ", myArray)
      shuffle(myArray)
      if (myArray) {
        // set root in allItems to myArray
        setAllItems((prev) => ({
          ...prev,
          root: [...myArray]
        }));
     
      }   
    
  },[props.content])

  const getAnswer = () => {
    //get the label of the items in the destination_container array
    const answer_array: string[]  = []
    allItems.destination_container.forEach(item => {
     // console.log("item.label=", item.label);
      answer_array.push(item.label)
    });
   
    return answer_array.join('/')
    //return "not implemented"
    
  }

    useImperativeHandle(ref, () => ({
        getAnswer,
   }));


  const handleSortableItemClick = (item_id: string, container_id: string) => {
    //look in items1.root for the index of the item with the item_id
    const item_index = allItems[container_id].findIndex((item) => item.id === item_id);
    //console.log("item_index=", item_index);
   
    //look for this item in the source container (container from which it was clicked)
    const the_item = allItems[container_id].find((item) => item.id === item_id);
    //console.log("handleSortableItemClick found item =", the_item);
    
    if (container_id === "root") {
          if (the_item) { // append the item to the destination_container array
              setAllItems((prev) => ({
                  ...prev,
                  destination_container: [
                      ...prev.destination_container,
                      { ...allItems.root[item_index], id: uuidv4() }
                  ]
              }));
          }
          //console.log("disable the clicked item with id ", item_id, " in the root array")
          setAllItems((prev) => ({
              ...prev,
              root: prev.root.map((item) => item.id === item_id ? { ...item, disable: true } : item),
          }));
    }
    else { //destination_container

      //look for a disabled item in the root array with the same label as the clicked item 
      const item_in_root = allItems.root.find((item) => (item.label === the_item?.label && item.disable === true));
      //console.log("found item_in_root=", item_in_root);
        if (item_in_root) {
            //enable the item in the root array
            setAllItems((prev) => ({
                ...prev,
                root: prev.root.map((item) => item.id === item_in_root.id ? { ...item, disable: false } : item),
            }));
            //at the same time, remove the clicked item from the destination_container array
            setAllItems((prev) => ({
                ...prev,
                destination_container: prev.destination_container.filter((item) => item.id !== item_id)
            }));
        }
    }
    return 
  };

  return (
    <div style={wrapperStyle}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col gap-4 align-top">
      
        <div className="flex flex-row justify-start bg-amber-300">
            <DestinationContainer id="destination_container" 
              items={allItems.destination_container} 
              parent_function={handleSortableItemClick} 
            />
        </div>
        <div className="flex flex-row bg-orange-300">
          <Container id="root" 
            items={allItems.root} 
            parent_function={handleSortableItemClick} /></div>
        </div>
        <DragOverlay>{activeId && activeLabel ? <Item id={activeId} label={activeLabel} /> : null}</DragOverlay>
      </DndContext>
    </div>
  );

  function findContainer(id: string) {
   // console.log("findContainer called with id:", id, 'items1 =', items1);
    if (id in allItems) {
      //console.log("id ", id, "is in items return id directly");
      return id;
    }

    //return Object.keys(items).find((key) => (items[key as keyof typeof items] as string[]).includes(id));
    return Object.keys(allItems).find((key) => 
      (allItems[key as keyof typeof allItems] as ItemProps[]).some((item) => item.id === id)
    );
    // return Object.keys(items).find((key) => items[key].includes(id));
  }

  function handleDragStart(event:DragStartEvent) {
    //console.log("handleDragStart called event=", event);
    const { active } = event;
    const { id } = active;

    setActiveId(id.toString());
    //search for active item in the items1 root array
    //let activeItem
    let activeItem = allItems.root.find((item) => item.id === id);
    //console.log("activeItem=", activeItem);
    if (!activeItem) {
      //search in items1 destination_container array
      activeItem = allItems.destination_container.find((item) => item.id === id);
      //console.log("activeItem=", activeItem);
    }
    //console.log("activeItem label =", activeItem?.label);
    setActiveLabel(activeItem?.label ?? null);
  }

  function handleDragOver(event:any) {
    const { active, over } = event;
    const { id } = active;
    const { id: overId } = over;

    //console.log("handleDragOver called");
    //console.log("active (id):", id);
    //console.log("overId:", overId);
    
    // Find the containers
    const activeContainer = findContainer(id);
    //console.log("after findContainer, activeContainer:", activeContainer);
    const overContainer = findContainer(overId);
    //console.log("after findContainer overContainer:", overContainer);

    if (activeContainer === 'destination_container' && overContainer === 'root') {
      return
    }
    
    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      //console.log("Either activeContainer or overContainer is not found, or they are the same. Exiting handleDragOver.");
      return;
    }
 
    setAllItems((prev) => {
     // console.log("setItems1 called in handleDragOver prev =", prev);
     // console.log(" find the items in the prev state for activeContainer (root or destination_container or container2 ...):");
      const activeItems = prev[activeContainer as keyof typeof allItems];

     // console.log("previous state of activeItems:", activeItems);
      //console.log(" find the items in the prev state for overContainer");
      const overItems = prev[overContainer as keyof typeof allItems];
     // console.log("previous state of overItems:", overItems);

      //console.log("find the index of the active item in the activeItems array");
      const activeIndex = activeItems.findIndex((item) => item.id === active.id);
      //console.log("activeIndex:", activeIndex);

      //console.log("find the index of the over item in the overItems array");
      const overIndex = overItems.findIndex((item) => item.id === overId);
      //console.log("overIndex:", overIndex);
      // active.data.current.clientY > over.rect.offsetTop + over.rect.height;
      let newIndex;
      if (overId in prev) {
        // We're at the root droppable of a container
        //console.log('We re at the root droppable of a container newIndex=', newIndex)
        newIndex = overItems.length + 1;
      } else {
        const isBelowLastItem =
          over &&
          overIndex === overItems.length - 1 
          const modifier = isBelowLastItem ? 1 : 0;
          //console.log('isBelowLastItem:', isBelowLastItem)
          newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
          //console.log('newIndex calculated based on isBelowLastItem:', newIndex)
      }
    
      
//  [activeContainer]: [...prev[activeContainer].filter((item) => item.id !== active.id) ],
      //console.log("overContainter slice = ", prev[overContainer].filter((item) => parseInt(item.id) < newIndex));
// ...prev[overContainer].slice(newIndex, prev[overContainer].length)
      const results = { ...prev, 
        [activeContainer]: [...prev[activeContainer].map((item) => item.id === active.id ? { ...item, id: item.id + "0", disable: true } : item ) ] ,
        [overContainer]: [
          ...prev[overContainer].filter((_item, index) => index < newIndex), // filter out the items that are before the new index to avoid duplicates
          allItems[activeContainer][activeIndex],
          ...prev[overContainer].filter((_item, index) =>  index >= newIndex && index <= prev[overContainer].length) // filter out the items that are before the new index to avoid duplicates
        ]
      }
      return results
    });
    
    
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    const { id } = active;
    const overId = over?.id;

    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId || "");

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      return;
    }

   // const activeIndex = items1[activeContainer].indexOf(active.id);
    const activeIndex = allItems[activeContainer].findIndex((item) => item.id === active.id);
    //const overIndex = items[overContainer].indexOf(overId || "");
    const overIndex = allItems[overContainer].findIndex((item) => item.id === overId || item.id === "");
    //console.log('handleDragEnd *** activeIndex:', activeIndex, 'overIndex:', overIndex)

    if (activeIndex !== overIndex) {
      setAllItems((items) => ({
        ...items,
        [overContainer]: arrayMove(items[overContainer], activeIndex, overIndex)
      }));
    }

    setActiveId(null);
  }
})

export default DragDrop;
