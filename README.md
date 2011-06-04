Mediator.js
===========
For more information, please see http://www.thejacklawson.com/index.php/2011/06/mediators-for-modularized-asynchronous-programming-in-javascript/

A light utility class to help implement the Mediator pattern to ease asynchronous programming
---------------------------------------------

Mediator is a simple class that allows you to register, unregister, and call methods based on data passed in. Its purpose is to make the usage of WebSockets, AJAX calls, or any other asynchronous operation easier.

It is built under the assumption that you're passing data back and forth, and your responses are typed thusly:

    { Type: 1, From: "Jack", Message: "Hi, GitHub!" }

Usage
-----

You can register events with the mediator two ways: with a "type", as explained above, or with a predicate function.

    Mediator.Add(1, function(data){ alert(data.Message); });
    
    Mediator.Add(function(data){ 
            return data.From == "Jack" 
        }, 
        function(data){ alert(data.Message);
     });

You can remove events by passing in a type or predicate, and optionally the function to remove. Predicates and functions must be named- not anonymous- to be able to be removed.

    Mediator.Remove(1); // removes all methods to be called when a data with a Type property with the value of 1 is received
    Mediator.Remove(1, MethodFN);
    
    Mediator.Remove(PredicateFN);
    Mediator.Remove(PredicateFN, MethodFN);
