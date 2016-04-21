var utils = {};

utils.error = function(err, Err) {
  Err = Err || Error;
  var e = new Err(err.message || err);
  e.from = 'Luno';
  for (var i in err) e[i] = err[i];
  return e;
};

utils.invalidArgument = function(name, value, mustBe) {
  var self = this;
  return utils.error({
    message: 'Invalid argument: ' + name + ' must be ' + mustBe,
    code: 'invalid_argument',
    argument: name,
    value: value
  }, TypeError);
};


module.exports = utils;
