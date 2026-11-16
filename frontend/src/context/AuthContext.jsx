/* eslint-disable react-refresh/only-export-components */
import {createContext, useContext, useState, useEffect, useCallback} from "react";
import toast from "react-hot-toast";
import API from "../api/axios";
import socket from "../socket/socket";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem("userInfo");
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            return null;
        }
    });

    const login = useCallback((data) => {
        localStorage.setItem("userInfo", JSON.stringify(data));
        setUser(data);
    }, []);

    const logout = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

            if (userInfo?.token) {
                await API.post("/auth/logout");
            }
        } catch (error) {
            if (!error?.globalNotificationShown) {
                toast.error(error?.message || "Logout failed.");
            }
        } finally {
            localStorage.removeItem("userInfo");
            socket.disconnect();
            setUser(null);
        }
    };

    useEffect(() => {
        if (user?._id && user?.token) {
            socket.auth = {token: user.token};
            socket.connect();
        } else {
            socket.disconnect();
        }

        return () => socket.disconnect();
    }, [user]);

    return (
        <AuthContext.Provider value={{user, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
