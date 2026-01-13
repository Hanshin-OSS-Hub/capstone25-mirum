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

    const updateUser = (updatedData) => {
        // localStorage 업데이트
        if (updatedData.name) {
            localStorage.setItem("name", updatedData.name);
        }
        if (updatedData.email) {
            localStorage.setItem("email", updatedData.email);
        }
        // state 업데이트
        setUser(prev => ({
            ...prev,
            name: updatedData.name || prev.name,
            email: updatedData.email || prev.email
        }));
    };

    const deleteUser = () => {
        // 상태 초기화만 담당
        logout();
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser, deleteUser }}>
            {children}
        </AuthContext.Provider>
    );
}