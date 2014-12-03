(function(context, factory) {
  if (typeof define === 'function' && define.amd) {
    return define([], factory);
  } else if (typeof module !== 'undefined' && module.exports) {
    return module.exports = factory();
  } else {
    return context["ObjectHistory"] = factory();
  }
})(this, function() {
  var History, observe, redo, undo, unobserve;
  History = (function() {
    function History(isChild) {
      this.isChild = isChild != null ? isChild : true;
      this._backwards = [];
      this._forwards = [];
    }

    return History;

  })();

  /*
  	 * History functions
   */
  undo = function() {
    var step;
    step = this.__History__._backwards.pop();
    this.__History__._forwards.push({
      key: step.key,
      value: this[step.key]
    });
    this[step.key] = step.value;
    return this.__History__._backwards.pop();
  };
  redo = function() {
    var step;
    step = this.__History__._forwards.pop();
    this.__History__._backwards.push({
      key: step.key,
      value: this[step.key]
    });
    this[step.key] = step.value;
    return this.__History__._backwards.pop();
  };

  /*
  	 * End of history functions
   */
  observe = function(obj) {
    var prop, _fn, _i, _len, _ref;
    Object.defineProperty(obj, "__History__", {
      enumerable: false,
      configurable: true,
      value: new History(false)
    });
    Object.defineProperty(obj, "undo", {
      enumerable: false,
      configurable: false,
      writable: false,
      value: function(n) {
        if (typeof n === "number") {
          while (n--) {
            undo.call(this);
          }
        } else {
          undo.call(this);
        }
        return this;
      }
    });
    Object.defineProperty(obj, "redo", {
      enumerable: false,
      configurable: false,
      writable: false,
      value: function(n) {
        if (typeof n === "number") {
          while (n--) {
            redo.call(this);
          }
        } else {
          redo.call(this);
        }
        return this;
      }
    });
    _ref = Object.keys(obj);
    _fn = function(prop) {
      var property, value;
      value = obj[prop];
      property = prop;
      Object.defineProperty(obj, prop, {
        get: function() {
          return prop;
        },
        set: function(newVal) {
          var step;
          step = {
            key: property,
            value: prop
          };
          this.__History__._backwards.push(step);
          return prop = newVal;
        }
      });
      return obj[property] = value;
    };
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      prop = _ref[_i];
      _fn(prop);
    }
  };
  unobserve = function(obj) {
    var prop, val, _fn;
    delete obj.__History__;
    _fn = function(prop, val) {
      return Object.defineProperty(obj, prop, {
        writable: true,
        configurable: true,
        enumerable: true,
        value: val
      });
    };
    for (prop in obj) {
      val = obj[prop];
      _fn(prop, val);
    }
  };
  return {
    observe: observe,
    unobserve: unobserve
  };
});
