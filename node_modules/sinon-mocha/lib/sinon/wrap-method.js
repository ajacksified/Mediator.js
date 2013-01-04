var WrapMethod = {};

WrapMethod.enhance = function(sinon){
  var wrap = sinon.wrapMethod;

  WrapMethod.sinonInstance = sinon;
  WrapMethod.originalWrapMethod = wrap;

  sinon.wrapMethod = WrapMethod.wrapMethod;
};

WrapMethod.wrapMethod = function(){
  var result = WrapMethod.originalWrapMethod.apply(this, arguments);
  WrapMethod.objects.push(result);

  return result;
};

WrapMethod.wrapMethod.restore = function(){
  WrapMethod.sinonInstance.wrapMethod = WrapMethod.originalWrapMethod;
};

WrapMethod.restoreWrappedMethods = function(){
  var i = 0, len = WrapMethod.objects.length, obj;


  for(i, len; i < len; i++){
    obj = WrapMethod.objects[i];
    if(obj.restore){
      obj.restore();
    }
  }

  WrapMethod.objects.length = 0;
};

WrapMethod.objects = [];
module.exports = exports = WrapMethod;
