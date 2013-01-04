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

  describe("addSubscriber", function(){
    it("should add a callback to the collection", function(){
      var spy = jasmine.createSpy("adding a test callback");
      channel.addSubscriber(spy);

      expect(channel._callbacks.length).toBe(1);
    });

    it("should give callbacks an id", function(){
      var spy = jasmine.createSpy("adding a test callback");
      channel.addSubscriber(spy);

      expect(channel._callbacks[0].id).toBeDefined();
      expect(channel._callbacks[0].id).not.toBe('');
    });

    it("should add a callback to the collection with context", function(){
      var spy = jasmine.createSpy("adding a callback with context"),
          contextObj = { derp: "herp" };

      channel.addSubscriber(spy, {}, contextObj);
      expect(channel._callbacks[0].context).toBe(contextObj);
    });

    it("should add a callback to the collection with options", function(){
      var spy = jasmine.createSpy("adding a callback with context"),
          contextObj = window,
          optionsObj = { derp: "herp" };

      channel.addSubscriber(spy, optionsObj, contextObj);
      expect(channel._callbacks[0].options).toBe(optionsObj);
    });

    it("should be able to set top priority", function(){
      var spy = jasmine.createSpy("adding a test callback"),
          spy2 = jasmine.createSpy("adding another test callback"),
          spy3 = jasmine.createSpy("adding a third test callback");

      channel.addSubscriber(spy);
      channel.addSubscriber(spy2, { priority: 0 });
      channel.addSubscriber(spy3);

      expect(channel._callbacks[0].fn).toBe(spy2);
      expect(channel._callbacks[1].fn).toBe(spy);
      expect(channel._callbacks[2].fn).toBe(spy3);
    });

    it("should be able to set arbitrary priority", function(){
      var spy = jasmine.createSpy("adding a test callback"),
          spy2 = jasmine.createSpy("adding another test callback"),
          spy3 = jasmine.createSpy("adding a third test callback");

      channel.addSubscriber(spy);
      channel.addSubscriber(spy2);
      channel.addSubscriber(spy3, { priority: 1 });

      expect(channel._callbacks[0].fn).toBe(spy);
      expect(channel._callbacks[1].fn).toBe(spy3);
      expect(channel._callbacks[2].fn).toBe(spy2);
    });

    it("should be able to change priority after adding it", function(){
      var spy = jasmine.createSpy("adding a test callback"),
          spy2 = jasmine.createSpy("adding another test callback"),
          spy3 = jasmine.createSpy("adding a third test callback");

      var sub = channel.addSubscriber(spy, { num: 1 });
      channel.addSubscriber(spy2, { num: 2 });
      channel.addSubscriber(spy3, { num: 3 });

      channel.setPriority(sub.id, 2);

      expect(channel._callbacks[0].fn).toBe(spy2);
      expect(channel._callbacks[1].fn).toBe(spy3);
      expect(channel._callbacks[2].fn).toBe(spy);

    });
  });

  describe("GetSubscriber", function(){
    it("should get a callback by its id", function(){
      var spy = jasmine.createSpy("adding a test callback");
      channel.addSubscriber(spy);

      expect(channel.getSubscriber(channel._callbacks[0].id)).toBeDefined();
    });
  });

  describe("addChannel", function(){
    it("should add a channel to the collection", function(){
      var channelName = "test";
      channel.addChannel(channelName);

      expect(channel._channels[channelName]).toBeDefined();
    });
  });

  describe("hasChannel", function(){
    it("should return true if the channel exists", function(){
      var channelName = "test";
      channel.addChannel(channelName);

      expect(channel.hasChannel(channelName)).toBe(true);
    });

    it("should return true if the channel does not exist", function(){
      var channelName = "test",
          badChannelName = "herp";

      channel.addChannel(channelName);

      expect(channel.hasChannel(badChannelName)).toBe(false);
    });
  });

  describe("ReturnChannel", function(){
    it("should return a reference to a channel by name", function(){
      var channelName = "test";

      channel.addChannel(channelName);

      expect(channel.returnChannel(channelName)).toBe(channel._channels[channelName]);
    });
  });

  describe("removeSubscriber", function(){
    it("should remove callbacks if no fn is given", function(){
      var spy = jasmine.createSpy("adding a test callback");

      channel.addSubscriber(spy);
      expect(channel._callbacks.length).toBe(1);

      channel.removeSubscriber();
      expect(channel._callbacks.length).toBe(0);
    });

    it("should remove matching callbacks a valid fn is given", function(){
      var spy = jasmine.createSpy("adding a test callback"),
          spy2 = jasmine.createSpy("adding a second test callback");

      channel.addSubscriber(spy);
      channel.addSubscriber(spy2);
      expect(channel._callbacks.length).toBe(2);

      channel.removeSubscriber(spy);
      expect(channel._callbacks.length).toBe(1);
      expect(channel._callbacks[0].fn).toBe(spy2);
    });

    it("should remove matching callbacks a valid id is given", function(){
      var spy = jasmine.createSpy("adding a test callback"),
          spy2 = jasmine.createSpy("adding a second test callback"),
          sub = channel.addSubscriber(spy);

      channel.addSubscriber(spy2);
      expect(channel._callbacks.length).toBe(2);

      channel.removeSubscriber(sub.id);
      expect(channel._callbacks.length).toBe(1);
      expect(channel._callbacks[0].fn).toBe(spy2);
    });


    it("should do nothing if an valid fn is given", function(){
      var spy = jasmine.createSpy("adding a test callback"),
          invalidFn = "derp";

      channel.addSubscriber(spy);
      channel.addSubscriber(function() {});
      expect(channel._callbacks.length).toBe(2);

      channel.removeSubscriber(invalidFn);
      expect(channel._callbacks.length).toBe(2);
    });

    it("should do nothing if a non-matching fn is given", function(){
      var spy = jasmine.createSpy("adding a test callback"),
          spy2 = jasmine.createSpy("adding another test callback");

      channel.addSubscriber(spy);
      expect(channel._callbacks.length).toBe(1);

      channel.removeSubscriber(spy2);
      expect(channel._callbacks.length).toBe(1);
    });
  });


  describe("publish", function(){
    it("should call all matching callbacks", function(){
      var spy = jasmine.createSpy("adding a test callback"),
          data = ["data"];

      channel.addSubscriber(spy);
      channel.publish(data);

      expect(spy).toHaveBeenCalledWith(data[0]);
    });

    it("should call all matching callbacks with predicates", function(){
      var spy = jasmine.createSpy("adding a test callback"),
          data = ["data"];

      channel.addSubscriber(spy, window, { predicate: function(data){ return data.length == 4 } });
      channel.publish(data);

      expect(spy).toHaveBeenCalledWith(data[0]);
    });

    it("should call all matching callbacks with context", function(){
      var spy = jasmine.createSpy("context for callback"),
          data = ["data"];

      channel.addSubscriber(function() { this(); }, {}, spy );
      channel.publish(data);

      expect(spy).toHaveBeenCalled();
    });

    it("should call all matching for parent channels", function(){
      var channelName = "test",
          spy = jasmine.createSpy("outer function"),
          spy2 = jasmine.createSpy("inner function"),
          data = ["data"];

      channel.addSubscriber(spy);
      channel.addChannel(channelName);
      channel._channels[channelName].addSubscriber(spy2);

      channel._channels[channelName].publish(data);

      expect(spy).toHaveBeenCalledWith(data[0]);
      expect(spy2).toHaveBeenCalledWith(data[0]);
    });
  });
});
