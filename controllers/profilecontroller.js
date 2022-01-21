const router = require("express").Router();
const { Profile } = require("../models");
const { UniqueConstraintError } = require("sequelize/lib/errors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validateJWT = require("../middleware/validatejwt");

module.exports = router;