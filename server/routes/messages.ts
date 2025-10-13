import express from "express";
import mongoose from "mongoose";
import Message from "../models/Message";
import { ChatMessagePayload as MessageType} from "../types";

const messagesRouter = express.Router();

messagesRouter.get('/', async (_req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: 1 });
        res.send(messages);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
});

messagesRouter.get('/:id', async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).send({ error: 'Message not found' });
        }

        res.send(message);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
});

messagesRouter.post('/', async (req, res) => {
    const messageData: Omit<MessageType, 'timestamp'> = {
        user: req.body.user,
        text: req.body.text,
    };

    try {
        const message = new Message({
            ...messageData,
            timestamp: new Date().toISOString(),
        });

        await message.save();

        res.send(message);
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).send({ error: error.message });
        }
        console.error(error);
        res.sendStatus(500);
    }
});

export default messagesRouter;
