import { useEffect, useRef, useState } from "react";
import "../styles/Home.css"

import { Outlet, useNavigate } from "react-router-dom";

import api from "../api";
import { type LevelProps } from "../components/Level";
import TeacherControlPanel from "./TeacherControlPanel";
//import type { WebSocketMessageProps } from "../components/shared/types";
import { type TeacherControlRefProps } from "./TeacherControlPanel";
//import ScoreBoardTeacher from "./ScoreBoardTeacher";
import { useUserConnections } from "../components/context/UserConnectionsContext";
import ScoreBoard from "./ScoreBoard";
import Navbar from "../components/Navbar";
import DictionaryLookup from "../components/DictionaryLookup";
//import ScoreBoard from "./ScoreBoard";
//import { useDispatch } from "react-redux";
//import { clearLiveQuestionInfo} from "../redux/connectedUsersSlice"
//import type { AppDispatch } from "../redux/store";

type TeacherTab = "control" | "navbar";

function HomeTeacher() {

    const {liveQuizId} = useUserConnections();
    const teacherControlPanelRef = useRef<TeacherControlRefProps>(null);
    const [activeTab, setActiveTab] = useState<TeacherTab>("control");
    const navigate = useNavigate();
    const [levels, setLevels] = useState<LevelProps[]>([]);

    useEffect(() => {
        api.get("/api/levels/")
            .then((res) => res.data)
            .then((data) => setLevels(data as LevelProps[]))
            .catch((err) => alert(err));
    }, []); // fetch once on mount

    const tabClass = (tab: TeacherTab) =>
        `px-4 py-2 rounded-t-md font-medium ${
            activeTab === tab
                ? "bg-blue-300 text-blue-900"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
        }`;

    return (

        <div className="grid grid-cols-[2fr_1fr] gap-4">

            <div className="bg-blue-300 col-span-1">
                {/* Tabs */}
                <div className="flex items-center gap-1 px-2 pt-2">
                    <button
                        className={tabClass("control")}
                        onClick={() => { setActiveTab("control"); navigate("/"); }}
                    >
                        Control Panel
                    </button>
                    <button className={tabClass("navbar")} onClick={() => setActiveTab("navbar")}>
                        Navbar
                    </button>
                    <div className="ml-auto pb-2">
                        <DictionaryLookup mode="teacher" />
                    </div>
                </div>

                {/* Tab content */}
                {activeTab === "control" ? (
                    <TeacherControlPanel ref={teacherControlPanelRef} live_quiz_id={liveQuizId} />
                ) : (
                    <>
                        <Navbar role="teacher" levels={levels} />
                        {/* Nested route content (e.g. Category) belongs to the Navbar browsing flow. */}
                        <Outlet />
                    </>
                )}
            </div>
            <div className="bg-green-300 col-span-1">
                <ScoreBoard my_row= {null} />
            </div>
        </div>
    );
}

export default HomeTeacher;


/*
    <div className="bg-green-300 col-span-1">
                <ScoreBoard myLiveScore={{question_number: undefined, score: undefined, total_score: undefined}} />
            </div>
*/
