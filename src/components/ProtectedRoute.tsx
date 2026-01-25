import { Navigate } from "react-router-dom";
//import { jwtDecode } from "jwt-decode";
//import api from "../api";
//import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import {type JSX } from "react";
import { useSelector } from "react-redux";


function ProtectedRoute({ children: children }: { children: JSX.Element }) {
    const { isLoggedIn } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);
    //const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    //const { isLoggedIn } = useSelector((state: { user: { name: string; isLoggedIn: boolean } }) => state.user);

    // kpham: this component deals with ACCESS TOKEN expiration and refresh only,
    // it has nothing to do with login status which is handled by redux store
    // see explanation below in the first useEffect


    /*
    useEffect(() => {
        // KPHAM: only check auth if user is logged in
        // ********* keep this logic, which works in conjunction with the one in HOME.tsx to make sure
        // that all tabs are logged out when user logs out from one tab.

        // Let's say you are logged in on two tabs: TAB 1, and TAB 2. And you log out of TAB 2. 
        // 
        // If you don't check for user logged in before validating token, 
        // 
        // then when user tries to refresh
        // a tab after logging out from another tab, the HOME page will still display BUT WITHOUT valid user name
        // because the redux-persist store has been cleared by the logout action in the other tab
        if (isLoggedIn)
            //console.log("ProtectedRoute: Checking TOKEN...now that user is logged in");
            auth().catch(() => setIsAuthorized(false))
        else {
            setIsAuthorized(false);
            return
        }
    }, [isLoggedIn])
    */

    /*
    const refreshToken = async () => {
        //const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
            const res = await api.post("/api/token/refresh/", {
                refresh: refreshToken,
            });
            if (res.status === 200) {
                //localStorage.setItem(ACCESS_TOKEN, res.data.access)
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
        //const token = localStorage.getItem(ACCESS_TOKEN);
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsAuthorized(false);
            return;
        }
        const decoded = jwtDecode(token);
        // print decoded for debugging
        //console.log("Decoded token:", decoded);
        const tokenExpiration = decoded.exp;
        //console.log("Token expiration time (epoch):", tokenExpiration);
        const now = Date.now() / 1000;
        //console.log("Current time (epoch):", now);
        if (tokenExpiration === undefined) {
            //console.log("Token expiration is undefined.");
            setIsAuthorized(false);
            return;
        }
       

        if (tokenExpiration && tokenExpiration < now) {
            //console.log("Session has expired. Do you want to continue?");
            await refreshToken();
        } else {
            //console.log("Token did not expire yet.");
            setIsAuthorized(!!tokenExpiration);
        }
    };
    */

    if (isLoggedIn === null) {
        return <div>Loading...</div>;
    }

    return isLoggedIn ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;