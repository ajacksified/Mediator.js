'use strict';
const Mediator = require('../mediator.min').Mediator;
const mocha = require('mocha');
const chai = require('chai').use(require('sinon-chai'));

// Reused variables
let sub;
const originalOptions = {};
const originalContext = {};
const originalFN = function () {};

mocha.describe('Mediator', function () {
  mocha.beforeEach(function () {
    sub = new Mediator.Subscriber(originalFN, originalOptions, originalContext);
  });

  mocha.describe('initializing', function () {
    mocha.it('should act like a constructor when called like a function', function () { chai.expect(Mediator()).not.to.be.undefined; });
  });

  mocha.describe('updating', function () {
    mocha.it('should update the fn', function () {
      const newFN = function (data) { data; };
      sub.update({ fn: newFN });
      chai.expect(sub.fn).to.equal(newFN);
    });

    mocha.it('should update the options (predicate)', function () {
      const newPredicate = (data) => { (data == true); };
      const newOptions = { predicate: newPredicate };
      sub.update({ options: newOptions });
      chai.expect(sub.options.predicate).to.equal(newPredicate);
    });

    mocha.it('should update the context', function () {
      const newContext = { derp: 'herp' };
      sub.update({ context: newContext });
      chai.expect(sub.context).to.equal(newContext);
    });
  });
});
