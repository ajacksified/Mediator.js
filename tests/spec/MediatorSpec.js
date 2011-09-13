describe("Mediator", function() {
  var mediator;

  beforeEach(function() {
    mediator = new Mediator();
  });

  describe("initialization", function(){
    
  });

  describe("adding subscribers", function(){
    it("should add a callback for a given channel", function(){
      mediator.Subscribe("test", function(){});
      expect(mediator._callbacks.test).toBeDefined();
    });

    it("should add multiple callbacks for a given channel", function(){
      mediator.Subscribe("test", function(){});
      mediator.Subscribe("test", function(){});
      expect(mediator._callbacks.test.length).toBe(2);
    });
  });

  describe("publishing", function(){
    it("should call a callback for a given channel", function(){
      var spy = jasmine.createSpy("test channel callback");

      mediator.Subscribe("test", spy);
      mediator.Publish("test");

      expect(spy).toHaveBeenCalled();
    });

    it("should call callbacks for all functions in a given channel", function(){
      var spy = jasmine.createSpy("test channel callback");
      var spy2 = jasmine.createSpy("second test channel callback");

      mediator.Subscribe("test", spy);
      mediator.Subscribe("test", spy2);
      mediator.Publish("test");

      expect(spy).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();

    });

    it("should pass arguments to the given function", function(){
      var spy = jasmine.createSpy("test channel callback with args");
      var arg = "test";

      mediator.Subscribe("test", spy);
      mediator.Publish("test", "test");

      expect(spy).toHaveBeenCalledWith(arg);
    });

    it("should call all matching predicates", function(){
      var spy = jasmine.createSpy("predicate: length of 4");
      var spy2 = jasmine.createSpy("predicate: starts with Y");
      var spy3 = jasmine.createSpy("test channel callback");
      
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
      var spy = jasmine.createSpy("test channel callback");
      var spy2 = jasmine.createSpy("second test channel callback");

      mediator.Subscribe("test", spy);
      mediator.Subscribe("test", spy2);
      mediator.Remove("test", spy);
      mediator.Publish("test");
      
      expect(spy).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });
  });
});
