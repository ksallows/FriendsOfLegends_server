const router = require('express').Router();
const { Profile } = require('../models');
const validateJWT = require('../middleware/validatejwt');
const util = require('util')

// *
// *    update profile info & refresh riot api fields
// *
router.put('/update', validateJWT, async (request, response) => {

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

    if (!summonerName)
        return response.status(500).json({ message: 'Summoner Name is Required' })

    if (!server)
        return response.status(500).json({ message: 'Server is Required' })

    if (!discord.match(/^.{3,32}#[0-9]{4}$/))
        return response.status(400).json({ message: "Discord tag not valid" });

    summonerName = encodeURI(summonerName)
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

// *
// *    refresh riot api fields
// *
router.put('/refresh', validateJWT, async (request, response) => {

    const newData = {
        summonerId: null,
        level: null,
        summonerIcon: null,
        rank: null,
        topChamps: [],
    }

    let summonerId;
    let summonerName;
    let server;
    const accountId = request.accountId;

    try {
        const profile = await Profile.findOne({
            where: {
                accountId: accountId
            },
            attributes: ['summonerId', 'summonerName', 'server'],
            raw: true
        })
        summonerId = profile.summonerId;
        summonerName = profile.summonerName;
        server = profile.server;
    } catch (err) {
        response.status(500).json({
            err: `Error: ${err}`
        })
    }

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

// *
// *    get summoner verification code
// *
router.get('/verification', validateJWT, async (request, response) => {
    const accountId = request.accountId;

    let profileId;

    try {
        const profile = await Profile.findOne({
            where: {
                accountId: accountId
            },
            attributes: ['profileId'],
            raw: true
        })
        profileId = profile.profileId;
        response.status(200).json({
            code: profileId
        });
    } catch (err) {
        response.status(500).json({
            err: `Error: ${err}`
        })
    }
})

// *
// *    verify summoner verification code
// *
router.post('/verification', validateJWT, async (request, response) => {

    const accountId = request.accountId;
    let summonerId, summonerName, server, profileId;

    try {
        const profile = await Profile.findOne({
            where: {
                accountId: accountId
            },
            attributes: ['summonerId', 'summonerName', 'server', 'profileId'],
            raw: true
        })
        summonerId = profile.summonerId;
        summonerName = profile.summonerName;
        server = profile.server;
        profileId = profile.profileId;
    } catch (err) {
        response.status(500).json({
            err: `Error: ${err}`
        })
    }

    if (!summonerId || !summonerName || !server)
        return response.status(500).json({ error: 'Must have summoner name and server before verification' })

    await fetch(`https://${server}.api.riotgames.com/lol/platform/v4/third-party-code/by-summoner/${summonerId}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'X-Riot-Token': process.env.RIOT_API_KEY
        }
    })
        .then(result => {
            if (result.status === 404)
                return response.status(404).json({ error: 'Code not found on account' })
            else
                return result.json()
        })
        .then(async (result) => {
            if (result === profileId) {
                try {
                    await Profile.update(
                        { verified: true },
                        { where: { accountId: accountId } }
                    );
                    response.status(200).json({
                        message: "Account verified!",
                    });
                } catch (error) {
                    response.status(500).json({
                        err: `Error ${error}`,
                    });
                }
            }
            else return response.status(401).json({ error: 'Code doesn\'t match' })
        })
})

module.exports = router;