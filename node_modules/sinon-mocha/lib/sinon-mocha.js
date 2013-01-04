

var SinonMocha,
    WrapMethod = require('./sinon/wrap-method'),
    Hooks = require('./mocha-hooks');

SinonMocha = {

  sinon: null,

  enhance: function(sinon, mocha){
    SinonMocha.sinon = sinon;
    Hooks.enhance(mocha);
    Hooks.beforeEach(SinonMocha.beforeEach);
    Hooks.afterEach(SinonMocha.afterEach);
  },

  beforeEach: function(){
    WrapMethod.enhance(SinonMocha.sinon);
  },

  afterEach: function(){
    WrapMethod.restoreWrappedMethods();
    SinonMocha.sinon.wrapMethod.restore();
  }

};

module.exports = exports = SinonMocha;
