import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../redux/userSlice";
import { Navigate } from "react-router-dom";
import api from "../api";

function Logout() {
    const dispatch = useDispatch();
    //const hasLoggedOut = useRef(false);

    useEffect(() => {
        const performLogout = async () => {
            try {
                // 1. Tell Django to delete the cookies
                await api.post('/api/api/logout/');
                
                // 2. Clean up the UI state
                dispatch(logout());
                
                // 3. Optional: Redirect to login
                window.location.href = '/';
            } catch (error) {
               //console.error("Logout failed", error);
            }
        };

        performLogout();
    }, [dispatch]);

    return <Navigate to="/login" />;
}

export default Logout;