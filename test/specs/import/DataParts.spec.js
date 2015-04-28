var DateParts = require('../../../src/scripts/import/dateParts');

fdescribe('dateParts can ', function () {

    describe('match a string to', function () {

        it('a year', function () {

            var date = new DateParts('2004');
            var dateMatch = date.matched();
            expect(dateMatch).toBe('%Y');
            expect(date.parts.length).toBe(0);

        });

        it('numbers, but not a year', function () {

            var date = new DateParts('20004');
            var spy = spyOn(date,'isUnknownMonthsAndYears')//isNumbersButNotYears
            var dateMatch = date.matched();
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
            var spy;
            var date = new DateParts('02-02');
            var dateMatch = date.matched();
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

            var spy;
            var date;
            var dateMatch;

            date = new DateParts('13-04');
            spy = spyOn(date,'isUnknownMonthsAndYears')
            dateMatch = date.matched();
            expect(spy.calls.count()).toBe(2);

            date = new DateParts('13-04');
            dateMatch = date.matched();
            expect(dateMatch).toBe(null);

        });

        it('is short Months And Years', function(){

            var spy;
            var date;
            var dateMatch;

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

            var spy;
            var date;
            var dateMatch;

            date = new DateParts('01-04-01');
            dateMatch = date.matched();
            expect(dateMatch).toBe(false);
            expect(date.parts.length).toBeGreaterThan(0);

        });

    });

    describe('guess what unknown strings might be', function () {

    });

});
