var Backbone = require('./../core/backbone.js');

module.exports = new Backbone.Collection([
        {width: 600, height: null, variationName: 'ft-theme large', hasMaster: true},
        {width: 300, height: null, variationName: 'ft-theme regular'},
        {width: 186, height: null, variationName: 'ft-theme small'},
        {width: 200, height: 245,  variationName: 'print-theme small'},
        {width: 600, height: 338,  variationName: 'video-theme large', hasMaster: true, selectMaster: true}
    ])
;
