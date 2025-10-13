import express from "express";
import cors from 'cors';
import mongoose from "mongoose";
import usersRouter from "./routes/users";
import messagesRouter from "./routes/messages";
import * as http from "node:http";
import {startChatServer} from "./ws/wsServer";
import config from "./config";

const app = express();
const PORT = 8000;

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

app.use("/messages", messagesRouter);
app.use("/users", usersRouter);

const server = http.createServer(app);

startChatServer(server);

const run = async () => {
    await mongoose.connect(config.db);
    console.log("Connected to MongoDB");

    server.listen(PORT, () => {
        console.log("server listening on PORT", PORT);
    });

    process.on("exit", () => {
        mongoose.disconnect();
    });
};

run().catch(console.error);


