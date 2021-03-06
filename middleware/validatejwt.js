const jwt = require("jsonwebtoken");
const { Account } = require("../models");

const validateJWT = async (req, res, next) => {

    try {
        if (req.method == "OPTIONS") {
            next();
        } else if (
            req.headers.authorization &&
            req.headers.authorization.includes("Bearer")
        ) {
            const { authorization } = req.headers;
            const payload = authorization
                ? jwt.verify(
                    authorization.includes("Bearer")
                        ? authorization.split(" ")[1]
                        : authorization,
                    process.env.JWT_SECRET
                )
                : undefined;
            if (payload) {
                let foundAccount = await Account.findOne({ where: { accountId: payload.id } });

                if (foundAccount) {
                    req.accountId = foundAccount.dataValues.accountId;
                    req.admin = foundAccount.dataValues.admin
                    next();
                } else {
                    res.status(400).send({ message: "Not Authorized" });
                }
            } else {
                res.status(401).send({ message: "Invalid token" });
            }
        } else {
            res.status(403).send({ message: "Forbidden" });
        }
    }
    catch (error) { res.status(403).send({ message: "Forbidden" }); }
};

module.exports = validateJWT;