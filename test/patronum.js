var chai, expect, p;

chai = require('chai');

p = require('../src/patronum');

chai.should();

expect = chai.expect;

describe("objectoPatronum", function() {
  before(function() {
    return this.obj = {
      a: 1,
      b: [
        null, 1, 2, 3, {
          c: 4,
          d: void 0
        }
      ],
      e: {
        f: 5,
        g: 6,
        h: "",
        i: "test",
        j: [],
        k: {},
        l: {
          m: {
            n: {
              o: void 0
            }
          }
        }
      }
    };
  });
  it("should", function() {
    var expecto;
    p.reducto(this.obj);
    expecto = {
      a: 1,
      b: [
        1, 2, 3, {
          c: 4
        }
      ],
      e: {
        f: 5,
        g: 6
      }
    };
    return this.obj.should.deep.equal(expecto);
  });
});
