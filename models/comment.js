const { DataTypes } = require('sequelize');
const db = require('../db');

const Comment = db.define('comment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    commentBody: {
        type: DataTypes.STRING,
        allowNull: false
    },
    commentCreatedById: {    // id of user who made comment
        type: DataTypes.STRING,
        allowNull: false
    },
    commentCreatedByAlias: {    // alias of user who made comment
        type: DataTypes.STRING,
        allowNull: false
    },
    commentCreatedForId: {    // id of user who's page was commented
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Comment;