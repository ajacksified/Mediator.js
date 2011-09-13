describe("Channel", function() {
  var mediator;

  beforeEach(function() {
    channel = new Mediator.Channel();
  });

  describe("AddSubscriber", function(){
    it("should add a callback to the collection", function(){
      var spy = jasmine.createSpy("adding a test callback");
      channel.AddSubscriber(spy);

      expect(channel._callbacks.length).toBe(1);
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
      var spy = jasmine.createSpy("adding a test callback");

      channel.AddSubscriber(spy);
      channel.AddSubscriber(function() {});
      expect(channel._callbacks.length).toBe(2);

      channel.RemoveSubscriber(spy);
      expect(channel._callbacks.length).toBe(1);
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
