import { createServer, IncomingMessage, ServerResponse } from "http";
import path from "path";
import express from "express";
import WebSocket, { Server } from "ws";

import * as Automerge from "automerge";
import AutomergeServer from "automerge-server";

import { fromPlaybook, playbooks } from "root-rpg-model";

import { randomBytes } from "crypto";

import level from "level";
var db = level("db/root-rpg");

const initialiseCharacter = (playbook: string) => {
    return Automerge.from(fromPlaybook(playbooks[playbook ?? "arbiter"]));
}

const automergeServer = new AutomergeServer({
    loadDocument: async (id) => {
        try {
            return await new Promise((resolve, reject) => {
                db.get(id, (err, value) => {
                    if(err) reject(err);
                    resolve(value);
                });
            });
        } catch(e) {
            return false;
        }
    },

    saveDocument: async (id, text, doc) => {
        return await new Promise<void>((resolve, reject) => {
            db.put(id, text, (err) => {
                if(err) reject(err);
                resolve();
            });
        })
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

    ws.on("message", (message) => {
        console.log("message: ", message);
        const data = JSON.parse(message.toString());
        if(data.action === "new-document") {
            const newDocId = randomBytes(16).toString('hex')
            db.put(newDocId, Automerge.save(initialiseCharacter(data.playbook)));
            ws.send(JSON.stringify({ action: "load", id: newDocId }));
        }
    })
});

const dir = path.resolve("./")
app.use(express.static(path.join(dir, "build")))
app.get('/*', function (req, res) {
  res.sendFile(path.join(dir, "build", "index.html"));
});

const PORT = (process.env.PORT as unknown as number) ?? 3000;
const HOST = process.env.HOST ?? "localhost";
server.listen(PORT, HOST, () => {
    console.log(`Listening on http://${HOST}:${PORT}`);
});