import express from "express";
import cors from 'cors';
import mongoose from "mongoose";

const app = express();
const PORT = 8000;

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const run = async () => {

    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });

    process.on('exit', () => {
        mongoose.disconnect();
    })
};

run().catch(console.error);

