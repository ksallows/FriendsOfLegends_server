const { DataTypes } = require('sequelize');
const db = require('../db');

const Comment = db.define('comment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    for: {  //profileId
        type: DataTypes.STRING,
        allowNull: false
    },
    from: { //profileId
        type: DataTypes.STRING,
        allowNull: false
    },
    fromAlias: {
        type: DataTypes.STRING,
        allowNull: false
    },
    body: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Comment;