var pipeline = require('../../../src/scripts/import/validateFilePipeline');

var pipelineData = '&	FTSE 100 - PRICE INDEX\n' +
    '11 Dec 2014	6461.7\n' +
    '12 Dec 2014	6300.63\n' +
    '15 Dec 2014	6182.72';

var pipelineFile =  pipelineData + '\n' +
'&title=FTSE 100\n' +
'&subtitle=Index\n' +
'&source=Thomson Reuters Datastream\n' +
'&comment=our commments\n' +
'&doublescale=0\n' +
'&accumulate=false\n';

describe('validateFilePipeline can ', function () {

    it('validate a file', function () {

        expect(pipeline.isValid('&	')).toBe(true);
        expect(pipeline.isValid('& ')).toBe(false);

    });

    it('parse a file', function () {

        var parsed = pipeline.parse(pipelineFile);
        expect(parsed.dataString).toBe(pipelineData);
        expect(parsed.options.accumulate).toBe('false');
        expect(parsed.options.doublescale).toBe('0');
        expect(parsed.options.subtitle).toBe('Index');
        expect(parsed.options.title).toBe('FTSE 100');
        expect(parsed.options.comment).toBe('our commments');

    });

});
