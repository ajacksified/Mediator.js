var SinonMocha = require('../lib/sinon-mocha'),
    mocha, calls = [],
    afterEach = SinonMocha.afterEach,
    MochaHooks = require('../lib/mocha-hooks');

sinon.stub(SinonMocha, 'afterEach', function(){
  calls.push(this.title);
  afterEach.apply(this, arguments);
});

SinonMocha.enhance(sinon);

describe('sinon-mocha', function(){

  describe(".beforeEach", function(){

    var spyMe = function spyMe(){
          return 'foo';
        },
        object = {
          spyMe: spyMe
        };

    before(function(){
      sinon.stub(object, 'spyMe').returns('bar');
    });

    it("should be sping on spyMe", function(){
      expect(object.spyMe()).to.equal('bar');
    });

    after(function(){
      expect(object.spyMe()).to.equal('bar');
      object.spyMe.restore();
      expect(object.spyMe).not.to.be('foo');
    });

  });

  describe(".afterEach", function(){

    var subject = {
      spy: function(){
        return 'myself';
      },
      stub: function(){
        return 'foo';
      }
    }, stub, spy;

    beforeEach(function(){
      spy = sinon.spy(subject, 'spy');
      stub = sinon.stub(subject, 'stub').returns('stub');
    });

    it("should have spied on subject.spy", function(){
      var result = subject.spy();
      expect(subject.spy.called).to.be(true);
      expect(result).to.be('myself');
    });

    it("should have stubbed out subject.stub", function(){
      var result = subject.stub();
      expect(subject.stub.called).to.be(true);
      expect(result).to.be('stub');
    });

    after(function(){
      //it should have restored object.spy to the original function
      expect(subject.spy).not.to.be(spy);
      //it should have restored object.stub to the original function
      expect(subject.stub).not.to.be(stub);
    });

  });

});
