const { DataTypes } = require('sequelize')
const db = require('../db');

const Profile = db.define('profile', {
    profileId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    accountId: {
        type: DataTypes.STRING,
        allowNull: false
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
        type: DataTypes.ARRAY(DataTypes.STRING),
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
        type: DataTypes.ARRAY(DataTypes.STRING),
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
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
});

module.exports = Profile;