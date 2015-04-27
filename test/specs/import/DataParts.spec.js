var DateParts = require('../../../src/scripts/import/dateParts');

fdescribe('dateParts can ', function () {

    describe('match a string to', function () {

        it('a year', function () {

            var date = new DateParts('2004');
            var dateMatch = date.matched();
            expect(dateMatch).toBe('%Y');

        });

        it('numbers, but not a year', function () {

            var date = new DateParts('20004');
            var spy = spyOn(date,'isUnknownMonthsAndYears')
            var dateMatch = date.matched();
            expect(dateMatch).toBe(null);
            expect(spy.calls.count()).toBe(0);

            date = new DateParts('200.04');
            dateMatch = date.matched();
            expect(dateMatch).toBe(null);
            expect(spy.calls.count()).toBe(0);

        });

        it('a month-year', function () {

            var date = new DateParts('02-02');
            var dateMatch = date.matched();
            expect(dateMatch).toBe('%m/%y');

            date = new DateParts('02-13');
            dateMatch = date.matched();
            expect(dateMatch).toBe('%m/%y');

            date = new DateParts('13-04');
            dateMatch = date.matched();
            expect(dateMatch).toBe('%y/%m');

            date = new DateParts('2013-04');
            dateMatch = date.matched();
            expect(dateMatch).toBe('%Y/%m');

            date = new DateParts('04-2013');
            dateMatch = date.matched();
            expect(dateMatch).toBe('%Y/%m');

        });
    });

});
