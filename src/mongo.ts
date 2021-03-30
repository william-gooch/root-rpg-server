import { MongoClient } from "mongodb";

let client: MongoClient;
let dbName: string;

export const config = async (name: string) => {
    dbName = name;
    client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
}

export const close = async () => {
    await client.close();
}

const getClient = (): MongoClient => {
    if(client) {
        return client;
    } else {
        throw new Error("Must initialize client before getting it!");
    }
}

export const getDb = () => {
    return getClient().db(dbName);
}

export const getCollection = (name: string) => {
    return getDb().collection(name);
}