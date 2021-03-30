import { Schema, model, Document } from "mongoose";
import { MCampaign } from "./campaign";
import bcrypt from "bcrypt";

export interface MUser extends Document {
    username: string;
    email: string;
    passwordHash: string;
    campaigns: MCampaign[];

    setPassword(password: string): void;
    validatePassword(password: string): boolean;
}

const userSchema = new Schema<MUser>({
    username: {
        type: String,
        unique: true,
    },
    email: {
        type: String,
        unique: true,
    },
    passwordHash: String,
    campaigns: [{ type: Schema.Types.ObjectId, ref: "campaigns" }],
});

userSchema.methods.setPassword = function (password: string) {
    this.passwordHash = bcrypt.hashSync(password, 10);
}

userSchema.methods.validatePassword = function (password: string) {
    return bcrypt.compareSync(password, this.passwordHash)
};

export const Users = model<MUser>("users", userSchema);