import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect, type JSX } from "react";


function ProtectedRoute({ children: children }: { children: JSX.Element }) {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        console.log("ProtectedRoute: Checking authorization...");
        auth().catch(() => setIsAuthorized(false))
    }, [])

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
            const res = await api.post("/api/token/refresh/", {
                refresh: refreshToken,
            });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access)
                setIsAuthorized(true)
            } else {
                setIsAuthorized(false)
            }
        } catch (error) {
            console.log(error);
            setIsAuthorized(false);
        }
    };

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsAuthorized(false);
            return;
        }
        const decoded = jwtDecode(token);
        // print decoded for debugging
        console.log("Decoded token:", decoded);
        const tokenExpiration = decoded.exp;
        console.log("Token expiration time (epoch):", tokenExpiration);
        const now = Date.now() / 1000;
        console.log("Current time (epoch):", now);
        if (tokenExpiration === undefined) {
            setIsAuthorized(false);
            return;
        }
        else {
            console.log("Token expiration time - now:", tokenExpiration - now);
        }

        if (tokenExpiration && tokenExpiration < now) {
            alert("Session has expired. Do you want to continue?");
            await refreshToken();
        } else {
            setIsAuthorized(!!tokenExpiration);
        }
    };

    if (isAuthorized === null) {
        return <div>Loading...</div>;
    }

    return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;