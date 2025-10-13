import { WebSocketServer, WebSocket } from "ws";
import MessageModel from "../models/Message";
import UserModel from "../models/User";
import type {
    WebSocketMessage,
    ChatMessagePayload,
    UserListPayload,
} from "../types";

const clients = new Map<WebSocket, string>();

export const startChatServer = (server: any) => {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws: WebSocket) => {
        console.log("Client connected");

        ws.on("message", async (raw: string) => {
            try {
                const data = JSON.parse(raw) as WebSocketMessage;

                switch (data.type) {
                    case "LOGIN": {
                        const token = (data as Extract<WebSocketMessage, { type: "LOGIN" }>).payload;
                        if (typeof token !== "string") {
                            sendError(ws, "Invalid LOGIN payload");
                            return;
                        }

                        const user = await UserModel.findOne({ token });
                        if (!user) {
                            sendError(ws, "Invalid token");
                            ws.close();
                            return;
                        }

                        clients.set(ws, user.username);
                        user.isOnline = true;
                        await user.save();

                        await broadcastUserList(wss);
                        await sendLastMessages(ws);
                        break;
                    }

                    case "MESSAGE": {
                        const username = clients.get(ws);
                        if (!username) return;

                        const text = (data as Extract<WebSocketMessage, { type: "MESSAGE" }>).payload;
                        if (typeof text !== "string") {
                            sendError(ws, "Invalid MESSAGE payload");
                            return;
                        }

                        const message: ChatMessagePayload = {
                            user: username,
                            text,
                            timestamp: new Date().toISOString(),
                        };

                        await MessageModel.create(message);

                        const response: WebSocketMessage = { type: "MESSAGE", payload: message };
                        const json = JSON.stringify(response);

                        wss.clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(json);
                            }
                        });

                        break;
                    }

                    case "LOGOUT": {
                    await handleLogout(ws, wss);
                    break;
                }

            default:
                sendError(ws, "Unknown message type");
                break;
            }
            } catch (e) {
                console.error("Error parsing WS message:", e);
                sendError(ws, "Invalid JSON message");
            }
        });

        ws.on("close", () => handleLogout(ws, wss));
    });

    console.log("💬 WebSocket server started");
};

const sendError = (ws: WebSocket, message: string) => {
    const errorMsg: WebSocketMessage = { type: "ERROR", payload: message };
    ws.send(JSON.stringify(errorMsg));
};

const broadcast = (wss: WebSocketServer, message: WebSocketMessage) => {
    const json = JSON.stringify(message);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(json);
        }
    });
};

const broadcastUserList = async (wss: WebSocketServer) => {
    const users = (await UserModel.find({}, { username: 1, isOnline: 1, _id: 0 }).lean()) as UserListPayload[];
    const msg: WebSocketMessage = { type: "USER_LIST", payload: users };
    broadcast(wss, msg);
};

const sendLastMessages = async (ws: WebSocket) => {
    const messages = await MessageModel.find().sort({ _id: -1 }).limit(30).lean();
    const msg: WebSocketMessage = {
        type: "MESSAGE",
        payload: messages.reverse(),
    };
    ws.send(JSON.stringify(msg));
};

const handleLogout = async (ws: WebSocket, wss: WebSocketServer) => {
    const username = clients.get(ws);
    if (!username) return;

    const user = await UserModel.findOne({ username });
    if (user) {
        user.isOnline = false;
        await user.save();
    }

    clients.delete(ws);
    await broadcastUserList(wss);
};
