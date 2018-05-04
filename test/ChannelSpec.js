const Mediator = require('../index').Mediator;
const mocha = require('mocha');
const sinon = require('sinon');
const chai = require('chai').use(require('sinon-chai'));

// Reused letiables
let channel;
let spy;

mocha.describe('Channel', () => {
  mocha.beforeEach(() => {
    channel = new Mediator.Channel();
    spy = sinon.spy();
  });

  mocha.describe('Initialization', () => {
    mocha.it('should set its namespace property', () => chai.expect(channel.namespace).to.equal(''));
    mocha.it('should set its namespace property to a given namespace', () => {
      let namespacedChannel = new Mediator.Channel('test:coffee');
      chai.expect(namespacedChannel.namespace).to.equal('test:coffee');
    });
    mocha.it('should act like a constructor when called like a function', () => chai.expect(Mediator.Channel('name')).not.to.be.undefined);
  });

  mocha.describe('addSubscriber', () => {
    mocha.it('should add a subscriber to the collection', () => {
      channel.addSubscriber(spy);
      chai.expect(channel._subscribers.length).to.equal(1);
    });

    mocha.it('should give subscribers an id', () => {
      channel.addSubscriber(spy);
      chai.expect(channel._subscribers[0].id).to.not.be.undefined;
      chai.expect(channel._subscribers[0].id).to.not.equal('');
    });

    mocha.it('should add a subscriber to the collection with context', () => {
      let contextObj = { derp: 'herp' };
      channel.addSubscriber(spy, {}, contextObj);
      chai.expect(channel._subscribers[0].context).to.equal(contextObj);
    });

    mocha.it('should add a subscriber to the collection with options', () => {
      let contextObj = {};
      let optionsObj = { derp: 'herp' };
      channel.addSubscriber(spy, optionsObj, contextObj);
      chai.expect(channel._subscribers[0].options).to.equal(optionsObj);
    });

    mocha.it('should be able to set top priority', () => {
      let spy2 = sinon.spy();
      let spy3 = sinon.spy();
      let idA = channel.addSubscriber(spy, { priority: 1 }).id;
      let idB = channel.addSubscriber(spy2).id;
      let idC = channel.addSubscriber(spy3, { priority: 3 }).id;
      chai.expect(channel._subscribers[0].id).to.equal(idC);
      chai.expect(channel._subscribers[1].id).to.equal(idA);
      chai.expect(channel._subscribers[2].id).to.equal(idB);
    });

    mocha.it('should be able to set arbitrary priority', () => {
      let spy2 = sinon.spy();
      let spy3 = sinon.spy();
      channel.addSubscriber(spy);
      channel.addSubscriber(spy2);
      channel.addSubscriber(spy3, { priority: 1 });
      chai.expect(channel._subscribers[0].fn).to.equal(spy3);
      chai.expect(channel._subscribers[1].fn).to.equal(spy);
      chai.expect(channel._subscribers[2].fn).to.equal(spy2);
    });

    mocha.it('should be able to change priority after adding it', () => {
      let spy2 = sinon.spy();
      let spy3 = sinon.spy();
      let idA = channel.addSubscriber(spy, { num: 1 }).id;
      let idB = channel.addSubscriber(spy2, { num: 2 }).id;
      let idC = channel.addSubscriber(spy3, { num: 3 }).id;
      channel.setPriority(idA, 2);
      chai.expect(channel._subscribers[0].id).to.equal(idA);
      chai.expect(channel._subscribers[1].id).to.equal(idB);
      chai.expect(channel._subscribers[2].id).to.equal(idC);
    });
    mocha.it('should keep the priorities as initially set (issue #15)', () => {
      let idA = channel.addSubscriber(spy, {priority: 9}).id;
      let idB = channel.addSubscriber(spy, {priority: 1}).id;
      chai.expect(channel._subscribers[0].id).to.equal(idA);
      chai.expect(channel._subscribers[1].id).to.equal(idB);
    });
  });

  mocha.describe('GetSubscriber', () => {
    mocha.it('should get a subscriber by its id', () => {
      channel.addSubscriber(spy);
      chai.expect(channel.getSubscriber(channel._subscribers[0].id)).to.not.be.undefined;
    });
  });

  mocha.describe('addChannel', () => {
    mocha.it('should add a channel to the collection', () => {
      let channelName = 'test';
      channel.addChannel(channelName);
      chai.expect(channel._channels[channelName]).to.not.be.undefined;
    });
  });

  mocha.describe('hasChannel', () => {
    mocha.it('should return true if the channel exists', () => {
      let channelName = 'test';
      channel.addChannel(channelName);
      chai.expect(channel.hasChannel(channelName)).to.equal(true);
    });

    mocha.it('should return true if the channel does not exist', () => {
      let channelName = 'test';
      let badChannelName = 'herp';
      channel.addChannel(channelName);
      chai.expect(channel.hasChannel(badChannelName)).to.equal(false);
    });
  });

  mocha.describe('ReturnChannel', () => {
    mocha.it('should return a reference to a channel by name', () => {
      let channelName = 'test';
      channel.addChannel(channelName);
      chai.expect(channel.returnChannel(channelName)).to.equal(channel._channels[channelName]);
    });
  });

  mocha.describe('removeSubscriber', () => {
    mocha.it('should remove subscribers if no fn is given', () => {
      channel.addSubscriber(spy);
      chai.expect(channel._subscribers.length).to.equal(1);
      channel.removeSubscriber();
      chai.expect(channel._subscribers.length).to.equal(0);
    });

    mocha.it('should remove matching subscribers a valid fn is given', () => {
      let spy2 = sinon.spy();
      channel.addSubscriber(spy);
      channel.addSubscriber(spy2);
      chai.expect(channel._subscribers.length).to.equal(2);
      channel.removeSubscriber(spy);
      chai.expect(channel._subscribers.length).to.equal(1);
      chai.expect(channel._subscribers[0].fn).to.equal(spy2);
    });

    mocha.it('should remove matching subscribers a valid id is given', () => {
      let spy2 = sinon.spy();
      let spy3 = sinon.spy();
      channel.addSubscriber(spy);
      let sub2 = channel.addSubscriber(spy2);
      chai.expect(channel._subscribers.length).to.equal(2);
      channel.addSubscriber(spy3);
      chai.expect(channel._subscribers.length).to.equal(3);
      channel.removeSubscriber(sub2.id);
      chai.expect(channel._subscribers.length).to.equal(2);
      chai.expect(channel._subscribers[0].fn).to.equal(spy);
      chai.expect(channel._subscribers[1].fn).to.equal(spy3);
    });

    mocha.it('should do nothing if an invalid fn is given', () => {
      let invalidFn = 'derp';
      channel.addSubscriber(spy);
      channel.addSubscriber(() => {});
      chai.expect(channel._subscribers.length).to.equal(2);
      channel.removeSubscriber(invalidFn);
      chai.expect(channel._subscribers.length).to.equal(2);
    });

    mocha.it('should do nothing if a non-matching fn is given', () => {
      let spy2 = sinon.spy();
      channel.addSubscriber(spy);
      chai.expect(channel._subscribers.length).to.equal(1);
      channel.removeSubscriber(spy2);
      chai.expect(channel._subscribers.length).to.equal(1);
    });

    mocha.describe('autoCleanChannel', () => {
      mocha.it('should automatically clean channels when the parameter is not specified', () => {
        channel.addChannel('sub1');
        let subChannel = channel.returnChannel('sub1');
        let subscriber = subChannel.addSubscriber(spy);
        subChannel.removeSubscriber(subscriber.id);
        chai.expect(channel._channels['sub1']).to.be.undefined;
      });
      mocha.it('should NOT automatically clean channels when the parameter is false', () => {
        channel.addChannel('sub1');
        let subChannel = channel.returnChannel('sub1');
        let subscriber = subChannel.addSubscriber(spy);
        subChannel.removeSubscriber(subscriber.id, false);
        chai.expect(channel._channels['sub1']).to.not.be.undefined;
      });
      mocha.it('should automatically clean channels when the parameter is true', () => {
        channel.addChannel('sub1');
        let subChannel = channel.returnChannel('sub1');
        let subscriber = subChannel.addSubscriber(spy);
        subChannel.removeSubscriber(subscriber.id, true);
        chai.expect(channel._channels['sub1']).to.be.undefined;
      });
      mocha.it('should automatically clean channels and empty parent channels', () => {
        channel.addChannel('sub1');
        let subChannel = channel.returnChannel('sub1');
        subChannel.addChannel('sub2');
        let subChannel2 = subChannel.returnChannel('sub2');
        let subscriber = subChannel2.addSubscriber(spy);
        subChannel2.removeSubscriber(subscriber.id, true);
        chai.expect(subChannel._channels['sub2']).to.be.undefined;
        chai.expect(channel._channels['sub1']).to.be.undefined;
      });
      mocha.it('should NOT automatically clean channels when there are still other subscribers', () => {
        let spy2 = sinon.spy();
        channel.addChannel('sub1');
        let subChannel = channel.returnChannel('sub1');
        let subscriber = subChannel.addSubscriber(spy);
        subChannel.addSubscriber(spy2);
        subChannel.removeSubscriber(subscriber.id, true);
        chai.expect(channel._channels['sub1']).to.not.be.undefined;
      });
      mocha.it('should NOT automatically clean channels when the channel has sub-channels', () => {
        channel.addChannel('sub1');
        let subChannel = channel.returnChannel('sub1');
        let subscriber = subChannel.addSubscriber(spy);
        subChannel.addChannel('sub2');
        subChannel.removeSubscriber(subscriber.id, true);
        chai.expect(channel._channels['sub1']).to.not.be.undefined;
        chai.expect(subChannel._channels['sub2']).to.not.be.undefined;
      });
    });
  });

  mocha.describe('publish', () => {
    mocha.it('should call all matching subscribers', () => {
      let data = ['data'];
      channel.addSubscriber(spy);
      channel.publish(data);
      chai.expect(spy).calledWith(data[0]);
    });

    mocha.it('should call all matching subscribers with predicates', () => {
      let data = ['data'];
      channel.addSubscriber(spy, {}, { predicate: function (data) { return data.length === 4; } });
      channel.publish(data);
      chai.expect(spy).calledWith(data[0]);
    });

    mocha.it('should call all matching subscribers with context', () => {
      let data = ['data'];
      // TODO: fails test if ES2015 version is applied
      // channel.addSubscriber(() => { this() }, {}, spy)
      channel.addSubscriber(function () { this(); }, {}, spy);
      channel.publish(data);
      chai.expect(spy).called;
    });

    mocha.it('should call all matching for parent channels', () => {
      let channelName = 'test';
      let spy2 = sinon.spy();
      let data = ['data'];
      channel.addSubscriber(spy);
      channel.addChannel(channelName);
      channel._channels[channelName].addSubscriber(spy2);
      channel._channels[channelName].publish(data);
      chai.expect(spy).calledWith(data[0]);
      chai.expect(spy2).calledWith(data[0]);
    });

    mocha.it('should call all matching subscribers with context', () => {
      let data = ['data'];
      // TODO: fails test if ES2015 version is applied
      // channel.addSubscriber(() => { this() }, {}, spy)
      channel.addSubscriber(function () { this(); }, {}, spy);
      channel.publish(data);
      chai.expect(spy).called;
    });

    mocha.it('should call subscribers in predefined priority', () => {
      let sub1 = () => {
        this.a += '1';
      };
      let sub2 = () => {
        this.a += '2';
      };
      let sub3 = () => {
        this.a += '3';
      };
      let data = ['data'];
      this.a = '0';
      channel.addSubscriber(sub3, {}, this);
      channel.addSubscriber(sub1, { priority: 2 }, this);
      channel.addSubscriber(sub2, { priority: 1 }, this);
      channel.publish(data);
      chai.expect(this.a).to.equal('0123');
    });
  });
});
