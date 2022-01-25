const { DataTypes } = require('sequelize');
const db = require('../db');

const Comment = db.define('comment', {
    commentId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    forProfileId: {  //profileId
        type: DataTypes.STRING,
        allowNull: false
    },
    fromProfileId: { //profileId
        type: DataTypes.STRING,
        allowNull: false
    },
    body: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Comment;