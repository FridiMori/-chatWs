export interface ChatMessage {
    user: string;
    text: string;
    timestamp: string;
}

export interface UserInfo {
    username: string;
    isOnline: boolean;
}

export interface WebSocketMessage {
    type: 'LOGIN' | 'MESSAGE' | 'LOGOUT' | 'USER_LIST' | 'ERROR';
    payload?: any;
}
