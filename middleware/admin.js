module.exports = (req, res, next) => {
  const admin = req.user.roles.find((r) => r === 'Admin');

  if (!admin) return res.status(403).send('User is not an admin.');

  next();
};
