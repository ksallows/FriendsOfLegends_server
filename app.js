require('dotenv').config();
const fetch = require('node-fetch')
globalThis.fetch = fetch
const express = require('express');
const cors = require('cors')
const app = express();

let whitelist = ['http://localhost:3001', 'https://ks-friendsoflegends-client.herokuapp.com', 'http://localhost:3000']
app.use(cors({ origin: whitelist, credentials: true }));
const dbConnection = require('./db');
const controllers = require('./controllers');
app.use(express.json());

app.use('/account', controllers.accountcontroller);
app.use('/profile', controllers.profilecontroller);
app.use('/comment', controllers.commentcontroller);
app.use('/rating', controllers.ratingcontroller);

dbConnection.authenticate()
    .then(() => dbConnection.sync())
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`[Server]: App is listening on ${process.env.PORT}.`);
        });
    })
    .catch((error) => {
        console.log(`[Server]: Server crashed. Error = ${error}`);
    });