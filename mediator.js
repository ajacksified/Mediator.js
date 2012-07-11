/*!
* Mediator.js Library v0.7.0
* https://github.com/ajacksified/Mediator.js
*
* Copyright 2011, Jack Lawson
* MIT Licensed (http://www.opensource.org/licenses/mit-license.php)
*
* For more information: http://www.thejacklawson.com/index.php/2011/06/mediators-for-modularized-asynchronous-programming-in-javascript/
* Project on GitHub: https://github.com/ajacksified/Mediator.js
*
* Last update: Sep 15 2011
*/

(function(root){

  // We'll generate guids for class instances for easy referencing later on.
  // Subscriber instances will have an id that can be refernced for quick
  // lookups.

  function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  };

  // Subscribers are instances of Mediator Channel registrations. We generate
  // an object instance so that it can be updated later on without having to
  // unregister and re-register. Subscribers are constructed with a function
  // to be called, options object, and context.

  function Subscriber(fn, options, context){
    if (!this instanceof Subscriber) {
      return new Subscriber(fn, context, options);
    }else{
      this.id = guidGenerator();
      this.fn = fn;
      this.options = options;
      this.context = context;
      this.channel = null;
    }
  };

  Subscriber.prototype = {
    // Mediator.Update on a subscriber instance can update its function,context,
    // or options object. It takes in an object and looks for fn, context, or
    // options keys.

    Update: function(options){
      if(options){
        this.fn = options.fn || this.fn;
        this.context = options.context || this.context;
        this.options = options.options || this.options;
        if (this.channel && this.options && this.options.priority != undefined) {
            this.channel.SetPriority(this.id, this.options.priority);
        }
      }
    }
  };


  function Channel(namespace){
    if (!this instanceof Channel) {
      return new Channel(namespace);
    }else{
      this.namespace = namespace || "";
      this._callbacks = [];
      this._channels = [];
      this.stopped = false;
    }
  };

  // A Mediator channel holds a list of sub-channels and callbacks to be fired
  // when Mediator.Publish is called on the Mediator instance. It also contains
  // some methods to manipulate its lists of data; only SetPriority and
  // StopPropagation are meant to be used. The other methods should be accessed
  // through the Mediator instance.

  Channel.prototype = {
    AddSubscriber: function(fn, options, context){
      var callback = new Subscriber(fn, options, context);

      if(options && options.priority !== undefined){
        options.priority = options.priority >> 0;

        if(options.priority < 0) options.priority = 0;
        if(options.priority > this._callbacks.length) options.priority = this._callbacks.length;

        this._callbacks.splice(options.priority, 0, callback);
      }else{
        this._callbacks.push(callback);
      }

      callback.channel = this;

      return callback;
    },

    // The channel instance is passed as an argument to the mediator callback,
    // and further callback propagation can be called with
    // channel.StopPropagation().
    StopPropagation: function(){
      this.stopped = true;
    },

    GetSubscriber: function(identifier){
      for(var x = 0, y = this._callbacks.length; x < y; x++){
        if(this._callbacks[x].id == identifier || this._callbacks[x].fn == identifier){
          return this._callbacks[x];
        }
      }

      for(var z in this._channels){
        if(this._channels.hasOwnProperty(z)){
          var sub = this._channels[z].GetSubscriber(identifier);
          if(sub !== undefined){
            return sub;
          }
        }
      }
    },

    // Channel.SetPriority is useful in updating the order in which Subscribers
    // are called, and takes an identifier (Callback id or named function) and
    // an array index. It will not search recursively through subchannels.

    SetPriority: function(identifier, priority){
      var oldIndex = 0;

      for(var x = 0, y = this._callbacks.length; x < y; x++){
        if(this._callbacks[x].id == identifier || this._callbacks[x].fn == identifier){
          break;
        }
        oldIndex ++;
      }

      var sub = this._callbacks[oldIndex],
          firstHalf = this._callbacks.slice(0, oldIndex),
          lastHalf = this._callbacks.slice(oldIndex+1);

      this._callbacks = firstHalf.concat(lastHalf);
      this._callbacks.splice(priority, 0, sub);

    },

    AddChannel: function(channel){
      this._channels[channel] = new Channel((this.namespace ? this.namespace + ':' : '') + channel);
    },

    HasChannel: function(channel){
      return this._channels.hasOwnProperty(channel);
    },

    ReturnChannel: function(channel){
      return this._channels[channel];
    },

    // This will remove a subscriber recursively through its subchannels.

    RemoveSubscriber: function(identifier){
      if(!identifier){
        this._callbacks = [];

        for(var z in this._channels){
          if(this._channels.hasOwnProperty(z)){
            this._channels[z].RemoveSubscriber(identifier);
          }
        }
      }

      for(var y = 0, x = this._callbacks.length; y < x; y++) {
        if(this._callbacks[y].fn == identifier || this._callbacks[y].id == identifier){
          this._callbacks[y].channel = null;
          this._callbacks.splice(y,1);
          x--; y--;
        }
      }
    },

    // This will publish arbitrary arguments to a subscriber recursively
    // through its subchannels.

    Publish: function(data){
      for(var y = 0, x = this._callbacks.length; y < x; y++) {
        if(!this.stopped){
          var callback = this._callbacks[y], l;

          if(callback.options !== undefined && typeof callback.options.predicate === "function"){
            if(callback.options.predicate.apply(callback.context, data)){
              callback.fn.apply(callback.context, data);
            }
          }else{
            callback.fn.apply(callback.context, data);
          }
        }

        l = this._callbacks.length;
        if(l < x) y--; x = l;
      }

      for(var x in this._channels){
        if(!this.stopped){
          if(this._channels.hasOwnProperty(x)){
            this._channels[x].Publish(data);
          }
        }
      }

      this.stopped = false;
    }
  };

  function Mediator() {
    if (!this instanceof Mediator) {
      return new Mediator();
    }else{
      this._channels = new Channel('');
    }
  };

  // A Mediator instance is the interface through which events are registered
  // and removed from publish channels.

  Mediator.prototype = {

    // Returns a channel instance based on namespace, for example
    // application:chat:message:received

    GetChannel: function(namespace){
      var channel = this._channels;
      var namespaceHierarchy = namespace.split(':');

      if(namespace === ''){
        return channel;
      }

      if(namespaceHierarchy.length > 0){
        for(var i = 0, j = namespaceHierarchy.length; i < j; i++){

          if(!channel.HasChannel(namespaceHierarchy[i])){
            channel.AddChannel(namespaceHierarchy[i]);
          }

          channel = channel.ReturnChannel(namespaceHierarchy[i]);
        }
      }

      return channel;
    },

    // Pass in a channel namespace, function to be called, options, and context
    // to call the function in to Subscribe. It will create a channel if one
    // does not exist. Options can include a predicate to determine if it
    // should be called (based on the data published to it) and a priority
    // index.

    Subscribe: function(channelName, fn, options, context){
      var options = options || {},
          context = context || {},
          channel = this.GetChannel(channelName),
          sub = channel.AddSubscriber(fn, options, context);

      return sub;
    },

    // Returns a subscriber for a given subscriber id / named function and
    // channel namespace

    GetSubscriber: function(identifier, channel){
      return this.GetChannel(channel || "").GetSubscriber(identifier);
    },

    // Remove a subscriber from a given channel namespace recursively based on
    // a passed-in subscriber id or named function.

    Remove: function(channelName, identifier){
      this.GetChannel(channelName).RemoveSubscriber(identifier);
    },

    // Publishes arbitrary data to a given channel namespace. Channels are
    // called recursively downwards; a post to application:chat will post to
    // application:chat:receive and application:chat:derp:test:beta:bananas.
    // Called using Mediator.Publish("application:chat", [ args ]);

    Publish: function(channelName){
      var args = Array.prototype.slice.call(arguments, 1),
          channel = this.GetChannel(channelName);

      args.push(channel);

      this.GetChannel(channelName).Publish(args);
    }
  };

  // Finally, expose it all.

  root.Mediator = Mediator;
  Mediator.Channel = Channel;
  Mediator.Subscriber = Subscriber;

})(typeof exports == "undefined" ? window : exports);

