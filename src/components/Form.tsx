import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { useAppDispatch } from "../redux/hooks";


import LoadingIndicator from "./LoadingIndicator"
import { setUser } from "../redux/user";

interface FormProps {
    route: string;
    method: "login" | "register";
}
// const baseURL = import.meta.env.VITE_API_URL
function Form({ route, method }: FormProps) {

    const user_name_env = import.meta.env.VITE_USER_NAME
    const password_env = import.meta.env.VITE_PASSWORD

    const [username, setUsername] = useState(user_name_env);
    const [password, setPassword] = useState(password_env);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";

    const dispatch = useAppDispatch();

    const handleSubmit = async (e: any) => {
        setLoading(true);
        e.preventDefault();

        try {
            const res = await api.post(route, { username, password })
            if (method === "login") {
                //console.log("Login successful:", res.data);
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                /* store user name in redux store */
                dispatch(setUser({ name: username }));
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