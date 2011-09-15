describe("Mediator", function() {
  var sub,
      originalOptions = {},
      originalContext = {},
      originalFN = function(){};

  beforeEach(function() {
    sub = new Mediator.Subscriber(originalFN, originalOptions, originalContext);
  });

  describe("updating", function(){
    it("should update the fn", function(){
      var newFN = function(data){ return data; };

      sub.Update({ fn: newFN });
      expect(sub.fn).toBe(newFN);
    });

    it("should update the options (predicate)", function(){
      var newPredicate = function(data){ return data==true; },
          newOptions = { predicate: newPredicate };

      sub.Update({ options: newOptions });
      expect(sub.options.predicate).toBe(newPredicate);
    });

    it("should update the context", function(){
      var newContext = { derp: "herp" };

      sub.Update({ context: newContext });
      expect(sub.context).toBe(newContext);
    });
  });
});

