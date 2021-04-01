// Permet de hasher le mot de passe des utilisateurs pour éviter de les retrouver en clair
const bcrypt = require("bcrypt");
// Permet de crypter une donnée;
const sha1 = require('sha1');

// Attribut un token à l'utilisateur lorsqu'il se connecte qui sera renvoyé à chaque requête
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Création d'un nouvel utilisateur
exports.signup = (req, res, next) => {
    var mail = req.body.email;

    bcrypt
        .hash(req.body.password, 10) // hashage du mot de passe qu'on "sale" 10x
        .then((hash) => {
            const user = new User({
                // masquer l'email
                email: sha1(mail),
                password: hash,
            });
            user
                .save()
                .then(() =>
                    res.status(201).json({
                        message: "Utilisateur créé !",
                    })
                )
                .catch((error) =>
                    res.status(400).json({
                        message: "Utilisateur déjà existant",
                    })
                );
        })
        .catch((error) =>
            res.status(500).json({
                error,
            })
        );
};

// Authentification d'un utilisateur déjà créé
exports.login = (req, res, next) => {
    var mail = req.body.email;

    User.findOne({
            email: sha1(mail),
        })
        .then((user) => {
            if (!user) {
                return res.status(401).json({
                    error: "Utilisateur non trouvé",
                });
            }
            // comparaison des hashs et vérifie s'ils ont le meme string d'origine
            bcrypt
                .compare(req.body.password, user.password)
                .then((valid) => {
                    if (!valid) {
                        return res.status(401).json({
                            error: "Mot de passe incorrect !",
                        });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign({
                                // encode un nouveau token d'authentification en tant que payload
                                userId: user._id,
                            },
                            "RANDOM_TOKEN_SECRET", {
                                expiresIn: "24h",
                            }
                        ),
                    });
                })
                .catch((error) =>
                    res.status(500).json({
                        error,
                    })
                );
        })
        .catch((error) =>
            res.status(500).json({
                error,
            })
        );
};