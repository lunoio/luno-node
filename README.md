# luno-node

Use the Luno API in Node.js

This module is a very thin wrapper on the Luno API, handling authentication, request signing and errors.

## Install

```sh
npm install --save luno
```

## Usage

For documentation on all methods and routes, please see our [docs](https://luno.io/docs).

```js
var Luno = require('luno');
var luno = new Luno({
  key: 'YOUR-API-KEY', // Your Luno API key
  secret: 'YOUR-SECRET-KEY', // Your Luno secret key
  timeout: 10000 // Maximum request timeout (in milliseconds). Default 10000.
});

luno.get('/users/usr_cz2D0VOugcBVWW', {}, function(err, user) {

});
```

### Methods

GET, POST, PUT, PATCH, DELETE and request.

```js
// GET
// luno.get(route, query, callback);
luno.get('/users', {
  limit: 10
}, function(err, resp) { });

// POST
// luno.post(route, query, body, callback);
luno.post('/users/usr_cz2D0VOugcBVWW/sessions', {}, {
  ip: req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
  user_agent: req.headers['user-agent'],
  details: {
    custom: 'session',
    properties: 'here'
  }
}, function(err, session) { });

// PUT
// luno.put(route, query, body, callback);
luno.put('/users/usr_cz2D0VOugcBVWW', {}, {
  name: 'Simon Tabor',
  profile: {
    properties: 'are',
    overwritten: true
  }
}, function(err, resp) { });

// PATCH
// luno.patch(route, query, body, callback);
luno.patch('/users/usr_cz2D0VOugcBVWW', {}, {
  name: 'Simon Tabor',
  profile: {
    properties: 'are',
    extended: true,
    old: 'properties',
    are: 'kept'
  }
}, function(err, resp) { });

// DELETE
// luno.delete(route, query, callback);
luno.delete('/users/usr_cz2D0VOugcBVWW', {}, function(err, resp) { });


// REQUEST (any method)
// luno.request(METHOD, route, query, body, callback);
luno.request('POST', '/users', {}, {
  email: 'simon@luno.io',
  password: 'my-password'
}, function(err, user) { });
```

### Middleware

Use the session middleware to quickly ensure a session is valid and fetch the details.

It'll set `req.session` to the session details (if the session is valid) and `req.user` to the user details (if the session is valid and there is an associated user).

```js
// app is an express server

app.use(luno.session({
  cookieName: 'session', // default config
  cookieConfig: {
    maxAge: 1209600000, // 14 days
    httpOnly: true,
    // secure: true
  }
}));

// admin section of the app requires the session to be valid
// and to have an associated user
app.use('/admin', function(req, res, next) {
  if (!req.user) return res.redirect('/login');
  next();
});

app.get('/', function(req, res, next) {
  // req.session and req.user might be falsy

  if (req.user) {
    res.send('Welcome ' + req.user.first_name);
  } else {
    res.send('Welcome');
  }
});

app.get('/admin', function(req, res, next) {
  // req.session and req.user must be set

  res.send('Hello ' + req.user.first_name);
});
```

### Registration

Let a user sign up and log them in.

*Note:* you may want to look at [Luno CSRF](https://github.com/lunoio/luno-csrf-node) to add CSRF protection using Luno.

```js
app.get('/signup', function(req, res) {
  // Send a barebones signup form
  res.send('<form method="POST" action="/signup"><input type="email" name="email"><input type="password" name="password"><input type="submit"></form>');
});

app.post('/signup', function(req, res, next) {
  luno.post('/users', {}, {
    email: req.body.email,
    password: req.body.password,
    profile: {
      test: true
    }
  }, function(err, user) {
    if (err) return next(err);

    // automatically log this user in
    luno.post('/users/' + user.id + '/sessions', {}, {
      ip: req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      user_agent: req.headers['user-agent']
    }, function(err, session) {
      if (err) return next(err);

      res.cookie('session', session.key, {
        maxAge: 1209600000, // 14 days
        httpOnly: true,
        secure: true
      });

      // redirect to the login-protected application
      res.redirect('/dashboard');
    });
  });
});
```
