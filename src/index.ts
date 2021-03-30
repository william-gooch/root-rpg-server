import { createServer } from "http";
import path from "path";
import express from "express";
import WebSocket from "ws";
import cors from "cors";

require("dotenv").config();

import * as Automerge from "automerge";
import AutomergeServer from "automerge-server";

import apiRouter from "./api";
import { config, close, getCollection } from "./mongo";

async function main() {
    try {
        await config("rootrpg");
        const coll = getCollection("characters");

        const automergeServer = new AutomergeServer({
            loadDocument: async (id) => {
                try {
                    const doc = await coll.findOne({ id });
                    if(doc === null) throw new Error("document-not-found");

                    return doc.automerge;
                } catch(e) {
                    return false;
                }
            },

            saveDocument: async (id, text, doc) => {
                return await coll.replaceOne(
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

        const dir = path.resolve("./")
        app.use(express.static(path.join(dir, "build")))
        app.use(cors())
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