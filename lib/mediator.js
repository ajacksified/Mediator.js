/*jslint bitwise: true, nomen: true, plusplus: true, white: true */

/*!
* Mediator.js Library v0.9.8
* https://github.com/ajacksified/Mediator.js
*
* Copyright 2013, Jack Lawson
* MIT Licensed (http://www.opensource.org/licenses/mit-license.php)
*
* For more information: http://thejacklawson.com/2011/06/mediators-for-modularized-asynchronous-programming-in-javascript/index.html
* Project on GitHub: https://github.com/ajacksified/Mediator.js
*
* Last update: October 19 2013
*/

(function(global, factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    // AMD
    define('mediator-js', [], function() {
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

  // A Mediator channel holds a list of sub-channels and subscribers to be fired
  // when Mediator.publish is called on the Mediator instance. It also contains
  // some methods to manipulate its lists of data; only setPriority and
  // StopPropagation are meant to be used. The other methods should be accessed
  // through the Mediator instance.
  Channel.prototype.addSubscriber = function(fn, options, context) {
    var subscriber = new Subscriber(fn, options, context);

    if (options && options.priority !== undefined) {
      // Cheap hack to either parse as an int or turn it into 0. Runs faster
      // in many browsers than parseInt with the benefit that it won't
      // return a NaN.
      options.priority = options.priority >> 0;

      if (options.priority < 0) { options.priority = 0; }
      if (options.priority >= this._subscribers.length) { options.priority = this._subscribers.length-1; }

      this._subscribers.splice(options.priority, 0, subscriber);
    }else{
      this._subscribers.push(subscriber);
    }

    subscriber.channel = this;

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
    var oldIndex = 0,
        x = 0,
        sub, firstHalf, lastHalf, y;

    for(x = 0, y = this._subscribers.length; x < y; x++) {
      if (this._subscribers[x].id === identifier || this._subscribers[x].fn === identifier) {
        break;
      }
      oldIndex ++;
    }

    sub = this._subscribers[oldIndex];
    firstHalf = this._subscribers.slice(0, oldIndex);
    lastHalf = this._subscribers.slice(oldIndex+1);

    this._subscribers = firstHalf.concat(lastHalf);
    this._subscribers.splice(priority, 0, sub);
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

  Channel.prototype.removeSubscriber = function(identifier) {
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

  Mediator.prototype.remove = function(channelName, identifier) {
    var channel = this.getChannel(channelName || "", true);
    if (channel.namespace !== channelName) {
      return false;
    }

    channel.removeSubscriber(identifier);
  }

  // Publishes arbitrary data to a given channel namespace. Channels are
  // called recursively downwards; a post to application:chat will post to
  // application:chat:receive and application:chat:derp:test:beta:bananas.
  // Called using Mediator.publish("application:chat", [ args ]);

  Mediator.prototype.publish = function(channelName) {
    var channel = this.getChannel(channelName || "", true);
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
  Mediator.version = "0.9.8";

  return Mediator;
}));
