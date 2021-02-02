import { createServer } from "http";
import WebSocket from "ws";

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

const server = createServer();
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

const PORT = 3001;
const HOST = process.env.HOST ?? "localhost";
server.listen(PORT, HOST, () => {
    console.log(`Listening on http://${HOST}:${PORT}`);
});