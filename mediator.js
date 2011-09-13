/*! 
* Mediator.js Library v03.
* https://github.com/ajacksified/Mediator.js
*
* Copyright 2011, Jack Lawson
* MIT Licensed (http://www.opensource.org/licenses/mit-license.php)
*
* For more information: http://www.thejacklawson.com/index.php/2011/06/mediators-for-modularized-asynchronous-programming-in-javascript/
* Project on GitHub: https://github.com/ajacksified/Mediator.js
*
* Last update: Sep 13 2011
*/

(function(){
  function Mediator() {
    if (!this instanceof Mediator) {
      return new Mediator();
    }else{
      this._callbacks = { Predicates: [] };
    }
  }

  Mediator.prototype = {
    _defaultOptions: {},

    Subscribe: function(channel, fn, options, context){
      MergeRecursive(options, this._defaultOptions);

      if(context === undefined){
        context = window;
      }

      if(!this._callbacks[channel]){
        this._callbacks[channel] = [];
      }

      this._callbacks[channel].push({ fn: fn, context: context, options: options });
      return;

    },

    Remove: function(channel, fn){
      if(this._callbacks[channel]){
        if(!fn){
          this._callbacks[channel] = [];
          return;
        }
        
        for(var y in this._callbacks[channel]) {
          if(this._callbacks[channel][y].fn == fn){
            this._callbacks[channel].splice(y,1);
          }
        }
      } 
    },
    
    Publish: function(channel){
      var data = Array.prototype.slice.call(arguments, 1),
        callback,
        callbacks;

      if(channel !== undefined && this._callbacks[channel]){

        for(var x in this._callbacks[channel]){
          callbacks = this._callbacks[channel];

          if(callbacks.hasOwnProperty(x)){
            var callback = callbacks[x];

            if(callback.options !== undefined && typeof callback.options.predicate == "function"){
              if(callback.options.predicate.apply(callback.context, data)){
                callback.fn.apply(callback.context, data);
              } 
            }else{
              callback.fn.apply(callback.context, data);
            }
          }
        }
      } 
    }
  };

  function MergeRecursive(obj1, obj2) {
    for (var p in obj2) {
      try {
        if (obj2[p].constructor == Object) {
          obj1[p] = MergeRecursive(obj1[p], obj2[p]);
        } else {
          obj1[p] = obj2[p];
        }
      } catch(e) {
        obj1[p] = obj2[p];
      }
    }

    return obj1;
  }

  window.Mediator = Mediator;
})(window);
