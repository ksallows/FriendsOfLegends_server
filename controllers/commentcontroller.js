const router = require("express").Router();
const { Comment, Profile, Account } = require("../models/index");
const validateJWT = require("../middleware/validatejwt");
const sequelize = require("sequelize");
const { response } = require("express");

// TODO remove all instances of 'alias'
// TODO require summonername and verified = true for comments

router.post("/new", validateJWT, async (request, response) => {
    const accountId = request.accountId;

    const { forProfile, body } = request.body.comment

    if (body.length < 10) return response.status(500).json({ message: 'Comment must be at least 10 characters long' });
    if (body.length > 499) return response.status(500).json({ message: 'Max comment length is 500 characters' });

    try {
        // find profileId via accountId
        const profile = await Profile.findOne({
            where: {
                accountId: accountId
            },
            attributes: ['profileId', 'summonerName'],
            raw: true
        })
        // create comment
        await Comment.create({
            forProfileId: forProfile,
            profileId: forProfile,
            fromProfileId: profile.profileId,
            fromSummonerName: profile.summonerName,
            body: body
        });
        response.status(201).json({
            message: "Comment created",
            forProfileId: forProfile,
            fromProfileId: profile.profileId,
            body: body
        });
    } catch (error) {
        response.status(500).json({
            error: `Error: ${error}`
        })
    }
});

router.get("/comments/:profileId", validateJWT, async (request, response) => {
    const { profileId } = request.params

    try {
        const profile = await Comment.findAll({
            where: {
                forProfileId: profileId
            },
            raw: true,
            attributes: ['fromSummonerName', 'fromProfileId', 'body', 'commentId'],
            order: [
                ['createdAt', 'DESC']
            ]

        })
        response.status(201).json(profile);
    } catch (error) {
        response.status(500).json({
            error: `Error: ${error}`
        })
    }
});

router.put("/edit", validateJWT, async (request, response) => {
    const { accountId, admin } = request;

    const { body, commentId } = request.body.comment

    try {
        // get profileId of current account
        const profile = await Profile.findOne({
            where: {
                accountId: accountId
            },
            attributes: ['profileId'],
            raw: true
        })
        // get fromProfileId from specified comment
        const comment = await Comment.findOne({
            where: {
                commentId: commentId
            },
            attributes: ['fromProfileId'],
            raw: true
        })
        // if they match (or admin user), update
        if (profile.profileId === comment.fromProfileId || admin) {
            await Comment.update(
                { body: body },
                { where: { commentId: commentId } }
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
    const { accountId, admin } = request;

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
                commentId: commentId
            },
            attributes: ['fromProfileId'],
            raw: true
        })

        if (profile.profileId === comment.fromProfileId || admin) {
            await Comment.destroy(
                { where: { commentId: commentId } }
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