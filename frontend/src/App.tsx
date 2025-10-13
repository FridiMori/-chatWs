import React from 'react';
import { AuthProvider } from './AuthContext';
import { LoginForm } from './components/LoginForm';
import { ChatWindow } from './components/ChatWindow';
import { useAuth } from './AuthContext';
import './App.css';

const MainApp: React.FC = () => {
    const { token, login } = useAuth();
    const isLoggedIn = !!token;

    const handleLogin = (username: string, token: string) => {
        login(token, username);
    };

    return (
        <div className="app">
            {!isLoggedIn ? <LoginForm onLogin={handleLogin} /> : <ChatWindow />}
        </div>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <MainApp />
        </AuthProvider>
    );
}
