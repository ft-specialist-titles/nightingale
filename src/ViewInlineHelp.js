var Backbone = require('./core/backbone.js');
var Help = require('./help/index.js');

var ViewInlineHelp = Backbone.View.extend({
  render: function() {
    this.$el.popover({ 
      selector: '[data-help]',
      html: true,
      trigger: 'hover',
      content: function(el) {
        return this.dataset && this.dataset.help && this.dataset.help in Help ? Help[this.dataset.help] : null;
      }
    });
    return this;
  }
})

module.exports = ViewInlineHelp;
