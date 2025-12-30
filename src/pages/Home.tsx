import { useState, useEffect } from "react";
import api from "../api";
import { type LevelProps} from "../components/Level";
import "../styles/Home.css"
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

function Home() {

    const [levels, setLevels] = useState<LevelProps[]>([]);

    useEffect(() => {
        getLevels();
    }, []);

    const getLevels = () => {
        //console.log("Fetching categories...");
        api
            .get("/api/levels/")
            .then((res) => res.data)
            .then((data) => {
                //console.log("categories", data);
                setLevels(data);
                //console.log("categories", data);
            })
            .catch((err) => alert(err));
    };

    return (
        <>
        <div className="flex flex-col bg-amber-200 p-10">
              <div className='col-span-9 bg-bgColor2 text-textColor2 text-lg m-1'>
              <Navbar role="student" levels={levels}/>
            </div>
        </div>
        <Outlet />
        </>
    );
}

export default Home;