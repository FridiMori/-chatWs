export interface ChatMessagePayload {
    user: string;
    text: string;
    timestamp: string;
}

export interface UserListPayload {
    username: string;
    isOnline: boolean;
}

export interface UserFields {
    username: string;
    password: string;
    token: string;
    isOnline: boolean;
}

export type MessageType = "LOGIN" | "MESSAGE" | "LOGOUT" | "USER_LIST" | "ERROR";

export type WebSocketMessage =
    | { type: "LOGIN"; payload: string }
    | { type: "MESSAGE"; payload: string | ChatMessagePayload[] | ChatMessagePayload }
    | { type: "LOGOUT" }
    | { type: "USER_LIST"; payload: UserListPayload[] }
    | { type: "ERROR"; payload: string };

