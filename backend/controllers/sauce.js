const Sauce = require("../models/Sauce");
// file system permet de gérer les dl d'images
const fs = require("fs");

// Permet de créer une sauce
exports.createSauce = (req, res, next) => {
  // stockage des données du Front en objet
  const sauceObj = JSON.parse(req.body.sauce);
  // suppression de l'id auto
  delete sauceObj._id;
  const sauce = new Sauce({
    ...sauceObj,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce.save().then(() =>
    res.status(201).json({
      message: "Sauce sauvegardée",
    })
  );
};

// requete de modification d'une sauce
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`, // si contient une nouvelle image
      }
    : {
        ...req.body, // si pas de nouvelle image
      };
  Sauce.updateOne(
    {
      _id: req.params.id,
    },
    {
      ...sauceObject,
      _id: req.params.id,
    }
  )
    .then(() =>
      res.status(200).json({
        message: "Sauce modifiée",
      })
    )
    .catch(() =>
      res.status(400).json({
        error,
      })
    );
};

// suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id,
  }).then((sauce) => {
    // récup de l'url et split pour avoir le nom du fichier
    const filename = sauce.imageUrl.split("/images/")[1];
    // appel de unlink pour supp le fichier
    fs.unlink(`images/${filename}`, () => {
      Sauce.deleteOne({
        _id: req.params.id,
      })
        .then(() =>
          res.status(200).json({
            message: "Sauce supprimée",
          })
        )
        .catch((error) =>
          res.status(400).json({
            error,
          })
        );
    });
  });
};

// Gestion des likes et des dislikes
exports.likeSauce = (req, res, next) => {
  // Initialisation des constantes
  const like = req.body.like;
  const bodyUserId = req.body.userId;
  const paramId = req.params.id;

  // Gestion du like
  if (like == 1) {
    // $inc : Increments the value of the field by the specified amount
    // $push : Adds an item to an array.
    Sauce.updateOne(
      { _id: paramId },
      { $inc: { likes: 1 }, $push: { usersLiked: bodyUserId }, _id: paramId }
    )
      .then(() =>
        res.status(200).json({ message: "Vous avez aimé cette sauce" })
      )
      .catch((error) => res.status(400).json({ error }));
    // Gestion du dislike
  } else if (like == -1) {
    Sauce.updateOne(
      { _id: paramId },
      {
        $inc: { dislikes: 1 },
        $push: { usersDisliked: bodyUserId },
        _id: paramId,
      }
    )
      .then(() =>
        res.status(200).json({ message: "Vous n'avez pas aimé cette sauce" })
      )
      .catch((error) => res.status(400).json({ error }));
    // Suppression du like ou du dislike de l'utilisateur
  } else {
    Sauce.findOne({ _id: paramId })
      .then((sauce) => {
        // recherche de l'id dans le like
        if (sauce.usersLiked.indexOf(bodyUserId) != -1) {
          // Si présent on supprime le like
          // $pull : Removes all array elements that match a specified query.
          Sauce.updateOne(
            { _id: paramId },
            {
              $inc: { likes: -1 },
              $pull: { usersLiked: bodyUserId },
              _id: paramId,
            }
          )
            .then(() =>
              res
                .status(200)
                .json({ message: "Vous n'avez pas aimé cette sauce" })
            )
            .catch((error) => res.status(400).json({ error }));
        }
        // recherche de l'id dans le dislike
        else if (sauce.usersDisliked.indexOf(bodyUserId) != -1) {
          // Si présent on supprime le dislike
          Sauce.updateOne(
            { _id: paramId },
            {
              $inc: { dislikes: -1 },
              $pull: { usersDisliked: bodyUserId },
              _id: paramId,
            }
          )
            .then(() =>
              res.status(200).json({ message: "Vous avez aimé cette sauce" })
            )
            .catch((error) => res.status(400).json({ error }));
        }
      })
      .catch((error) => res.status(400).json({ error }));
  }
};

// recupération de toutes les sauces
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) =>
      res.status(400).json({
        error,
      })
    );
};

// récupération d'une seule sauce en fonction de son ID
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) =>
      res.status(404).json({
        error,
      })
    );
};
