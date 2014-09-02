var Backbone = require('./core/backbone.js');
var CollectionView = require('./core/CollectionView.js');
var RegionView = require('./core/RegionView.js');
var Datatypes = require('./Datatypes.js');
var $ = require('jquery');

function valueIsNumeric(value) { return value === Datatypes.NUMERIC; }
function valueIsCategorical(value) { return value === Datatypes.CATEGORICAL; }
function valueIsTime(value) { return value === Datatypes.TIME; }


function sortablelist(view){

  var placeholder = $('<div class="sortablelist-placeholder"/>');
  var index;
  var tempIndex;
  var dragging;
  return {
    dragstart: function(e) {
      if (!e.target.draggable) return false;
      var dataTransfer = e.originalEvent.dataTransfer;
      dataTransfer.effectAllowed = 'move';
      dataTransfer.setData('Text', 'dummy');
      var t = $(e.target);
      index = (dragging = $(e.target)).addClass('sortable-dragging').index();
      placeholder.html(t.html().replace(/\d+\./,''));
    },
    dragend: function(e) {
      if (!dragging) return;
      dragging.removeClass('sortable-dragging').show();
      placeholder.detach();
      // if (index !== dragging.index()) {
      //   var t = $(e.target);
      //   var newIndex = t.index();
      //   t.trigger({type: 'reorder', item: dragging, oldIndex: index, newIndex: newIndex});
      // }

      // no-cancel behaviour
      if (index !== tempIndex) {
        var t = $(e.target);
        t.trigger({type: 'reorder', item: dragging, oldIndex: index, newIndex: tempIndex});
      }
      dragging = null;
    },
    dragover: function(e) {
      if (e.type === 'drop') {
        e.stopPropagation();
        if (placeholder.is(':visible')) {
          placeholder.after(dragging);
        }
        dragging.trigger('dragend');
        return false;
      }
      e.preventDefault();
      e.originalEvent.dataTransfer.dropEffect = 'move';
      if (e.target.draggable) {
        dragging.hide();
        var t = $(e.target);
        var after = placeholder.index() < t.index()
        var p = t[after ? 'after' : 'before'](placeholder);
        
        // no-cancel behaviour
        tempIndex = view.$('>*:visible').index(placeholder);
      }
      return false;
    }
  };
}


var ViewSeries = CollectionView.extend({

  className: 'view-series-list',

  initialize: function() {
    CollectionView.prototype.initialize.apply(this, arguments);
    this._sortablelist = sortablelist(this);
  },

  events: {
    'dragstart': function(event){
      return this._sortablelist.dragstart(event);
    },
    dragend: function(event) {
      return this._sortablelist.dragend(event);
    },
    'dragover' : 'dragover',
    'dragenter' : 'dragover',
    'drop' : 'dragover',
    reorder: function(event) {
      var collection = this.collection;
      var model = collection.at(event.oldIndex);
      collection.remove(model, {silent:true});
      collection.add(model, {at: event.newIndex});
    }
  },

  dragover: function(event) {
    return this._sortablelist.dragover(event);
  },

  createView: function(model, index) {
    model.index = index;
    model.isLast = index >= this.collection.length - 1;
    return CollectionView.prototype.createView.call(this, model, index);
  },

  itemView: Backbone.View.extend({

    initialize: function() {
      this.listenTo(this.model, 'change:isOther', this.updateClassName);
    },

    className: function() {
      return 'view-series-list-item series-' + (this.model.get('isOther') ? 'other' : this.model.index + 1);
    },

    events: {
      'focus [name="property"]': 'selectText',
      'blur [name="property"]': 'blurLabelField',
      'keydown [name="property"]': 'keydownLabelField'
    },

    attributes: {
      draggable: 'true'
    },

    bindings: {
      '[name="property"]': 'property',
      '[name="isOther"]': 'isOther'
    },

    template: require('./templates/ordered-column.hbs'),

    keydownLabelField: function(event) {
      var esc = event.which === 27;
      var newline = event.which === 13;
      if (esc) {
        document.execCommand('undo');
        event.target.blur();
      } else if (!event.altKey && newline) {
        event.preventDefault();
        event.target.blur();
      }
    },

    updateClassName: function() {
      this.el.className = this.className();
    },

    blurLabelField: function(event) {
      // FIXME: allow line breaks in the value
      var value = event.target.textContent;
      if (!value) {
        event.target.textContent = this.model.get('property');
        return;
      }
      this.model.set('property', value);
    },

    selectText: function(event) {
      window.requestAnimationFrame(function() {
          var range = document.createRange();
          range.selectNodeContents(event.target);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
      });
    },

    render: function() {
      var d = this.model.toJSON();
      d.index = this.model.index + 1;
      d.primary = d.index === 1;
      d.isLast = this.model.isLast;
      this.el.innerHTML = this.template(d);
      this.stickit();
      return this;
    }

  })

});


var ViewDatatype = Backbone.View.extend({

  className: 'view-datatype',

  template: require('./templates/datatype.hbs'),

  bindings: {
    '[name="datatype"]': 'datatype'
  },

  render: function(){
    var data = this.model ? this.model.toJSON() : {};
    this.el.innerHTML = this.template(data);
    this.stickit();
    return this;
  }

});


var ViewHighlight = Backbone.View.extend({

  className: 'view-highlight',

  template: require('./templates/highlight.hbs'),

  bindings: {
    '[data-section-name="categorical"]': {
      observe: 'datatype',
      visible: valueIsCategorical
    },
    '[data-section-name="numeric"]': {
      observe: 'datatype',
      visible: valueIsNumeric
    },
    '[data-section-name="time"]': {
      observe: 'datatype',
      visible: valueIsTime
    }
  },

  render: function() {
    var data = this.model ? this.model.toJSON() : {};
    this.el.innerHTML = this.template(data);
    this.stickit();
    return this;
  }

});


var ViewDimensions = CollectionView.extend({

  className: 'view-dimensions',

  itemView: RegionView.extend({

    initialize: function() {
      RegionView.prototype.initialize.apply(this, arguments);
      this.listenTo(this.model, 'change:warningMessage', this.render);
    },

    className: 'view-single-dimension',

    template: require('./templates/dimension.hbs'),

    regions: {
      '[data-region="series"]': function () {
        return new ViewSeries({collection: this.model.columns});
      },
      '[data-region="datatype"]': function () {
        return new ViewDatatype({model: this.model});
      },
      '[data-region="highlight"]': function () {
        return new ViewHighlight({model: this.model});
      }
    },

    events: {
      submit: function (event) {
        event.preventDefault();
      }
    },

    bindings: {
      ':el': {
        observe: 'hasSeries',
        visible: true
      },
      '[name="label"]': {
        observe: ['label', 'suggestedLabel'],
        onGet: function(values) {
          return values[0] || values[1];
        },
        onSet: function(value) {
          return [(value || '').trim(), this.model.get('suggestedLabel')];
        }
      },
      '[data-section-name="series"]': {
        observe: 'multiseries',
        visible: true
      },
      '[data-section-name="forecast"]': {
        observe: 'datatype',
        visible: valueIsTime
      },
      '[data-section-name="label-format"]': {
        observe: 'datatype',
        visible: valueIsNumeric
      }
    },

    render: function() {
      RegionView.prototype.render.apply(this, arguments);
      this.stickit();
      return this;
    }

  })

});

module.exports = ViewDimensions;
