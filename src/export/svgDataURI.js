var utils = require('./utils.js');

var svgSchema = 'http://www.w3.org/2000/svg';

var elementToDataURI = exports.elementToDataURI = function elementToDataURI(svg, opts) {

  opts = opts || {};
  opts.encoding = opts.encoding || 'base64';

  // we're about to modify the SVG with export hacks 
  // and background color etc so we need to make a copy
  svg = svg.cloneNode(true);

  var transparent = !opts.bgColor || opts.bgColor === 'transparent';

  if (!transparent) {
    var rect = document.createElementNS(svgSchema, 'rect');
    rect.id = 'backgroundFill';
    rect.setAttribute('x', 0);
    rect.setAttribute('y', 0);
    rect.setAttribute('width', svg.getAttribute('width'));
    rect.setAttribute('height', svg.getAttribute('height'));
    rect.setAttribute('fill', opts.bgColor);
    svg.insertBefore(rect, svg.firstChild);
  }

  var xmlSrc = utils.svgToString(svg);

  // 2. Ensure the SVG can make a picture.
  //    TODO: do we also need to check
  //          - the svg has child nodes
  //          - has visibility and size (w & h)

  // 3. Modify XML exporting so it is more portable
  //    TODO: modify SVG XML acording to all the Hacks we'll need to suuport
  //          eg when SVGs get imported into Adobe Illustrator and Inkscape

  return utils.toDataURI(xmlSrc, 'image/svg+xml', opts.encoding);
};

exports.elementToImageDataURI = function elementToImageDataURI(svg, opts, callback) {
  opts = opts || {};
  opts.type = 'image/' + (opts.type || 'png').toLowerCase();
  opts.quality = Math.max(0, Math.min(1, opts.quality || 1));

  if (opts.type === 'image/jpg') {
    // although jpg is a recognised file extension
    // it's not the correct mime type
    opts.type = opts.type.replace('jpg', 'jpeg');
  }

  var noTransparencySupport = opts.type === 'image/jpeg';
  var transparent = !opts.bgColor || opts.bgColor === 'transparent';

  if (noTransparencySupport && !transparent) {
    opts.bgColor = '#ffffff';
  }

  // NOTE: this technique of using Canvas to save an image of an SVG
  //       is know to not work in some cases: mostly when the some
  //       of the funkier SVG features are being used.
  //       If this becomes a problem look into using CanVG
  //            - https://code.google.com/p/canvg/
  //       Here's an example of it being used
  //            - https://github.com/sampumon/SVG.toDataURL/blob/master/svg_todataurl.js

  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  var image = new Image();

  image.onload = function() {

    // TODO: understand more about canvas dimensions. read this.
    //        - http://stackoverflow.com/questions/4938346/canvas-width-and-height-in-html5

    var w = canvas.width = image.width;
    var h = canvas.height = image.height;
    var s = canvas.style;
    s.width = w + 'px';
    s.height = h + 'px';

    context.drawImage(image, 0, 0);
    var datauri = canvas.toDataURL(opts.type, opts.quality);
    
    // TODO: Research use of canvas.toDataURLHD.
    //       Is canvas.toBlob/canvas.toBlobHD more
    //       performant than canvas.toDataURL ?
    //       - https://developer.mozilla.org/en/docs/Web/API/HTMLCanvasElement

    callback(null, datauri);
  };

  image.onerror = function() {
    callback(new Error('Error creating image'));
  };

  image.src = elementToDataURI(svg, {bgColor: opts.bgColor});
};
