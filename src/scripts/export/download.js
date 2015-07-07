/* globals XMLHttpRequest, btoa, Uint8Array */

var svgDataURI = require('./svgDataURI.js');
var util = require('./utils.js');


module.exports = function download(name, svg, types, bgColor, callback) {

    window.requestAnimationFrame(function () {
        types = types instanceof Array ? types : [types];
        types.forEach(function (type) {
            var filename = util.createFilename(name, type);
            var download = util.fileDownloader(filename);
            if (type === 'svg') {
                download.dataURI(svgDataURI.elementToDataURI(svg, {
                    encoding: 'utf8',
                    bgColor: bgColor
                })).start(callback);
            } else if (type === 'png' || type === 'jpg' || type === 'jpeg') {
                svgDataURI.elementToImageDataURI(svg, {type: type, bgColor: bgColor}, function (err, datauri) {
                    if (err) {
                        console.error(err.message);
                        return;
                    }

                    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
                    xmlhttp.open("POST", "http://png-stamper.herokuapp.com/stamp");
                    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                    xmlhttp.responseType = "arraybuffer";
                    xmlhttp.onload = function ( oEvent ) {
                        var arr = new Uint8Array(this.response);
                        var raw = String.fromCharCode.apply(null,arr);
                        var b64=btoa(raw);
                        var dataURL="data:image/png;base64,"+b64;
                        download.dataURI(dataURL).start(callback);
                    };
                    xmlhttp.onerror = function (error) {
                        console.error("couldn't stamp image");
                        return download.dataURI(datauri).start(callback);
                    };

                    xmlhttp.send(JSON.stringify({
                      file: datauri.replace("data:image/png;base64,", ""),
                      filename: filename,
                      stamp: {
                        Software: 'Nightingale',
                        Author: window.email
                      }
                    }));




                });
            } else {
                console.error('Unsupported format:', type);
                callback && callback();
            }
        });
    });
};
