import express from "express";
import passport from "passport";
import { Users } from "../model/user";
import { isAuthenticated } from "../passport";

const userRouter = express.Router();

userRouter.post("/signup", async (req, res, next) => {
    if(!req.body.username || !req.body.email || !req.body.password) {
        return res.status(400).send("Insufficient information given.");
    }

    const oldUser = await Users.findOne({ $or: [{ email: req.body.email }, { username: req.body.username }] });
    if(oldUser) {
        return res.status(400).send("User already exists");
    }

    const newUser = await Users.create({
        username: req.body.username,
        email: req.body.email.toLowerCase(),
    });
    newUser.setPassword(req.body.password);
    newUser.save();

    req.login(newUser, (err) => {
        if(err) {
            return next(err);
        }
        return res.sendStatus(200);
    });
});

userRouter.post("/login", passport.authenticate("local"), (req, res, next) => {
    if(req.user) {
        return res.sendStatus(200);
    } else {
        return res.status(401).send("Unable to log in.");
    }
});

userRouter.post("/logout", (req, res, next) => {
    req.logout();

    res.sendStatus(200);
});

userRouter.get("/me", isAuthenticated, (req, res, next) => {
    return res.send(req.user);
});

export default userRouter;