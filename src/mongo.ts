import mongoose from "mongoose";

let db: mongoose.Connection;

export const config = async () => {
    const mongo = await mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    db = mongo.connection;
}

export const close = async () => {
    db.close();
}