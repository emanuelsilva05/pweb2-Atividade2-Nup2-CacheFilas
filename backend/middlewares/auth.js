const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.cookies['token']; // Procurando o token no cookie

  if (!token) {
    return res.status(401).send('É necessário estar autenticado para acessar esta rota');
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    console.log(error);
    res.status(400).send('Token inválido');
  }
};

module.exports = authMiddleware;
