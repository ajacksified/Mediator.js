var Mediator = require("../index").Mediator,
    sinon = require('sinon'),
    chai = require('chai'),
    expect = require('chai').expect,
    sinonChai = require("sinon-chai");

chai.use(sinonChai);
require('sinon-mocha').enhance(sinon);

describe("Channel", function() {
  var mediator, channel;

  beforeEach(function() {
    channel = new Mediator.Channel();
  });

  describe("Initialization", function(){
    it("should set its namespace property", function(){
      expect(channel.namespace).to.equal("");
    });

    it("should set its namespace property to a given namespace", function(){
      var namespacedChannel = new Mediator.Channel("test:coffee");
      expect(namespacedChannel.namespace).to.equal("test:coffee");
    });

    it("should act like a constructor when called like a function", function(){
      var fnChannel = Mediator.Channel("name");

      expect(fnChannel).not.to.be.undefined;
    });
  });

  describe("addSubscriber", function(){
    it("should add a subscriber to the collection", function(){
      var spy = sinon.spy();
      channel.addSubscriber(spy);

      expect(channel._subscribers.length).to.equal(1);
    });

    it("should give subscribers an id", function(){
      var spy = sinon.spy();
      channel.addSubscriber(spy);

      expect(channel._subscribers[0].id).to.not.be.undefined;
      expect(channel._subscribers[0].id).to.not.equal('');
    });

    it("should add a subscriber to the collection with context", function(){
      var spy = sinon.spy(),
          contextObj = { derp: "herp" };

      channel.addSubscriber(spy, {}, contextObj);
      expect(channel._subscribers[0].context).to.equal(contextObj);
    });

    it("should add a subscriber to the collection with options", function(){
      var spy = sinon.spy(),
          contextObj = {},
          optionsObj = { derp: "herp" };

      channel.addSubscriber(spy, optionsObj, contextObj);
      expect(channel._subscribers[0].options).to.equal(optionsObj);
    });

    it("should be able to set top priority", function(){
      var spy = sinon.spy(),
          spy2 = sinon.spy(),
          spy3 = sinon.spy();

      channel.addSubscriber(spy);
      channel.addSubscriber(spy2);
      channel.addSubscriber(spy3, { priority: 1 });

      expect(channel._subscribers[0].fn).to.equal(spy);
      expect(channel._subscribers[1].fn).to.equal(spy3);
      expect(channel._subscribers[2].fn).to.equal(spy2);
    });

    it("should be able to set arbitrary priority", function(){
      var spy = sinon.spy(),
          spy2 = sinon.spy(),
          spy3 = sinon.spy();

      channel.addSubscriber(spy);
      channel.addSubscriber(spy2);
      channel.addSubscriber(spy3, { priority: 1 });

      expect(channel._subscribers[0].fn).to.equal(spy);
      expect(channel._subscribers[1].fn).to.equal(spy3);
      expect(channel._subscribers[2].fn).to.equal(spy2);
    });

    it("should be able to change priority after adding it", function(){
      var spy = sinon.spy(),
          spy2 = sinon.spy(),
          spy3 = sinon.spy();

      var sub = channel.addSubscriber(spy, { num: 1 });
      channel.addSubscriber(spy2, { num: 2 });
      channel.addSubscriber(spy3, { num: 3 });

      channel.setPriority(sub.id, 2);

      expect(channel._subscribers[0].fn).to.equal(spy2);
      expect(channel._subscribers[1].fn).to.equal(spy3);
      expect(channel._subscribers[2].fn).to.equal(spy);

    });
  });

  describe("GetSubscriber", function(){
    it("should get a subscriber by its id", function(){
      var spy = sinon.spy();
      channel.addSubscriber(spy);

      expect(channel.getSubscriber(channel._subscribers[0].id)).to.not.be.undefined;
    });
  });

  describe("addChannel", function(){
    it("should add a channel to the collection", function(){
      var channelName = "test";
      channel.addChannel(channelName);

      expect(channel._channels[channelName]).to.not.be.undefined;
    });
  });

  describe("hasChannel", function(){
    it("should return true if the channel exists", function(){
      var channelName = "test";
      channel.addChannel(channelName);

      expect(channel.hasChannel(channelName)).to.equal(true);
    });

    it("should return true if the channel does not exist", function(){
      var channelName = "test",
          badChannelName = "herp";

      channel.addChannel(channelName);

      expect(channel.hasChannel(badChannelName)).to.equal(false);
    });
  });

  describe("ReturnChannel", function(){
    it("should return a reference to a channel by name", function(){
      var channelName = "test";

      channel.addChannel(channelName);

      expect(channel.returnChannel(channelName)).to.equal(channel._channels[channelName]);
    });
  });

  describe("removeSubscriber", function(){
    it("should remove subscribers if no fn is given", function(){
      var spy = sinon.spy();

      channel.addSubscriber(spy);
      expect(channel._subscribers.length).to.equal(1);

      channel.removeSubscriber();
      expect(channel._subscribers.length).to.equal(0);
    });

    it("should remove matching subscribers a valid fn is given", function(){
      var spy = sinon.spy(),
          spy2 = sinon.spy();

      channel.addSubscriber(spy);
      channel.addSubscriber(spy2);
      expect(channel._subscribers.length).to.equal(2);

      channel.removeSubscriber(spy);
      expect(channel._subscribers.length).to.equal(1);
      expect(channel._subscribers[0].fn).to.equal(spy2);
    });

    it("should remove matching subscribers a valid id is given", function(){
      var spy = sinon.spy(),
          spy2 = sinon.spy(),
          spy3 = sinon.spy();
      
      channel.addSubscriber(spy);
      var sub2 = channel.addSubscriber(spy2);
      expect(channel._subscribers.length).to.equal(2);
      channel.addSubscriber(spy3);
      expect(channel._subscribers.length).to.equal(3);
      
      channel.removeSubscriber(sub2.id);
      expect(channel._subscribers.length).to.equal(2);
      expect(channel._subscribers[0].fn).to.equal(spy);
      expect(channel._subscribers[1].fn).to.equal(spy3);
    });

    it("should do nothing if an invalid fn is given", function(){
      var spy = sinon.spy(),
          invalidFn = "derp";

      channel.addSubscriber(spy);
      channel.addSubscriber(function() {});
      expect(channel._subscribers.length).to.equal(2);

      channel.removeSubscriber(invalidFn);
      expect(channel._subscribers.length).to.equal(2);
    });

    it("should do nothing if a non-matching fn is given", function(){
      var spy = sinon.spy(),
          spy2 = sinon.spy();

      channel.addSubscriber(spy);
      expect(channel._subscribers.length).to.equal(1);

      channel.removeSubscriber(spy2);
      expect(channel._subscribers.length).to.equal(1);
    });
  });


  describe("publish", function(){
    it("should call all matching subscribers", function(){
      var spy = sinon.spy(),
          data = ["data"];

      channel.addSubscriber(spy);
      channel.publish(data);

      expect(spy).calledWith(data[0]);
    });

    it("should call all matching subscribers with predicates", function(){
      var spy = sinon.spy(),
          data = ["data"];

      channel.addSubscriber(spy, {}, { predicate: function(data){ return data.length == 4 } });
      channel.publish(data);

      expect(spy).calledWith(data[0]);
    });

    it("should call all matching subscribers with context", function(){
      var spy = sinon.spy(),
          data = ["data"];

      channel.addSubscriber(function() { this(); }, {}, spy );
      channel.publish(data);

      expect(spy).called;
    });

    it("should call all matching for parent channels", function(){
      var channelName = "test",
          spy = sinon.spy(),
          spy2 = sinon.spy(),
          data = ["data"];

      channel.addSubscriber(spy);
      channel.addChannel(channelName);
      channel._channels[channelName].addSubscriber(spy2);

      channel._channels[channelName].publish(data);

      expect(spy).calledWith(data[0]);
      expect(spy2).calledWith(data[0]);
    });
    
    it("should call all matching subscribers with context", function(){
      var spy = sinon.spy(),
          data = ["data"];

      channel.addSubscriber(function() { this(); }, {}, spy );
      channel.publish(data);

      expect(spy).called;
    });
    
    it("should call subscribers in predefined priority", function(){
      var sub1 = function(){
        this.a += "1";
      },
      sub2 = function(){
        this.a += "2";
      },
      sub3 = function(){
        this.a += "3";
      },
      data = ["data"];
      this.a = "0";

      channel.addSubscriber(sub3, {}, this);
      channel.addSubscriber(sub1, { priority: 2 }, this);
      channel.addSubscriber(sub2, { priority: 1 }, this);
      channel.publish(data);
      expect(this.a).to.equal("0123");
    });

  });
});
