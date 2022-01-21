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
        server,
        discord
    } = request.body.profile;

    const newData = {
        summonerId: null,
        level: null,
        summonerIcon: null,
        discord: discord,
        roles: null,
        active: null,
        gameModes: null,
        voiceComm: null,
        description: null,
        active: true,
        rank: null,
        topChamps: [],
        summonerName: summonerName,
        server: server
    }

    summonerName = encodeURI(summonerName)

    if (summonerName === null)
        return response.status(500).json({ message: 'Summoner Name is Required' })

    if (server === null)
        return response.status(500).json({ message: 'Server is Required' })

    if (!discord.match(/^.{3,32}#[0-9]{4}$/))
        return response.status(400).json({ message: "Discord tag not valid" });

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
            if (result.length === 0)
                newData.rank = 'Unranked';
            else {
                let a;
                for (i = 0; i < result.length; i++) {
                    if (result[i].queueType === 'RANKED_SOLO_5x5') {
                        a = i;
                    }
                }
                if (result[a].tier !== 'CHALLENGER' && result[a].tier !== 'MASTER' && result[a].tier !== 'GRANDMASTER')
                    newData.rank = `${result[a].tier === ''} ${result[a].rank}`
                else
                    newData.rank = result[a].tier
            }
        })

    await fetch(`https://${server}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${newData.summonerId}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'X-Riot-Token': process.env.RIOT_API_KEY
        }
    })
        .then(result => result.json())
        .then(result => newData.topChamps.push(result[0].championId, result[1].championId, result[2].championId))

    console.log(newData.topChamps)

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

module.exports = router;