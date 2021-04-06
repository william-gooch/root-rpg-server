import { randomBytes } from "crypto";
import _ from "lodash";
import base64url from "base64url";
import express from "express";
import { Campaigns } from "../model/campaign";
import { isAuthenticated } from "../passport";
import { MUser } from "../model/user";
import { Characters } from "../model/character";

const campaignRouter = express.Router();

campaignRouter.get("/my", isAuthenticated, async (req, res, next) => {
    const result = await (req.user as MUser).populate("campaigns").execPopulate();
    return res.send(result.campaigns);
})

campaignRouter.get("/:campaignId", isAuthenticated, async (req, res, next) => {
    const result = await Campaigns
        .findOne({ id: req.params.campaignId })
        .populate("characters");

    if(!result) {
        return res.sendStatus(404);
    }

    res.send(result);
});

campaignRouter.post("/new", isAuthenticated, async (req, res, next) => {
    const newCampaignId = base64url.encode(randomBytes(6));

    const newCampaign = await Campaigns.create({
        id: newCampaignId,
        owner: (req.user as MUser)._id,
        ...req.body,
    });
    newCampaign.save();

    (req.user as MUser).campaigns.push(newCampaign._id);
    (req.user as MUser).save();

    res.status(201).send(newCampaign);
});

campaignRouter.post("/:campaignId/join", isAuthenticated, async (req, res, next) => {
    if(!req.body.characterId) {
        return res.sendStatus(400);
    }

    const character = await Characters
        .findOne({ id: req.body.characterId });
    
    if(!character) {
        return res.sendStatus(404);
    }

    const campaign = await Campaigns
        .findOne({ id: req.params.campaignId })
    
    if(!campaign) {
        return res.sendStatus(404);
    }

    campaign.characters.push(character._id)
    campaign.characters = _.uniq(campaign.characters);
    await campaign.save();

    (req.user as MUser).campaigns.push(campaign._id);
    (req.user as MUser).save();

    res.sendStatus(200);
});

export default campaignRouter;