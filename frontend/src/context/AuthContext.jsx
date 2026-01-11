import { useState, useEffect } from "react";
import { AuthContext } from "./useAuth";

export default function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const username = localStorage.getItem("username");
        const name = localStorage.getItem("name");
        const email = localStorage.getItem("email");
        if (token && username) {
            setIsAuthenticated(true);
            setUser({ username, name, email });
        }
    }, []);

    const login = (userData) => {
        // localStorage에 저장
        localStorage.setItem("accessToken", userData.accessToken);
        localStorage.setItem("refreshToken", userData.refreshToken);
        localStorage.setItem("username", userData.username);
        localStorage.setItem("name", userData.name);
        localStorage.setItem("email", userData.email);
        
        // state 업데이트
        setIsAuthenticated(true);
        setUser({
            username: userData.username,
            name: userData.name,
            email: userData.email
        });
    };

    const logout = () => {
        localStorage.clear();
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}