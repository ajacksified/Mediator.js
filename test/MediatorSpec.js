var Mediator = require("../mediator").Mediator,
    sinon = require('sinon'),
    chai = require('chai'),
    expect = require('chai').expect,
    sinonChai = require("sinon-chai");

chai.use(sinonChai);
require('sinon-mocha').enhance(sinon);

describe("Mediator", function() {
  var mediator;

  beforeEach(function() {
    mediator = new Mediator();
  });

  describe("publishing", function(){
    it("should call a callback for a given channel", function(){
      var spy = sinon.spy();

      mediator.subscribe("testX", spy);
      mediator.publish("testX");

      expect(spy).called;
    });

    it("should stop propagation if requested", function(){
      var spy = sinon.spy(),
          spy2 = sinon.spy(),
          callback = function(c){ c.stopPropagation(); spy(); },
          callback2 = function(){ spy2(); };

      mediator.subscribe("testX", callback);
      mediator.subscribe("testX", callback2);
      mediator.publish("testX");

      expect(spy).called;
      expect(spy2).not.called;
    });


    it("should call callbacks for all functions in a given channel", function(){
      var spy = sinon.spy(),
          spy2 = sinon.spy();

      mediator.subscribe("test", spy);
      mediator.subscribe("test", spy2);
      mediator.publish("test");

      expect(spy).called;
      expect(spy).called;
    });

    it("should pass arguments to the given function", function(){
      var spy = sinon.spy(),
          channel = "test",
          arg = "arg1",
          arg2 = "arg2";

      mediator.subscribe(channel, spy);
      mediator.publish(channel, arg, arg2);

      expect(spy).calledWith(arg, arg2, mediator.getChannel(channel));
    });

    it("should call all matching predicates", function(){
      var spy = sinon.spy(),
          spy2 = sinon.spy(),
          spy3 = sinon.spy();

      var predicate = function(data){
        return data.length === 4;
      }

      var predicate2 = function(data){
        return data[0] == "Y";
      }

      mediator.subscribe("test", spy, { predicate: predicate });
      mediator.subscribe("test", spy2, { predicate: predicate2 });
      mediator.subscribe("test", spy3);

      mediator.publish("test", "Test");

      expect(spy).called;
      expect(spy2).not.called;
      expect(spy3).called;
    });
  });

  describe("removing", function(){
    it("should remove callbacks for a given channel", function(){
      var spy = sinon.spy();

      mediator.subscribe("test", spy);
      mediator.remove("test");
      mediator.publish("test");

      expect(spy).not.called;
    });

    it("should remove callbacks for a given channel / named function pair", function(){
      var spy = sinon.spy(),
          spy2 = sinon.spy();

      mediator.subscribe("test", spy);
      mediator.subscribe("test", spy2);
      mediator.remove("test", spy);
      mediator.publish("test");

      expect(spy).not.called;
      expect(spy2).called;
    });
  });

  describe("updating", function(){
    it("should update callback by identifier", function(){
      var spy = sinon.spy(),
          newPredicate = function(data){ return data; };

      var sub = mediator.subscribe("test", spy),
          subId = sub.id;

      var subThatIReallyGotLater = mediator.getSubscriber(subId, "test");
      subThatIReallyGotLater.update({ options: { predicate: newPredicate } });
      expect(subThatIReallyGotLater.options.predicate).to.equal(newPredicate);
    });

    it("should update callback by fn", function(){
      var spy = sinon.spy(),
          newPredicate = function(data){ return data; };

      var sub = mediator.subscribe("test", spy);

      var subThatIReallyGotLater = mediator.getSubscriber(spy, "test");
      subThatIReallyGotLater.update({ options: { predicate: newPredicate } });
      expect(subThatIReallyGotLater.options.predicate).to.equal(newPredicate);
    });
  });

  describe("namespaces", function(){
    it("should call all functions within a given channel namespace", function(){
      var spy = sinon.spy();
      var spy2 = sinon.spy();

      mediator.subscribe("test:channel", spy);
      mediator.subscribe("test", spy2);

      mediator.publish("test:channel");

      expect(spy).called;
      expect(spy2).called;
    });

    it("should call only functions within a given channel namespace", function(){
      var spy = sinon.spy();
      var spy2 = sinon.spy();

      mediator.subscribe("test", spy);
      mediator.subscribe("derp", spy2);

      mediator.publish("test");

      expect(spy).called;
      expect(spy2).not.called;
    });

    it("should remove functions within a given channel namespace", function(){
      var spy = sinon.spy(),
          spy2 = sinon.spy();

      mediator.subscribe("test:test1", spy);
      mediator.subscribe("test", spy2);

      mediator.remove("test:test1");

      mediator.publish("test:test1");

      expect(spy).not.called;
      expect(spy2).called;
    });

    it("should publish to specific namespaces", function(){
      var spy = sinon.spy(),
          spy2 = sinon.spy();

      mediator.subscribe("test:test1:test2", spy);
      mediator.subscribe("test", spy2);

      mediator.publish("test:test1", "data");

      expect(spy).not.called;
      expect(spy2).called;
    });
  });
});
