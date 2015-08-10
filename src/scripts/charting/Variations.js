var Backbone = require('./../core/backbone.js');

module.exports = new Backbone.Collection([
        {width: 600, height: null, variationName: 'ft-web-theme large', hasMaster: true},
        {width: 300, height: null, variationName: 'ft-web-theme regular'},
        {width: 186, height: null, variationName: 'ft-web-theme small'},
        {width: 200, height: 245,  variationName: 'ft-print-theme small'},
        {width: 600, height: 338,  variationName: 'ft-video-theme large', hasMaster: true, selectMaster: true}
    ])
;
