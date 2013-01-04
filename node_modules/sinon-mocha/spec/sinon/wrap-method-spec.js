var WrapMethod = require('../../lib/sinon/wrap-method');

describe("sinon", function(){

  var originalWrapMethod;

  before(function(){
    originalWrapMethod = sinon.wrapMethod;
  });

  describe(".enhance", function(){

    beforeEach(function(){
      expect(sinon.wrapMethod).to.be(originalWrapMethod);
      WrapMethod.enhance(sinon);
    });

    afterEach(function(){
      if(sinon.wrapMethod.restore){
        sinon.wrapMethod.restore();
      }
    });

    it("should save sinon instance", function(){
      expect(WrapMethod.sinonInstance).to.be(sinon);
    });

    it("should have overwritten wrapMethod", function(){
      expect(sinon.wrapMethod).not.to.be(originalWrapMethod);
    });

    it("should set sinon.wrapMethod to our wrapMethod", function(){
      expect(sinon.wrapMethod).to.be(WrapMethod.wrapMethod);
    });

    it("should allow restoring of wrapMethod", function(){
      sinon.wrapMethod.restore();
      expect(sinon.wrapMethod).to.be(originalWrapMethod);
    });

  });

  describe(".wrapMethod", function(){

    var obj = {
      stub: function(){},
      spy: function(){}
    };

    before(function(){
      WrapMethod.enhance(sinon);
    });

    after(function(){
      sinon.wrapMethod.restore();
    });

    afterEach(function(){
      WrapMethod.objects.length = 0;
    });

    it("should save wrappedMethod from stubs in WrapMethod.objects", function(){
      var stub = sinon.stub(obj, 'stub');
      expect(stub).not.to.be(undefined);
      expect(WrapMethod.objects[0]).to.be(stub);
    });

    it("should save wrappedMethod from spys in WrapMethod.objects", function(){
      var spy = sinon.spy(obj, 'spy');
      expect(spy).not.to.be(undefined);
      expect(WrapMethod.objects[0]).to.be(spy);
    });

  });

  describe(".retoreWrappedMethods", function(){
    var stub1 = {restore: function(){ console.log('FOO!'); }},
        stub2 = function(){};

    before(function(){
      sinon.spy(stub1, 'restore');
    });

    beforeEach(function(){
      WrapMethod.objects.length = 0;
    });

    it("should call restore on all objects then truncate array", function(){
      WrapMethod.objects.push(stub1);

      WrapMethod.restoreWrappedMethods();

      expect(stub1.restore.called).to.be(true);
      expect(WrapMethod.objects.length).to.be(0);
    });

    it("should not fail when object has no restore method", function(){
      WrapMethod.objects.push(stub2);
      WrapMethod.restoreWrappedMethods();

      expect(WrapMethod.objects.length).to.be(0);
    });


  });

});
