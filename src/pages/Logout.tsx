import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { type AppDispatch } from "../redux/store";
import { logout } from "../redux/userSlice";
import { Navigate } from "react-router-dom";
import { clear } from '../redux/connectedUsersSlice';
import { reset } from "../redux/liveQuizIdSlice";

function Logout() {
    const dispatch = useDispatch<AppDispatch>();
    const hasLoggedOut = useRef(false);

    useEffect(() => {
        if (!hasLoggedOut.current) {
            
            dispatch(logout());
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            hasLoggedOut.current = true; // Ensure logout is only dispatched once
            // clear access and refresh tokens from localStorage
            dispatch(clear()); // clear list of connected users in redux store
            dispatch(reset()); // reset liveQuizId in redux store
   
        }
    }, [dispatch]);

    return <Navigate to="/login" />;
}

export default Logout;