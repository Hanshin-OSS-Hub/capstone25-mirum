import { createContext, useContext } from "react";

export const AuthContext = createContext();

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth 커스텀 훅은 AuthProvider 내부에서만 사용될 수 있습니다.");
    }
    return context;
}
