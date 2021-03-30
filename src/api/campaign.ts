import { randomBytes } from "crypto";
import base64url from "base64url";
import express from "express";
import { Campaigns } from "../model/campaign";
import { isAuthenticated } from "../passport";
import { MUser } from "../model/user";

const campaignRouter = express.Router();

campaignRouter.get("/my", isAuthenticated, async (req, res, next) => {
    const result = await (req.user as MUser).populate("campaigns").execPopulate();

    if(result.campaigns) {
        return res.send(result.campaigns);
    } else {
        return res.sendStatus(404);
    }
})

campaignRouter.get("/:campaignId", isAuthenticated, async (req, res, next) => {
    const result = await Campaigns
        .findOne({ id: req.params.campaignId })
        .populate("characters");

    if(!result) {
        res.sendStatus(404);
    }

    res.send(result);
});

campaignRouter.post("/new", isAuthenticated, async (req, res, next) => {
    const newCampaignId = base64url.encode(randomBytes(6));

    const newCampaign = await Campaigns.create({
        id: newCampaignId,
        ...req.body,
    });
    newCampaign.save();

    (req.user as MUser).campaigns.push(newCampaign._id);
    (req.user as MUser).save();

    res.status(201).send(newCampaign);
});

export default campaignRouter;