/* TODO:
 * This should probably exist inside mocha itself
 * or be bundled as a separate package.
 */
var MochaHooks;

MochaHooks = {

  _beforeEaches: [],
  _afterEaches: [],
  _enhanced: false,

  /**
   * Enhances mocha instance with global before/after hooks.
   *
   * @param {Mocha} mocha optional mocha instance
   */
  enhance: function(mocha){
    var runSuite;

    if(typeof(mocha) === 'undefined'){
      mocha = MochaHooks.findMocha();
    }

    runSuite = mocha.Runner.prototype.runSuite;
    mocha.Runner.prototype.runSuite = function(suite){
      var beforeEachHook;

      if(suite.title === '' && !MochaHooks._enhanced){
        beforeEachHook = new mocha.Hook('"before each" hook', function(){
          MochaHooks.runBeforeEach(this);
        });

        //This is a push so we just use normal afterEach
        suite.afterEach(function(){
          MochaHooks.runAfterEach(this);
        });

        beforeEachHook.parent = suite;
        beforeEachHook.ctx = suite.ctx;
        beforeEachHook.timeout(suite.timeout());
        suite._beforeEach.unshift(beforeEachHook);

        MochaHooks._enhanced = true;
      }
      return runSuite.apply(this, arguments);
    };
  },

  /**
   * Adds a global beforeEach hook
   *
   * @param {Function} hook will be called before each test
   */
  beforeEach: function(fn){
    this._beforeEaches.push(fn);
  },

  /**
   * Adds a global afterEach hook
   *
   * @param {Function} hook will be called after each test
   */
  afterEach: function(fn){
    this._afterEaches.push(fn);
  },

  /**
   * Executes all hooks for a particular type 
   * in a given context.
   *
   * @param {String} type name of the property in MochaHooks 
   * @param {Object} context context to execute hooks in
   */
  _runHooksFor: function(type, context){
    var i = 0, 
        store = MochaHooks[type],
        len = store.length;

    for(i = 0; i < len; i++){
      store[i].call(context);
    }
  },

  /**
   * Executes all beforeEach hooks in context
   *
   * @param {Object} context
   */
  runBeforeEach: function(context){
    MochaHooks._runHooksFor('_beforeEaches', context);
  },

  /**
   * Executes all afterEach hooks in context
   *
   * @param {Object} context
   */
  runAfterEach: function(context){
    MochaHooks._runHooksFor('_afterEaches', context);
  },

  /**
   * Finds the used mocha runtime and returns it.
   *
   * This is a hack that searches through require.cache...
   *
   * @return {Mocha}
   */
  findMocha: function(){
    var objectCache = require.cache,
        key,
        mochaMatch = /mocha\/index\.js$/,
        mocha,
        runSuite;

    for(key in objectCache){
      if(objectCache.hasOwnProperty(key)){
        if(key.match(mochaMatch)){
          mocha = require(key);
        }
      }
    }

    return mocha;
  },

};

module.exports = exports = MochaHooks;
