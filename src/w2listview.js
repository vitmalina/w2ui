/************************************************************************
*	Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*	- Following objects defined
*		- w2listview		- listview widget
*		- $().w2listview	- jQuery wrapper
*   - Dependencies: jQuery, w2utils
*
* == NICE TO HAVE ==
*	- icons/images support
*	- "Ctrl"/"Shift" keys support in multiselect mode
*
************************************************************************/

(function () {
	var w2listview = function (options) {
		this.box		= null;		// DOM Element that holds the element
		this.name		= null;		// unique name for w2ui
		this.vType		= null;
		this.items		= [];
		this.menu		= [];
		this.multiselect	= true;		// multiselect support
		this.keyboard		= true;		// keyboard support
		this.focused		= null;		// focused item
		this.onClick		= null;
		this.onDblClick		= null;
		this.onKeydown		= null;
		this.onContextMenu	= null;
		this.onMenuClick	= null;		// when context menu item selected
		this.onRender		= null;
		this.onRefresh		= null;
		this.onDestroy		= null;

		$.extend(true, this, w2obj.listview, options);
	};

	// ====================================================
	// -- Registers as a jQuery plugin

	$.fn.w2listview = function(method) {
		if (typeof method === 'object' || !method ) {
			// check name parameter
			if (!$.fn.w2checkNameParam(method, 'w2listview')) return;
			if (typeof method.viewType !== 'undefined') {
				method.vType = method.viewType;
				delete method.viewType;
			}
			var items  = method.items;
			var object = new w2listview(method);
			$.extend(object, { items: [], handlers: [] });
			for (var i in items) { object.items[i] = $.extend({}, w2listview.prototype.item, items[i]); }
			if ($(this).length !== 0) {
				object.render($(this)[0]);
			}
			// register new object
			w2ui[object.name] = object;
			return object;
		} else if (w2ui[$(this).attr('name')]) {
			var obj = w2ui[$(this).attr('name')];
			obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
			return this;
		} else {
			console.log('ERROR: Method ' +  method + ' does not exist on jQuery.w2listview' );
		}
	};

	// ====================================================
	// -- Implementation of core functionality

	w2listview.prototype = {
		item : {
			id		: null,		// param to be sent to all event handlers
			caption		: '',
			description	: '',
			selected	: false,
			onClick		: null,
			onDblClick	: null,
			onKeydown	: null,
			onContextMenu	: null,
			onRefresh	: null
		},

		viewType: function (value) {
			if (arguments.length === 0) {
				switch (this.vType) {
					case 'icon-tile':
						return 'icon-tile';
					case 'icon-large':
						return 'icon-large';
					case 'icon-medium':
						return 'icon-medium';
					default:
						return 'icon-small';
				}
			} else {
				this.vType = value;
				var vt = 'w2ui-' + this.viewType();
				$(this.box)
					.removeClass('w2ui-icon-small w2ui-icon-medium w2ui-icon-large w2ui-icon-tile')
					.addClass(vt);
				return vt;
			}
		},

		add: function (item) {
			return this.insert(null, item);
		},

		insert: function (id, item) {
			if (!$.isArray(item)) item = [item];
			// assume it is array
			for (var r in item) {
				// checks
				if (String(item[r].id) == 'undefined') {
					console.log('ERROR: The parameter "id" is required but not supplied. (obj: '+ this.name +')');
					return;
				}
				var unique = true;
				for (var i in this.items) { if (this.items[i].id == item[r].id) { unique = false; break; } }
				if (!unique) {
					console.log('ERROR: The parameter "id='+ item[r].id +'" is not unique within the current items. (obj: '+ this.name +')');
					return;
				}
				if (!w2utils.isAlphaNumeric(item[r].id)) {
					console.log('ERROR: The parameter "id='+ item[r].id +'" must be alpha-numeric + "-_". (obj: '+ this.name +')');
					return;
				}
				// add item
				item = $.extend({}, item, item[r]);
				if (id === null || typeof id == 'undefined') {
					this.items.push(item);
				} else {
					var middle = this.get(id, true);
					this.items = this.items.slice(0, middle).concat([item], this.items.slice(middle));
				}
				this.refresh(item[r].id);
			}
		},

		remove: function (id) {
			var removed = 0;
			for (var i = 0; i < arguments.length; i++) {
				var item = this.get(arguments[i]);
				if (!item) return false;
				removed++;
				// remove from array
				this.items.splice(this.get(item.id, true), 1);
				// remove from screen
				$(this.box).find('#itm_'+ w2utils.escapeId(item.id)).remove();
			}
			return removed;
		},

		set: function (id, item) {
			var index = this.get(id, true);
			if (index === null) return false;
			$.extend(this.items[index], item);
			this.refresh(id);
			return true;
		},

		get: function (id, returnIndex) {
            var i = 0
			if (arguments.length === 0) {
				var all = [];
				for (; i < this.items.length; i++) if (this.items[i].id !== null) all.push(this.items[i].id);
				return all;
			}
			for (; i < this.items.length; i++) {
				if (this.items[i].id === id) {
					if (returnIndex === true) return i; else return this.items[i];
				}
			}
			return null;
		},

		select: function (id, addSelection) {
            if (arguments.length === 1 || !this.multiselect) addSelection = false;
			if (!addSelection) {
				for (var i1 in this.items) {
					if (this.items[i1].id != id) this.unselect(this.items[i1].id);
				}
			}
			var item = this.get(id);
			if (!item) return false;
			if (!item.selected) {
				$(this.box).find('#itm_'+ w2utils.escapeId(id))
					.addClass('w2ui-selected');
				item.selected = true;
			}
			this.focused = id;
			return item.selected;
		},

		unselect: function (id) {
			for (var i = 0; i < arguments.length; i++) {
				var item = this.get(arguments[i]);
				if (item && item.selected) {
					item.selected = false;
					$(this.box).find('#itm_'+ w2utils.escapeId(item.id))
						.removeClass('w2ui-selected');
					if (this.focused === item.id) this.focused = null;
                }
			}
			return true;
		},

		// ===================================================
		// -- Internal Event Handlers

		click: function (id, event) {
			var obj = this;
			var item = obj.get(id);
			if (item == null) return false;
			var eventData = obj.trigger({ phase: 'before', type: 'click', target: id, originalEvent: event, object: item });
			var rslt = !(eventData.isCancelled === true);
			if (rslt) {
				// default action
				obj.select(id);
				// event after
				obj.trigger($.extend(eventData, { phase: 'after' }));
			}
			return rslt;
		},

		dblClick: function (id, event) {
			var obj = this;
			var item = obj.get(id);
			if (item == null) return false;
			var eventData = obj.trigger({ phase: 'before', type: 'dblClick', target: id, originalEvent: event, object: item });
			var rslt = !(eventData.isCancelled === true);
			if (rslt) {
				// default action
				// -- empty
				// event after
				obj.trigger($.extend(eventData, { phase: 'after' }));
			}
			return rslt;
		},

		keydown: function (event) {
			var obj = this;
			var item = this.get(obj.focused);
			if (item == null || obj.keyboard !== true) return false;
			var eventData = obj.trigger({ phase: 'before', type: 'keydown', target: obj.name, originalEvent: event });
			var rslt = !(eventData.isCancelled === true);
			if (rslt) {
				// default behaviour
				if (event.keyCode == 37) selectNeighbor('left');
				if (event.keyCode == 39) selectNeighbor('right');
				if (event.keyCode == 38) selectNeighbor('up');
				if (event.keyCode == 40) selectNeighbor('down');
				// cancel event if needed
				if ($.inArray(event.keyCode, [37, 38, 39, 40]) != -1) {
					if (event.preventDefault) event.preventDefault();
					if (event.stopPropagation) event.stopPropagation();
				}

				// event after
				obj.trigger($.extend(eventData, { phase: 'after' }));
			}
			return rslt;

			function selectNeighbor(neighbor) {
				var idx = obj.get(item.id, true);
                var newIdx;
				if (neighbor === 'up') newIdx = idx - itemsInLine();
				if (neighbor === 'down') newIdx = idx + itemsInLine();
				if (neighbor === 'left') newIdx = idx - 1;
				if (neighbor === 'right') newIdx = idx + 1;
				if (newIdx >= 0 && newIdx < obj.items.length && newIdx != idx) obj.select(obj.items[newIdx].id);
			}

			function itemsInLine() {
                var lv = $(obj.box).find('> ul');
				return ~~(lv.width() / w2utils.getSize(lv.find('> li').get(0), 'width'));
			}
		},

		contextMenu: function (id, event) {
			var obj = this;
			var item = this.get(id);
			if (item == null) return false;
            if (!item.selected) obj.select(id);
			var eventData = obj.trigger({ phase: 'before', type: 'contextMenu', target: id, originalEvent: event, object: item });
			var rslt = !(eventData.isCancelled === true);
			if (rslt) {
				// default action
				if (obj.menu.length > 0) {
					$(obj.box).find('#itm_'+ w2utils.escapeId(id))
						.w2menu(obj.menu, {
							left: (event ? event.offsetX || event.pageX : 50) - 25,
							select: function (item, event, index) { obj.menuClick(id, index, event); }
						}
					);
				}
				// event after
				obj.trigger($.extend(eventData, { phase: 'after' }));
			}
			return false;
		},

		menuClick: function (itemId, index, event) {
			var obj = this;
			// event before
			var eventData = obj.trigger({ phase: 'before', type: 'menuClick', target: itemId, originalEvent: event, menuIndex: index, menuItem: obj.menu[index] });
			var rslt = !(eventData.isCancelled === true);
			if (rslt) {
				// default action
				// -- empty
				// event after
				obj.trigger($.extend(eventData, { phase: 'after' }));
			}
			return rslt;
		},

		refresh: function (id) {
			var time = (new Date()).getTime();
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			if (String(id) == 'undefined') {
				// refresh all
				for (var i in this.items) this.refresh(this.items[i].id);
			}
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'refresh', target: (typeof id != 'undefined' ? id : this.name), object: this.get(id) });
			if (eventData.isCancelled === true) return false;
			// create or refresh only one item
			var item = this.get(id);
			if (item === null) return false;
			//if (typeof item.caption != 'undefined') item.text = item.caption;

			var jq_el   = $(this.box).find('#itm_'+ w2utils.escapeId(item.id));
			var itemHTML =
					'<div class="icon-small">small icon</div> ' +
					'<div class="icon-medium">medium icon</div> ' +
					'<div class="icon-large">large icon</div> ' +
					'<div class="caption">' + item.caption + '</div> ' +
					'<div class="description">' + item.description + '</div>';
			if (jq_el.length === 0) {
				// does not exist - create it
				html =	'<li id="itm_'+ item.id +'" ' +
					'onclick="w2ui[\''+ this.name +'\'].click(\''+ item.id +'\', event);" '+'' +
					'ondblclick="w2ui[\''+ this.name +'\'].dblClick(\''+ item.id +'\', event);" '+
					'oncontextmenu="w2ui[\''+ this.name +'\'].contextMenu(\''+ item.id +'\', event); if (event.preventDefault) event.preventDefault();" '+
					'>'+ itemHTML + '</li>';
				if (this.get(id, true) != this.items.length-1 && $(this.box).find('#itm_'+ w2utils.escapeId(this.items[parseInt(this.get(id, true))+1].id)).length > 0) {
					$(this.box).find('#itm_'+ w2utils.escapeId(this.items[parseInt(this.get(id, true))+1].id)).before(html);
				} else {
					$(this.box).find('#itmlast').before(html);
				}
			} else {
				// refresh
				jq_el.html(itemHTML);
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			return (new Date()).getTime() - time;
		},

		render: function (box) {
			var time = (new Date()).getTime();
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box });
			if (eventData.isCancelled === true) return false;
			// default action
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			if (String(box) != 'undefined' && box !== null) {
				if ($(this.box).find('> ul #itmlast').length > 0) {
					$(this.box)
						.removeAttr('name')
						.removeClass('w2ui-reset w2ui-listview w2ui-icon-small w2ui-icon-medium w2ui-icon-large w2ui-icon-tile')
						.html('');
				}
				this.box = box;
			}
			if (!this.box) return false;
			// render all items
			var html =	'<ul><li id="itmlast" style="display: none;"></li></ul>';
			$(this.box)
				.attr('name', this.name)
				.addClass('w2ui-reset w2ui-listview w2ui-' + this.viewType())
				.html(html);
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.refresh();
			return (new Date()).getTime() - time;
		},

		destroy: function () {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'destroy', target: this.name });
			if (eventData.isCancelled === true) return false;
			// clean up
			if ($(this.box).find('> ul #itmlast').length > 0) {
				$(this.box)
					.removeAttr('name')
					.removeClass('w2ui-reset w2ui-listview w2ui-icon-small w2ui-icon-medium w2ui-icon-large w2ui-icon-tile')
					.html('');
			}
			delete w2ui[this.name];
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		}
	};

	$.extend(w2listview.prototype, w2utils.event);
	w2obj.listview = w2listview;
})();
