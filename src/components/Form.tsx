import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
//import { useAppDispatch } from "../redux/store";


import LoadingIndicator from "./LoadingIndicator"
import { setUser } from "../redux/userSlice";
import { useDispatch } from "react-redux";

interface FormProps {
    route: string;
    method: "login" | "register";
}
// const baseURL = import.meta.env.VITE_API_URL
function Form({ route, method }: FormProps) {

    const user_name_env = import.meta.env.VITE_USER_NAME
    const password_env = import.meta.env.VITE_PASSWORD

    //console.log("User name from env:", user_name_env);

    const [username, setUsername] = useState(user_name_env);
    const [password, setPassword] = useState(password_env);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";

    const dispatch = useDispatch();

    const handleSubmit = async (e: any) => {
        //alert("Submitting form...");
        setLoading(true);
        e.preventDefault();

        try {
            const res = await api.post(route, { username, password })
            if (method === "login") {
                console.log("Login successful:", res.data);
                //localStorage.setItem(ACCESS_TOKEN, res.data.access);
                //localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                /* store user name in redux store */
                console.log("********* Storing user in redux:********* ", username);
                dispatch(setUser(username));
                navigate("/")
            } else {
                navigate("/login")
            }
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false)
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>{name}</h1>
            <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            {loading && <LoadingIndicator />}
            <button className="form-button" type="submit">
                {name}
            </button>
        </form>
    );
}

export default Form

/*
How it redux-persist works with localStorage under the hood
When you call dispatch(setUser(name)), the data travels through this cycle:

Action Dispatched: Your component sends the name.

Reducer Updates: The userSlice updates the state in memory.

Persist Middleware: redux-persist notices the change in the user slice.

Storage: It writes the new state to localStorage.

On Refresh: When the page reloads, the PersistGate reads from localStorage and 
pushes the data back into Redux before your app finishes loading.

Verifying the Data
You can check if this is working by opening your browser's Developer Tools:

Go to the Application tab.

Select Local Storage on the left.

You should see a key named persist:root. If you look at the value, you'll see your user object serialized as a string.


*/
