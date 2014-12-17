(function(context, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    context["ObjectHistory"] = factory();
  }
})(this, function() {

  /*
  	Basic helper functions
   */

  /*
  	 * Checks if given value is type of something
   */
  var History, deepGet, fixNumber, isType, observe, redo, undo, unobserve;
  isType = function(val, type) {
    var classToType;
    if (val === void 0 || val === null) {
      return String(val);
    }
    classToType = {
      '[object Boolean]': 'boolean',
      '[object Number]': 'number',
      '[object String]': 'string',
      '[object Function]': 'function',
      '[object Array]': 'array',
      '[object Date]': 'date',
      '[object RegExp]': 'regexp',
      '[object Object]': 'object',
      '[object Null]': 'null',
      '[object Undefined]': 'undefined'
    };
    return classToType[Object.prototype.toString.call(val)] === type;
  };
  fixNumber = function(val) {
    if (isType(val, "number")) {
      val = +val;
    }
    return val;
  };

  /*
  	 * Reads value from object through path
  	 * @param obj {Object}
  	 * @param path {String} - e.g. 'a.foo.1.bar'
   */
  deepGet = function(obj, path) {
    var key;
    if (!isType(path, "array")) {
      path = (path.split(".")).reverse().map(fixNumber);
    }
    key = path.pop();
    if (path.length === 0 || !Object.prototype.hasOwnProperty.call(obj, key)) {
      return obj[key];
    }
    return deepGet(obj[key], path);
  };
  ({

    /*
    	 * Writes value to object through path
    	 * @param obj {Object}
    	 * @param path {String} - e.g. 'a.foo.bar'
    	 * @param value {Mixed}
    	 * @param create {Boolean} - whether it should build non-existent tree or not
     */
    deepSet: function(obj, path, value, create) {
      var key;
      if ((create == null) || create === void 0) {
        create = true;
      }
      if (!isType(path, "array")) {
        path = (path.split(".")).reverse().map(fixNumber);
      }
      key = path.pop();
      if (path.length === 0) {
        return obj[key] = value;
      }
      if (!Object.prototype.hasOwnProperty.call(obj, key) || obj[key] === void 0) {
        if (create === true) {
          if (isType(path[path.length - 1], "number")) {
            obj[key] = [];
          } else {
            obj[key] = {};
          }
        } else {
          throw new Error("Value not set, because creation is set to false!");
        }
      }
      deepSet(obj[key], path, value, create);
    }
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
      path: step.path,
      value: deepGet(this, step.path)
    });
    deepSet(this, step.path, step.value);
    return this.__History__._backwards.pop();
  };
  redo = function() {
    var step;
    step = this.__History__._forwards.pop();
    this.__History__._backwards.push({
      path: step.path,
      value: deepGet(this, step.path)
    });
    deepSet(this, step.path, step.value);
    return this.__History__._backwards.pop();
  };

  /*
  	 * End of history functions
   */
  observe = function(obj, whitelist, extension, deep, origin, path) {
    var keys, prop, _fn, _i, _len;
    if (extension == null) {
      extension = false;
    }
    if (deep == null) {
      deep = true;
    }
    if ((origin == null) || origin === void 0) {
      origin = obj;
    }
    if ((path == null) || path === void 0) {
      path = [];
    }
    if (!isType(path, "array")) {
      path = path.split(".");
    }
    if (!origin.hasOwnProperty("__History__")) {
      Object.defineProperty(origin, "__History__", {
        enumerable: false,
        configurable: true,
        value: new History(false)
      });
    }
    if (!origin.hasOwnProperty("undo")) {
      Object.defineProperty(origin, "undo", {
        configurable: true,
        enumerable: false,
        writable: false,
        value: function(n) {
          if (!isType(n, "number")) {
            n = 1;
          }
          while (n--) {
            undo.call(origin);
          }
          return this;
        }
      });
    }
    if (!origin.hasOwnProperty("redo")) {
      Object.defineProperty(origin, "redo", {
        configurable: true,
        enumerable: false,
        writable: false,
        value: function(n) {
          if (!isType(n, "number")) {
            n = 1;
          }
          while (n--) {
            redo.call(origin);
          }
          return this;
        }
      });
    }
    keys = Object.keys(obj);
    _fn = function(prop) {
      var property, savePath, value;
      value = obj[prop];
      property = prop;
      path.push(property);
      savePath = path.join(".");
      if ((value != null) && (isType(value, 'object') || isType(value, 'array')) && deep === true) {
        observe(value, whitelist, extension, deep, origin, savePath);
      } else {
        Object.defineProperty(obj, prop, {
          enumerable: true,
          configurable: true,
          get: function() {
            return prop;
          },
          set: function(newVal) {
            var step;
            step = {
              path: savePath,
              value: prop
            };
            origin.__History__._backwards.push(step);
            return prop = newVal;
          }
        });
        obj[property] = value;
        origin.__History__._backwards.pop();
      }
      path.pop();
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
      if ((val != null) && isType(val, "object") || isType(val, "array")) {
        return unobserve(val);
      } else {
        return Object.defineProperty(obj, prop, {
          writable: true,
          configurable: true,
          enumerable: true,
          value: val
        });
      }
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
