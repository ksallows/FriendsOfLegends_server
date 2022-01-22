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
    const { profileId } = request.params

    try {
        const profile = await Comment.findAll({
            where: {
                for: profileId
            },
            raw: true
        })
        response.status(201).json(profile);
    } catch (error) {
        response.status(500).json({
            error: `Error: ${error}`
        })
    }
});

router.put("/edit", validateJWT, async (request, response) => {
    const accountId = request.accountId;

    const { body, commentId } = request.body.comment

    try {
        const profile = await Profile.findOne({
            where: {
                accountId: accountId
            },
            attributes: ['profileId'],
            raw: true
        })
        const comment = await Comment.findOne({
            where: {
                id: commentId
            },
            attributes: ['from'],
            raw: true
        })

        if (profile.profileId === comment.from) {
            await Comment.update(
                { body: body },
                { where: { id: commentId } }
            );
        }
        else return response.status(403).json({ message: 'You can only edit YOUR comments.' })

        response.status(200).json({
            message: 'Comment updated:',
            body: body
        })

    } catch (error) {
        response.status(500).json({
            error: `Error: ${error}`
        })
    }
});

router.delete("/delete", validateJWT, async (request, response) => {
    const accountId = request.accountId;

    const { commentId } = request.body.comment

    try {
        const profile = await Profile.findOne({
            where: {
                accountId: accountId
            },
            attributes: ['profileId'],
            raw: true
        })
        const comment = await Comment.findOne({
            where: {
                id: commentId
            },
            attributes: ['from'],
            raw: true
        })

        if (profile.profileId === comment.from) {
            await Comment.destroy(
                { where: { id: commentId } }
            );
        }
        else return response.status(403).json({ message: 'You can only delete YOUR comments.' })

        response.status(200).json({
            message: 'Comment deleted'
        })

    } catch (error) {
        response.status(500).json({
            error: `Error: ${error}`
        })
    }
});

module.exports = router;