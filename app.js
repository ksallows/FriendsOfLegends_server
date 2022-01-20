require('dotenv').config();
const express = require('express');
const cors = require('cors')
const app = express();
app.use(cors())
const dbConnection = require('./db');
const controllers = require('./controllers');
app.use(express.json());

app.use('/user', controllers.usercontroller);
app.use('/comment', controllers.commentcontroller);

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