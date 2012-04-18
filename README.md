Mediator.js
===========
Version 0.7.0

For more information, please see 

[my blog post](http://thejacklawson.com/2011/06/mediators-for-modularized-asynchronous-programming-in-javascript/)

[View the project on Github](https://github.com/ajacksified/Mediator.js)

[View the documentation](hhttp://thejacklawson.com/Mediator.js/)

Documentation built using [Paige](https://github.com/rthauby/Paige)

A light utility class to help implement the Mediator pattern to ease asynchronous programming
---------------------------------------------

Mediator is a simple class that allows you to register, unregister, and call 
subscriber methods to help event-based, asyncronous programming.  Its purpose 
is to make the usage of WebSockets, AJAX calls, or any other asynchronous 
operations easier to maintain and test.

*<1k bytes, minifed and gzipped*

Why?
---
My specific use case: bind elements easily for websocket callbacks. But, you
may find usage in it for all kinds of things: as an event management system,
to decouple calls between javascript functions, ajax request callbacks, and
more. There's an excellent article that talks about Mediators more in detail
by [Addy Osmani](http://addyosmani.com/largescalejavascript/#mediatorpattern)
(that made me go back and refactor this code a bit.)

Usage
-----

You can register events with the mediator two ways: using channels, or with a 
predicate to perform more complex matching. Predicates are run using whatever
args are passed in by the publishing class. Instantiate a new mediator, and
then you can being subscribing, removing, and publishing.

Subscription signature:

    (channel, callback, <options>, <context>);
    Mediator.Publish(channel, <data, data, ... >)
    Mediator.Remove(<channel>) 

Callback signature:

    function(<data, data ...>, channel);
    

Mediator.Subscribe options (all are optional; default is empty):

    { 
      predicate: function(*args){ return arg1 == arg2; } 
      priority: 0|1|... (array index; max of callback array length, min of 0)
    }

Subscriber object (returned on Mediator.Subscribe):

    {
      id, // guid
      fn, // function
      options, // options
      context, // context for fn to be called within
      channel, // provides a pointer back to its channel
      Update(options){ ...} // function that accepts { fn, options, context }
    }

Examples:

    var mediator = new Mediator();

    // Alert data when the "message" channel is published to
    // Subscribe returns a "Subscriber" object
    mediator.Subscribe("message", function(data){ alert(data); });
    mediator.Publish("message", "Hello, world");
    
    // Alert the "message" property of the object called when the predicate function returns true (The "From" property is equal to "Jack")
    var predicate = function(data){ return data.From === "Jack" };
    mediator.Subscribe("channel", function(data){ alert(data.Message); }, { predicate: predicate });
    mediator.Publish("channel", { Message: "Hey!", From: "Jack" }); //alerts
    mediator.Publish("channel", { Message: "Hey!", From: "Audrey" }); //doesn't alert

You can remove events by passing in a type or predicate, and optionally the 
function to remove. Predicates and functions must be named- not anonymous- 
to be able to be removed.

    // removes all methods bound to a channel 
    mediator.Remove("channel");
    
    // unregisters *only* MethodFN, a named function, from "channel" 
    mediator.Remove("channel", MethodFN);
    
You can call the registered functions with the Publish method, which accepts 
an args array:

    mediator.Publish("channel", "argument", "another one", { etc: true }); // args go on forever

As of version 0.4, you can namespace your subscribing / removing / publishing as such:

    mediator.Subscribe("application:chat:receiveMessage", function(data){ ... });
    
    // will recursively call anything in the appllication:chat:receiveMessage namespace 
    mediator.Publish("application:chat:receiveMessage", "Jack Lawson", "Hey");
    
    // will recursively remove everything under application:chat
    mediator.Remove("application:chat");

You can update Subscriber priority:

    var sub = mediator.Subscribe("application:chat", function(data){ ... });
    var sub2 = mediator.Subscribe("application:chat", function(data){ ... });

    // have sub2 executed first
    mediator.GetChannel("application:chat").SetPriority(sub2.id, 0);

You can update Subscriber callback, context, and/or options:

    sub.Update({ fn: ..., context: { }, options: { ... });

You can stop the chain of execution by calling channel.StopPropagation():

    // for example, let's not post the message if the from and to are the same
    mediator.Subscribe("application:chat", function(data, channel){
      //something with data
      channel.stopPropagation();
    }, options: {
      predicate: function(data){ return data.From == data.To },
      priority: 0
    });

Changes from Last Version
-------------------------
Version 0.6.1
* Cleaned up some typos
* Save pointer to channel within subscription
* Save namespace in channel
* Fixed bugs in SetPriority

Version 0.6.0
* Added ability to stop the chain of calls using c.stopPropagation()

Version 0.5.0
* Added ability to access and update subscribing objects
  * Subscribers now have a unique ID and can be queried by id or by function
  * Subscriber class can have its function, context, or options updated
  * Subscriber priority can be updated post-addition
  * Channels made public by Mediator.GetChannel
  * Added a little performance test

Version 0.4.2
* Added Priority to calls, allowing you to set callback index

Version 0.4.1
* Minor internal updates

Version 0.4.0
* Predicate no longer acts as a channel and is moved to an options object
at the end of the subcription call.
* Signatures changed; context moved to the end of subscriptions
* Namespacing for subscription binding


License
-------
This class and its accompanying README and are 
[MIT licensed](http://www.opensource.org/licenses/mit-license.php). 


Also uses unmodified [Jasmine](http://pivotal.github.com/jasmine/) 
for testing (MIT licensed as well.)

In Closing
----------
Have fun, and please submit suggestions and improvements! You can leave any 
issues here, or contact me on Twitter (@ajacksified).
