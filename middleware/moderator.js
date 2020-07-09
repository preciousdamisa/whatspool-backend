module.exports = (req, res, next) => {
  const moderator = req.user.roles.find((r) => r === 'Moderator');

  if (!moderator) return res.status(403).send('User is not a moderator.');

  next();
};
