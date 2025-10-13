import mongoose, { Model } from "mongoose";
import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import type { UserFields } from "../types";

interface UserMethods {
    checkPassword(password: string): Promise<boolean>;
    generateToken(): void;
}

type UserModel = Model<UserFields, {}, UserMethods>;

const Schema = mongoose.Schema;
const SALT_WORK_FACTOR = 10;

const UserSchema = new Schema<UserFields, UserModel, UserMethods>({
    username: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: async function (value: string): Promise<boolean> {
                if (!this.isModified("username")) return true;
                const existing = await mongoose.models.User.findOne({ username: value });
                return !existing;
            },
            message: "This username is already taken",
        },
    },
    password: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
});

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;

    next();
});

UserSchema.set("toJSON", {
    transform: (_doc, ret: Partial<UserFields>) => {
        delete ret.password;
        return ret;
    },
});

UserSchema.methods.checkPassword = function (password: string) {
    return bcrypt.compare(password, this.password);
};

UserSchema.methods.generateToken = function () {
    this.token = randomUUID();
};

const User = mongoose.model<UserFields, UserModel>("User", UserSchema);
export default User;
