import { useEffect, useRef, useState } from "react";
// import { IoIosArrowDown } from "react-icons/io";
// import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Link } from "react-router-dom";
import type { LevelProps, CategoryProps } from "./Level";
import api from "../api";



   export default function Navbar({ levels }: { role: string; levels: LevelProps[] | null }) {
    //const [animationParent] = useAutoAnimate();
    
    const [categoriesLinks, setCategoriesLinks] = useState<{ label: string; link: string }[]>([])
    const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
    const dropdownRef = useRef<HTMLDivElement | null>(null); // Ref for the dropdown container

    const handleClickOutside = (event: MouseEvent) => {
      
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // If the click is outside the dropdown, clear the dropdown state
        //alert("handleClickOutside called")
        setSelectedLevel(null);
        setCategoriesLinks([]);
      }
    };
  
    useEffect(() => {
      // Add event listener to detect clicks outside the dropdown
      document.addEventListener("mousedown", handleClickOutside);
  
      return () => {
        // Cleanup the event listener on component unmount
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);
  
  


    
  //link: `/categories/${category.id}/sub_categories_student/${sub_category.id}`
  
  const showDropdownLinks = (levelNumber: number) => {
   const url = `/english/levels/${levelNumber}/categories`
   //levels/<int:pk>/categories
   //console.log("Fetching categories for level ", levelNumber, " from API endpoint: ", url)

   api.
    get(url).then(response => {
      //console.log("API response for categories list: ", response.data)
      const categories = response.data as CategoryProps[]
      const links = categories.map(category => ({
        label: category.name,
        link: `/categories/${category.id}`
      }))
      setSelectedLevel(levelNumber)
      setCategoriesLinks(links)
    }
    ).catch(error => {
      console.error("Error fetching categories for level", levelNumber, ": ", error)
    })

  
  }


    return (
      <div className="flex  max-w-7xl justify-between px-5 py-0">
        {/* left side  */}
       
          {/* logo */}
          <div className="hidden md:flex items-center gap-0.5 transition-all">
            { levels &&
            levels.map((level, i) => (
              <div
                key={i}
                className="relative group py-3 transition-all "
              >
             
                  <button
                  className="bg-amber-700 text-white flex cursor-pointer p-2  items-center text-sm "
                     onClick={() => showDropdownLinks(level.id)}>{level.name}
                  </button>
                  {/* dropdown */}  
                
                  {selectedLevel === level.id && categoriesLinks.length > 0 && (
                      <div className="relative" ref={dropdownRef}>
                  <div className="absolute top-full left-0 w-max m-1 bg-green-500  shadow-lg z-10">
                    {categoriesLinks.map((category, index) => (
                      <Link
                        key={index}
                        to={category.link}
                        className="block px-4 py-1 text-sm bg-green-700 text-white p-2 mb-0.5 last:mb-0 hover:bg-green-800"
                        onClick={() => {setSelectedLevel(null); setCategoriesLinks([])}}
                     >
                        {category.label}
                      </Link>
                    ))
                    }     
                    </div>  
                    </div>
                  )}
               
              </div>
            ))}
   
          </div>
          {/* navitems */}
       
  
        {/* right side data */}
     
      </div>
    );
  }