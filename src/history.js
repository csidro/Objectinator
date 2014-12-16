(function(context, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    context["ObjectHistory"] = factory();
  }
})(this, function() {
  var History, observe, redo, undo, unobserve;
  ({

    /*
    	Basic helper functions
     */
    isType: function(val, type) {}
  });

  /*
  	End of helper functions
   */
  History = (function() {
    function History() {
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
  observe = function(obj, whitelist, deep, extension, origin, path) {
    var key, keys, prop, _fn, _i, _len;
    if (deep == null) {
      deep = true;
    }
    if (extension == null) {
      extension = false;
    }
    if ((origin == null) || origin === void 0) {
      origin = obj;
    }
    if ((path == null) || path === void 0) {
      path = [];
    }
    if (!(Object.prototype.toString.call(val) === "[object Array]")) {
      path = path.split(".");
    }
    Object.defineProperty(obj, "__History__", {
      enumerable: false,
      configurable: true,
      value: new History(false)
    });
    Object.defineProperty(obj, "undo", {
      configurable: true,
      enumerable: false,
      writable: false,
      value: function(n) {
        if (typeof n === "number") {
          while (n--) {
            undo.call(obj);
          }
        } else {
          undo.call(obj);
        }
        return this;
      }
    });
    Object.defineProperty(obj, "redo", {
      configurable: true,
      enumerable: false,
      writable: false,
      value: function(n) {
        if (typeof n === "number") {
          while (n--) {
            redo.call(obj);
          }
        } else {
          redo.call(obj);
        }
        return this;
      }
    });
    keys = Object.keys(obj);
    if ((whitelist != null) && deep === false) {
      keys = whitelist;
      if (extension === false) {
        keys = (function() {
          var _i, _len, _ref, _results;
          _ref = Object.keys(obj);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            key = _ref[_i];
            if (whitelist.indexOf(key) !== -1) {
              _results.push(key);
            }
          }
          return _results;
        })();
      }
    }
    _fn = function(prop) {
      var property, value;
      value = obj[prop];
      property = prop;
      if (isType(value, 'object') || isType(value, 'array') && deep === true) {
        path.push(prop);
        observe(value, whitelist, deep, extension, origin, path.join("."));
      } else if (isType(value, 'object') || isType(value, 'array') && deep === false) {
        return;
      }
      Object.defineProperty(obj, prop, {
        enumerable: true,
        configurable: true,
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
      obj[property] = value;
    };
    for (_i = 0, _len = keys.length; _i < _len; _i++) {
      prop = keys[_i];
      _fn(prop);
    }
  };
  unobserve = function(obj) {
    var prop, val, _fn;
    delete obj.__History__;
    delete obj.undo;
    delete obj.redo;
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
