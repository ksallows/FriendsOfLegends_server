const router = require('express').Router();
const { Account, Profile } = require('../models');
const { UniqueConstraintError } = require('sequelize/lib/errors');
const validateJWT = require('../middleware/validatejwt');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const util = require('util')

router.post('/register', async (request, response) => {
    let { email, password } = request.body.account;

    let accountId;

    const emailRegex =
        /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|'(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*')@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

    const passwordRegex = /^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!#$%&?'_]).*$/

    if (!emailRegex.test(email))
        return response.status(400).json({ message: 'Email not valid' });

    if (!passwordRegex.test(password))
        return response.status(400).json({ message: 'Password must be at least 8 characters and include at least 1 letter and 1 number, and 1 symbol (!#$%&?"_)' });

    try {
        await Account.create({
            email,
            passwordhash: bcrypt.hashSync(password, 13)
        })
            .then(async (account) => {
                accountId = account.accountId
                await Profile.create({
                    accountId: accountId
                })
                    .then(async (profile) => {
                        await Account.update(
                            { profileId: profile.profileId },
                            { where: { accountId: accountId } }
                        )
                        let token = jwt.sign({ id: accountId }, process.env.JWT_SECRET, {
                            expiresIn: 60 * 60 * 24,
                        });
                        response.status(201).json({
                            message: 'Account successfully created',
                            email: email,
                            sessionToken: token,
                            profileId: profile.profileId
                        });
                    })
            })

    } catch (error) {
        if (error.name == 'SequelizeUniqueConstraintError') {
            response.status(409).json({
                message: 'Email already in use',
            });
        } else
            response.status(500).json({
                message: `Failed to register account.${error}`,
            });
    }
});

router.post('/login', async (request, response) => {
    let { email, password } = request.body.account;

    try {
        const loginAccount = await Account.findOne({
            where: {
                email: email,
            },
        });

        if (loginAccount) {
            let passwordComparison = await bcrypt.compare(
                password,
                loginAccount.passwordhash
            );
            if (passwordComparison) {
                let token = jwt.sign(
                    { id: loginAccount.accountId },
                    process.env.JWT_SECRET,
                    { expiresIn: 60 * 60 * 24 }
                );

                response.status(200).json({
                    account: loginAccount.email,
                    message: 'Account successfully logged in!',
                    sessionToken: token,
                });
            } else {
                response.status(401).json({
                    message: 'Incorrect email or password',
                });
            }
        } else {
            response.status(401).json({
                message: 'Incorrect email or password',
            });
        }
    } catch (error) {
        response.status(500).json({
            message: `Failed to log user in. ${error}`,
        });
    }
});

router.post('/checkToken', validateJWT, async (request, response) => {
    response.status(200).json({
        message: `Token valid`
    });
})
module.exports = router;