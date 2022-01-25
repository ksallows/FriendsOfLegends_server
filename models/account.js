const { DataTypes } = require('sequelize');
const db = require('../db');

const Account = db.define('account', {
    // *    BASIC ACCT INFO
    accountId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    profileId: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'NOTSET'
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
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
});

module.exports = Account;