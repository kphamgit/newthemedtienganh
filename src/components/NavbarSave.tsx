import { useEffect, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Link } from "react-router-dom";
import type { CategoryProps, SubCategoryProps } from "./Category";

type NavItem = {
    label: string;
    link?: string;
    children?: NavItem[];
  };

   export default function NavbarSave({ role, categories }: { role: string; categories: CategoryProps[] | null }) {
    const [animationParent] = useAutoAnimate();
    const [navItems, setNavItems] = useState<NavItem[]>([]);


  
   
    const handleItemClick = () => {
      //e.stopPropagation();
      console.log("handleItemClick");
    }
    
  //link: `/categories/${category.id}/sub_categories_student/${sub_category.id}`
    useEffect(() => {
      if (categories) {
        const nav_items = categories.map((category: CategoryProps) => {
          return {
            label: category.name,
            children: category.sub_categories.map((sub_category: SubCategoryProps) => {
              return {
                label: sub_category.name,
                link: `/sub_categories_student/${sub_category.id}`
              }
            })
          }
        })
        //console.log("HERE nav_items", nav_items)
        setNavItems(nav_items)
      }
  }, [categories])
  
    return (
      <div className="flex  max-w-7xl justify-between px-5 py-0">
        {/* left side  */}
        <section ref={animationParent} className="flex items-center gap-10">
          {/* logo */}
          <div className="hidden md:flex items-center gap-0.5 transition-all">
              <div className='text-md bg-green-400 text-red-400  p-2 text-sm font-bold'>
                <Link to={`/homepage/${role}`} >Home</Link>
              </div>
            {navItems.map((d, i) => (
              <div
                key={i}
                className="relative group py-3 transition-all "
              >
                <p className="bg-green-300 text-red-400 flex cursor-pointer p-2  items-center group-hover:text-textColor4 text-sm " >
                  <span>{d.label}</span>
                  {d.children && (
                    <IoIosArrowDown className=" rotate-180  transition-all group-hover:rotate-0" />
                  )}
                </p>
  
                {/* dropdown */}
                {d.children && (
                  <div className="absolute  left-0 mt-3  top-10 hidden w-auto  flex-col bg-gray-100 py-3 shadow-md text-sm transition-all group-hover:flex ">
                    {d.children.map((ch, i) => (
                      <Link to={ch.link ?? "#"}
                        key={i}
                        className=" flex cursor-pointer items-center  py-1 pl-4 pr-4 bg-gray-100 text-orange-500 hover:text-blue-400  "
                      >
                        {/* item */}
                        <span onClick={handleItemClick} className=" whitespace-nowrap ">
                          {ch.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
              <div className='text-md bg-amber-600 text-blue-400 text-sm p-2'>
                <Link to="/games">Games</Link>
              </div>
              
          </div>
          {/* navitems */}
        </section>
  
        {/* right side data */}
     
      </div>
    );
  }