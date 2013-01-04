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

      sub.update({ fn: newFN });
      expect(sub.fn).toBe(newFN);
    });

    it("should update the options (predicate)", function(){
      var newPredicate = function(data){ return data==true; },
          newOptions = { predicate: newPredicate };

      sub.update({ options: newOptions });
      expect(sub.options.predicate).toBe(newPredicate);
    });

    it("should update the context", function(){
      var newContext = { derp: "herp" };

      sub.update({ context: newContext });
      expect(sub.context).toBe(newContext);
    });
  });
});

