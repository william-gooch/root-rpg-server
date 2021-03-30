import { Schema, model, Document } from "mongoose";
import { Character } from "root-rpg-model";

export interface MCharacter extends Document {
    id: string;
    automerge: string;
    value: Character;
}

const equipmentSchema = new Schema({
    name: String,
    wear: { max: Number, current: Number },
    load: Number,
    range: [String],
    skillTags: [String],
    tags: [String]
});

const characterSchema = new Schema({
    id: String,
    automerge: String,
    value: {
        playbook: String,
        name: String,
        details: String,
        demeanor: String,

        background: {
            type: Map,
            of: String,
        },

        drives: {
            type: Map,
            of: Boolean,
        },
        nature: String,
        connections: {
            type: Map,
            of: {
                name: String,
                description: String,
            },
        },

        reputation: [{
            faction: String,
            modifier: Number,
            notoriety: Number,
            prestige: Number,
        }],

        stats: {
            Charm: Number,
            Cunning: Number,
            Finesse: Number,
            Luck: Number,
            Might: Number,
        },

        harm: {
            injury: { max: Number, current: Number },
            exhaustion: { max: Number, current: Number },
            depletion: { max: Number, current: Number },
        },
        
        roguishFeats: {
            type: Map,
            of: Boolean,
        },
        weaponSkills: {
            type: Map,
            of: Boolean,
        },
        moves: {
            type: Map,
            of: Schema.Types.Mixed,
        },

        equipment: [equipmentSchema],
    }
});

export const Characters = model<MCharacter>("characters", characterSchema);