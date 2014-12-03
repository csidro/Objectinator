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
  observe = function(obj, whitelist, extension) {
    var key, keys, prop, _fn, _i, _len;
    if (extension == null) {
      extension = false;
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
            undo.call(this);
          }
        } else {
          undo.call(this);
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
            redo.call(this);
          }
        } else {
          redo.call(this);
        }
        return this;
      }
    });
    keys = Object.keys(obj);
    if (whitelist != null) {
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
      return obj[property] = value;
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
