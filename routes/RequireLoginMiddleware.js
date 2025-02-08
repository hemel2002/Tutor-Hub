const requireLogin = (req, res, next) => {
  if (!req.session.UserId) {
    req.session.returnTo = req.originalUrl;
    console.log(req.session.returnTo);
    console.log('Redirecting to signin');
    return res.redirect('/signin');
  }
  next();
};

module.exports = requireLogin;
