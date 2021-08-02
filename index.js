const { MongoClient, ObjectId } = require('mongodb');
const express = require('express');

const { countMessage } = require('./utils');

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
        try {
            // CPU 100%, not block EL and heap out of memory -> crash app
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
        } catch (err) {
            console.error(err);
            res.status(500).send('ERROR');
        }

    });

    app.get("/call-with-chunk-in-wrong-way", async (req, res) => {
        try {
            // CPU reach 100%, not block EL and heap out of memory
            const client = new MongoClient(url);
            await client.connect();
            console.log('Connected successfully to db');

            const db = client.db(dbName);
            const collection = db.collection("messages");

            let lastId;
            let messages = [];

            while (true) {
                let condition = {};
                if (lastId) {
                    condition._id = { $gt: ObjectId(lastId) };
                }
                const tempMessages = await collection.find(condition).limit(1000).toArray();
                if (tempMessages.length == 0) {
                    break;
                }
                lastId = tempMessages[tempMessages.length - 1]._id;
                messages = messages.concat(tempMessages);
            }

            const count = messages.reduce((acc, message) => {
                return countMessage(acc, message.botId);
            }, {});

            res.json(count);
        } catch (error) {
            console.error(error);
            res.status(500).send('ERROR');
        }
    });

    app.get("/call-with-chunk", async (req, res) => {
        try {
            // CPU reach 100%, not block EL and get data in http status 200
            const client = new MongoClient(url);
            await client.connect();
            console.log('Connected successfully to db');

            const db = client.db(dbName);
            const collection = db.collection("messages");

            let lastId;
            let count = {};

            while (true) {
                let condition = {};
                if (lastId) {
                    condition._id = { $gt: ObjectId(lastId) };
                }
                const messages = await collection.find(condition).limit(1000).toArray();
                if (messages.length == 0) {
                    break;
                }
                lastId = messages[messages.length - 1]._id;

                count = messages.reduce((acc, message) => {
                    return countMessage(acc, message.botId);
                }, count);
            }


            res.json(count);
        } catch (error) {
            console.error(error);
            res.status(500).send('ERROR');
        }
    });

    app.get("/call-with-chunk-and-worker", async (req, res) => {
        try {
            // CPU reach 100%, not block EL and get data in http status 200
            const client = new MongoClient(url);
            await client.connect();
            console.log('Connected successfully to db');

            const db = client.db(dbName);
            const collection = db.collection("messages");

            let lastId;
            let count = {};

            while (true) {
                let condition = {};
                if (lastId) {
                    condition._id = { $gt: ObjectId(lastId) };
                }
                const messages = await collection.find(condition).limit(1000).toArray();
                if (messages.length == 0) {
                    break;
                }
                lastId = messages[messages.length - 1]._id;

                count = messages.reduce((acc, message) => {
                    return countMessage(acc, message.botId);
                }, count);
            }


            res.json(count);
        } catch (error) {
            console.error(error);
            res.status(500).send('ERROR');
        }
    });

    app.listen(3000, () => {
        console.log('Server started at port 3000');
    });
}

main().catch(err => {
    console.error('ERROR: ', err);
    process.exit(1);
});
