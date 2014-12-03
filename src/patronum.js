(function(context, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    context["objectoPatronum"] = factory();
  }
})(this, function() {

  /*
  	 * ObjectoPatronum is a tree helper
   */
  var objectoPatronum;
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
        if ((create == null) || create === void 0) {
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
        this.missito(obj[key], path, value, create);
      },

      /*
      		 * Delete property from object
      		 * @param obj {Object}
      		 * @param path {String|Reversed array}
       */
      evapores: function(obj, path) {
        var key, parent;
        if (!this.isArray(path)) {
          path = (path.split(".")).map(this.fixKey);
        }
        key = path.pop();
        path.reverse();
        parent = this.invito(obj, path);
        delete parent[key];
      },

      /*
      		 * Delete backwards until sibling is found
      		 * @param obj
      		 * @param path
       */
      evaporesMaxima: function(obj, path) {
        if (!this.isArray(path)) {
          path = (path.split(".")).map(this.fixKey);
        }
        while (this.siblingumRevelio(obj, path.join(".")).length === 0) {
          path.pop();
        }
        this.evapores(obj, path);
      },

      /*
      		 * Repairs array indexing
      		 * @param arr {Array}
       */
      reparo: function(arr) {
        var i;
        i = 0;
        while (i < arr.length) {
          if ((arr[i] == null) || arr[i] === void 0) {
            arr.splice(i, 1);
          } else {
            i++;
          }
        }
        return arr;
      },

      /*
      		 * Reduce objects not used trees
      		 * First
      		 * @param obj {Object}
       */
      reductoValues: [void 0, null, "", [], {}],
      reductoKeys: ["i"],
      reductoMap: [],
      reducto: function(obj) {
        var fn, _;
        _ = this;
        this.designo(obj);
        this.reductoMap.map(function(path) {
          return _.evaporesMaxima(obj, path);
        });
        fn = function(obj) {
          var key, keys, _i, _len;
          if (_.isArray(obj)) {
            obj = _.reparo(obj);
          }
          if (_.isObject(obj) || _.isArray(obj)) {
            keys = Object.keys(obj);
            for (_i = 0, _len = keys.length; _i < _len; _i++) {
              key = keys[_i];
              fn(obj[key]);
            }
          }
        };
        fn(obj);
      },

      /*
      		 * Builds the reductoMap
       */
      designo: function(obj, path, origin) {
        var evaporesPath, key, keys, _i, _len;
        if ((origin == null) || origin === void 0) {
          origin = obj;
        }
        if ((path == null) || path === void 0) {
          path = [];
        }
        if (!this.isArray(path)) {
          path = path.split(".");
        }
        if (this.isObject(obj) || this.isArray(obj)) {
          keys = Object.keys(obj);
          for (_i = 0, _len = keys.length; _i < _len; _i++) {
            key = keys[_i];
            path.push(key);
            this.designo(obj[key], path.join("."), origin);
            path.pop();
          }
        } else {
          evaporesPath = path.join(".");
          if (this.reductoValues.indexOf(obj) !== -1 || this.reductoKeys.indexOf(path.pop()) !== -1) {
            this.reductoMap.push(evaporesPath);
          }
        }
      },

      /*
      		 * Reveals current paths sibling properties
      		 * @param obj {Object}
      		 * @param path {String}
       */
      siblingumRevelio: function(obj, path) {
        var key, parent, siblings;
        if (!this.isArray(path)) {
          path = (path.split(".")).map(this.fixKey);
        }
        key = path.pop();
        parent = this.invito(obj, path.join("."));
        siblings = Object.keys(parent);
        siblings.splice(siblings.indexOf(key), 1);
        return siblings;
      }
    };
  })();
  return {
    invito: objectoPatronum.invito,
    missito: objectoPatronum.missito,
    evapores: objectoPatronum.evapores,
    evaporesMaxima: objectoPatronum.evaporesMaxima,
    reparo: objectoPatronum.reparo,
    reducto: objectoPatronum.reducto,
    siblingumRevelio: objectoPatronum.siblingumRevelio,
    get: objectoPatronum.invito,
    set: objectoPatronum.missito,
    remove: objectoPatronum.evapores,
    removeBackwards: objectoPatronum.evaporesMaxima,
    repair: objectoPatronum.reparo,
    reduce: objectoPatronum.reducto,
    getSiblings: objectoPatronum.siblingumRevelio
  };
});
