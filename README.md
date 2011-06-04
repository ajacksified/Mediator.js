Mediator.js
===========
For more information, please see http://www.thejacklawson.com/index.php/2011/06/mediators-for-modularized-asynchronous-programming-in-javascript/

A light utility class to help implement the Mediator pattern to ease asynchronous programming
---------------------------------------------

Mediator is a simple class that allows you to register, unregister, and call methods based on data passed in. Its purpose is to make the usage of WebSockets, AJAX calls, or any other asynchronous operation easier to maintain and test.

It is built under the assumption, though does not require, that it is accepting an object with a "Type" property. As an example:

    { Type: 1, From: "Jack", Message: "Hi, GitHub!" }

Usage
-----

You can register events with the mediator two ways: using the type property explained above, or with a predicate to perform more complex matching. Do note that all predicates are run upon receiving data. As an example:

    // Alert the "message" property of the object called when the Type property of the object is 1
    Mediator.Add(1, function(data){ alert(data.Message); });
    
    // Alert the "message" property of the object called when the predicate function returns true (The "From" property is equal to "Jack")
    Mediator.Add(function(data){ 
            return data.From == "Jack" 
        }, 
        function(data){ alert(data.Message);
     });

You can remove events by passing in a type or predicate, and optionally the function to remove. Predicates and functions must be named- not anonymous- to be able to be removed.

    // removes all methods to be called when a data.Type === 1
   Mediator.Remove(1);
    
    // unregisters MethodFN as something to be called when data.Type === 1
    Mediator.Remove(1, MethodFN);
    
    // unregisters the predicate PredicateFN
    Mediator.Remove(PredicateFN);
    
    // unregisters the MethodFN from PredicateFN
    Mediator.Remove(PredicateFN, MethodFN);

You can call the registered functions with the Call method, which accepts an object:

    Mediator.Call({ Type: 1, Message: "Hi, Github", From: "Jack" });

This would normally be called on the success event of an AJAX call or onmessage for a WebSocket implementation. Or, perhaps it's called through DOM events, or through a timer... anytime we need asyncronous calls.

License
-------
This class and its accompanying README and test.html file are MIT licensed: http://www.opensource.org/licenses/mit-license.php

In Closing
----------
Have fun, and please submit suggestions and improvements! You can leave any issues here, or contact me on Twitter (@ajacksified).
