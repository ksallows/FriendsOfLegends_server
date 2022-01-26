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

    try {
        // find profileId via accountId
        const profile = await Profile.findOne({
            where: {
                accountId: accountId
            },
            attributes: ['profileId'],
            raw: true
        })
        // create comment
        await Comment.create({
            forProfileId: forProfile,
            fromProfileId: profile.profileId,
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
        // if they match, update
        if (profile.profileId === comment.fromProfileId) {
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
                commentId: commentId
            },
            attributes: ['fromProfileId'],
            raw: true
        })

        if (profile.profileId === comment.fromProfileId) {
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