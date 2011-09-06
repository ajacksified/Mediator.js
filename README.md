Mediator.js
===========
Version 0.2
For more information, please see [my blog post](http://www.thejacklawson.com/index.php/2011/06/mediators-for-modularized-asynchronous-programming-in-javascript/)

A light utility class to help implement the Mediator pattern to ease asynchronous programming
---------------------------------------------

Mediator is a simple class that allows you to register, unregister, and call 
methods based on data passed in.  Its purpose is to make the usage of WebSockets, 
AJAX calls, or any other asynchronous operation easier to maintain and test.

*462 bytes, minifed and gzipped*

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
args are passed in by the publishing class.

    // Alert data when the "message" channel is published to
    Mediator.Subscribe("message", function(data){ alert(data); });
    Mediator.Publish("message", "Hello, world");
    
    // Alert the "message" property of the object called when the predicate function returns true (The "From" property is equal to "Jack")
    var predicate = function(data){ return data.From === "Jack" };
    Mediator.Subscribe(predicate, function(data){ alert(data.Message); });
    Mediator.Publish("channel", { Message: "Hey!", From: "Jack" }); //alerts
    Mediator.Publish("channel", { Message: "Hey!", From: "Audrey" }); //doesn't alert

You can remove events by passing in a type or predicate, and optionally the 
function to remove. Predicates and functions must be named- not anonymous- 
to be able to be removed.

    // removes all methods bound to a channel 
   Mediator.Remove("channel");
    
    // unregisters *only* MethodFN, a named function, from "channel" 
    Mediator.Remove("channel", MethodFN);
    
    // unregisters all callbacks otherwise called by the predicate PredicateFN
    Mediator.Remove(PredicateFN);
    
    // unregisters the MethodFN from PredicateFN
    Mediator.Remove(PredicateFN, MethodFN);

You can call the registered functions with the Publish method, which accepts 
an args array:

    Mediator.Publish("channel", "argument", "another one", { etc: true }); // args go on forever


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
