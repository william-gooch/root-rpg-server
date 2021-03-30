import { createServer } from "http";
import path from "path";
import express from "express";
import WebSocket from "ws";
import cors from "cors";

require("dotenv").config();

import AutomergeServer from "automerge-server";

import apiRouter from "./api";
import { config, close } from "./mongo";
import { Characters } from "./model/character";

import session from "express-session";
import "./passport";
import passport from "passport";

async function main() {
    try {
        await config();

        const automergeServer = new AutomergeServer({
            loadDocument: async (id) => {
                try {
                    const doc = await Characters.findOne({ id });
                    if(doc === null) throw new Error("document-not-found");

                    return doc.automerge;
                } catch(e) {
                    return false;
                }
            },

            saveDocument: async (id, text, doc) => {
                return await Characters.replaceOne(
                    { id },
                    { id, value: doc, automerge: text },
                    { upsert: true }
                );
            },

            checkAccess: async (id, req) => {
                return true;
            }
        });

        const app = express();
        const server = createServer(app);
        const wss = new WebSocket.Server({ server });

        wss.on("connection", async (ws, req: any) => {
            automergeServer.handleSocket(ws, req);
        });

        const dir = path.resolve("./");
        app.use(express.static(path.join(dir, "build")));
        app.use(express.json());

        app.use(cors({
            origin: true,
            credentials: true,
        }));

        app.use(session({
            resave: false,
            saveUninitialized: true,
            secret: "rootin",
        }));
        app.use(passport.initialize());
        app.use(passport.session());

        app.use('/api', apiRouter);
        app.get('/', (req, res) => {
            res.sendFile(path.join(dir, "build", "index.html"));
        });
        app.get('*', function (req, res) {
            res.redirect("/")
        });

        const PORT = (process.env.PORT as unknown as number) ?? 3000;
        const HOST = process.env.HOST ?? "localhost";
        server.listen(PORT, HOST, () => {
            console.log(`Listening on http://${HOST}:${PORT}`);
        });
        server.on("close", () => close());
    } catch(e) {
        console.log(e);
    }
}

main();