import { useState, useEffect } from "react";
import api from "../api";
import { type CategoryProps} from "../components/Category";
import "../styles/Home.css"
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

function Home() {

    const [categories, setCategories] = useState<CategoryProps[]>([]);

    useEffect(() => {
        getCategories();
    }, []);

    const getCategories = () => {
        api
            .get("/api/categories/")
            .then((res) => res.data)
            .then((data) => {
                setCategories(data);
                //console.log("categories", data);
            })
            .catch((err) => alert(err));
    };

    return (
        <>
        <div className="flex flex-col bg-amber-200 p-10">
              <div className='col-span-9 bg-bgColor2 text-textColor2 text-lg m-1'>
              <Navbar role="student" categories={categories}/>
            </div>
        </div>
        <Outlet />
        </>
    );
}

export default Home;