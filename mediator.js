/*!
* Mediator.js Library v0.7.0
* https://github.com/ajacksified/Mediator.js
*
* Copyright 2013, Jack Lawson
* MIT Licensed (http://www.opensource.org/licenses/mit-license.php)
*
* For more information: http://thejacklawson.com/2011/06/mediators-for-modularized-asynchronous-programming-in-javascript/index.html
* Project on GitHub: https://github.com/ajacksified/Mediator.js
*
* Last update: Jan 04 2013
*/

(function(root, factory) {
  if (typeof exports === 'function') {
    // Node/CommonJS
    exports.Mediator = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], function() {
      // export to global too for backward compatiblity
      return (root.Mediator = factory());
    });
  } else {
    // browser global
    root.Mediator = factory();
  }
})(this, function() {

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
      return new Subscriber(fn, options, context);
    }else{
      this.id = guidGenerator();
      this.fn = fn;
      this.options = options;
      this.context = context;
      this.channel = null;
    }
  };

  Subscriber.prototype = {
    // Mediator.update on a subscriber instance can update its function,context,
    // or options object. It takes in an object and looks for fn, context, or
    // options keys.

    update: function(options){
      if(options){
        this.fn = options.fn || this.fn;
        this.context = options.context || this.context;
        this.options = options.options || this.options;
        if (this.channel && this.options && this.options.priority != undefined) {
            this.channel.setPriority(this.id, this.options.priority);
        }
      }
    }
  };


  function Channel(namespace, parent){
    if (!this instanceof Channel) {
      return new Channel(namespace);
    }else{
      this.namespace = namespace || "";
      this._callbacks = [];
      this._channels = [];
      this._parent = parent;
      this.stopped = false;
    }
  };

  // A Mediator channel holds a list of sub-channels and callbacks to be fired
  // when Mediator.publish is called on the Mediator instance. It also contains
  // some methods to manipulate its lists of data; only setPriority and
  // StopPropagation are meant to be used. The other methods should be accessed
  // through the Mediator instance.

  Channel.prototype = {
    addSubscriber: function(fn, options, context){
      var callback = new Subscriber(fn, options, context);

      if(options && options.priority !== undefined){
        options.priority = options.priority >> 0;

        if(options.priority < 0) options.priority = 0;
        if(options.priority >= this._callbacks.length) options.priority = this._callbacks.length-1;

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
    stopPropagation: function(){
      this.stopped = true;
    },

    getSubscriber: function(identifier){
      var x = 0,
          sub, z;

      for(x = 0, y = this._callbacks.length; x < y; x++){
        if(this._callbacks[x].id == identifier || this._callbacks[x].fn == identifier){
          return this._callbacks[x];
        }
      }
    },

    // Channel.setPriority is useful in updating the order in which Subscribers
    // are called, and takes an identifier (Callback id or named function) and
    // an array index. It will not search recursively through subchannels.

    setPriority: function(identifier, priority){
      var oldIndex = 0,
          x = 0,
          sub, firstHalf, lastHalf;

      for(x = 0, y = this._callbacks.length; x < y; x++){
        if(this._callbacks[x].id == identifier || this._callbacks[x].fn == identifier){
          break;
        }
        oldIndex ++;
      }

      sub = this._callbacks[oldIndex];
      firstHalf = this._callbacks.slice(0, oldIndex);
      lastHalf = this._callbacks.slice(oldIndex+1);

      this._callbacks = firstHalf.concat(lastHalf);
      this._callbacks.splice(priority, 0, sub);
    },

    addChannel: function(channel){
      this._channels[channel] = new Channel((this.namespace ? this.namespace + ':' : '') + channel, this);
    },

    hasChannel: function(channel){
      return this._channels.hasOwnProperty(channel);
    },

    returnChannel: function(channel){
      return this._channels[channel];
    },

    // This will remove a subscriber recursively through its subchannels.

    removeSubscriber: function(identifier){
      var y = 0,
          x, z;

      if(!identifier){
        this._callbacks = [];

        for(z in this._channels){
          if(this._channels.hasOwnProperty(z)){
            this._channels[z].removeSubscriber(identifier);
          }
        }
      }

      for(y = 0, x = this._callbacks.length; y < x; y++) {
        if(this._callbacks[y].fn == identifier || this._callbacks[y].id == identifier){
          this._callbacks[y].channel = null;
          this._callbacks.splice(y,1);
          x--;
          y--;
        }
      }
    },

    // This will publish arbitrary arguments to a subscriber recursively
    // through its subchannels.

    publish: function(data){
      var y = 0, x, callback, l;

      for(y = 0, x = this._callbacks.length; y < x; y++) {
        if(!this.stopped){
          callback = this._callbacks[y];

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

      if(this._parent){
        this._parent.publish(data);
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

    // returns a channel instance based on namespace, for example
    // application:chat:message:received

    getChannel: function(namespace){
      var channel = this._channels,
          namespaceHierarchy = namespace.split(':'),
          i;

      if(namespace === ''){
        return channel;
      }

      if(namespaceHierarchy.length > 0){
        for(i = 0, j = namespaceHierarchy.length; i < j; i++){

          if(!channel.hasChannel(namespaceHierarchy[i])){
            channel.addChannel(namespaceHierarchy[i]);
          }

          channel = channel.returnChannel(namespaceHierarchy[i]);
        }
      }

      return channel;
    },

    // Pass in a channel namespace, function to be called, options, and context
    // to call the function in to Subscribe. It will create a channel if one
    // does not exist. Options can include a predicate to determine if it
    // should be called (based on the data published to it) and a priority
    // index.

    subscribe: function(channelName, fn, options, context){
      var options = options || {},
          context = context || {},
          channel = this.getChannel(channelName),
          sub = channel.addSubscriber(fn, options, context);

      return sub;
    },

    // returns a subscriber for a given subscriber id / named function and
    // channel namespace

    getSubscriber: function(identifier, channel){
      return this.getChannel(channel || "").getSubscriber(identifier);
    },

    // remove a subscriber from a given channel namespace recursively based on
    // a passed-in subscriber id or named function.

    remove: function(channelName, identifier){
      this.getChannel(channelName).removeSubscriber(identifier);
    },

    // publishes arbitrary data to a given channel namespace. Channels are
    // called recursively downwards; a post to application:chat will post to
    // application:chat:receive and application:chat:derp:test:beta:bananas.
    // Called using Mediator.publish("application:chat", [ args ]);

    publish: function(channelName){
      var args = Array.prototype.slice.call(arguments, 1),
          channel = this.getChannel(channelName);

      args.push(channel);

      this.getChannel(channelName).publish(args);
    }
  };

  // Finally, expose it all.

  Mediator.Channel = Channel;
  Mediator.Subscriber = Subscriber;
  return Mediator;

});

