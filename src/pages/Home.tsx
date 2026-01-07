import { useState, useEffect } from "react";
import api from "../api";
import { type LevelProps} from "../components/Level";
import "../styles/Home.css"
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import { type RootState } from "../redux/store";
import { useSelector } from "react-redux";


function Home() {

    const [levels, setLevels] = useState<LevelProps[]>([]);
    const user = useSelector((state: RootState) => state.user);

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
        <div className="text-red-800 mx-10 my-4">Welcome <span className="font-bold">{user.name}</span> to <span className="text-blue-600">tienganhphuyen.com</span></div>
        <div className="flex flex-col bg-amber-200 py-2 px-10">
              <div className='col-span-9 bg-bgColor2 text-textColor2 text-lg m-1'>
              <Navbar role="student" levels={levels}/>
            </div>
        </div>
        <Outlet />
        </>
    );
}

export default Home;