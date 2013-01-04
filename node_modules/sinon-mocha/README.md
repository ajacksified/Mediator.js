# Sinon Mocha

Sinon Mocha is an extension library for mocha/sinon that will automatically clean up "wrapped" methods.

Tested with:

| **Sinon** | **Mocha** |
| ----- | ----- |
| 1.3   | 0.12  |

As of version 0.0.1 browser support is not tested but is planned in a future version.

## Example Usage

``` javascript

var sinon = require('sinon'),
    //You don't need to use expect for this to work
    //This is just to provide a working example
    expect = require('expect.js');
    
//Enhance sinon
//You can also pass a mocha as the second argument.
require('sinon-mocha').enhance(sinon);

describe("MyClass", function(){

  var MyClass = require('my-class'),
      subject;
      
  //before (all) hooks are *NOT* automatically cleaned up for you.
  before(function(){
    sinon.stub(MyClass.prototype, 'ajax', function(){
      //...
    });
  });
  
  //You must `.restore` the method yourself.
  after(function(){
    MyClass.prototype.ajax.restore();
  });

  beforeEach(function(){
    subject = new MyClass();
    
    sinon.spy(subject, 'spiedMethod');
    //Stubs also work
    sinon.stub(subject, 'stubbedMethod');
    //And stubs with functionality
    sinon.stub(subject, 'stubbedMethodWFunc', function(){
      console.log(' I get called ! ' );
    });
  });
  
  describe(".spiedMethod", function(){
  
    it("will call spy", function(){
      subject.spiedMethod();
      expect(subject.spiedMethod.called).to.be(true);
    });
    
  });
  
  // Etc...

});

```

## How it works

In short sinon's wrapMethod function is overwritten to capture its results in the `beforeEach` of every test.
Then in the `afterEach` those methods are `.restore()`[d].

To gain access to mocha there is a hack that will search through `require.cache` and pick out its `mocha/index.js`
and require it to ensure we modify the actual mocha being used. I ran into some issue that lead me down this path.
When running `require('mocha')` I would end up with a different instance then was being used inside the test context.

`Mocha.Runner.runSuite` is patched to add a beforeEach and afterEach that invokes the sinon magic.
See `lib/mocha-hooks.js`. 

## WHY?

Jasmine spoiled me.

## License

MIT (see LICENSE)
