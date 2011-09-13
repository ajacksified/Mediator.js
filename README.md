Mediator.js
===========
Version 04.
For more information, please see 
[my blog post](http://www.thejacklawson.com/index.php/2011/06/mediators-for-modularized-asynchronous-programming-in-javascript/)

A light utility class to help implement the Mediator pattern to ease asynchronous programming
---------------------------------------------

Mediator is a simple class that allows you to register, unregister, and call 
subscriber methods to help event-based, asyncronous programming.  Its purpose 
is to make the usage of WebSockets, AJAX calls, or any other asynchronous 
operations easier to maintain and test.

*590 bytes, minifed and gzipped*

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
then you can being subscribing, removing, and publishing. As of version 0.4,
Mediator.js supports namespacing.
    
    var mediator = new Mediator();

    // Alert data when the "message" channel is published to
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


Changes from Last Version
-------------------------
Predicate no longer acts as a channel and is moved to an options object
at the end of the subcription call.

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
