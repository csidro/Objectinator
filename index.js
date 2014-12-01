// Generated by CoffeeScript 1.8.0

/*
 * ObjectoPatronum helps in [g|s]etting values [from|to] the deep
 */
var History, a, objectoPatronum, observe, redo, undo, unobserve;

objectoPatronum = (function() {
  return {
    isArray: function(val) {
      return Object.prototype.toString.call(val) === "[object Array]";
    },
    isObject: function(val) {
      return Object.prototype.toString.call(val) === "[object Object]";
    },
    isNumeric: function(val) {
      return isFinite(val) && Object.prototype.toString.call(+val) === "[object Number]";
    },
    fixKey: function(val) {
      if (objectoPatronum.isNumeric(val)) {
        val = +val;
      }
      return val;
    },

    /*
    	 * Reads value from object through path
    	 * @param obj {Object}
    	 * @param path {String} - e.g. 'a.foo.1.bar'
     */
    invito: function(obj, path) {
      var key;
      if (!this.isArray(path)) {
        path = (path.split(".")).reverse().map(this.fixKey);
      }
      key = path.pop();
      if (path.length === 0 || !Object.prototype.hasOwnProperty.call(obj, key)) {
        return obj[key];
      }
      return this.invito(obj[key], path);
    },

    /*
    	 * Writes value to object through path
    	 * @param obj {Object}
    	 * @param path {String} - e.g. 'a.foo.bar'
    	 * @param value {Mixed}
    	 * @param create {Boolean} - whether it should build non-existent tree or not
     */
    missito: function(obj, path, value, create) {
      var key;
      if (create == null) {
        create = true;
      }
      if (!this.isArray(path)) {
        path = (path.split(".")).reverse().map(this.fixKey);
      }
      key = path.pop();
      if (path.length === 0) {
        return obj[key] = value;
      }
      if (!Object.prototype.hasOwnProperty.call(obj, key) || obj[key] === void 0) {
        if (create === true) {
          if (this.isNumeric(path[path.length - 1])) {
            obj[key] = [];
          } else {
            obj[key] = {};
          }
        } else {
          throw new Error("Value not set, because creation is set to false!");
        }
      }
      return this.missito(obj[key], path, value, create);
    },

    /*
    	 * Delete property from object
    	 * @param obj {Object}
    	 * @param path {String}
     */
    evapores: function(obj, path) {
      var key;
      if (!this.isArray(path)) {
        path = (path.split(".")).reverse().map(this.fixKey);
      }
      key = path.pop();
      if (path.length === 0) {
        delete obj[key];
        return;
      }
      return this.evapores(obj[key], path);
    },

    /*
    	 * Reduce objects not used trees
    	 * First
    	 * @param obj {Object}
     */
    reductoValues: [void 0, null, ""],
    reducto: function(obj, path, deletion, origin) {
      var key, _i, _len, _ref, _results;
      if (path == null) {
        path = [];
      }
      if (deletion == null) {
        deletion = false;
      }
      if (origin == null) {
        origin = obj;
      }
      if (!deletion) {
        if (this.isObject(obj) || this.isArray(obj)) {
          _ref = Object.keys(obj);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            key = _ref[_i];
            _results.push((function(key) {
              return this.reducto(obj[key], path.push(key, false, origin));
            })(key));
          }
          return _results;
        } else if (this.reductoValues.indexOf(obj) !== -1) {
          return this.reducto(obj, path, true, origin);
        }
      } else {
        if (this.siblingumRevelio(origin, path.join('.')).length !== 0) {
          return this.evapores(origin, path.reverse());
        } else {
          path.pop();
          return this.reducto(origin, path, deletion, origin);
        }
      }
    },

    /*
    	 * Reveals current paths sibling properties
    	 * @param obj {Object}
    	 * @param path {String}
     */
    siblingumRevelio: function(obj, path) {
      var key, keyList, parent;
      if (!this.isArray(path)) {
        path = (path.split(".")).map(this.fixKey);
      }
      key = path.pop();
      parent = this.invito(obj, path.reverse());
      keyList = Object.keys(parent);
      return keyList.splice(keyList.indexOf(key), 1);
    }
  };
})();

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
  Object.defineProperty(obj, "__History__", {
    enumerable: false,
    configurable: true,
    value: new History(false)
  });
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

a = {
  b: 1,
  c: {
    e: void 0,
    d: [
      null, void 0, "", [
        1, 2, 3, {
          a: 1,
          b: 2
        }
      ]
    ],
    f: {
      g: "asdf",
      h: {
        i: 1,
        j: void 0,
        k: void 0,
        l: {
          m: {
            n: {
              o: void 0
            }
          }
        }
      }
    }
  }
};
