const { DataTypes } = require('sequelize');
const db = require('../db');

const User = db.define('user', {
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
        unique: false
    },
    passwordhash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    summonerName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    summonerId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    rank: {
        type: DataTypes.STRING,
        allowNull: true
    },
    server: {
        type: DataTypes.STRING,
        allowNull: true
    },
    discord: {
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
    voiceComm: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ratings: {
        type: DataTypes.ARRAY,
        allowNull: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    roles: {
        type: DataTypes.ARRAY,
        allowNull: true
    },
    admin: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
});

module.exports = User;