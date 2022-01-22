const router = require("express").Router();
const { Comment, Profile, Account } = require("../models/index");
const validateJWT = require("../middleware/validatejwt");
const sequelize = require("sequelize");
const { response } = require("express");

router.post("/new", validateJWT, async (request, response) => {
    const accountId = request.accountId;

    const { forProfile, body } = request.body.comment

    let profileId, fromAlias;

    try {
        const profile = await Profile.findOne({
            where: {
                accountId: accountId
            },
            attributes: ['profileId'],
            raw: true
        })
        const account = await Account.findOne({
            where: {
                accountId: accountId
            },
            attributes: ['alias'],
            raw: true
        })
        profileId = profile.profileId;
        fromAlias = account.alias;
        await Comment.create({
            for: forProfile,
            from: profileId,
            fromAlias: fromAlias,
            body: body
        });

        response.status(201).json({
            message: "Comment created",
            for: forProfile,
            from: profileId,
            fromAlias: fromAlias,
            body: body
        });
    } catch (error) {
        response.status(500).json({
            error: `Error: ${error}`
        })
    }
});

router.get("/:profileId", validateJWT, async (request, response) => {
});

router.put("/edit", validateJWT, async (request, response) => {
});

router.delete("/delete", validateJWT, async (request, response) => {
});

module.exports = router;