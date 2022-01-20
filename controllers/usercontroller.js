const router = require("express").Router();
const { User } = require("../models");
const { UniqueConstraintError } = require("sequelize/lib/errors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validateJWT = require("../middleware/validatejwt");

router.post("/register", async (request, response) => {
    let { email, alias, password } = request.body.user;

    const emailRegex =
        /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

    if (!email.match(emailRegex))
        return response.status(400).json({ message: "Email not valid" });

    if (password.length < 8)
        return response
            .status(400)
            .json({ message: "Password must be at least 8 characters" });

    try {
        const user = await User.create({
            email,
            alias,
            passwordhash: bcrypt.hashSync(password, 13)
        });

        let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: 60 * 60 * 24,
        });

        response.status(201).json({
            message: "User successfully created",
            email: email,
            alias: alias,
            sessionToken: token
        });
    } catch (error) {
        if (error.name == "SequelizeUniqueConstraintError") {
            response.status(409).json({
                message: "Email or username already in use",
            });
        } else
            response.status(500).json({
                message: `Failed to register user.`,
            });
    }
});

// router.post("/login", async (request, response) => {
//     let { email, password } = request.body.user;

//     try {
//         const loginUser = await User.findOne({
//             where: {
//                 email: email,
//             },
//         });

//         if (loginUser) {
//             let passwordComparison = await bcrypt.compare(
//                 password,
//                 loginUser.passwordhash
//             );
//             if (passwordComparison) {
//                 let token = jwt.sign(
//                     { id: loginUser.user_id },
//                     process.env.JWT_SECRET,
//                     { expiresIn: 60 * 60 * 24 }
//                 );

//                 response.status(200).json({
//                     user: loginUser,
//                     message: "User successfully logged in!",
//                     sessionToken: token,
//                 });
//             } else {
//                 response.status(401).json({
//                     message: "Incorrect email or password",
//                 });
//             }
//         } else {
//             response.status(401).json({
//                 message: "Incorrect email or password",
//             });
//         }
//     } catch (error) {
//         response.status(500).json({
//             message: `Failed to log user in. ${error}`,
//         });
//     }
// });

// router.put("/edit", validateJWT, async (request, response) => {
//     let { description, imageURL } = request.body.user;
//     const id = request.user_id;

//     const newDescription = {
//         profileDescription: description,
//         profilePicture: imageURL,
//     };

//     const query = {
//         where: {
//             user_id: id,
//         },
//     };

//     try {
//         await User.update(newDescription, query);

//         response.status(200).json({
//             message: "Updated",
//             updatedDesc: description,
//             updatedURL: imageURL,
//         });
//     } catch (err) {
//         response.status(500).json({
//             err: `Error ${err}`,
//         });
//     }
// });

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