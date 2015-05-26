/* global expect, describe, it */
var QuarterParser = require('../../../src/scripts/transform/quarterParser');
var d3 = require('d3');

describe(" quarter parser", function() {
    describe("building a quarter parser", function() {
        it('should create a function', function() {
            var qp = QuarterParser("%q/%y");
            expect(typeof qp).toBe("function");
        });
        it('should throw if we give it a bad format', function() {
            expect(function() {
                QuarterParser("foo")
            }).toThrow(jasmine.any(Error));
        });
    });

    describe("using a quarter parser", function() {

        it('should parse a date correctly', function() {
            var parser = QuarterParser("%Y/%q");
            var date = "2001/Q1";
            var expectedDate = d3.time.format('%Y-%m-%d').parse("2001-03-28");

            expect(parser(date).getTime()).toBe(expectedDate.getTime());

        });

        it('should parse a short year date correctly', function() {
            var parser = QuarterParser("%y/%q");
            var date = "01/Q1";
            var expectedDate = d3.time.format('%Y-%m-%d').parse("2001-03-28");

            expect(parser(date).getTime()).toBe(expectedDate.getTime());

        });

        it('should parse a date when the quarter is first', function() {
            var parser = QuarterParser("%q/%Y");
            var date = "Q1/2001";
            var expectedDate = d3.time.format('%Y-%m-%d').parse("2001-03-28");

            expect(parser(date).getTime()).toBe(expectedDate.getTime());

        });

        it('should parse a date when the quarter is lowercase', function() {
            var parser = QuarterParser("%q/%Y");
            var date = "q1/2001";
            var expectedDate = d3.time.format('%Y-%m-%d').parse("2001-03-28");

            expect(parser(date).getTime()).toBe(expectedDate.getTime());

        });

    });
});
