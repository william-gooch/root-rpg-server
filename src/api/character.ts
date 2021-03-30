import { randomBytes } from "crypto";
import base64url from "base64url";
import express from "express";
import * as Automerge from "automerge";
import { fromPlaybook, playbooks } from "root-rpg-model";
import { Characters } from "../model/character";

const characterRouter = express.Router();

characterRouter.get("/:characterId", async (req, res, next) => {
    const result = await Characters.findOne({ id: req.params.characterId })
    res.send(result.value);
});

const initialiseCharacter = (playbook: string) => {
    return Automerge.from(fromPlaybook(playbooks[playbook ?? "arbiter"]));
};

characterRouter.post("/new/:playbook", async (req, res, next) => {
    const newDocId = base64url.encode(randomBytes(6));
    const newDoc = initialiseCharacter(req.params.playbook);

    const result = await Characters.create({
        id: newDocId,
        value: newDoc,
        automerge: Automerge.save(newDoc)
    });
    await result.save();

    res.send(newDocId);
});

characterRouter.delete("/:characterId", async (req, res, next) => {
    const result = await Characters.deleteOne({ id: req.params.characterId });
    res.sendStatus(200);
});

export default characterRouter;