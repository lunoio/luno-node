module.exports = function(luno, conf) {

  var config = {
    cookieName: 'session',
    cookieConfig: {
      maxAge: 1209600000,
      httpOnly: true
    }
  };

  for (var i in conf) config[i] = conf[i];

  return function(req, res, next) {
    var key = req.cookies[config.cookieName];
    if (!key) return next();

    luno.post('/sessions/access', { expand: 'user' }, {
      key: key,
      ip: req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      user_agent: req.headers['user-agent']
    }, function(err, session) {
      if (err) {
        if (err.code === 'session_not_found') res.clearCookie(config.cookieName, config.cookieConfig);
        return next();
      }

      res.cookie(config.cookieName, session.key, config.cookieConfig);

      req.session = session;
      req.user = session.user;
      next();
    });
  };
};
