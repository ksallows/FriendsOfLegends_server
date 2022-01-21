const router = require("express").Router();
const { Profile } = require("../models");
const { UniqueConstraintError } = require("sequelize/lib/errors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validateJWT = require("../middleware/validatejwt");
//const { DataTypes } = require("sequelize/dist");

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

    // ? fetch: summonerId (id), profileIcon (profileIconId), level (summonerLevel)
    // {
    //     "id": "ClazlW-TfDBWcACca48cQKRyy8og7StMNrdmgxr9MgQckUk",
    //     "accountId": "je7dcfTne4K-M-JIDEKGIjXGgDyQYh4-VhOJOekpYP_ae-Q",
    //     "puuid": "Tu13h0NFEJKnFy8_ekMW0mAl0XHL8dLP43r3FZo6lBnFQX93l3LecrstfLuXKkwfBvZTM2hBrcsD1w",
    //     "name": "Scuttle",
    //     "profileIconId": 4413,
    //     "revisionDate": 1642785399716,
    //     "summonerLevel": 213
    // }
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
        .then(async () => {
            await fetch(`https://${server}.api.riotgames.com/lol/league/v4/entries/by-summoner/${newData.summonerId}`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'X-Riot-Token': process.env.RIOT_API_KEY
                }
            })
                .then(result => result.json())
                .then(result => {
                    newData.rank = `${result[0].tier} ${result[0].rank}`
                })
        })

    const query = {
        where: {
            accountId: accountId,
        }
    };

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