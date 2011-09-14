/*! 
* Mediator.js Library v0.4.1
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
  function Channel(){
    if (!this instanceof Channel) {
      return new Channel();
    }else{
      this._callbacks = [];
      this._channels = [];
    }
  };

  Channel.prototype = {
    AddSubscriber: function(fn, options, context){
      this._callbacks.push({ fn: fn, context: context, options: options });
    },

    AddChannel: function(channel){
      this._channels[channel] = new Channel();
    },

    HasChannel: function(channel){
      return this._channels.hasOwnProperty(channel);
    },

    ReturnChannel: function(channel){
      return this._channels[channel];
    },

    RemoveSubscriber: function(fn){
      if(!fn){
        this._callbacks = []; 
        
        for(var z in this._channels){
          if(this._channels.hasOwnProperty(z)){
            this._channels[z].RemoveSubscriber(fn);
          }
        }
      }
      
      for(var y = 0, x = this._callbacks.length; y < x; y++) {
        if(this._callbacks[y].fn == fn){
          this._callbacks.splice(y,1);
          x--; y--;
        }
      }
    },

    Publish: function(data){
      for(var y = 0, x = this._callbacks.length; y < x; y++) {
        var callback = this._callbacks[y];

        if(callback.options !== undefined && typeof callback.options.predicate === "function"){
          if(callback.options.predicate.apply(callback.context, data)){
            callback.fn.apply(callback.context, data);
          } 
        }else{
          callback.fn.apply(callback.context, data);
        }
      }

      for(var x in this._channels){
        if(this._channels.hasOwnProperty(x)){
          this._channels[x].Publish(data);
        }
      }
    }
  };
  
  function Mediator() {
    if (!this instanceof Mediator) {
      return new Mediator();
    }else{
      this._channels = new Channel();
    }
  };

  Mediator.prototype = {
    _channelFromNamespace: function(namespace){
      var channel = this._channels;
      var namespaceHeirarchy = namespace.split(':');
      
      if(namespaceHeirarchy.length > 0){
        for(var i = 0, j = namespaceHeirarchy.length; i < j; i++){

          if(!channel.HasChannel(namespaceHeirarchy[i])){
            channel.AddChannel(namespaceHeirarchy[i]);
          }
          
          channel = channel.ReturnChannel(namespaceHeirarchy[i]);
        }
      }
      
      return channel;
    },

    Subscribe: function(channelName, fn, options, context){
      options = options || {};
      context = context || {};

      this._channelFromNamespace(channelName).AddSubscriber(fn, options, context );
    },

    Remove: function(channelName, fn){
      this._channelFromNamespace(channelName).RemoveSubscriber(fn);
    },
    
    Publish: function(channelName){
      this._channelFromNamespace(channelName).Publish(Array.prototype.slice.call(arguments, 1));
    }
  };

  Mediator.Channel = Channel;
  window.Mediator = Mediator;
})(window);

