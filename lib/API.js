'use strict';
var crypto = require('crypto');
var request = require('request');
var qs = require('querystring');
var pkg = require('../package.json');
var session = require('./session');
var utils = require('./utils');

/**
 * Luno class
 * @date   2016-04-21
 * @param  {Object}   config Configuration properties to override defaults.
 *                           Key and secret are required, see https://luno.io/dashboard/account
 */
var Luno = module.exports = function(config) {
  var self = this;

  if (typeof config !== 'object' || !config) throw utils.invalidArgument('config', config, 'an object')
  if (typeof config.key !== 'string' || !config.key) throw utils.invalidArgument('config.key', config.key, 'a string');
  if (typeof config.secret !== 'string' || !config.secret) throw utils.invalidArgument('config.secret', config.secret, 'a string');

  self.config = {
    host: 'https://api.luno.io',
    version: 1,
    key: null,
    secret: null,
    timeout: 10000,
    sandbox: false
  };

  for (var i in config) self.config[i] = config[i];

  self.endpoint = '/v' + self.config.version;
};

/**
 * Make a signed request to Luno's API
 * @date   2016-04-21
 * @param  {String}       method HTTP method to use, e.g. GET or POST
 * @param  {String}       route  Endpoint to make the request to, e.g. /users
 * @param  {Object}       params Query-string parameters to send with the request
 * @param  {Object|Null}  body   Entity/POST body to send with the request
 * @param  {Function}     cb     Callback function
 */
Luno.prototype.request = function(method, route, params, body, cb) {
  var self = this;

  if (typeof cb !== 'function') throw utils.invalidArgument('callback', cb, 'a function');
  if (typeof method !== 'string') return cb(utils.invalidArgument('method', method, 'a string'));
  if (typeof route !== 'string') return cb(utils.invalidArgument('route', route, 'a string'));
  if (typeof params !== 'object' || !params) return cb(utils.invalidArgument('params', params, 'an object'));
  if (typeof body !== 'object') return cb(utils.invalidArgument('body', body, 'null or an object'));

  var validMethods = [ 'GET', 'POST', 'PUT', 'PATCH', 'DELETE' ];
  if (validMethods.indexOf(method) === -1) {
    return cb(utils.invalidArgument('method', method, 'in ' + validMethods.join(', ')));
  }

  var p = {};
  for (var i in params) {
    p[i] = params[i];
  }

  p.key = self.config.key;
  p.timestamp = new Date().toISOString();
  if (typeof p.sandbox === 'undefined' && self.config.sandbox) p.sandbox = true;

  if (route.indexOf(self.endpoint) !== 0) route = self.endpoint + route;

  var sign = method + ':' + route + '?' + qs.stringify(p);
  if (body) sign += ':' + JSON.stringify(body);
  p.sign = crypto.createHmac('sha512', self.config.secret).update(sign, 'utf8').digest('hex');

  request({
    url: self.config.host + route,
    method: method,
    qs: p,
    body: body ? body : undefined,
    json: true,
    timeout: self.config.timeout,
    headers: {
      'user-agent': 'luno_node/' + pkg.version
    }
  }, function(err, res, data) {
    if (err) return cb(err);

    if (!data) {
      return cb(utils.error({
        message: 'Empty response',
        code: 'empty_response',
        status: res.statusCode
      }));
    }

    // non-200 statuscode - error
    if (res.statusCode >= 300 || res.statusCode < 200) {
      // not entirely sure what the error is (shouldn't happen)
      if (!data.message) return cb(data);
      return cb(utils.error(data));
    }

    cb(err, data);
  });
};

Luno.prototype.get = function(route, params, cb) {
  this.request('GET', route, params, null, cb);
};

Luno.prototype.post = function(route, params, body, cb) {
  this.request('POST', route, params, body, cb);
};

Luno.prototype.put = function(route, params, body, cb) {
  this.request('PUT', route, params, body, cb);
};

Luno.prototype.patch = function(route, params, body, cb) {
  this.request('PATCH', route, params, body, cb);
};

Luno.prototype.delete = function(route, params, cb) {
  this.request('DELETE', route, params, null, cb);
};

/**
 * Middleware for accessing a session. See https://github.com/lunoio/luno-node#middleware
 * @date   2016-04-21
 * @param  {Object}   config Configuration to override defaults (see lib/session.js for defaults)
 * @return {Function}        Middleware (req, res, next) that checks for a valid session and will access it.
 *                           Sets req.session and req.user to the session and user if it's valid.
 */
Luno.prototype.session = function(config) {
  var self = this;
  return session(self, config);
};
