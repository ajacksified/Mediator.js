const Mediator = require('../index').Mediator;
const mocha = require('mocha');
const chai = require('chai').use(require('sinon-chai'));

// Reused variables
let sub;
let originalOptions = {};
let originalContext = {};
let originalFN = () => {};

mocha.describe('Mediator', () => {
  mocha.beforeEach(() => {
    sub = new Mediator.Subscriber(originalFN, originalOptions, originalContext);
  });

  mocha.describe('initializing', () => {
    mocha.it('should act like a constructor when called like a function', () => chai.expect(Mediator.Subscriber('name')).not.to.be.undefined);
  });

  mocha.describe('updating', () => {
    mocha.it('should update the fn', () => {
      let newFN = data => data;
      sub.update({ fn: newFN });
      chai.expect(sub.fn).to.equal(newFN);
    });

    mocha.it('should update the options (predicate)', () => {
      let newPredicate = (data) => (data === true);
      let newOptions = { predicate: newPredicate };
      sub.update({ options: newOptions });
      chai.expect(sub.options.predicate).to.equal(newPredicate);
    });

    mocha.it('should update the context', () => {
      let newContext = { derp: 'herp' };
      sub.update({ context: newContext });
      chai.expect(sub.context).to.equal(newContext);
    });
  });
});
