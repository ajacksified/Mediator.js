describe("Mediator", function() {
  var mediator;

  beforeEach(function() {
    mediator = new Mediator();
  });

  describe("publishing", function(){
    it("should call a callback for a given channel", function(){
      var spy = jasmine.createSpy("test channel callback");

      mediator.Subscribe("testX", spy);
      mediator.Publish("testX");

      expect(spy).toHaveBeenCalled();
    });

    it("should call callbacks for all functions in a given channel", function(){
      var spy = jasmine.createSpy("test channel callback"),
          spy2 = jasmine.createSpy("second test channel callback");

      mediator.Subscribe("test", spy);
      mediator.Subscribe("test", spy2);
      mediator.Publish("test");

      expect(spy).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();

    });

    it("should pass arguments to the given function", function(){
      var spy = jasmine.createSpy("test channel callback with args"),
          arg = "test";

      mediator.Subscribe("test", spy);
      mediator.Publish("test", "test");

      expect(spy).toHaveBeenCalledWith(arg);
    });

    it("should call all matching predicates", function(){
      var spy = jasmine.createSpy("predicate: length of 4"),
          spy2 = jasmine.createSpy("predicate: starts with Y"),
          spy3 = jasmine.createSpy("test channel callback");
      
      var predicate = function(data){
        return data.length === 4;
      }

      var predicate2 = function(data){
        return data[0] == "Y";
      }

      mediator.Subscribe("test", spy, { predicate: predicate });
      mediator.Subscribe("test", spy2, { predicate: predicate2 });
      mediator.Subscribe("test", spy3);

      mediator.Publish("test", "Test");

      expect(spy).toHaveBeenCalled();
      expect(spy2).not.toHaveBeenCalled();
      expect(spy3).toHaveBeenCalled;
    });
  });

  describe("removing", function(){
    it("should remove callbacks for a given channel", function(){
      var spy = jasmine.createSpy("test channel callback");

      mediator.Subscribe("test", spy);
      mediator.Remove("test");
      mediator.Publish("test");
      
      expect(spy).not.toHaveBeenCalled();
    });

    it("should remove callbacks for a given channel / named function pair", function(){
      var spy = jasmine.createSpy("test channel callback"),
          spy2 = jasmine.createSpy("second test channel callback");

      mediator.Subscribe("test", spy);
      mediator.Subscribe("test", spy2);
      mediator.Remove("test", spy);
      mediator.Publish("test");
      
      expect(spy).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });
  });

  describe("namespaces", function(){
    it("should call all functions within a given channel namespace", function(){
      var spy = jasmine.createSpy("test channel callback");
      var spy2 = jasmine.createSpy("second test channel callback");

      mediator.Subscribe("test:channel", spy);
      mediator.Subscribe("test:channel2", spy2);
      mediator.Publish("test");

      expect(spy).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });

    it("should call only functions within a given channel namespace", function(){
      var spy = jasmine.createSpy("test channel callback");
      var spy2 = jasmine.createSpy("second test channel callback");

      mediator.Subscribe("test:channel", spy);
      mediator.Subscribe("derp:channel2", spy2);
      mediator.Publish("test");

      expect(spy).toHaveBeenCalled();
      expect(spy2).not.toHaveBeenCalled();
    });

    it("should remove functions within a given channel namespace", function(){
      var spy = jasmine.createSpy("inner test channel callback"),
          spy2 = jasmine.createSpy("outermost channel callback");

      mediator.Subscribe("test:test1:test2", spy);
      mediator.Subscribe("test", spy2);

      mediator.Remove("test:test1");

      mediator.Publish("test");

      expect(spy).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });

  });
});
