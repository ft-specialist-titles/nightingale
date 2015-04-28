var predictDateFormat = require('../../../src/scripts/import/predictDateFormat');

describe('predictDateFormat ', function () {

    it('does not understand everything', function () {

        expect(predictDateFormat('1.001')).toBe(null);
        expect(predictDateFormat('1,001')).toBe(null);
        expect(predictDateFormat('1,000,000')).toBe(null);
        expect(predictDateFormat('20004')).toBe(null);
        expect(predictDateFormat('01 02 03')).toBe(null);
        expect(predictDateFormat('32 2024')).toBe(null);
        expect(predictDateFormat('01 Apr 05')).toBe(null);
    });

    it('thinks it understands, but gets it wrong or forgets info', function () {
        //todo: should these be fixed?
        expect(predictDateFormat('52 04 24')).toBe(null); // '%Y/%m/%d'
        expect(predictDateFormat('Apr 28 15')).toBe(null);// '%b/%d/%y'
        expect(predictDateFormat('13 2024')).toBe('%d/%Y');// null?
    });

    it('can give you a suggested format', function () {

        expect(predictDateFormat('4')).toBe('%Y');
        expect(predictDateFormat('04')).toBe('%Y');
        expect(predictDateFormat('004')).toBe('%Y');
        expect(predictDateFormat('2004')).toBe('%Y');
        expect(predictDateFormat('04/24')).toBe('%m/%y');
        expect(predictDateFormat('04-24')).toBe('%m/%y');
        expect(predictDateFormat('04 24')).toBe('%m/%y');
        expect(predictDateFormat('04 024')).toBe('%m/%Y');
        expect(predictDateFormat('12 2024')).toBe('%m/%Y');
        expect(predictDateFormat('31 04 24')).toBe('%d/%m/%y');
        expect(predictDateFormat('31 04 2024')).toBe('%d/%m/%Y');
        expect(predictDateFormat('04 31 24')).toBe('%m/%d/%y');
        expect(predictDateFormat('2012 04 24')).toBe('%Y/%m/%d');
        expect(predictDateFormat('Apr 28 2015')).toBe('%b/%d/%Y');
        expect(predictDateFormat('Apr 2015')).toBe('%b/%Y');
        expect(predictDateFormat('Tue Apr 28 2015')).toBe('%a/%b/%d/%Y');
        expect(predictDateFormat('Apr 28 2015')).toBe('%b/%d/%Y');
        expect(predictDateFormat('01 Apr 2015')).toBe('%d/%b/%Y');
        expect(predictDateFormat('01 Apr 35')).toBe('%d/%b/%y');
        expect(predictDateFormat('01 28 2015')).toBe('%x'); //'%m/%d/%Y'
        expect(predictDateFormat('13:26:27')).toBe('%X'); //'%H:%M:%S'
        expect(predictDateFormat('Tue Apr 28 2015 13:26:27')).toBe('%a/%b/%d/%Y/%H:%M:%S');
        expect(predictDateFormat('Tuesday April 28 2015 13:26:27')).toBe('%A/%B/%d/%Y/%H:%M:%S');

    });

});
