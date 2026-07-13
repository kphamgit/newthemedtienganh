import { useRef } from "react";
import "../styles/Home.css"

import { Outlet } from "react-router-dom";

import TeacherControlPanel from "./TeacherControlPanel";
//import type { WebSocketMessageProps } from "../components/shared/types";
import { type TeacherControlRefProps } from "./TeacherControlPanel";
//import ScoreBoardTeacher from "./ScoreBoardTeacher";
import { useUserConnections } from "../components/context/UserConnectionsContext";
import ScoreBoard from "./ScoreBoard";
//import ScoreBoard from "./ScoreBoard";
//import { useDispatch } from "react-redux";
//import { clearLiveQuestionInfo} from "../redux/connectedUsersSlice"
//import type { AppDispatch } from "../redux/store";
function HomeTeacher() {
 
    const {liveQuizId} = useUserConnections();
    const teacherControlPanelRef = useRef<TeacherControlRefProps>(null);

    return (
   
        <div className="grid grid-cols-[2fr_1fr] gap-4">
           
            <div className="bg-blue-300 col-span-1">
                <TeacherControlPanel ref={teacherControlPanelRef} live_quiz_id={liveQuizId} />
                <Outlet />
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
