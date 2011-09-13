describe("Mediator", function() {
  var mediator;

  beforeEach(function() {
    channel = new Mediator.Channel();
  });

  describe("initialization", function(){
    
  });

  describe("AddCallback", function(){
    it("should add a callback to the collection", function(){
      var spy = jasmine.createSpy("adding a test callback");
      channel.AddCallback(spy);

      expect(channel._callbacks.length).toBe(1);
    });

    it("should add a callback to the collection with context", function(){
      var spy = jasmine.createSpy("adding a callback with context"),
          contextObj = { derp: "herp" };

      channel.AddCallback(spy, contextObj);
      expect(channel._callbacks[0].context).toBe(contextObj);
    });

    it("should add a callback to the collection with options", function(){
      var spy = jasmine.createSpy("adding a callback with context"),
          contextObj = window,
          optionsObj = { derp: "herp" };

      channel.AddCallback(spy, contextObj, optionsObj);
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

  });

  describe("RemoveCallback", function(){

  });


  describe("Publish", function(){

  });
});

/*
ReturnChannel: function(channel){
RemoveCallback: function(fn){
Publish: function(data){
*/
