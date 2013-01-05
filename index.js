module.exports = process.env.MEDIATOR_JS_COV
  ? require('./lib-cov/mediator')
  : require('./lib/mediator');
