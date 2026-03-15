import { useRef } from "react";
import "../styles/Home.css"

import { Outlet } from "react-router-dom";

import TeacherControlPanel from "./TeacherControlPanel";
//import type { WebSocketMessageProps } from "../components/shared/types";
import { type TeacherControlRefProps } from "./TeacherControlPanel";
//import ScoreBoardTeacher from "./ScoreBoardTeacher";
import { useUserConnections } from "../components/context/UserConnectionsContext";
//import ScoreBoard from "./ScoreBoard";
//import { useDispatch } from "react-redux";
//import { clearLiveQuestionInfo} from "../redux/connectedUsersSlice"
//import type { AppDispatch } from "../redux/store";
function HomeTeacher() {

    //const [levels, setLevels] = useState<LevelProps[]>([]);

    //const state = useSelector((state: RootState) => state);
 
    //const user_name = useSelector((state: RootState) => state.name);
    //const { name, isLoggedIn } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);
    //const rehydrated = useSelector((state: RootState) => state._persist?.rehydrated); //
   // const { name } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);
  
    const {liveQuizId} = useUserConnections();

    //const [liveQuizId, setLiveQuizId] = useState<string | null>(null);


    //const chatPageRef = useRef<ChatPageRefProps>(null);
    //const [chat, setChat] = useState<{ text: string; user_name: string }>({ text: "", user_name: "" });

    const teacherControlPanelRef = useRef<TeacherControlRefProps>(null);

    //const { websocketRef} = useWebSocket();

    //const {eventEmitter} = useWebSocket();
    //const liveQuizInReduxStore = useSelector((state: RootState) => state.liveQuizId.value);

    //const dispatch = useDispatch<AppDispatch>();

    //const wsUrl = `${import.meta.env.VITE_WS_PROTOCOL}://${import.meta.env.VITE_WS_URL}/ws/socket-server/${name}/`;

    // Listen for user logging out in other tabs. If that happends, reload this tab to reflect the logout state
    // which effectively logs out this tab as well and redirects to login page

    // KPHAM: this logic works in conjunction with ProtecedRoute component
    // in which, upon component mount, the loggedin state of the use is checked before 
    // attempting to authorize access to protected routes
    
    return (
   
        <div className="grid grid-cols-[2fr_1fr] gap-4">
           
            <div className="bg-blue-300">
                <TeacherControlPanel ref={teacherControlPanelRef} live_quiz_id={liveQuizId} />
                <Outlet />
            </div>
   
        </div>
    );
}

export default HomeTeacher;

