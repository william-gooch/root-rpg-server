import { randomBytes } from "crypto";
import base64url from "base64url";
import express from "express";
import * as Automerge from "automerge";
import { fromPlaybook, playbooks } from "root-rpg-model";
import { Characters } from "../model/character";
import { MUser } from "../model/user";
import { isAuthenticated } from "../passport";

const characterRouter = express.Router();

characterRouter.get("/my", isAuthenticated, async (req, res, next) => {
    const result = await (req.user as MUser).populate("characters").execPopulate();

    if(result.characters) {
        const characters = Object.fromEntries(result.characters.map(char => [char.id, char.value]));
        return res.send(characters);
    } else {
        return res.sendStatus(404);
    }
})

characterRouter.get("/:characterId", async (req, res, next) => {
    const result = await Characters.findOne({ id: req.params.characterId })
    res.send(result.value);
});

const initialiseCharacter = (playbook: string) => {
    return Automerge.from(fromPlaybook(playbooks[playbook ?? "arbiter"]));
};

characterRouter.post("/new/:playbook", isAuthenticated, async (req, res, next) => {
    const newDocId = base64url.encode(randomBytes(6));
    const newDoc = initialiseCharacter(req.params.playbook);

    const result = await Characters.create({
        id: newDocId,
        value: newDoc,
        automerge: Automerge.save(newDoc)
    });
    await result.save();

    (req.user as MUser).characters.push(result._id);
    (req.user as MUser).save();

    res.send(newDocId);
});

characterRouter.delete("/:characterId", isAuthenticated, async (req, res, next) => {
    const result = await Characters.deleteOne({ id: req.params.characterId, _id: { $in: (req.user as MUser).characters } });
    res.sendStatus(200);
});

export default characterRouter;