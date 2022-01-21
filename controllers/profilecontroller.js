const router = require("express").Router();
const { Profile } = require("../models");
const { UniqueConstraintError } = require("sequelize/lib/errors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validateJWT = require("../middleware/validatejwt");

router.put("/update", async (request, response) => {

    // profileIcon      int     RiotAPI
    // voiceComm        bool    user
    // level            int     RiotAPI
    // discord          str     user
    // roles            arr     user
    // summonerName     str     user
    // timezone         str     user
    // description      str     user
    // topChamps        arr     RiotAPI
    // server           str     user
    // gameModes        arr     user
    // rank             str     RiotAPI
    // active           bool    user
    // summonerId       str     RiotAPI

    // let {
    //     voiceComm,
    //     discord,
    //     roles,
    //     summonerName,
    //     timezome,
    //     description,
    //     server,
    //     gameModes,
    //     active
    // } = request.body.profile;

    // if (summonerName === null)
    //     return response.status(500).json({ message: 'Summoner Name is Required' })

    // if (server === null)
    //     return response.status(500).json({ message: 'Server is Required' })

    let server = 'na1';

    fetch(`https://${server}.api.riotgames.com/lol/summoner/v4/summoners/by-name/Scuttle`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'X-Riot-Token': process.env.RIOT_API_KEY
        }
    })
        .then(result => result.json())
        .then(result => console.log(result))


    // const newDescription = {
    //     profileDescription: description,
    //     profilePicture: imageURL,
    // };

    // const query = {
    //     where: {
    //         user_id: id,
    //     },
    // };

    // try {
    //     await User.update(newDescription, query);

    //     response.status(200).json({
    //         message: "Updated",
    //         updatedDesc: description,
    //         updatedURL: imageURL,
    //     });
    // } catch (err) {
    //     response.status(500).json({
    //         err: `Error ${err}`,
    //     });
    // }
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