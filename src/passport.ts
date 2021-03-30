import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { MUser, Users } from "./model/user";

passport.use(new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    Users.findOne({ email: email.toLowerCase() }).then((user) => {
        if(!user) {
            return done(null, false, { message: "Incorrect email." });
        }
        if(!user.validatePassword(password)) {
            return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
    }).catch((err) => {
        return done(err);
    });
}));

passport.serializeUser((user: MUser, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await Users.findById(id, { passwordHash: 0, campaigns: 0 });
        done(null, user);
    } catch (err) {
        done(err);
    }
});

export const isAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    } else {
        return res.sendStatus(401);
    }
}