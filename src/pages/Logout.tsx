import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../redux/userSlice";
import { Navigate } from "react-router-dom";

function Logout() {
    const dispatch = useDispatch();
    const hasLoggedOut = useRef(false);

    useEffect(() => {
        if (!hasLoggedOut.current) {
            
            dispatch(logout());
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            hasLoggedOut.current = true; // Ensure logout is only dispatched once
            // clear access and refresh tokens from localStorage
   
        }
    }, [dispatch]);

    return <Navigate to="/login" />;
}

export default Logout;