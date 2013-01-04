var Hooks = require('../lib/mocha-hooks');

Hooks.enhance();

describe("mocha", function(){
  var originalBefore, originalAfter;

  before(function(){
    originalBefore = Hooks._beforeEaches;
    originalAfter = Hooks._afterEaches;
    Hooks._beforeEaches = [];
    Hooks._afterEaches = [];
  });

  after(function(){
    Hooks._beforeEaches = originalBefore;
    Hooks._afterEaches = originalAfter;
  });

  describe(".enhance", function(){

    describe("hooks firing", function(){

      var beforeEachIndex = 0,
          afterEachIndex = 0;

      before(function(){

        Hooks.beforeEach(function(){
          beforeEachIndex++;
        });

        Hooks.afterEach(function(){
          afterEachIndex++;
        });
      });

      it("one", function(){
        expect(beforeEachIndex).to.be(1);
        expect(afterEachIndex).to.be(0);
      });

      describe("testing nesting", function(){
        it("two", function(){
          expect(beforeEachIndex).to.be(2);
          expect(afterEachIndex).to.be(1);
        });

        describe("deep nesting", function(){
          it("three", function(){
            expect(beforeEachIndex).to.be(3);
            expect(afterEachIndex).to.be(2);
          });
        });
      });


      after(function(){
        Hooks._beforeEaches.pop();
        Hooks._afterEaches.pop();

        expect(afterEachIndex).to.be(3);
        expect(beforeEachIndex).to.be(3);
      });

    });

  });

  describe(".beforeEach", function(){
    var fn = function(){};

    it("should add function to _beforeEaches", function(){
      Hooks.beforeEach(fn);
      expect(Hooks._beforeEaches).to.contain(fn);
      Hooks._beforeEaches.pop();
    });

  });

  describe(".afterEach", function(){
    var fn = function(){};

    it("should add function to _afterEaches", function(){
      Hooks.afterEach(fn);
      expect(Hooks._afterEaches).to.contain(fn);
      Hooks._afterEaches.pop();
    });
  });


  describe('runners', function(){
    var runners = ['runBeforeEach', 'runAfterEach'],
        stores = {
          'runBeforeEach': '_beforeEaches',
          'runAfterEach': '_afterEaches'
        }, i;

    for(i = 0; i < runners.length; i++){
      (function(name){

        describe("." + name, function(){
          var store = stores[name],
              stub = {
                hook: function(){}
              }, context = {};

          before(function(){
            sinon.stub(stub, 'hook');
          });

          beforeEach(function(){
            Hooks[store].push(stub.hook);
            Hooks[name](context);
          });

          afterEach(function(){
            Hooks[store].pop();
          });

          it("should have added hook", function(){
            expect(Hooks[store]).to.contain(stub.hook);
          });

          it("should have called stub in correct context", function(){
            var call;
            expect(stub.hook.called).to.be(true);

            call = stub.hook.getCall(0);

            expect(call.thisValue).to.be(context);
          });

        });

      }(runners[i]));
    }

  });

  describe(".findMocha", function(){

    it("should return mocha", function(){
      expect(Hooks.findMocha().Runner).to.be.a('function');
    });

  });

});
