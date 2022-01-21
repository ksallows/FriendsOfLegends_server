const router = require("express").Router();
const { Profile } = require("../models");
const { UniqueConstraintError } = require("sequelize/lib/errors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validateJWT = require("../middleware/validatejwt");
const util = require('util')

router.put("/update", validateJWT, async (request, response) => {

    let {
        summonerName,
        server
    } = request.body.profile;

    summonerName = encodeURI(summonerName)

    const newData = {
        summonerId: null,
        level: null,
        summonerIcon: null,
        discord: null,
        roles: [],
        active: null,
        gameModes: [],
        voiceComm: null,
        description: null,
        active: true,
        rank: null
    }

    if (summonerName === null)
        return response.status(500).json({ message: 'Summoner Name is Required' })

    if (server === null)
        return response.status(500).json({ message: 'Server is Required' })

    const accountId = request.accountId;

    await fetch(`https://${server}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'X-Riot-Token': process.env.RIOT_API_KEY
        }
    })
        .then(result => result.json())
        .then(result => {
            if (result.status_code === 404) {
                return response.status(500).json({
                    message: "Summoner not found",
                })
            }
            newData.summonerId = result.id;
            newData.summonerIcon = result.profileIconId;
            newData.level = result.summonerLevel
        })

    await fetch(`https://${server}.api.riotgames.com/lol/league/v4/entries/by-summoner/${newData.summonerId}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'X-Riot-Token': process.env.RIOT_API_KEY
        }
    })
        .then(result => result.json())
        .then(result => {
            console.log(util.inspect(result, { showHidden: false, depth: null, colors: true }))
            if (result.length === 0)
                newData.rank = 'Unranked';
            else {
                let a;
                for (i = 0; i < result.length; i++) {
                    if (result[i].queueType === 'RANKED_SOLO_5x5') {
                        a = i;
                    }
                }
                newData.rank = `${result[a].tier} ${result[a].rank}`
            }
        })

    try {
        await Profile.update(
            newData,
            { where: { accountId: accountId } }
        );
        response.status(200).json({
            message: "Updated",
        });
    } catch (err) {
        response.status(500).json({
            err: `Error ${err}`,
        });
    }
});

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

// router.post("/checkToken", validateJWT, async (request, response) => {
//     response.status(200).json({
//         message: "Valid Token.",
//         user_id: request.user_id,
//         username: request.username,
//     });
// });

// router.get("/:username", async (request, response) => {
//     const username = request.params.username;

//     try {
//         const userInfo = await User.findAll({
//             where: {
//                 username: username,
//             },
//             attributes: ["profileDescription", "profilePicture"],
//         });
//         response.status(200).json(userInfo);
//     } catch (error) {
//         response.status(500).json({
//             error: `Error ${error}`,
//         });
//     }
// });

// router.get('/:username', async (request, response) => {
//     const username = request.params.username;

//     try {
//         const userInfo = await User.findAll({
//             where: {
//                 username: username,
//             },
//             attributes: ['profileDescription', 'profilePicture']
//         })
//         response.status(200).json(userInfo)
//     }
//     catch (error) {
//         response.status(500).json({
//             error: `Error ${error}`
//         });
//     }
// });

// router.get('/usernameFromId/:id', async (request, response) => {
//     const user_id = request.params.id;

//     try {
//         let username = await User.findAll({
//             where: {
//                 user_id: user_id
//             },
//             attributes: ['username']
//         })
//         response.status(200).json(username)
//     }
//     catch (error) {
//         response.status(500).json({
//             error: `Error ${error}`
//         });
//     }
// })

module.exports = router;