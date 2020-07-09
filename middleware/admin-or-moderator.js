module.exports = (req, res, next) => {
  const adminOrModerator = req.user.roles.find(
    (r) => r === 'Admin' || r === 'Moderator'
  );

  if (!adminOrModerator)
    return res.status(403).send('User is not an admin or moderator.');

  next();
};
