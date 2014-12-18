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
  var History, deepGet, deepSet, fixNumber, isInList, isType, observe, redo, undo, unobserve;
  isType = function(val, type) {
    var classToType;
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

  /*
  	 * Writes value to object through path
  	 * @param obj {Object}
  	 * @param path {String} - e.g. 'a.foo.bar'
  	 * @param value {Mixed}
  	 * @param create {Boolean} - whether it should build non-existent tree or not
   */
  deepSet = function(obj, path, value, create) {
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
  };

  /*
  	 * Checks if path is in a whitelisted place
   */
  isInList = function(path, whitelist) {
    var item, matches, _i, _len;
    if ((whitelist == null) || whitelist === void 0 || (whitelist.length && whitelist.length === 0)) {
      return true;
    }
    matches = 0;
    for (_i = 0, _len = whitelist.length; _i < _len; _i++) {
      item = whitelist[_i];
      if (path.indexOf(item) !== -1 || item.indexOf(path) !== -1) {
        matches++;
      }
    }
    return matches > 0;
  };

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
    var keys, prop, savePath, _fn, _fn1, _i, _j, _len, _len1;
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
    savePath = path.join(".");
    if (extension === true && isType(whitelist, array)) {
      _fn = function(path) {
        if (deepGet(obj, path) === void 0) {
          deepSet(obj, path, null, true);
        }
      };
      for (_i = 0, _len = whitelist.length; _i < _len; _i++) {
        path = whitelist[_i];
        _fn(path);
      }
    }
    extension = false;
    if (!origin.hasOwnProperty("__History__")) {
      Object.defineProperty(origin, "__History__", {
        enumerable: false,
        configurable: true,
        value: new History()
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
    if (isType(obj, "object") || isType(obj, "array")) {
      Object.defineProperty(obj, "define", {
        configurable: true,
        enumerable: false,
        writable: false,
        value: function(key, value) {
          path.push(key);
          savePath = path.join(".");
          path.pop();
          if (deepGet(origin, savePath) === void 0) {
            deepSet(origin, savePath, value, true);
          }
          return observe(origin, [savePath]);
        }
      });
    }
    if (!obj.hasOwnProperty("unobserve")) {
      Object.defineProperty(obj, "unobserve", {
        configurable: true,
        enumerable: false,
        writable: false,
        value: function(path) {
          if ((path == null) || path === void 0) {
            return unobserve(origin, [savePath]);
          } else {
            return unobserve(obj, [path]);
          }
        }
      });
    }
    if (!obj.hasOwnProperty("remove")) {
      Object.defineProperty(obj, "remove", {
        configurable: true,
        enumerable: false,
        writable: false,
        value: function() {
          var step;
          savePath = path.join(".");
          step = {
            path: savePath,
            value: obj
          };
          return origin.__History__._backwards.push(step);
        }
      });
    }
    keys = Object.keys(obj);
    _fn1 = function(prop) {
      var value;
      value = obj[prop];
      path.push(prop);
      savePath = path.join(".");
      if (isInList(savePath, whitelist)) {
        if ((value != null) && (isType(value, 'object') || isType(value, 'array')) && deep === true) {
          observe(value, whitelist, extension, deep, origin, savePath);
        } else {
          (function(origin, obj, prop, savePath) {
            Object.defineProperty(obj, prop, {
              enumerable: true,
              configurable: true,
              get: function() {
                return prop;
              },
              set: function(val) {
                var step;
                step = {
                  path: savePath,
                  value: prop
                };
                origin.__History__._backwards.push(step);
                return prop = val;
              }
            });
            obj[prop] = value;
            return origin.__History__._backwards.pop();
          })(origin, obj, prop, savePath);
        }
      }
      path.pop();
    };
    for (_j = 0, _len1 = keys.length; _j < _len1; _j++) {
      prop = keys[_j];
      _fn1(prop);
    }
  };
  unobserve = function(obj, blacklist, path) {
    var prop, val, _fn;
    if ((path == null) || path === void 0) {
      path = [];
    }
    if (!isType(path, "array")) {
      path = path.split(".");
    }
    _fn = function(prop, val) {
      var savePath;
      path.push(prop);
      savePath = path.join(".");
      if (isInList(savePath, blacklist)) {
        if ((val != null) && isType(val, "object") || isType(val, "array")) {
          unobserve(val, blacklist, savePath);
        } else {
          if (obj.hasOwnProperty("__History__")) {
            delete obj.__History__;
          }
          if (obj.hasOwnProperty("undo")) {
            delete obj.undo;
          }
          if (obj.hasOwnProperty("redo")) {
            delete obj.redo;
          }
          if (obj.hasOwnProperty("define")) {
            delete obj.define;
          }
          if (obj.hasOwnProperty("unobserve")) {
            delete obj.unobserve;
          }
          Object.defineProperty(obj, prop, {
            writable: true,
            configurable: true,
            enumerable: true,
            value: val
          });
        }
      }
      path.pop();
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
