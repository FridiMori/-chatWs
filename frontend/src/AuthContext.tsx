import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
    token: string | null;
    username: string | null;
    login: (token: string, username: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);

    const login = (newToken: string, newUsername: string) => {
        setToken(newToken);
        setUsername(newUsername);
    };

    const logout = () => {
        setToken(null);
        setUsername(null);
    };

    return (
        <AuthContext.Provider value={{ token, username, login, logout }}>
    {children}
    </AuthContext.Provider>
);
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
