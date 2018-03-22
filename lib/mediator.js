/*jslint bitwise: true, nomen: true, plusplus: true, white: true */

/*!
* Mediator.js Library v0.11.0
* https://github.com/ajacksified/Mediator.js
*
* Copyright 2018, Jack Lawson
* MIT Licensed (http://www.opensource.org/licenses/mit-license.php)
*
* For more information: http://thejacklawson.com/2011/06/mediators-for-modularized-asynchronous-programming-in-javascript/index.html
* Project on GitHub: https://github.com/ajacksified/Mediator.js
*
* Last update: 22 Mar 2018
*/

(function(global, factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    // AMD
    define([], function() {
      global.Mediator = factory();
      return global.Mediator;
    });
  } else if (typeof exports !== 'undefined') {
    // Node/CommonJS
    exports.Mediator = factory();
  } else {
    // Browser global
    global.Mediator = factory();
  }
}(this, function() {
  'use strict';

  // We'll generate guids for class instances for easy referencing later on.
  // Subscriber instances will have an id that can be refernced for quick
  // lookups.

  function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };

    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  }

  // Subscribers are instances of Mediator Channel registrations. We generate
  // an object instance so that it can be updated later on without having to
  // unregister and re-register. Subscribers are constructed with a function
  // to be called, options object, and context.

  function Subscriber(fn, options, context) {
    if (!(this instanceof Subscriber)) {
      return new Subscriber(fn, options, context);
    }

    this.id = guidGenerator();
    this.fn = fn;
    this.options = options;
    this.context = context;
    this.channel = null;
  }

  // Mediator.update on a subscriber instance can update its function,context,
  // or options object. It takes in an object and looks for fn, context, or
  // options keys.
  Subscriber.prototype.update = function(options) {
    if (options) {
      this.fn = options.fn || this.fn;
      this.context = options.context || this.context;
      this.options = options.options || this.options;
      if (this.channel && this.options && this.options.priority !== undefined) {
          this.channel.setPriority(this.id, this.options.priority);
      }
    }
  }

  // A Mediator channel holds a list of sub-channels and subscribers to be fired
  // when Mediator.publish is called on the Mediator instance. It also contains
  // some methods to manipulate its lists of data; only setPriority and
  // StopPropagation are meant to be used. The other methods should be accessed
  // through the Mediator instance.

  function Channel(namespace, parent) {
    if (!(this instanceof Channel)) {
      return new Channel(namespace);
    }

    this.namespace = namespace || "";
    this._subscribers = [];
    this._channels = {};
    this._parent = parent;
    this.stopped = false;
  }

  // Sort function for sorting the channels based on their priority. The sort will
  // place the channel with the highest priority in the first place of the array,
  // all other channels will be added in descending order. i.g. a channel with a
  // priority of 9 will be placed before a channel with a priority of 3
  Channel.prototype.channelPrioritySort = function(a, b) {
    if (a.options.priority > b.options.priority) {
      return -1;
    } else if (a.options.priority < b.options.priority) {
      return 1;
    }
    return 0;
  };

  Channel.prototype.addSubscriber = function(fn, options, context){
    // Make sure there is always an options object
    if (!options) {
      options = { priority: 0 };
    }

    // Cheap hack to either parse as an int or turn it into 0. Runs faster
    // in many browsers than parseInt with the benefit that it won't
    // return a NaN.
    options.priority = options.priority | 0;

    var subscriber = new Subscriber(fn, options, context);
    subscriber.channel = this;

    this._subscribers.push(subscriber);
    this._subscribers.sort(this.channelPrioritySort);

    return subscriber;
  }

  // The channel instance is passed as an argument to the mediator subscriber,
  // and further subscriber propagation can be called with
  // channel.StopPropagation().
  Channel.prototype.stopPropagation = function() {
    this.stopped = true;
  }

  Channel.prototype.getSubscriber = function(identifier) {
    var x = 0,
        y = this._subscribers.length;

    for(x, y; x < y; x++) {
      if (this._subscribers[x].id === identifier || this._subscribers[x].fn === identifier) {
        return this._subscribers[x];
      }
    }
  }

  // Channel.setPriority is useful in updating the order in which Subscribers
  // are called, and takes an identifier (subscriber id or named function) and
  // an array index. It will not search recursively through subchannels.

  Channel.prototype.setPriority = function(identifier, priority) {
    var x = 0,
        y = this._subscribers.length;

    for(; x<y; x++) {
      if (this._subscribers[x].id === identifier || this._subscribers[x].fn === identifier){
        this._subscribers[x].priority = priority;
        break;
      }
    }

    this._subscribers.sort(this.channelPrioritySort);
  }

  Channel.prototype.addChannel = function(channel) {
    this._channels[channel] = new Channel((this.namespace ? this.namespace + ':' : '') + channel, this);
  }

  Channel.prototype.hasChannel = function(channel) {
    return this._channels.hasOwnProperty(channel);
  }

  Channel.prototype.returnChannel = function(channel) {
    return this._channels[channel];
  }

  Channel.prototype.removeSubscriber = function(identifier, autoCleanup) {
    var x = this._subscribers.length - 1;

    autoCleanup = (typeof autoCleanup === 'undefined') ? true : autoCleanup;

    // If we don't pass in an id, we're clearing all
    if(!identifier){
      this._subscribers = [];
    } else {
      // Going backwards makes splicing a whole lot easier.
      for(x; x >= 0; x--) {
        if(this._subscribers[x].fn === identifier || this._subscribers[x].id === identifier){
          this._subscribers[x].channel = null;
          this._subscribers.splice(x,1);
        }
      }
    }

    // Check if we should attempt to automatically clean up the channel
    if (autoCleanup) {
      this.autoCleanChannel();
    }

    var x = this._subscribers.length - 1;

    // If we don't pass in an id, we're clearing all
    if (!identifier) {
      this._subscribers = [];
      return;
    }

    // Going backwards makes splicing a whole lot easier.
    for(x; x >= 0; x--) {
      if (this._subscribers[x].fn === identifier || this._subscribers[x].id === identifier) {
        this._subscribers[x].channel = null;
        this._subscribers.splice(x,1);
      }
    }
  }

  Channel.prototype.autoCleanChannel = function() {
    // First make sure there are no more subscribers, if there are we
    // can stop processing the channel any further
    if (this._subscribers.length !== 0) {
      return;
    }

    // Next we need to make sure there are no more sub-channels that
    // have this channel as its parent channel. We try to iterate over the
    // properties of _channels and as soon as we find a property we've
    // set we will stop processing the channel any further
    for (var key in this._channels) {
      if (this._channels.hasOwnProperty(key)) {
        return;
      }
    }

    // The last check before we can remove the channel is to see if it
    // has a parent. If there is no parent we don't want to remove this
    // channel
    if (this._parent != null) {
      // We need the ID by which this channel is known to its parent, it should
      // be the last part of the namespace. We need split the namespace up and
      // take its last element to pass along to the removeChannel method
      var path = this.namespace.split(':'),
          channelName = path[path.length - 1];
      // The parent of the current channel to remove this channel
      this._parent.removeChannel(channelName);
    }
  }

  Channel.prototype.removeChannel = function(channelName) {
    if (this.hasChannel(channelName)) {
      this._channels[channelName] = null;
      delete this._channels[channelName];
      // After removing a sub-channel we can check if that makes this channel
      // suitable for auto clean up
      this.autoCleanChannel();
    }
  };


  // This will publish arbitrary arguments to a subscriber and then to parent
  // channels.

  Channel.prototype.publish = function(data) {
    var x = 0,
        y = this._subscribers.length,
        shouldCall = false,
        subscriber, l,
        subsBefore,subsAfter;

    // Priority is preserved in the _subscribers index.
    for(x, y; x < y; x++) {
      // By default set the flag to false
      shouldCall = false;
      subscriber = this._subscribers[x];

      if (!this.stopped) {
        subsBefore = this._subscribers.length;
        if (subscriber.options !== undefined && typeof subscriber.options.predicate === "function") {
          if (subscriber.options.predicate.apply(subscriber.context, data)) {
            // The predicate matches, the callback function should be called
            shouldCall = true;
          }
        }else{
          // There is no predicate to match, the callback should always be called
          shouldCall = true;
        }
      }

      // Check if the callback should be called
      if (shouldCall) {
        // Check if the subscriber has options and if this include the calls options
        if (subscriber.options && subscriber.options.calls !== undefined) {
          // Decrease the number of calls left by one
          subscriber.options.calls--;
          // Once the number of calls left reaches zero or less we need to remove the subscriber
          if (subscriber.options.calls < 1) {
            this.removeSubscriber(subscriber.id);
          }
        }
        // Now we call the callback, if this in turns publishes to the same channel it will no longer
        // cause the callback to be called as we just removed it as a subscriber
        subscriber.fn.apply(subscriber.context, data);

        subsAfter = this._subscribers.length;
        y = subsAfter;
        if (subsAfter === subsBefore - 1) {
          x--;
        }
      }
    }

    if (this._parent) {
      this._parent.publish(data);
    }

    this.stopped = false;
  }

  function Mediator() {
    if (!(this instanceof Mediator)) {
      return new Mediator();
    }

    this._channels = new Channel('');
  }

  // A Mediator instance is the interface through which events are registered
  // and removed from publish channels.

  // Returns a channel instance based on namespace, for example
  // application:chat:message:received. If readOnly is true we
  // will refrain from creating non existing channels.
  Mediator.prototype.getChannel = function(namespace, readOnly) {
    var channel = this._channels,
        namespaceHierarchy = namespace.split(':'),
        x = 0,
        y = namespaceHierarchy.length;

    if (namespace === '') {
      return channel;
    }

    if (namespaceHierarchy.length > 0) {
      for(x, y; x < y; x++) {

        if (!channel.hasChannel(namespaceHierarchy[x])) {
          if (readOnly) {
            break;
          } else {
            channel.addChannel(namespaceHierarchy[x]);
          }
        }

        channel = channel.returnChannel(namespaceHierarchy[x]);
      }
    }

    return channel;
  }

  // Pass in a channel namespace, function to be called, options, and context
  // to call the function in to Subscribe. It will create a channel if one
  // does not exist. Options can include a predicate to determine if it
  // should be called (based on the data published to it) and a priority
  // index.

  Mediator.prototype.subscribe = function(channelName, fn, options, context) {
    var channel = this.getChannel(channelName || "", false);

    options = options || {};
    context = context || {};

    return channel.addSubscriber(fn, options, context);
  }

  // Pass in a channel namespace, function to be called, options, and context
  // to call the function in to Subscribe. It will create a channel if one
  // does not exist. Options can include a predicate to determine if it
  // should be called (based on the data published to it) and a priority
  // index.

  Mediator.prototype.once = function(channelName, fn, options, context) {
    options = options || {};
    options.calls = 1;

    return this.subscribe(channelName, fn, options, context);
  }

  // Returns a subscriber for a given subscriber id / named function and
  // channel namespace

  Mediator.prototype.getSubscriber = function(identifier, channelName) {
    var channel = this.getChannel(channelName || "", true);
    // We have to check if channel within the hierarchy exists and if it is
    // an exact match for the requested channel
    if (channel.namespace !== channelName) {
      return null;
    }

    return channel.getSubscriber(identifier);
  }

  // Remove a subscriber from a given channel namespace recursively based on
  // a passed-in subscriber id or named function.

  Mediator.prototype.remove = function(channelName, identifier, autoClean) {
    var channel = this.getChannel(channelName || "", true);

    if (channel.namespace !== channelName) {
      return false;
    }

    channel.removeSubscriber(identifier, autoClean);
  }


  // Publishes arbitrary data to a given channel namespace. Channels are
  // called recursively downwards; a post to application:chat will post to
  // application:chat:receive and application:chat:derp:test:beta:bananas.
  // Called using Mediator.publish("application:chat", [ args ]);

  Mediator.prototype.publish = function(channelName) {
    var channel = this.getChannel(channelName || "", false);
    if (channel.namespace !== channelName) {
      return null;
    }

    var args = Array.prototype.slice.call(arguments, 1);

    args.push(channel);

    channel.publish(args);
  }

  // Alias some common names for easy interop
  Mediator.prototype.on = Mediator.prototype.subscribe;
  Mediator.prototype.bind = Mediator.prototype.subscribe;
  Mediator.prototype.emit = Mediator.prototype.publish;
  Mediator.prototype.trigger = Mediator.prototype.publish;
  Mediator.prototype.off = Mediator.prototype.remove;

  // Finally, expose it all.

  Mediator.Channel = Channel;
  Mediator.Subscriber = Subscriber;
  Mediator.version = "0.10.1";

  return Mediator;
}));
