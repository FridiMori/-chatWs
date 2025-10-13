import express from "express";
import mongoose from "mongoose";
import User from "../models/User";
import type { UserFields } from "../types";

const usersRouter = express.Router();

usersRouter.post("/", async (req, res, next) => {
    const { username, password } = req.body as Pick<UserFields, "username" | "password">;

    if (!username || !password) {
        return res.status(400).send({ error: "Username and password are required" });
    }

    try {
        const user = new User({ username, password });
        user.generateToken();
        await user.save();

        res.send({ username: user.username, token: user.token });
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).send(error);
        }
        next(error);
    }
});

usersRouter.post("/sessions", async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).send({ error: "Username not found!" });
        }

        const isMatch = await user.checkPassword(password);
        if (!isMatch) {
            return res.status(400).send({ error: "Password is wrong!" });
        }

        user.generateToken();
        await user.save();

        res.send({ username: user.username, token: user.token });
    } catch (error) {
        next(error);
    }
});

usersRouter.delete("/sessions", async (req, res, next) => {
    try {
        const token = req.get("Authorization");
        if (!token) return res.status(204).send();

        const user = await User.findOne({ token });
        if (!user) return res.status(204).send();

        user.generateToken();
        await user.save();

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default usersRouter;
