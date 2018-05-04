module.exports = process.env.MEDIATOR_JS_COV
  ? require('./mediator.min')
  : require('./lib/mediator')
