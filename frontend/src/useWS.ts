import { useEffect, useRef, useState } from 'react';
import type { ChatMessage, UserInfo, WebSocketMessage } from './types';

export const useWebSocket = (
    token: string | null,
    onMessage: (msgs: ChatMessage[]) => void,
    onUserList: (users: UserInfo[]) => void
) => {
    const wsRef = useRef<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!token) return;

        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${wsProtocol}//${window.location.host}`);

        ws.onopen = () => {
            const loginMsg: WebSocketMessage = { type: 'LOGIN', payload: token };
            ws.send(JSON.stringify(loginMsg));
            setConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const data: WebSocketMessage = JSON.parse(event.data);

                if (data.type === 'MESSAGE') {
                    const msgs = Array.isArray(data.payload) ? data.payload : [data.payload];
                    onMessage(msgs);
                } else if (data.type === 'USER_LIST') {
                    onUserList(data.payload || []);
                }
            } catch (e) {
                console.error('WS parse error:', e);
            }
        };

        ws.onclose = () => setConnected(false);
        ws.onerror = () => setConnected(false);

        wsRef.current = ws;

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'LOGOUT' }));
                ws.close();
            }
        };
    }, [token]);

    const sendMessage = (text: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'MESSAGE', payload: text }));
        }
    };

    return { connected, sendMessage };
};
