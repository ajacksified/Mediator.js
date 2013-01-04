describe("Mediator", function() {
  var mediator;

  beforeEach(function() {
    mediator = new Mediator();
  });

  describe("publishing", function(){
    it("should call a callback for a given channel", function(){
      var spy = jasmine.createSpy("test channel callback");

      mediator.subscribe("testX", spy);
      mediator.publish("testX");

      expect(spy).toHaveBeenCalled();
    });

    it("should stop propagation if requested", function(){
      var spy = jasmine.createSpy("test channel callback"),
          spy2 = jasmine.createSpy("test channel callback that shouldn't be called"),
          callback = function(c){ c.stopPropagation(); spy(); },
          callback2 = function(){ spy2(); };

      mediator.subscribe("testX", callback);
      mediator.subscribe("testX", callback2);
      mediator.publish("testX");

      expect(spy).toHaveBeenCalled();
      expect(spy2).not.toHaveBeenCalled();
    });


    it("should call callbacks for all functions in a given channel", function(){
      var spy = jasmine.createSpy("test channel callback"),
          spy2 = jasmine.createSpy("second test channel callback");

      mediator.subscribe("test", spy);
      mediator.subscribe("test", spy2);
      mediator.publish("test");

      expect(spy).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();

    });

    it("should pass arguments to the given function", function(){
      var spy = jasmine.createSpy("test channel callback with args"),
          channel = "test",
          arg = "arg1",
          arg2 = "arg2";

      mediator.subscribe(channel, spy);
      mediator.publish(channel, arg, arg2);

      expect(spy).toHaveBeenCalledWith(arg, arg2, mediator.getChannel(channel));
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

      mediator.subscribe("test", spy, { predicate: predicate });
      mediator.subscribe("test", spy2, { predicate: predicate2 });
      mediator.subscribe("test", spy3);

      mediator.publish("test", "Test");

      expect(spy).toHaveBeenCalled();
      expect(spy2).not.toHaveBeenCalled();
      expect(spy3).toHaveBeenCalled;
    });
  });

  describe("removing", function(){
    it("should remove callbacks for a given channel", function(){
      var spy = jasmine.createSpy("test channel callback");

      mediator.subscribe("test", spy);
      mediator.remove("test");
      mediator.publish("test");
      
      expect(spy).not.toHaveBeenCalled();
    });

    it("should remove callbacks for a given channel / named function pair", function(){
      var spy = jasmine.createSpy("test channel callback"),
          spy2 = jasmine.createSpy("second test channel callback");

      mediator.subscribe("test", spy);
      mediator.subscribe("test", spy2);
      mediator.remove("test", spy);
      mediator.publish("test");
      
      expect(spy).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });
  });

  describe("updating", function(){
    it("should update callback by identifier", function(){
      var spy = jasmine.createSpy("test channel callback"),
          newPredicate = function(data){ return data; };

      var sub = mediator.subscribe("test", spy),
          subId = sub.id;

      var subThatIReallyGotLater = mediator.getSubscriber(subId, "test");
      subThatIReallyGotLater.update({ options: { predicate: newPredicate } });
      expect(subThatIReallyGotLater.options.predicate).toBe(newPredicate);
    });

    it("should update callback by fn", function(){
      var spy = jasmine.createSpy("test channel callback"),
          newPredicate = function(data){ return data; };

      var sub = mediator.subscribe("test", spy);

      var subThatIReallyGotLater = mediator.getSubscriber(spy, "test");
      subThatIReallyGotLater.update({ options: { predicate: newPredicate } });
      expect(subThatIReallyGotLater.options.predicate).toBe(newPredicate);
    });
  });

  describe("namespaces", function(){
    it("should call all functions within a given channel namespace", function(){
      var spy = jasmine.createSpy("test channel callback");
      var spy2 = jasmine.createSpy("second test channel callback");

      mediator.subscribe("test:channel", spy);
      mediator.subscribe("test", spy2);

      mediator.publish("test:channel");

      expect(spy).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });

    it("should call only functions within a given channel namespace", function(){
      var spy = jasmine.createSpy("test channel callback");
      var spy2 = jasmine.createSpy("second test channel callback");

      mediator.subscribe("test", spy);
      mediator.subscribe("derp", spy2);

      mediator.publish("test");

      expect(spy).toHaveBeenCalled();
      expect(spy2).not.toHaveBeenCalled();
    });

    it("should remove functions within a given channel namespace", function(){
      var spy = jasmine.createSpy("inner test channel callback"),
          spy2 = jasmine.createSpy("outermost channel callback");

      mediator.subscribe("test:test1", spy);
      mediator.subscribe("test", spy2);

      mediator.remove("test:test1");

      mediator.publish("test:test1");

      expect(spy).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });

    it("should publish to specific namespaces", function(){
      var spy = jasmine.createSpy("inner test channel callback"),
          spy2 = jasmine.createSpy("outermost channel callback");

      mediator.subscribe("test:test1:test2", spy);
      mediator.subscribe("test", spy2);

      mediator.publish("test:test1", "data");

      expect(spy).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();

    });

  });
});
