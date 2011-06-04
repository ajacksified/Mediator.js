(function(){
  var Mediator = function(){};

  Mediator.prototype = {
    _callbacks: { Predicates: [] },

    Add: function(condition, fn){
      if(typeof condition === "function"){
        this._callbacks.Predicates.push([condition, fn]);
        return;
      }
      
      if(typeof condition === "number"){
        if(!this._callbacks[condition]){
          this._callbacks[condition] = [];
        }

        this._callbacks[condition].push(fn);
        return;
      }

      throw("Must be a predicate or response data type integer.");
    },

    Remove: function(condition, fn){
      if(this._callbacks.Predicates.length > 0 && typeof condition == "function"){
        var counter = 0;
        for(var x in this._callbacks.Predicates){
          if(this._callbacks.Predicates[x][0] == condition && (!fn || fn == this._callbacks.Predicates[x])){
            this._callbacks.Predicates.splice(counter, 1);
            counter--;
          }

          counter++;
        }
        
        return;
      }
        
      if(this._callbacks[condition]){
        if(!fn){
          this._callbacks[condition] = [];
          return;
        }

        for(var y in this._callbacks[condition]) {
          if(this._callbacks[condition][y] == fn){
            this._callbacks[condition].splice(y,1);
          }
        }
      } 
    },
    
    Call: function(data){
      if(data.Type !== undefined && this._callbacks[data.Type]){
        for(var x in this._callbacks[data.Type]){
          this._callbacks[data.Type][x](data);

        }
      } 
      
      for(var y in this._callbacks.Predicates){
        if(this._callbacks.Predicates[y][0](data)){
          this._callbacks.Predicates[y][1](data);
        } 
      }
    }
  }

  window.Mediator = Mediator.prototype;;
})(window);
