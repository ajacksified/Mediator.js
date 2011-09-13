/*! 
* Mediator.js Library v0.3
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
      this._channels = { };
    }
  }

  Mediator.prototype = {
    _defaultOptions: {},

    _mergeRecursive: function (obj1, obj2) {
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
    },

    _channelFromNamespace: function(namespace){
      var namespaceHeirarchy = namespace.split(':');
      var channel = this._channels;
      
      if(namespaceHeirarchy.length > 0){
        var channel = this._channels;

        for(var i = 0, j = namespaceHeirarchy.length; i < j; i++){
          if(i > 0 && !channel.channels[namespaceHeirarchy[i]]){
            channel.channels[namespaceHeirarchy[i]] = [];
          }else if(i == 0){
            channel[namespaceHeirarchy[i]] = { "channels": [], "callbacks": [] };
          }
          
          channel = channel[namespaceHeirarchy[i]];
        }
      }

      return channel;
    },

    Subscribe: function(channel, fn, options, context){
      this._mergeRecursive(options, this._defaultOptions);

      if(context === undefined){
        context = window;
      }

      this._channelFromNamespace(channel).callbacks.push({ fn: fn, context: context, options: options });
      return;
    },

    Remove: function(channelName, fn){
      var channel = this._channelFromNamespace(channel)
      if(this._channelFromNamespace(channel)){;

        if(!fn){
          channel = [];
          return;
        }
        
        for(var y in channel.callbacks) {
          if(channel.callbacks[y].fn == fn){
            channel.callbacks.splice(y,1);
          }
        }
      } 
    },
    
    Publish: function(channelName){
      var data = Array.prototype.slice.call(arguments, 1),
        callback,
        callbacks,
        channel = this._channelFromNamespace(channelName);

      for(var x in channel.callbacks){
        if(channel.callbacks.hasOwnProperty(x)){
          var callback = channel.callbacks[x];

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
  };

  window.Mediator = Mediator;
})(window);
