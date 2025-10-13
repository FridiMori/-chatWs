import React, { useState } from 'react';

interface LoginFormProps {
    onLogin: (username: string, token: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const endpoint = isRegister ? '/users' : '/users/sessions';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            if (!response.ok) {
                setError(data.error || 'Error occurred');
                setIsLoading(false);
                return;
            }

            onLogin(data.username, data.token);
        } catch {
            setError('Connection error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>💬 Chat App</h1>
                <form onSubmit={handleSubmit} className="login-form">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        disabled={isLoading}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Loading...' : isRegister ? 'Register' : 'Login'}
                    </button>
                </form>
                {error && <div className="error">{error}</div>}
                <button
                    className="toggle-btn"
                    onClick={() => setIsRegister(!isRegister)}
                    disabled={isLoading}
                >
                    {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
                </button>
            </div>
        </div>
    );
};
