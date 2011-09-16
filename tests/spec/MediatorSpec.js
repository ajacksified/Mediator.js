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

    it("should stop propagation if requested", function(){
      var spy = jasmine.createSpy("test channel callback"),
          spy2 = jasmine.createSpy("test channel callback that shouldn't be called"),
          callback = function(c){ c.StopPropagation(); spy(); },
          callback2 = function(){ spy2(); };

      mediator.Subscribe("testX", callback);
      mediator.Subscribe("testX", callback2);
      mediator.Publish("testX");

      expect(spy).toHaveBeenCalled();
      expect(spy2).not.toHaveBeenCalled();
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
          channel = "test",
          arg = "arg1",
          arg2 = "arg2";

      mediator.Subscribe(channel, spy);
      mediator.Publish(channel, arg, arg2);

      expect(spy).toHaveBeenCalledWith(arg, arg2, mediator.GetChannel(channel));
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

  describe("updating", function(){
    it("should update callback by identifier", function(){
      var spy = jasmine.createSpy("test channel callback"),
          newPredicate = function(data){ return data; };

      var sub = mediator.Subscribe("test", spy),
          subId = sub.id;

      var subThatIReallyGotLater = mediator.GetSubscriber(subId, "test");
      subThatIReallyGotLater.Update({ options: { predicate: newPredicate } });
      expect(subThatIReallyGotLater.options.predicate).toBe(newPredicate);
    });

    it("should find callback by identifier recursively, then update", function(){
      var spy = jasmine.createSpy("test channel callback"),
          newPredicate = function(data){ return data; };

      var sub = mediator.Subscribe("test:deeper", spy),
          subId = sub.id;

      var subThatIReallyGotLater = mediator.GetSubscriber(subId);
      subThatIReallyGotLater.Update({ options: { predicate: newPredicate } });
      expect(subThatIReallyGotLater.options.predicate).toBe(newPredicate);
    });

    it("should update callback by fn", function(){
      var spy = jasmine.createSpy("test channel callback"),
          newPredicate = function(data){ return data; };

      var sub = mediator.Subscribe("test", spy);

      var subThatIReallyGotLater = mediator.GetSubscriber(spy, "test");
      subThatIReallyGotLater.Update({ options: { predicate: newPredicate } });
      expect(subThatIReallyGotLater.options.predicate).toBe(newPredicate);
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

    it("should publish to specific namespaces", function(){
      var spy = jasmine.createSpy("inner test channel callback"),
          spy2 = jasmine.createSpy("outermost channel callback");

      mediator.Subscribe("test:test1:test2", spy);
      mediator.Subscribe("test", spy2);

      mediator.Publish("test:test1", "data");

      expect(spy).toHaveBeenCalled();
      expect(spy2).not.toHaveBeenCalled();

    });

  });
});
