var Mediator = require("../index").Mediator,
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

  describe("initializing", function(){
    it("should act like a constructor when called like a function", function(){
      var fnMediator = Mediator();
      expect(fnMediator).not.to.be.undefined;
    });

    it("should start with a channel", function(){
      expect(mediator.getChannel('')).not.to.be.undefined;
    });
  });

  describe("subscribing", function(){
    it("should subscribe to a given channel", function(){
      var spy = sinon.spy();
      mediator.subscribe("test", spy);
      expect(mediator.getChannel("test")._subscribers.length).to.equal(1);
    });

    it("should bind 'once'", function(){
      var spy = sinon.spy();
      mediator.once("test", spy);
      mediator.publish("test");
      mediator.publish("test");

      expect(spy).calledOnce;
    });

    it("should bind with arbitrary number of calls", function(){
      var spy = sinon.spy(), i;
      mediator.subscribe("test", spy, { calls: 3 });

      for(i = 0; i < 5; i++){
        mediator.publish("test");
      }

      expect(spy).calledThrice;
    });

    it("should remove a subscriber in a list of others that's been called its maximum amount of times", function(){
      var spy = sinon.spy(), i;

      mediator.subscribe("test", function(){});
      mediator.subscribe("test", spy, { calls: 3 });
      mediator.subscribe("test", function(){});

      for(i = 0; i < 5; i++){
        mediator.publish("test");
      }

      expect(spy).calledThrice;
    });
  });

  describe("publishing", function(){
    it("should call a subscriber for a given channel", function(){
      var spy = sinon.spy();

      mediator.subscribe("testX", spy);
      mediator.publish("testX");

      expect(spy).called;
    });

    it("should stop propagation if requested", function(){
      var spy = sinon.spy(),
          spy2 = sinon.spy(),
          subscriber = function(c){ c.stopPropagation(); spy(); },
          subscriber2 = function(){ spy2(); };

      mediator.subscribe("testX", subscriber);
      mediator.subscribe("testX", subscriber2);
      mediator.publish("testX");

      expect(spy).called;
      expect(spy2).not.called;
    });


    it("should call subscribers for all functions in a given channel", function(){
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
    it("should remove subscribers for a given channel", function(){
      var spy = sinon.spy();

      mediator.subscribe("test", spy);
      mediator.remove("test");
      mediator.publish("test");

      expect(spy).not.called;
    });

    it("should remove subscribers for a given channel / named function pair", function(){
      var spy = sinon.spy(),
          spy2 = sinon.spy();

      mediator.subscribe("test", spy);
      mediator.subscribe("test", spy2);
      mediator.remove("test", spy);
      mediator.publish("test");

      expect(spy).not.called;
      expect(spy2).called;
    });    

    it("should remove subscribers by calling from subscriber's callback", function(){
      var spy = sinon.spy(),
          spy2 = sinon.spy(),
          catched = false;
      mediator.subscribe("test", function(){
        mediator.remove("test");
      });
      mediator.subscribe("test", spy);
      mediator.subscribe("test", spy2);
      try{
        mediator.publish("test");
      }
      catch (e){
        catched = true;
      }
      expect(catched).to.be.false;
      expect(spy).not.called;
      expect(spy2).not.called;
    });

    it("should remove subscriber by calling from its callback", function(){
      var remover = function(){
          mediator.remove("test", sub.id);
        };
      var spy = sinon.spy(),
          spy2 = sinon.spy(),
          catched = false,
          self = this;
      var sub = mediator.subscribe("test", remover);
      mediator.subscribe("test", spy);
      mediator.subscribe("test", spy2);
      try{
        mediator.publish("test");
      }
      catch (e){
        catched = true;
      }
      expect(catched).to.be.false;
      expect(spy).to.called;
      expect(spy2).to.called;
      var remover = sinon.spy(remover);
      mediator.publish("test");
      expect(remover).not.to.called;
      expect(spy).to.called;
      expect(spy2).to.called;  
    });
  });

  describe("updating", function(){
    it("should update subscriber by identifier", function(){
      var spy = sinon.spy(),
          newPredicate = function(data){ return data; };

      var sub = mediator.subscribe("test", spy),
          subId = sub.id;

      var subThatIReallyGotLater = mediator.getSubscriber(subId, "test");
      subThatIReallyGotLater.update({ options: { predicate: newPredicate } });
      expect(subThatIReallyGotLater.options.predicate).to.equal(newPredicate);
    });

    it("should update subscriber priority by identifier", function(){
      var spy = sinon.spy(),
          spy2 = sinon.spy(),
          sub = mediator.subscribe("test", spy),
          sub2 = mediator.subscribe("test", spy2);

      sub2.update({ options: { priority: 0 } });

      expect(mediator.getChannel("test")._subscribers[0].id).to.equal(sub2.id);
      expect(mediator.getChannel("test")._subscribers[1].id).to.equal(sub.id);
    });

    it("should update subscriber by fn", function(){
      var spy = sinon.spy(),
          newPredicate = function(data){ return data; };

      var sub = mediator.subscribe("test", spy);

      var subThatIReallyGotLater = mediator.getSubscriber(spy, "test");
      subThatIReallyGotLater.update({ options: { predicate: newPredicate } });
      expect(subThatIReallyGotLater.options.predicate).to.equal(newPredicate);
    });
  });

  describe("namespaces", function(){
    it("should make subchannels", function(){
      var spy = sinon.spy();
      mediator.subscribe("test:subchannel", spy);
      expect(mediator.getChannel("test")._channels["subchannel"]._subscribers.length).to.equal(1);
    });

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

  describe("aliases", function(){
    it("should alias 'on' and 'bind'", function(){
      var spy = sinon.spy();

      mediator.on("test", spy);
      mediator.bind("test", spy);
      mediator.publish("test");

      expect(spy).calledTwice;
    });

    it("should alias 'emit' and 'trigger'", function(){
      var spy = sinon.spy();

      mediator.subscribe("test", spy);

      mediator.emit("test");
      mediator.trigger("test");

      expect(spy).calledTwice;
    });

    it("should alias 'off' for subscriptions", function(){
      var spy = sinon.spy(),
          sub;

      sub = mediator.subscribe("test", spy);
      mediator.off("test", sub.id);

      mediator.publish("test");
      expect(spy).not.called;
    });

    it("should alias 'off' for channels", function(){
      var spy = sinon.spy(),
          sub;

      sub = mediator.subscribe("test", spy);
      mediator.off("test");

      mediator.publish("test");
      expect(spy).not.called;
    });
  });
});
