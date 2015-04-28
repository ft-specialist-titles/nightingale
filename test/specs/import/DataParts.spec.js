var DateParts = require('../../../src/scripts/import/dateParts');

describe('dateParts can ', function () {

    var spy;
    var date;
    var dateMatch;
    var part;

    describe('match a string to', function () {

        it('a year', function () {

            date = new DateParts('2004');
            dateMatch = date.matched();
            expect(dateMatch).toBe('%Y');
            expect(date.parts.length).toBe(0);

        });

        it('numbers, but not a year', function () {

            date = new DateParts('20004');
            spy = spyOn(date,'isUnknownMonthsAndYears')//isNumbersButNotYears
            dateMatch = date.matched();
            expect(dateMatch).toBe(null);
            expect(spy.calls.count()).toBe(0);//1
            expect(date.parts.length).toBe(0);

            date = new DateParts('200.04');
            spy = spyOn(date,'isUnknownMonthsAndYears')
            dateMatch = date.matched();
            expect(dateMatch).toBe(null);
            expect(spy.calls.count()).toBe(0);
            expect(date.parts.length).toBe(0);

            date = new DateParts('200,094');
            spy = spyOn(date,'isUnknownMonthsAndYears')
            dateMatch = date.matched();
            expect(dateMatch).toBe(null);
            expect(spy.calls.count()).toBe(0);
            expect(date.parts.length).toBe(0);

        });

        it('a month and year', function () {

            date = new DateParts('02-02');
            dateMatch = date.matched();
            expect(dateMatch).toBe('%m/%y');

            date = new DateParts('02-13');
            dateMatch = date.matched();
            expect(dateMatch).toBe('%m/%y');

            date = new DateParts('2013-04');
            dateMatch = date.matched();
            expect(dateMatch).toBe('%Y/%m');

            date = new DateParts('04-2013');
            dateMatch = date.matched();
            expect(dateMatch).toBe('%m/%Y');

        });

        it('is Unknown Months And Years', function(){

            date = new DateParts('13-04');
            spy = spyOn(date,'isUnknownMonthsAndYears')
            dateMatch = date.matched();
            expect(spy.calls.count()).toBe(2);

            date = new DateParts('13-04');
            dateMatch = date.matched();
            expect(dateMatch).toBe(null);

        });

        it('is short Months And Years', function(){

            date = new DateParts('feb-04');
            dateMatch = date.matched();
            expect(dateMatch).toBe('%b/%y');

            date = new DateParts('04-feb');
            dateMatch = date.matched();
            expect(dateMatch).toBe('%y/%b');

            date = new DateParts('2004-feb');
            dateMatch = date.matched();
            expect(dateMatch).toBe('%Y/%b');

            date = new DateParts('feb-2005');
            dateMatch = date.matched();
            expect(dateMatch).toBe('%b/%Y');

        });

        it('unknown', function(){

            date = new DateParts('01-04-01');
            dateMatch = date.matched();
            expect(dateMatch).toBe(false);
            expect(date.parts.length).toBeGreaterThan(0);

        });

    });

    describe('guess what unknown strings might be', function () {

        it('as above 999 for full year',function(){

            date = new DateParts();
            part = new date.Part('2014');
            expect(part.num).toBe(2014);
            expect(part.type).toBe('year');
            expect(part.format).toBe('%Y');
            expect(part.twoDigit).toBe(false);
            expect(part.guessYear).toBe(false);
            expect(part.guessMonth).toBe(false);
            expect(part.guessDay).toBe(false);

        });

        it('as above 31 for year',function(){

            date = new DateParts();
            part = new date.Part('99');
            expect(part.num).toBe(99);
            expect(part.type).toBe('year');
            expect(part.format).toBe('%y');
            expect(part.twoDigit).toBe(true);
            expect(part.guessYear).toBe(false);
            expect(part.guessMonth).toBe(false);
            expect(part.guessDay).toBe(false);

        });

        it('as above 12 to be guessed as year or day',function(){

            date = new DateParts();
            part = new date.Part('13');
            expect(part.num).toBe(13);
            expect(part.type).toBe(null);
            expect(part.format).toBe(null);
            expect(part.twoDigit).toBe(true);
            expect(part.guessYear).toBe(true);
            expect(part.guessMonth).toBe(false);
            expect(part.guessDay).toBe(true);

        });

        it('as 12 or less to be guessed as year or day or month',function(){

            date = new DateParts();
            part = new date.Part('12');
            expect(part.num).toBe(12);
            expect(part.type).toBe(null);
            expect(part.format).toBe(null);
            expect(part.twoDigit).toBe(true);
            expect(part.guessYear).toBe(true);
            expect(part.guessMonth).toBe(true);
            expect(part.guessDay).toBe(true);

        });

        it(': full month names',function(){

            date = new DateParts();
            part = new date.Part('january');
            expect(part.num).toBeNaN();
            expect(part.type).toBe('month');
            expect(part.format).toBe('%B');
            expect(part.twoDigit).toBe(false);
            expect(part.guessYear).toBe(false);
            expect(part.guessMonth).toBe(false);
            expect(part.guessDay).toBe(false);

        });

        it(': short month names',function(){

            date = new DateParts();
            part = new date.Part('jan');
            expect(part.num).toBeNaN();
            expect(part.type).toBe('month');
            expect(part.format).toBe('%b');
            expect(part.twoDigit).toBe(false);
            expect(part.guessYear).toBe(false);
            expect(part.guessMonth).toBe(false);
            expect(part.guessDay).toBe(false);

        });

        it(': full day names',function(){

            date = new DateParts();
            part = new date.Part('monday');
            expect(part.num).toBeNaN();
            expect(part.type).toBe('weekday');
            expect(part.format).toBe('%A');
            expect(part.twoDigit).toBe(false);
            expect(part.guessYear).toBe(false);
            expect(part.guessMonth).toBe(false);
            expect(part.guessDay).toBe(false);

        });

        it(': short day names',function(){

            date = new DateParts();
            part = new date.Part('tue');
            expect(part.num).toBeNaN();
            expect(part.type).toBe('weekday');
            expect(part.format).toBe('%a');
            expect(part.twoDigit).toBe(false);
            expect(part.guessYear).toBe(false);
            expect(part.guessMonth).toBe(false);
            expect(part.guessDay).toBe(false);

        });

        it(': times',function(){

            date = new DateParts('Tue Apr 28 2015 13:26:27 GMT+0100 (BST)');
            part = new date.Part('13:26:27');
            expect(part.num).toBeNaN();
            expect(part.type).toBe('time');
            expect(part.format).toBe('%H:%M:%S');
            expect(part.twoDigit).toBe(false);
            expect(part.guessYear).toBe(false);
            expect(part.guessMonth).toBe(false);
            expect(part.guessDay).toBe(false);

        });
        it(': time zone',function(){

            date = new DateParts('Tue Apr 28 2015 13:26:27 GMT+0100 (BST)');
            part = new date.Part('GMT+0100');
            expect(part.num).toBeNaN();
            expect(part.type).toBe(null);
            expect(part.format).toBe(null);
            expect(part.twoDigit).toBe(false);
            expect(part.guessYear).toBe(false);
            expect(part.guessMonth).toBe(false);
            expect(part.guessDay).toBe(false);

        });
        it(': morning or evening',function(){

            date = new DateParts();
            part = new date.Part('10:00am');
            expect(part.num).toBeNaN();
            expect(part.type).toBe('time');
            expect(part.format).toBe('%H:%M%p');
            expect(part.twoDigit).toBe(false);
            expect(part.guessYear).toBe(false);
            expect(part.guessMonth).toBe(false);
            expect(part.guessDay).toBe(false);

        });

    });

});
