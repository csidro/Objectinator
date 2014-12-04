
chai = require 'chai'

p = require '../src/patronum'

chai.should()
expect = chai.expect

describe "objectoPatronum", () ->
    before () ->
        @obj =
            a: 1
            b: [null, 1, 2, 3, {c: 4, d: undefined}]
            e:
                f: 5
                g: 6
                h: ""
                i: "test"
                j: []
                k: {}
                l:
                    m:
                        n:
                            o: undefined

    it "should", () ->
        p.reducto( @obj )

        expecto = 
            a: 1
            b: [1, 2, 3, {c: 4}]
            e:
                f: 5
                g: 6

        @obj.should.deep.equal( expecto )

    return 