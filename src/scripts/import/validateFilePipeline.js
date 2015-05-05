module.exports = {
    isValid : function(str) {
        return str.substring(0, 2) === '&\t';
    },
    parse : function(str) {
        /*jshint -W084 */
        var lines = str.trim().split(/[\n\r]+/gm);
        var line;
        var options = {};

        while (line = lines.pop()) {
            if (!line) {
                continue;
            }
            if (line.charAt(0) === '\t') {
                throw new Error('Pipeline formatted files must have a value for every cell in the index ("&") column.');
            }
            line = line.trim();
            if (!line) {
                continue;
            }
            if (line.charAt(0) !== '&') {
                lines.push(line);
                break;
            }
            var bits = line.split(/=/).map(Function.prototype.call, String.prototype.trim);
            var value = bits[1];
            if (value || value !== 'delete if not required') {
                options[bits[0].replace(/^&/, '')] = value;
            }
        }
        str = lines.join('\n');
        return {dataString: str, options: options};
    }
};
