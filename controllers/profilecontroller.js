const router = require('express').Router();
const { Profile, Account } = require('../models');
const validateJWT = require('../middleware/validatejwt');
const { request, response } = require('express');
const { Op } = require('sequelize');

const refresh = async (summonerName, server) => {
    let data = {
        summonerId: null,
        level: null,
        summonerIcon: null,
        rank: null,
        topChamps: [],
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
            data.summonerId = result.id;
            data.summonerIcon = result.profileIconId;
            data.level = result.summonerLevel
        })
        .catch(error => console.log(error))

    await fetch(`https://${server}.api.riotgames.com/lol/league/v4/entries/by-summoner/${data.summonerId}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'X-Riot-Token': process.env.RIOT_API_KEY
        }
    })
        .then(result => result.json())
        .then(result => {
            if (result.length === 0)
                data.rank = 'UNRANKED';
            else {
                let a;
                for (i = 0; i < result.length; i++) {
                    if (result[i].queueType === 'RANKED_SOLO_5x5') {
                        a = i;
                    }
                }
                if (result[a].tier !== 'CHALLENGER' && result[a].tier !== 'MASTER' && result[a].tier !== 'GRANDMASTER')
                    data.rank = `${result[a].tier === ''} ${result[a].rank}`
                else
                    data.rank = result[a].tier
            }
        })
        .catch(error => console.log(error))

    await fetch(`https://${server}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${data.summonerId}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'X-Riot-Token': process.env.RIOT_API_KEY
        }
    })
        .then(result => result.json())
        .then(result => data.topChamps.push(result[0].championId, result[1].championId, result[2].championId))
        .catch(error => console.log(error))
    return data
}

router.get('/summonerInfo', validateJWT, async (request, response) => {
    const accountId = request.accountId;

    try {
        let profile = await Profile.findOne({
            where: { accountId: accountId },
            raw: true
        });
        let account = await Account.findOne({
            where: { profileId: profile.profileId },
            raw: true
        })
        response.status(200).json({
            summonerName: profile.summonerName,
            server: profile.server,
            verified: profile.verified,
            admin: account.admin,
            profileId: profile.profileId
        });
    } catch (error) {
        response.status(500).json({
            error: `Error ${error}`,
        });
    }
})

// *
// *    find profile by id
// *
router.get('/p/:profileId', validateJWT, async (request, response) => {
    let { profileId } = request.params;

    try {
        let profile = await Profile.findOne({
            where: { profileId: profileId },
            raw: true
        });
        response.status(200).json({
            profile: profile
        });
    } catch (error) {
        response.status(500).json({
            error: `Error ${error}`,
        });
    }
})

// *
// *    find profiles by fields
// *
router.post('/find:page?', validateJWT, async (request, response) => {

    let fields = request.body.fields

    let query = {}

    query.server = fields.server;
    if (fields.rank !== null) query.rank = { [Op.startsWith]: fields.rank }
    if (fields.topChamps !== null) query.topChamps = { [Op.contains]: fields.topChamps }
    if (fields.roles !== null) query.roles = { [Op.contains]: fields.roles }
    if (fields.gameModes !== null) query.gameModes = { [Op.contains]: fields.gameModes }
    if (fields.voiceComm !== null) query.voiceComm = fields.voiceComm

    let offset = request.params.page ? request.params.page : 0

    try {
        let profiles = await Profile.findAll({
            where: query,
            raw: true,
            offset: offset,
            nest: true,
            attributes: ['profileId', 'summonerIcon', 'level', 'rank', 'topChamps', 'roles', 'voiceComm', 'gameModes', 'summonerName']
        });
        if (profiles.length > 0) response.status(200).json({ matches: profiles })
        else response.status(404).json({ message: 'Sorry, we couldn\'t find any players matching that criteria.' })

    } catch (error) {
        response.status(500).json({
            error: `Error ${error}`,
        });
    }
})

// *
// *    update profile info & refresh riot api fields
// *
router.put('/update', validateJWT, async (request, response) => {

    let {
        summonerName,
        server
    } = request.body.profile;

    if (!summonerName)
        return response.status(500).json({ message: 'Summoner Name is Required' })

    if (!server)
        return response.status(500).json({ message: 'Server is Required' })

    if (!request.body.profile.discord.match(/^.{3,32}#[0-9]{4}$/))
        return response.status(400).json({ message: "Discord tag not valid" });

    summonerName = encodeURI(summonerName);

    const accountId = request.accountId;

    let newData = await refresh(summonerName, server)

    newData = Object.assign(newData, request.body.profile)

    try {
        await Profile.update(
            newData,
            { where: { accountId: accountId } }
        );
        response.status(200).json({
            message: "Updated",
            data: newData
        });
    } catch (error) {
        response.status(500).json({
            error: `Error ${error}`,
        });
    }
});

// *
// *    refresh riot api fields
// *
router.put('/refresh', validateJWT, async (request, response) => {

    console.log(request.accountId)

    let profile;

    const accountId = request.accountId;

    try {
        profile = await Profile.findOne({
            where: {
                accountId: accountId
            },
            attributes: ['summonerId', 'summonerName', 'server'],
            raw: true
        })
    } catch (error) {
        response.status(500).json({
            error: `Error: ${error}`
        })
    }

    let newData = await refresh(profile.summonerName, profile.server)

    try {
        await Profile.update(
            newData,
            { where: { accountId: accountId } }
        );
        response.status(200).json({
            message: "Updated",
            rank: newData.rank,
            topChamps: newData.topChamps,
            summonerIcon: newData.summonerIcon,
            level: newData.level
        });
    } catch (error) {
        response.status(500).json({
            error: `Error ${error}`,
        });
    }
});

// *
// *    get summoner verification code
// *
router.get('/verify', validateJWT, async (request, response) => {
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
    } catch (error) {
        response.status(500).json({
            error: `Error: ${error}`
        })
    }
})

// *
// *    verify summoner verification code
// *
router.post('/verify', validateJWT, async (request, response) => {

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
    } catch (error) {
        response.status(500).json({
            error: `Error: ${error}`
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
                        error: `Error ${error}`,
                    });
                }
            }
            else return response.status(401).json({ error: 'Code doesn\'t match' })
        })
})

// *
// *    profile delete
// *
router.delete('/delete/:profileId', validateJWT, async (request, response) => {

    const admin = request.admin;

    if (!admin) return response.status('403').json({ message: 'Unauthorized' })

    const { profileId } = request.params;

    try {
        await Profile.destroy({
            where: {
                profileId: profileId
            }
        })
        return response.status('200').json({ message: 'Profile deleted' })
    } catch (error) {
        response.status(500).json({
            error: `Error: ${error}`
        })
    }
})

router.post('/updateSummonerName', validateJWT, async (request, response) => {
    const accountId = request.accountId;

    const { summonerName, server } = request.body.profile

    try {
        await Profile.update(
            {
                summonerName: summonerName,
                server: server
            },
            { where: { accountId: accountId } }
        )
        return response.status('200').json({ message: 'Profile updated' })
    } catch (error) {
        response.status(500).json({
            error: `Error: ${error}`
        })
    }

})

module.exports = router;