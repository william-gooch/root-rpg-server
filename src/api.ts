import express from "express";
import campaignRouter from "./api/campaign";

import characterRouter from "./api/character";
import userRouter from "./api/user";


const router = express.Router();

router.use("/character", characterRouter);
router.use("/campaign", campaignRouter);
router.use("/user", userRouter);


export default router;