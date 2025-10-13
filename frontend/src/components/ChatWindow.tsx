import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useWebSocket } from '../useWS';
import type { ChatMessage, UserInfo } from '../types';

export const ChatWindow: React.FC = () => {
    const { token, username, logout } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { connected, sendMessage } = useWebSocket(token, (msgs) => {
        setMessages(prev => [...prev, ...msgs]);
    }, setUsers);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;
        setMessages(prev => [...prev, { user: username!, text: inputValue, timestamp: new Date().toISOString() }]);
        sendMessage(inputValue);
        setInputValue('');
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const onlineUsers = users.filter(u => u.isOnline).length;

    return (
        <div className="chat-container">
        <div className="chat-header">
            <div>
                <h1>Chat</h1>
    <p className={`status ${connected ? 'online' : 'offline'}`}>
    {connected ? 'Online' : 'Offline'} · {onlineUsers} online
    </p>
    </div>
    <div className="user-info">
        <span>{username}</span>
        <button onClick={logout} className="logout-btn">Logout</button>
        </div>
        </div>

        <div className="main-content">
    <div className="messages-section">
    <div className="messages">
    {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.user === username ? 'own' : 'other'}`}>
    <div className="message-header">
    <span className="username">{msg.user}</span>
        <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
        </div>
        <div className="message-text">{msg.text}</div>
        </div>
))}
    <div ref={messagesEndRef} />
    </div>
    <div className="message-form">
    <input
        type="text"
    placeholder="Enter message..."
    value={inputValue}
    onChange={e => setInputValue(e.target.value)}
    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
    disabled={!connected}
    />
    <button onClick={handleSendMessage} disabled={!connected}>Send</button>
    </div>
    </div>
    <div className="users-section">
        <h2>Users</h2>
        <div className="users-list">
    {users.map(u => (
            <div key={u.username} className={`user-item ${u.isOnline ? 'online' : 'offline'}`}>
    <span className="status-dot"></span>
        <span>{u.username}</span>
        </div>
))}
    </div>
    </div>
    </div>
    </div>
);
};
