const { DataTypes } = require('sequelize');
const db = require('../db');

const Rating = db.define('rating', {
    rating: {
        type: DataTypes.INTEGER
    },
    upvotes: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false
    },
    downvotes: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false
    },
});

module.exports = Rating;