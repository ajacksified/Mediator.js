Mediator.js
===========
Version 0.9.0

__Breaking changes since version 0.7.0:__ see changelog below

For more information, please see 

[Relevant blog post](http://thejacklawson.com/2011/06/mediators-for-modularized-asynchronous-programming-in-javascript/)

[View the project on Github](https://github.com/ajacksified/Mediator.js)

[View the documentation](http://thejacklawson.com/Mediator.js/)

Documentation built using [Paige](https://github.com/rthauby/Paige)

A light utility class to help implement the Mediator pattern for easy eventing
------------------------------------------------------------------------------

Mediator is a simple class that allows you to register, unregister, and call
subscriber methods to help event-based, asyncronous programming.  Its purpose
is to make the usage of WebSockets, Ajax calls, DOM events, or any other
asynchronous operations easy to maintain and test.

*1.12kb, minifed and gzipped*

Why?
---
My specific use case: bind elements easily for WebSocket callbacks. But, you
may find usage in it for all kinds of things: as an event management system,
to decouple calls between javascript functions, Ajax request callbacks, and
more. There's an excellent online book that talks about Mediators more in detail
by [Addy Osmani](http://addyosmani.com/resources/essentialjsdesignpatterns/book/#mediatorpatternjavascript).

Usage
-----

You can register events with the mediator two ways using channels. You can add
a predicate to perform more complex matching.  Instantiate a new mediator, and
then you can being subscribing, removing, and publishing.

Subscription signature:

    Mediator.subscribe(channel, callback, <options>, <context>);
    Mediator.publish(channel, <data, data, ... >)
    Mediator.remove(channel, <identifier>)

Additionally, `on` and `bind` are aliased to `subscribe`, and `trigger` and
`emit` are bound to `publish`. `off` is an alias for `remove`. You can use
`once` to subscribe to an event that should only be fired once.

Subscriber signature:

    function(<data, data ...>, channel);

The channel is always returned as the last argument to subscriber functions.

Mediator.subscribe options (all are optional; default is empty):

    {
      predicate: function(*args){ ... }
      priority: 0|1|... 
      calls: 1|2|...
    }

Predicates return a boolean and are run using whatever args are passed in by the
publishing class. If the boolean is true, the subscriber is run.

Priority marks the order in which a subscriber is called.

`calls` allows you to specify how many times the subscriber is called before it
is automatically removed. This is decremented each time it is called until it
reaches 0 and is removed. If it has a predicate and the predicate does not match,
calls is not decremented.

A Subscriber object is returned when calling Mediator.subscribe. It allows you
to update options on a given subscriber, or to reference it by an id for easy
removal later.

    {
      id, // guid
      fn, // function
      options, // options
      context, // context for fn to be called within
      channel, // provides a pointer back to its channel
      update(options){ ...} // update the subscriber ({ fn, options, context })
    }

Examples:

    var mediator = new Mediator();

    // Alert data when the "message" channel is published to
    // Subscribe returns a "Subscriber" object
    mediator.subscribe("message", function(data){ alert(data); });
    mediator.publish("message", "Hello, world");

    // Alert the "message" property of the object called when the predicate function returns true (The "From" property is equal to "Jack")
    var predicate = function(data){ return data.From === "Jack" };
    mediator.subscribe("channel", function(data){ alert(data.Message); }, { predicate: predicate });
    mediator.publish("channel", { Message: "Hey!", From: "Jack" }); //alerts
    mediator.publish("channel", { Message: "Hey!", From: "Audrey" }); //doesn't alert

You can remove events by passing in a channel, or a channel and the
function to remove or subscriber id. If you only pass in a channel,
all subscribers are removed.

    // removes all methods bound directly to a channel, but not subchannels
    mediator.remove("channel");

    // unregisters *only* MethodFN, a named function, from "channel"
    mediator.remove("channel", MethodFN);

You can call the registered functions with the Publish method, which accepts 
an args array:

    mediator.publish("channel", "argument", "another one", { etc: true });

You can namespace your subscribing / removing / publishing as such:

    mediator.subscribe("application:chat:receiveMessage", function(data){ ... });

    // will call parents of the appllication:chat:receiveMessage namespace
    // (that is, next it will call all subscribers of application:chat, and then
    // application). It will not recursively call subchannels - only direct subscribers.
    mediator.publish("application:chat:receiveMessage", "Jack Lawson", "Hey");

You can update Subscriber priority:

    var sub = mediator.subscribe("application:chat", function(data){ ... });
    var sub2 = mediator.subscribe("application:chat", function(data){ ... });

    // have sub2 executed first
    mediator.getChannel("application:chat").setPriority(sub2.id, 0);

You can update Subscriber callback, context, and/or options:

    sub.update({ fn: ..., context: { }, options: { ... });

You can stop the chain of execution by calling channel.stopPropagation():

    // for example, let's not post the message if the from and to are the same
    mediator.subscribe("application:chat", function(data, channel){
      alert("Don't send messages to yourself!");
      channel.stopPropagation();
    }, options: {
      predicate: function(data){ return data.From == data.To },
      priority: 0
    });

Changes from Last Version
-------------------------

__Version 0.9.0__

* Reversed order of recursion: now calls parents instead of children channels
* Lowercase methods
* Aliases: `on` and `bind` are aliased to `subscribe`, and `trigger` and
`emit` are bound to `publish`. `off` is an alias for `remove`.
* Moved tests to mocha from jasmine
* Supports AMD, requirejs, and browser loading
* Lots of cleanup around extra variables, and jslinted
* Published to NPM under "mediator-js"
* Added travis-ci build

__Version 0.6.1__

* Cleaned up some typos
* Save pointer to channel within subscription
* Save namespace in channel
* Fixed bugs in SetPriority

__Version 0.6.0__

* Added ability to stop the chain of calls using c.stopPropagation()

__Version 0.5.0__

* Added ability to access and update subscribing objects
  * Subscribers now have a unique ID and can be queried by id or by function
  * Subscriber class can have its function, context, or options updated
  * Subscriber priority can be updated post-addition
  * Channels made public by Mediator.GetChannel
  * Added a little performance test

__Version 0.4.2__

* Added Priority to calls, allowing you to set callback index

__Version 0.4.1__

* Minor internal updates

__Version 0.4.0__

* Predicate no longer acts as a channel and is moved to an options object
at the end of the subcription call.
* Signatures changed; context moved to the end of subscriptions
* Namespacing for subscription binding

License
-------
This class and its accompanying README and are 
[MIT licensed](http://www.opensource.org/licenses/mit-license.php).

In Closing
----------
Have fun, and please submit suggestions and improvements! You can leave any
issues here, or contact me at ([@ajacksified](https://twitter.com/ajacksified)).
