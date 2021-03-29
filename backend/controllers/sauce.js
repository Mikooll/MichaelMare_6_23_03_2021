const Sauce = require('../models/Sauce');
// file system permet de gérer les dl d'images
const fs = require('fs');

// Permet de créer une sauce
exports.createSauce = (req, res, next) => {
    // stockage des données du FE en objet
    const sauceObj = JSON.parse(req.body.sauce);
    // suppression de l'id auto 
    delete sauceObj._id;
    const sauce = new Sauce({
        ...sauceObj,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() => res.status(201).json({
            message: 'Sauce sauvegardée'
        }))
};

// requete de modification d'une sauce
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` // si contient une nouvelle image
    } : {
        ...req.body // si pas de nouvelle image
    };
    Sauce.updateOne({
            _id: req.params.id
        }, {
            ...sauceObject,
            _id: req.params.id
        })
        .then(() => res.status(200).json({
            message: 'Sauce modifié'
        }))
        .catch(() => res.status(400).json({
            error
        }))
};

// suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({
            _id: req.params.id
        })
        .then(sauce => {
            // récup de l'url et split pour avoir le nom du fichier
            const filename = sauce.imageUrl.split('/images/')[1];
            // appel de unlink pour supp le fichier
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({
                        _id: req.params.id
                    })
                    .then(() => res.status(200).json({
                        message: 'Sauce supprimée'
                    }))
                    .catch(error => res.status(400).json({
                        error
                    }))
            });
        })
};

// recupération de toutes les sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({
            error
        }))
};

// récupération d'une seule sauce en fonction de son ID
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
            _id: req.params.id
        })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({
            error
        }))
};