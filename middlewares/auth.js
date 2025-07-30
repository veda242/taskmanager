const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization');

  if (!authHeader) return res.status(401).json({ msg: 'No token, authorization denied' });

  const token = authHeader.replace('Bearer ', '');

  try {
    // Verify token and attach user info to request
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next(); // IMPORTANT: call next() to continue
  } catch (err) {
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};
