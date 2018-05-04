const Mediator = require('../index').Mediator;
const mocha = require('mocha');
const sinon = require('sinon');
const chai = require('chai').use(require('sinon-chai'));

// Reused variables
let mediator;
let spy;
let spy2;

mocha.describe('Mediator', () => {
  mocha.beforeEach(() => {
    mediator = new Mediator();
    spy = sinon.spy();
    spy2 = sinon.spy();
  });

  mocha.describe('initializing', () => {
    mocha.it('should act like a constructor when called like a function', () => chai.expect(Mediator()).not.to.be.undefined);
    mocha.it('should start with a channel', () => chai.expect(mediator.getChannel('')).not.to.be.undefined);
  });

  mocha.describe('subscribing', () => {
    mocha.it('should subscribe to a given channel', () => {
      mediator.subscribe('test', spy);
      chai.expect(mediator.getChannel('test')._subscribers.length).to.equal(1);
    });

    mocha.it('should bind \'once\'', () => {
      mediator.once('test', spy);
      mediator.publish('test');
      mediator.publish('test');
      chai.expect(spy).calledOnce;
    });

    mocha.it('should bind with arbitrary number of calls', () => {
      mediator.subscribe('test', spy, { calls: 3 });
      for (let i = 0; i < 5; i++) {
        mediator.publish('test');
      }
      chai.expect(spy).calledThrice;
    });

    mocha.it('should bind with arbitrary number of calls when predicate matches', () => {
      let subscriber1 = mediator.subscribe('test', spy, { calls: 3, predicate: (d) => (d === 1) });
      let subscriber2 = mediator.subscribe('test', sinon.spy(), { calls: 3, predicate: (d) => (d === 2) });
      mediator.publish('test', 1);
      mediator.publish('test', 2);
      chai.expect(spy).calledOnce;
      chai.expect(subscriber1.options.calls).to.equal(2);
      chai.expect(subscriber2.options.calls).to.equal(2);
    });

    mocha.it('should remove a subscriber in a list of others that\'s been called its maximum amount of times', () => {
      mediator.subscribe('test', () => {});
      mediator.subscribe('test', spy, { calls: 3 });
      mediator.subscribe('test', () => {});
      for (let i = 0; i < 5; i++) {
        mediator.publish('test');
      }
      chai.expect(spy).calledThrice;
    });
  });

  mocha.describe('publishing', () => {
    mocha.it('should call a subscriber for a given channel', () => {
      mediator.subscribe('testX', spy);
      mediator.publish('testX');
      chai.expect(spy).called;
    });

    mocha.it('should stop propagation if requested', () => {
      let subscriber = (c) => { c.stopPropagation(); spy(); };
      let subscriber2 = () => { spy2(); };
      mediator.subscribe('testX', subscriber);
      mediator.subscribe('testX', subscriber2);
      mediator.publish('testX');
      chai.expect(spy).called;
      chai.expect(spy2).not.called;
    });

    mocha.it('should call subscribers for all functions in a given channel', () => {
      mediator.subscribe('test', spy);
      mediator.subscribe('test', spy2);
      mediator.publish('test');
      chai.expect(spy).called;
      chai.expect(spy2).called;
    });

    mocha.it('should pass arguments to the given function', () => {
      let channel = 'test';
      let arg = 'arg1';
      let arg2 = 'arg2';
      mediator.subscribe(channel, spy);
      mediator.publish(channel, arg, arg2);
      chai.expect(spy).calledWith(arg, arg2, mediator.getChannel(channel));
    });

    mocha.it('should call all matching predicates', () => {
      let spy3 = sinon.spy();
      let predicate = (data) => (data.length === 4);
      let predicate2 = (data) => (data[0] === 'Y');
      mediator.subscribe('test', spy, { predicate: predicate });
      mediator.subscribe('test', spy2, { predicate: predicate2 });
      mediator.subscribe('test', spy3);
      mediator.publish('test', 'Test');
      chai.expect(spy).called;
      chai.expect(spy2).not.called;
      chai.expect(spy3).called;
    });
  });

  mocha.describe('removing', () => {
    mocha.it('should remove subscribers for a given channel', () => {
      mediator.subscribe('test', spy);
      mediator.remove('test');
      mediator.publish('test');
      chai.expect(spy).not.called;
    });

    mocha.it('should allow subscriber to remove itself', () => {
      let removerCalled = false;
      let predicate = (data) => true;
      let remover = () => {
        removerCalled = true;
        mediator.remove('test', sub.id);
      };
      let sub = mediator.subscribe('test', remover, {predicate: predicate});
      mediator.subscribe('test', spy);
      mediator.publish('test');
      chai.expect(removerCalled).to.be.true;
      chai.expect(spy).called;
      chai.expect(mediator.getChannel('test')._subscribers.length).to.equal(1);
    });

    mocha.it('should remove subscribers for a given channel / named function pair', () => {
      mediator.subscribe('test', spy);
      mediator.subscribe('test', spy2);
      mediator.remove('test', spy);
      mediator.publish('test');
      chai.expect(spy).not.called;
      chai.expect(spy2).called;
    });

    mocha.it('should remove subscribers by calling from subscriber\'s callback', () => {
      let catched = false;
      mediator.subscribe('test', () => {
        mediator.remove('test');
      });
      mediator.subscribe('test', spy);
      mediator.subscribe('test', spy2);
      try {
        mediator.publish('test');
      } catch (e) {
        catched = true;
      }
      chai.expect(catched).to.be.false;
      chai.expect(spy).not.called;
      chai.expect(spy2).not.called;
    });

    mocha.it('should remove subscriber by calling from its callback', () => {
      let remover = () => {
        mediator.remove('test', sub.id);
      };
      let catched = false;
      let sub = mediator.subscribe('test', remover);
      mediator.subscribe('test', spy);
      mediator.subscribe('test', spy2);
      try {
        mediator.publish('test');
      } catch (e) {
        catched = true;
      }
      chai.expect(catched).to.be.false;
      chai.expect(spy).to.called;
      chai.expect(spy2).to.called;
      remover = sinon.spy(remover);
      mediator.publish('test');
      chai.expect(remover).not.to.called;
      chai.expect(spy).to.called;
      chai.expect(spy2).to.called;
    });
  });

  mocha.describe('updating', () => {
    mocha.it('should update subscriber by identifier', () => {
      let newPredicate = (data) => data;
      let sub = mediator.subscribe('test', spy);
      let subId = sub.id;
      let subThatIReallyGotLater = mediator.getSubscriber(subId, 'test');
      subThatIReallyGotLater.update({ options: { predicate: newPredicate } });
      chai.expect(subThatIReallyGotLater.options.predicate).to.equal(newPredicate);
    });

    mocha.it('should update subscriber priority by identifier', () => {
      let sub = mediator.subscribe('test', spy);
      let sub2 = mediator.subscribe('test', spy2);
      sub2.update({ options: { priority: 1 } });
      chai.expect(mediator.getChannel('test')._subscribers[0].id).to.equal(sub2.id);
      chai.expect(mediator.getChannel('test')._subscribers[1].id).to.equal(sub.id);
    });

    mocha.it('should update subscriber by fn', () => {
      // TODO: FIXME, or investigate the main library
      let newPredicate = (data) => data;
      let subThatIReallyGotLater = mediator.getSubscriber(spy, 'test');
      subThatIReallyGotLater.update({ options: { predicate: newPredicate } });
      chai.expect(subThatIReallyGotLater.options.predicate).to.equal(newPredicate);
    });
  });

  mocha.describe('namespaces', () => {
    mocha.it('should make subchannels', () => {
      mediator.subscribe('test:subchannel', spy);
      chai.expect(mediator.getChannel('test')._channels['subchannel']._subscribers.length).to.equal(1);
    });

    mocha.it('should call all functions within a given channel namespace', () => {
      mediator.subscribe('test:channel', spy);
      mediator.subscribe('test', spy2);
      mediator.publish('test:channel');
      chai.expect(spy).called;
      chai.expect(spy2).called;
    });

    mocha.it('should call only functions within a given channel namespace', () => {
      mediator.subscribe('test', spy);
      mediator.subscribe('derp', spy2);
      mediator.publish('test');
      chai.expect(spy).called;
      chai.expect(spy2).not.called;
    });

    mocha.it('should remove functions within a given channel namespace', () => {
      mediator.subscribe('test:test1', spy);
      mediator.subscribe('test', spy2);
      mediator.remove('test:test1');
      mediator.publish('test:test1');
      chai.expect(spy).not.called;
      chai.expect(spy2).called;
    });

    mocha.it('should publish to specific namespaces', () => {
      mediator.subscribe('test:test1:test2', spy);
      mediator.subscribe('test', spy2);
      mediator.publish('test:test1', 'data');
      chai.expect(spy).not.called;
      chai.expect(spy2).called;
    });

    mocha.it('should publish to parents of non-existing namespaces', () => {
      mediator.subscribe('test:test1:test2', spy);
      mediator.subscribe('test', spy2);
      mediator.publish('test:test1', 'data');
      chai.expect(spy).not.called;
      chai.expect(spy2).called;
    });
  });

  mocha.describe('aliases', () => {
    mocha.it('should alias \'on\' and \'bind\'', () => {
      mediator.on('test', spy);
      mediator.bind('test', spy);
      mediator.publish('test');
      chai.expect(spy).calledTwice;
    });

    mocha.it('should alias \'emit\' and \'trigger\'', () => {
      mediator.subscribe('test', spy);
      mediator.emit('test');
      mediator.trigger('test');
      chai.expect(spy).calledTwice;
    });

    mocha.it('should alias \'off\' for subscriptions', () => {
      let sub = mediator.subscribe('test', spy);
      mediator.off('test', sub.id);
      mediator.publish('test');
      chai.expect(spy).not.called;
    });

    mocha.it('should alias \'off\' for channels', () => {
      mediator.subscribe('test', spy);
      mediator.off('test');
      mediator.publish('test');
      chai.expect(spy).not.called;
    });
  });
});
