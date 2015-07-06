var RegionView = require('./../core/RegionView.js');

var ViewSaveImageControls = RegionView.extend({

    initialize: function (options) {
        this.hasMaster = options.model.get('variationName').split(' ').indexOf('large')>-1;
    },

    className: 'view-save-image-controls',

    template: require('./../templates/save-image-controls.hbs'),

    bindings: {
        '[name="save-size"]': 'standard',
        '[name="save-format"]': 'png'
    },

    render: function () {
        this.el.innerHTML = this.template({ hasMaster:this.hasMaster });
        this.stickit(this.model);
        return this;
    }

});

module.exports = ViewSaveImageControls;
