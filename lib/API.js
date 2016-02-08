'use strict';
var crypto = require('crypto');
var request = require('request');
var qs = require('querystring');
var pkg = require('../package.json');

var Luno = module.exports = function(config) {
  var self = this;

  self.config = {
    host: 'https://api.luno.io',
    version: 1,
    key: null,
    secret: null,
    timeout: 10000
  };

  for (var i in config) self.config[i] = config[i];

  self.endpoint = '/v' + self.config.version;
};

Luno.prototype.request = function(method, route, params, body, cb) {
  var self = this;

  if (!cb) cb = function() {};

  var p = {};
  for (var i in params) {
    p[i] = params[i];
  }

  p.key = self.config.key;
  p.timestamp = new Date().toISOString();

  route = self.endpoint + route;

  var sign = method + ':' + route + '?' + qs.stringify(p);
  if (body) sign += ':' + JSON.stringify(body);
  p.sign = crypto.createHmac('sha512', self.config.secret).update(sign).digest('hex');

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
      var err = new Error('Empty response');
      err.code = 'empty_response';
      err.status = res.statusCode;
      return cb(err);
    }

    // non-200 statuscode - error
    if (res.statusCode >= 300 || res.statusCode < 200) {
      // not entirely sure what the error is (shouldn't happen)
      if (!data.message) return cb(data);

      var err = new Error(data.message);
      err.code = data.code;
      err.status = data.status;
      err.extra = data.extra;
      // console.error(err);
      return cb(err);
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
