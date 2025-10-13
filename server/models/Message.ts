import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
    user: string;
    text: string;
    timestamp: string;
}

const MessageSchema = new Schema<IMessage>({
    user: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: String, required: true },
});

export default mongoose.model<IMessage>('Message', MessageSchema);
