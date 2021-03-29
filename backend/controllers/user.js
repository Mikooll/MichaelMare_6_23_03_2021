// Permet de hasher le mot de passe des utilisateurs pour éviter de les retrouver en clair
const bcrypt = require('bcrypt');

// Attribut un token à l'utilisateur lorsqu'il se connecte qui sera renvoyé à chaque requête
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Création d'un nouvel utilisateur
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10) // hashage du mot de passe qu'on "sale" 10x
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({
                    message: 'Utilisateur créé !'
                }))
                .catch(error => res.status(400).json({
                    error
                }));
        })
        .catch(error => res.status(500).json({
            error
        }));
};

// Authentification d'un utilisateur déjà créé
exports.login = (req, res, next) => {
    User.findOne({
            email: req.body.email
        })
        .then(user => {
            if (!user) {
                return res.status(401).json({
                    error: 'Utilisateur non trouvé !'
                });
            }
            // comparaison des hashs et vérifie s'ils ont le meme string d'origine
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({
                            error: 'Mot de passe incorrect !'
                        });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign({ // encode un nouveau token d'authentification en tant que payload
                                userId: user._id
                            },
                            'RANDOM_TOKEN_SECRET', {
                                expiresIn: '24h'
                            }
                        )
                    });
                })
                .catch(error => res.status(500).json({
                    error
                }));
        })
        .catch(error => res.status(500).json({
            error
        }));
};