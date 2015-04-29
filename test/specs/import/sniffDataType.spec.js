var sniffDataType = require('../../../src/scripts/import/sniffDataType');

describe('sniffDataType can ', function () {

    var dataTypes  =[{
        colName: 'date-example',
        strings: 0,
        stringValues: [],
        nulls: 0,
        numbers: 0,
        numberValues: [],
        dates: 0,
        dateValues: []
    }];
    it('guess a date', function () {

        expect(sniffDataType.bind(dataTypes)('11/03/2014', 0)).toBe(undefined);
        expect(dataTypes[0].dates).toBe(1);
        expect(dataTypes[0].dateValues[0]).toBe('11/03/2014');
        expect(dataTypes[0].strings).toBe(0);
        expect(dataTypes[0].numbers).toBe(0);
        expect(dataTypes[0].nulls).toBe(0);

        expect(sniffDataType.bind(dataTypes)('march', 0)).toBe(undefined);
        expect(dataTypes[0].dates).toBe(2);
        expect(dataTypes[0].dateValues[1]).toBe('march');

    });

    it('guess a number as int or date', function () {

        expect(sniffDataType.bind(dataTypes)('1', 0)).toBe(undefined);
        expect(dataTypes[0].dates).toBe(3);
        expect(dataTypes[0].numbers).toBe(1);
        expect(dataTypes[0].numberValues[0]).toBe('1');
        expect(dataTypes[0].dateValues[2]).toBe('1');

    });

    it('guess a nulls', function () {
        expect(sniffDataType.bind(dataTypes)(null, 0)).toBe(undefined);
        expect(dataTypes[0].nulls).toBe(1);
        expect(dataTypes[0].dates).toBe(3);

    });


});
