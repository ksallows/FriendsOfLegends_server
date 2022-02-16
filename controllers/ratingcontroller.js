const router = require("express").Router();
const { Rating, Profile, Account } = require("../models/index");
const validateJWT = require("../middleware/validatejwt");
const sequelize = require("sequelize");
const { response } = require("express");

// router.get("/likes", validateJWT, async (request, response) => {
//     const id = request.user_id;

//     try {
//         const userLikes = await User.findAll({
//             where: {
//                 user_id: id,
//             },
//             attributes: ["likedPosts"],
//         });
//         response.status(200).json(userLikes);
//     } catch (error) {
//         response.status(500).json({
//             error: `Error ${error}`,
//         });
//     }
// });

router.put("/rate", validateJWT, async (request, response) => {
    const accountId = request.accountId;
    const { forProfileId, rating } = request.body

    // {
    //     "rating": "upvote",
    //     "forProfileId": "84c989c1-d10e-4fc6-afc6-e20ecfa4a658"
    // }
    try {
        const profile = await Profile.findOne({
            where: {
                accountId: accountId
            },
            attributes: ['profileId'],
            raw: true
        })

        const profileId = profile.profileId;

        const ratingObject = await Rating.findOne({
            where: {
                profileId: profileId
            },
            raw: true
        })

        //create rating if doesn't exist, with upvote or downvote
        if (ratingObject === null) {
            let newRating = {};

            if (rating === 'upvote') newRating.upvotes = [profileId]
            else newRating.downvotes = [profileId]

            newRating.profileId = forProfileId;
            newRating.rating = rating === 'upvote' ? 1 : -1
            await Rating.create(newRating)
        }
        else {
            // user has NOT already upvoted/downvoted this post
            if (!ratingObject[`${rating}s`].includes(profileId)) {
                await Rating.increment('rating', { by: rating === 'upvote' ? 1 : -1, where: { profileId: forProfileId } })
                if (rating === 'upvote') {
                    await Rating.update(
                        {
                            upvotes: sequelize.fn(
                                "array_append",
                                sequelize.col("upvotes"),
                                profileId
                            ),
                            downvotes: sequelize.fn(
                                "array_remove",
                                sequelize.col("downvotes"),
                                profileId
                            ),
                        },
                        { where: { profileId: forProfileId } }
                    )
                }
                else {
                    await Rating.update(
                        {
                            downvotes: sequelize.fn(
                                "array_append",
                                sequelize.col("downvotes"),
                                profileId
                            ),
                            upvotes: sequelize.fn(
                                "array_remove",
                                sequelize.col("upvotes"),
                                profileId
                            ),
                        },
                        { where: { profileId: forProfileId } }
                    )
                }
            }
            //user has already upvoted or downvoted the profile
            else {
                //user is taking away their upvote
                if (rating === 'upvote') {
                    await Rating.increment('rating', { by: -1, where: { profileId: forProfileId } })
                    await Rating.update(
                        {
                            upvotes: sequelize.fn(
                                "array_remove",
                                sequelize.col("upvotes"),
                                profileId
                            ),
                        },
                        { where: { profileId: forProfileId } }
                    )
                }
                // user is taking away their downvote
                else {
                    await Rating.increment('rating', { by: 1, where: { profileId: forProfileId } })
                    await Rating.update(
                        {
                            downvotes: sequelize.fn(
                                "array_remove",
                                sequelize.col("downvotes"),
                                profileId
                            ),
                        },
                        { where: { profileId: forProfileId } }
                    )
                }
            }
        }
        response.status(200).json({
            message: 'rating updated'
        })

    }
    catch (error) {
        response.status(500).json({ message: error })
    }
});

module.exports = router;