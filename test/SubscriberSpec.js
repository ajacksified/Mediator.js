var Mediator = require("../index").Mediator,
    sinon = require('sinon'),
    chai = require('chai'),
    expect = require('chai').expect,
    sinonChai = require("sinon-chai");

chai.use(sinonChai);
require('sinon-mocha').enhance(sinon);

describe("Mediator", function() {
  var sub,
      originalOptions = {},
      originalContext = {},
      originalFN = function(){};

  beforeEach(function() {
    sub = new Mediator.Subscriber(originalFN, originalOptions, originalContext);
  });

  describe("initializing", function(){
    it("should act like a constructor when called like a function", function(){
      var fnSubscriber = Mediator.Subscriber("name");

      expect(fnSubscriber).not.to.be.undefined;
    });
  });

  describe("updating", function(){
    it("should update the fn", function(){
      var newFN = function(data){ return data; };

      sub.update({ fn: newFN });
      expect(sub.fn).to.equal(newFN);
    });

    it("should update the options (predicate)", function(){
      var newPredicate = function(data){ return data==true; },
          newOptions = { predicate: newPredicate };

      sub.update({ options: newOptions });
      expect(sub.options.predicate).to.equal(newPredicate);
    });

    it("should update the context", function(){
      var newContext = { derp: "herp" };

      sub.update({ context: newContext });
      expect(sub.context).to.equal(newContext);
    });
  });
});

