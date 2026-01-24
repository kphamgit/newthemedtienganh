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
            hasLoggedOut.current = true; // Ensure logout is only dispatched once
        }
    }, [dispatch]);

    return <Navigate to="/login" />;
}

export default Logout;