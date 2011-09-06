/*! 
* Mediator.js Library v0.2
* https://github.com/ajacksified/Mediator.js
*
* Copyright 2011, Jack Lawson
* MIT Licensed (http://www.opensource.org/licenses/mit-license.php)
*
* For more information: http://www.thejacklawson.com/index.php/2011/06/mediators-for-modularized-asynchronous-programming-in-javascript/
* Project on GitHub: https://github.com/ajacksified/Mediator.js
*
* Last update: Sep 6 2011
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
    Subscribe: function(channel, fn, context){
      if(context === undefined){
        context = window;
      }

      if(typeof channel === "function"){
        this._callbacks.Predicates.push({ predicate: channel, fn: fn, context: context});
        return;
      }
      
      if(!this._callbacks[channel]){
        this._callbacks[channel] = [];
      }

      this._callbacks[channel].push({ fn: fn, context: context });
      return;

    },

    Remove: function(channel, fn){
      if(this._callbacks.Predicates.length > 0 && typeof channel == "function"){
        var counter = 0,
          callback = {};
        for(var x = 0, l = this._callbacks.Predicates.length; x < l; x++){
          callback = this._callbacks.Predicates[x];

          if(callback.predicate == channel && (!fn || fn == callback.fn)){
            this._callbacks.Predicates.splice(x, 1);
          }
        }
        
        return;
      }
        
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
            callback.fn.apply(callback.context, data);
          }
        }
      } 
      
      for(var y in this._callbacks.Predicates){
        context = window;
        callback = this._callbacks.Predicates[y];
        
        if(callback.predicate.apply(callback.context, data)){
          callback.fn.apply(callback.context, data);
        } 
      }
    }
  };

  window.Mediator = Mediator;
})(window);
