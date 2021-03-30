import { randomBytes } from "crypto";
import base64url from "base64url";
import * as Automerge from "automerge";
import express from "express";
import { getCollection } from "./mongo";
import { fromPlaybook, playbooks } from "root-rpg-model";
const router = express.Router();

router.get("/character/:characterId", async (req, res, next) => {
    const characters = getCollection("characters");

    const result = await characters.findOne({ id: req.params.characterId });
    res.send(result.value);
});

const initialiseCharacter = (playbook: string) => {
    return Automerge.from(fromPlaybook(playbooks[playbook ?? "arbiter"]));
}

router.post("/character/new/:playbook", async (req, res, next) => {
    const characters = getCollection("characters");

    const newDocId = base64url.encode(randomBytes(6));
    const newDoc = initialiseCharacter(req.params.playbook);

    const result = characters.insertOne({
        id: newDocId,
        value: newDoc,
        automerge: Automerge.save(newDoc)
    });

    res.send(newDocId);
})

router.delete("/character/:characterId", async (req, res, next) => {
    const characters = getCollection("characters");

    const result = await characters.deleteOne({ id: req.params.characterId });
    res.sendStatus(200);
});

export default router;