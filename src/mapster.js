var Mapster;

(function(context, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory;
  } else {
    context["Mapster"] = factory;
  }
})(this, Mapster = (function() {
  function Mapster() {}

  Mapster.prototype.addMap = function(obj, map) {};

  return Mapster;

})());
