import { Schema, model, Document } from "mongoose";
import { MCharacter } from "./character";

export interface MCampaign extends Document {
    id: string;
    name: string;
    characters: MCharacter[];
}

const campaignSchema = new Schema({
    id: String,
    name: String,
    characters: [{ type: Schema.Types.ObjectId, ref: "characters" }],
});

export const Campaigns = model<MCampaign>("campaigns", campaignSchema);