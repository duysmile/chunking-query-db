const { MongoClient } = require('mongodb');
const express = require('express');

const url = 'mongodb://localhost:27017';
const dbName = 'nlp-prod';

async function main() {
    const app = express();

    app.use(express.json());

    app.get("/ping", async (req, res) => {
        const client = new MongoClient(url);
        await client.connect();
        console.log('Connected successfully to db');

        const db = client.db(dbName);
        const stats = await db.stats();
        return res.json(stats);
    });

    /*
    `   API for calculate sum messages per bot
    */

    app.get("/cal-without-chunk", async (req, res) => {
        const client = new MongoClient(url);
        await client.connect();
        console.log('Connected successfully to db');

        const db = client.db(dbName);
        const collection = db.collection("messages");

        const messages = await collection.find({}).toArray();
        const count = messages.reduce((acc, message) => {
            return countMessage(acc, message.botId);
        }, {});

        res.json(count);
    });

    app.get("/call-with-chunk", (req, res) => {

    });

    app.listen(3000, () => {
        console.log('Server started at port 3000');
    });
}

main().catch(err => {
    console.error('ERROR: ', err);
    process.exit(1);
});
