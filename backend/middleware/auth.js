const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Récupération du token
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); // Décodage du token
    const userId = decodedToken.userId; // Récupération du userID
    if (req.body.userId && req.body.userId !== userId) { // Vérif si userID correspond au token
      throw 'l\'utilisateur n\'est pas valable';
    } else {
      next(); 
    }
  } catch {
    res.status(401).json({
      error: new Error('La requête n\'est pas valide!')
    });
  }
};