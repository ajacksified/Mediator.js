describe("Channel", function() {
  var mediator;

  beforeEach(function() {
    channel = new Mediator.Channel();
  });

  describe("Initialization", function(){
    it("should set its namespace property", function(){
      expect(channel.namespace).toBe("");
    });

    it("should set its namespace property to a given namespace", function(){
      var namespacedChannel = new Mediator.Channel("test:coffee");

      expect(namespacedChannel.namespace).toBe("test:coffee");
    });
  });

  describe("AddSubscriber", function(){
    it("should add a callback to the collection", function(){
      var spy = jasmine.createSpy("adding a test callback");
      channel.AddSubscriber(spy);

      expect(channel._callbacks.length).toBe(1);
    });

    it("should give callbacks an id", function(){
      var spy = jasmine.createSpy("adding a test callback");
      channel.AddSubscriber(spy);

      expect(channel._callbacks[0].id).toBeDefined();
      expect(channel._callbacks[0].id).not.toBe('');
    });

    it("should add a callback to the collection with context", function(){
      var spy = jasmine.createSpy("adding a callback with context"),
          contextObj = { derp: "herp" };

      channel.AddSubscriber(spy, {}, contextObj);
      expect(channel._callbacks[0].context).toBe(contextObj);
    });

    it("should add a callback to the collection with options", function(){
      var spy = jasmine.createSpy("adding a callback with context"),
          contextObj = window,
          optionsObj = { derp: "herp" };

      channel.AddSubscriber(spy, optionsObj, contextObj);
      expect(channel._callbacks[0].options).toBe(optionsObj);
    });

    it("should be able to set top priority", function(){
      var spy = jasmine.createSpy("adding a test callback"),
          spy2 = jasmine.createSpy("adding another test callback"),
          spy3 = jasmine.createSpy("adding a third test callback");

      channel.AddSubscriber(spy);
      channel.AddSubscriber(spy2, { priority: 0 });
      channel.AddSubscriber(spy3);

      expect(channel._callbacks[0].fn).toBe(spy2);
      expect(channel._callbacks[1].fn).toBe(spy);
      expect(channel._callbacks[2].fn).toBe(spy3);
    });

    it("should be able to set arbitrary priority", function(){
      var spy = jasmine.createSpy("adding a test callback"),
          spy2 = jasmine.createSpy("adding another test callback"),
          spy3 = jasmine.createSpy("adding a third test callback");

      channel.AddSubscriber(spy);
      channel.AddSubscriber(spy2);
      channel.AddSubscriber(spy3, { priority: 1 });

      expect(channel._callbacks[0].fn).toBe(spy);
      expect(channel._callbacks[1].fn).toBe(spy3);
      expect(channel._callbacks[2].fn).toBe(spy2);
    });

    it("should be able to change priority after adding it", function(){
      var spy = jasmine.createSpy("adding a test callback"),
          spy2 = jasmine.createSpy("adding another test callback"),
          spy3 = jasmine.createSpy("adding a third test callback");

      var sub = channel.AddSubscriber(spy, { num: 1 });
      channel.AddSubscriber(spy2, { num: 2 });
      channel.AddSubscriber(spy3, { num: 3 });

      channel.SetPriority(sub.id, 2);

      expect(channel._callbacks[0].fn).toBe(spy2);
      expect(channel._callbacks[1].fn).toBe(spy3);
      expect(channel._callbacks[2].fn).toBe(spy);

    });
  });

  describe("GetSubscriber", function(){
    it("should get a callback by its id", function(){
      var spy = jasmine.createSpy("adding a test callback");
      channel.AddSubscriber(spy);

      expect(channel.GetSubscriber(channel._callbacks[0].id)).toBeDefined();
    });
  });

  describe("AddChannel", function(){
    it("should add a channel to the collection", function(){
      var channelName = "test";
      channel.AddChannel(channelName);

      expect(channel._channels[channelName]).toBeDefined();
    });
  });

  describe("HasChannel", function(){
    it("should return true if the channel exists", function(){
      var channelName = "test";
      channel.AddChannel(channelName);

      expect(channel.HasChannel(channelName)).toBe(true);
    });

    it("should return true if the channel does not exist", function(){
      var channelName = "test",
          badChannelName = "herp";

      channel.AddChannel(channelName);

      expect(channel.HasChannel(badChannelName)).toBe(false);
    });
  });

  describe("ReturnChannel", function(){
    it("should return a reference to a channel by name", function(){
      var channelName = "test";

      channel.AddChannel(channelName);

      expect(channel.ReturnChannel(channelName)).toBe(channel._channels[channelName]);
    });
  });

  describe("RemoveSubscriber", function(){
    it("should remove callbacks if no fn is given", function(){
      var spy = jasmine.createSpy("adding a test callback");

      channel.AddSubscriber(spy);
      expect(channel._callbacks.length).toBe(1);

      channel.RemoveSubscriber();
      expect(channel._callbacks.length).toBe(0);
    });

    it("should remove matching callbacks a valid fn is given", function(){
      var spy = jasmine.createSpy("adding a test callback"),
          spy2 = jasmine.createSpy("adding a second test callback");

      channel.AddSubscriber(spy);
      channel.AddSubscriber(spy2);
      expect(channel._callbacks.length).toBe(2);

      channel.RemoveSubscriber(spy);
      expect(channel._callbacks.length).toBe(1);
      expect(channel._callbacks[0].fn).toBe(spy2);
    });

    it("should remove matching callbacks a valid id is given", function(){
      var spy = jasmine.createSpy("adding a test callback"),
          spy2 = jasmine.createSpy("adding a second test callback");

      var sub = channel.AddSubscriber(spy);
      channel.AddSubscriber(spy2);
      expect(channel._callbacks.length).toBe(2);

      channel.RemoveSubscriber(sub.id);
      expect(channel._callbacks.length).toBe(1);
      expect(channel._callbacks[0].fn).toBe(spy2);
    });


    it("should do nothing if an valid fn is given", function(){
      var spy = jasmine.createSpy("adding a test callback"),
          invalidFn = "derp";

      channel.AddSubscriber(spy);
      channel.AddSubscriber(function() {});
      expect(channel._callbacks.length).toBe(2);

      channel.RemoveSubscriber(invalidFn);
      expect(channel._callbacks.length).toBe(2);
    });

    it("should do nothing if a non-matching fn is given", function(){
      var spy = jasmine.createSpy("adding a test callback"),
        spy2 = jasmine.createSpy("adding another test callback");

      channel.AddSubscriber(spy);
      expect(channel._callbacks.length).toBe(1);

      channel.RemoveSubscriber(spy2);
      expect(channel._callbacks.length).toBe(1);
    });
  });


  describe("Publish", function(){
    it("should call all matching callbacks", function(){
      var spy = jasmine.createSpy("adding a test callback"),
          data = ["data"];

      channel.AddSubscriber(spy);
      channel.Publish(data);

      expect(spy).toHaveBeenCalledWith(data[0]);
    });

    it("should call all matching callbacks with predicates", function(){
      var spy = jasmine.createSpy("adding a test callback"),
          data = ["data"];

      channel.AddSubscriber(spy, window, { predicate: function(data){ return data.length == 4 } });
      channel.Publish(data);

      expect(spy).toHaveBeenCalledWith(data[0]);
    });

    it("should call all matching callbacks with context", function(){
      var spy = jasmine.createSpy("context for callback"),
          data = ["data"];

      channel.AddSubscriber(function() { this(); }, {}, spy );
      channel.Publish(data);

      expect(spy).toHaveBeenCalled();
    });
    
    it("should call all matching for nested channels", function(){
      var channelName = "test",
          spy = jasmine.createSpy("inner function"),
          data = ["data"];

      channel.AddChannel(channelName);
      channel._channels[channelName].AddSubscriber(spy);

      channel.Publish(data);

      expect(spy).toHaveBeenCalledWith(data[0]);
    });
  });
});
