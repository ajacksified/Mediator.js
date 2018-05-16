'use strict';
const Mediator = require('../mediator.min').Mediator;
const mocha = require('mocha');
const sinon = require('sinon');
const chai = require('chai').use(require('sinon-chai'));

// Reused letiables
let channel;
let spy;

mocha.describe('Channel', function () {
  mocha.beforeEach(function () {
    channel = new Mediator.Channel();
    spy = sinon.spy();
  });

  mocha.describe('Initialization', function () {
    mocha.it('should set its namespace property', function () { chai.expect(channel.namespace).to.equal(''); });
    mocha.it('should set its namespace property to a given namespace', function () {
      const namespacedChannel = new Mediator.Channel('test:coffee');
      chai.expect(namespacedChannel.namespace).to.equal('test:coffee');
    });
    mocha.it('should act like a constructor when called like a function', function () { chai.expect(Mediator.Channel('name')).not.to.be.undefined; });
  });

  mocha.describe('addSubscriber', function () {
    mocha.it('should add a subscriber to the collection', function () {
      channel.addSubscriber(spy);
      chai.expect(channel._subscribers.length).to.equal(1);
    });

    mocha.it('should give subscribers an id', function () {
      channel.addSubscriber(spy);
      chai.expect(channel._subscribers[0].id).to.not.be.undefined;
      chai.expect(channel._subscribers[0].id).to.not.equal('');
    });

    mocha.it('should add a subscriber to the collection with context', function () {
      const contextObj = { derp: 'herp' };
      channel.addSubscriber(spy, {}, contextObj);
      chai.expect(channel._subscribers[0].context).to.equal(contextObj);
    });

    mocha.it('should add a subscriber to the collection with options', function () {
      const contextObj = {};
      const optionsObj = { derp: 'herp' };
      channel.addSubscriber(spy, optionsObj, contextObj);
      chai.expect(channel._subscribers[0].options).to.equal(optionsObj);
    });

    mocha.it('should be able to set top priority', function () {
      const spy2 = sinon.spy();
      const spy3 = sinon.spy();
      const idA = channel.addSubscriber(spy, { priority: 1 }).id;
      const idB = channel.addSubscriber(spy2).id;
      const idC = channel.addSubscriber(spy3, { priority: 3 }).id;
      chai.expect(channel._subscribers[0].id).to.equal(idC);
      chai.expect(channel._subscribers[1].id).to.equal(idA);
      chai.expect(channel._subscribers[2].id).to.equal(idB);
    });

    mocha.it('should be able to set arbitrary priority', function () {
      const spy2 = sinon.spy();
      const spy3 = sinon.spy();
      channel.addSubscriber(spy);
      channel.addSubscriber(spy2);
      channel.addSubscriber(spy3, { priority: 1 });
      chai.expect(channel._subscribers[0].fn).to.equal(spy3);
      chai.expect(channel._subscribers[1].fn).to.equal(spy);
      chai.expect(channel._subscribers[2].fn).to.equal(spy2);
    });

    mocha.it('should be able to change priority after adding it', function () {
      const spy2 = sinon.spy();
      const spy3 = sinon.spy();
      const idA = channel.addSubscriber(spy, { num: 1 }).id;
      const idB = channel.addSubscriber(spy2, { num: 2 }).id;
      const idC = channel.addSubscriber(spy3, { num: 3 }).id;
      channel.setPriority(idA, 2);
      chai.expect(channel._subscribers[0].id).to.equal(idA);
      chai.expect(channel._subscribers[1].id).to.equal(idB);
      chai.expect(channel._subscribers[2].id).to.equal(idC);
    });
    mocha.it('should keep the priorities as initially set (issue #15)', function () {
      const idA = channel.addSubscriber(spy, {priority: 9}).id;
      const idB = channel.addSubscriber(spy, {priority: 1}).id;
      chai.expect(channel._subscribers[0].id).to.equal(idA);
      chai.expect(channel._subscribers[1].id).to.equal(idB);
    });
  });

  mocha.describe('GetSubscriber', function () {
    mocha.it('should get a subscriber by its id', function () {
      channel.addSubscriber(spy);
      chai.expect(channel.getSubscriber(channel._subscribers[0].id)).to.not.be.undefined;
    });
  });

  mocha.describe('addChannel', function () {
    mocha.it('should add a channel to the collection', function () {
      const channelName = 'test';
      channel.addChannel(channelName);
      chai.expect(channel._channels[channelName]).to.not.be.undefined;
    });
  });

  mocha.describe('hasChannel', function () {
    mocha.it('should return true if the channel exists', function () {
      const channelName = 'test';
      channel.addChannel(channelName);
      chai.expect(channel.hasChannel(channelName)).to.equal(true);
    });

    mocha.it('should return true if the channel does not exist', function () {
      const channelName = 'test';
      const badChannelName = 'herp';
      channel.addChannel(channelName);
      chai.expect(channel.hasChannel(badChannelName)).to.equal(false);
    });
  });

  mocha.describe('ReturnChannel', function () {
    mocha.it('should return a reference to a channel by name', function () {
      const channelName = 'test';
      channel.addChannel(channelName);
      chai.expect(channel.returnChannel(channelName)).to.equal(channel._channels[channelName]);
    });
  });

  mocha.describe('removeSubscriber', function () {
    mocha.it('should remove subscribers if no fn is given', function () {
      channel.addSubscriber(spy);
      chai.expect(channel._subscribers.length).to.equal(1);
      channel.removeSubscriber();
      chai.expect(channel._subscribers.length).to.equal(0);
    });

    mocha.it('should remove matching subscribers a valid fn is given', function () {
      const spy2 = sinon.spy();
      channel.addSubscriber(spy);
      channel.addSubscriber(spy2);
      chai.expect(channel._subscribers.length).to.equal(2);
      channel.removeSubscriber(spy);
      chai.expect(channel._subscribers.length).to.equal(1);
      chai.expect(channel._subscribers[0].fn).to.equal(spy2);
    });

    mocha.it('should remove matching subscribers a valid id is given', function () {
      const spy2 = sinon.spy();
      const spy3 = sinon.spy();
      channel.addSubscriber(spy);
      const sub2 = channel.addSubscriber(spy2);
      chai.expect(channel._subscribers.length).to.equal(2);
      channel.addSubscriber(spy3);
      chai.expect(channel._subscribers.length).to.equal(3);
      channel.removeSubscriber(sub2.id);
      chai.expect(channel._subscribers.length).to.equal(2);
      chai.expect(channel._subscribers[0].fn).to.equal(spy);
      chai.expect(channel._subscribers[1].fn).to.equal(spy3);
    });

    mocha.it('should do nothing if an invalid fn is given', function () {
      const invalidFn = 'derp';
      channel.addSubscriber(spy);
      channel.addSubscriber(function () {});
      chai.expect(channel._subscribers.length).to.equal(2);
      channel.removeSubscriber(invalidFn);
      chai.expect(channel._subscribers.length).to.equal(2);
    });

    mocha.it('should do nothing if a non-matching fn is given', function () {
      const spy2 = sinon.spy();
      channel.addSubscriber(spy);
      chai.expect(channel._subscribers.length).to.equal(1);
      channel.removeSubscriber(spy2);
      chai.expect(channel._subscribers.length).to.equal(1);
    });

    mocha.describe('autoCleanChannel', function () {
      mocha.it('should automatically clean channels when the parameter is not specified', function () {
        channel.addChannel('sub1');
        const subChannel = channel.returnChannel('sub1');
        const subscriber = subChannel.addSubscriber(spy);
        subChannel.removeSubscriber(subscriber.id);
        chai.expect(channel._channels.sub1).to.be.undefined;
      });
      mocha.it('should NOT automatically clean channels when the parameter is false', function () {
        channel.addChannel('sub1');
        const subChannel = channel.returnChannel('sub1');
        const subscriber = subChannel.addSubscriber(spy);
        subChannel.removeSubscriber(subscriber.id, false);
        chai.expect(channel._channels.sub1).to.not.be.undefined;
      });
      mocha.it('should automatically clean channels when the parameter is true', function () {
        channel.addChannel('sub1');
        const subChannel = channel.returnChannel('sub1');
        const subscriber = subChannel.addSubscriber(spy);
        subChannel.removeSubscriber(subscriber.id, true);
        chai.expect(channel._channels.sub1).to.be.undefined;
      });
      mocha.it('should automatically clean channels and empty parent channels', function () {
        channel.addChannel('sub1');
        const subChannel = channel.returnChannel('sub1');
        subChannel.addChannel('sub2');
        const subChannel2 = subChannel.returnChannel('sub2');
        const subscriber = subChannel2.addSubscriber(spy);
        subChannel2.removeSubscriber(subscriber.id, true);
        chai.expect(subChannel._channels.sub2).to.be.undefined;
        chai.expect(channel._channels.sub1).to.be.undefined;
      });
      mocha.it('should NOT automatically clean channels when there are still other subscribers', function () {
        const spy2 = sinon.spy();
        channel.addChannel('sub1');
        const subChannel = channel.returnChannel('sub1');
        const subscriber = subChannel.addSubscriber(spy);
        subChannel.addSubscriber(spy2);
        subChannel.removeSubscriber(subscriber.id, true);
        chai.expect(channel._channels.sub1).to.not.be.undefined;
      });
      mocha.it('should NOT automatically clean channels when the channel has sub-channels', function () {
        channel.addChannel('sub1');
        const subChannel = channel.returnChannel('sub1');
        const subscriber = subChannel.addSubscriber(spy);
        subChannel.addChannel('sub2');
        subChannel.removeSubscriber(subscriber.id, true);
        chai.expect(channel._channels.sub1).to.not.be.undefined;
        chai.expect(subChannel._channels.sub2).to.not.be.undefined;
      });
    });
  });

  mocha.describe('publish', function () {
    mocha.it('should call all matching subscribers', function () {
      const data = ['data'];
      channel.addSubscriber(spy);
      channel.publish(data);
      chai.expect(spy).calledWith(data[0]);
    });

    mocha.it('should call all matching subscribers with predicates', function () {
      const data = ['data'];
      channel.addSubscriber(spy, {}, { predicate: (data) => { data.length == 4; } });
      channel.publish(data);
      chai.expect(spy).calledWith(data[0]);
    });

    mocha.it('should call all matching subscribers with context', function () {
      const data = ['data'];
      // Revisit later with ES2015+
      channel.addSubscriber(function () { this(); }, {}, spy);
      channel.publish(data);
      chai.expect(spy).called;
    });

    mocha.it('should call all matching for parent channels', function () {
      const channelName = 'test';
      const spy2 = sinon.spy();
      const data = ['data'];
      channel.addSubscriber(spy);
      channel.addChannel(channelName);
      channel._channels[channelName].addSubscriber(spy2);
      channel._channels[channelName].publish(data);
      chai.expect(spy).calledWith(data[0]);
      chai.expect(spy2).calledWith(data[0]);
    });

    mocha.it('should call all matching subscribers with context', function () {
      const data = ['data'];
      // Revisit later with ES2015+
      channel.addSubscriber(function () { this(); }, {}, spy);
      channel.publish(data);
      chai.expect(spy).called;
    });

    mocha.it('should call subscribers in predefined priority', function () {
      let a;
      const sub1 = function () {
        a += '1';
      };
      const sub2 = function () {
        a += '2';
      };
      const sub3 = function () {
        a += '3';
      };
      const data = ['data'];
      a = '0';
      channel.addSubscriber(sub3, {}, this);
      channel.addSubscriber(sub1, { priority: 2 }, this);
      channel.addSubscriber(sub2, { priority: 1 }, this);
      channel.publish(data);
      chai.expect(a).to.equal('0123');
    });
  });
});
