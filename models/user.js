const { DataTypes } = require('sequelize');
const db = require('../db');

const User = db.define('user', {
    // *    BASIC ACCT INFO
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    alias: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    passwordhash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    admin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    // * RIOT API GENERATED INFO
    summonerName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    summonerId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    rank: {
        type: DataTypes.STRING,
        allowNull: true
    },
    topChamps: {
        type: DataTypes.ARRAY,
        allowNull: true
    },
    profileIcon: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    // * USER SUPPLIED INFO
    server: {
        type: DataTypes.STRING,
        allowNull: true
    },
    discord: {
        type: DataTypes.STRING,
        allowNull: true
    },
    roles: {
        type: DataTypes.ARRAY,
        allowNull: true
    },
    voiceComm: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    gameModes: {
        type: DataTypes.ARRAY,
        allowNull: true
    },

    // * RATING
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    ratings: {
        type: DataTypes.ARRAY,
        allowNull: true
    },


    // * COMMENTS
    commentsMade: {
        type: DataTypes.ARRAY,
        allowNull: true
    },
    comments: {
        type: DataTypes.ARRAY,
        allowNull: true
    }
});

module.exports = User;