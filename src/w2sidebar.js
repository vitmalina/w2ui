/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2sidebar	  - sidebar widget
*		- $.w2sidebar - jQuery wrapper
*   - Dependencies: jQuery, w2utils
*
*   NICE TO HAVE
*     - group animate open
*
*  == 1.2 changes 
*     - top_html, bottom_html
*     - suport for icon fonts
* 
************************************************************************/

(function () {
	var w2sidebar = function (options) {
		this.name			= null;
		this.box 			= null;
		this.sidebar		= null;
		this.parent 		= null;
		this.img 			= null;
		this.icon 			= null;
		this.style	 		= '';
		this.selected 		= null;	// current selected node (readonly)
		this.nodes	 		= []; 	// Sidebar child nodes
		this.top_html		= '';
		this.bottom_html    = '';
		this.onClick		= null;	// Fire when user click on Node Text
		this.onDblClick		= null;	// Fire when user dbl clicks
		this.onContextMenu	= null;	
		this.onOpen			= null;	// Fire when node Expands
		this.onClose		= null;	// Fire when node Colapses
		this.onRender 		= null;
		this.onRefresh		= null;
		this.onResize 		= null;
		this.onDestroy	 	= null;
	
		$.extend(true, this, options);
	}
	
	// ====================================================
	// -- Registers as a jQuery plugin
	
	$.fn.w2sidebar = function(method) {
		if (typeof method === 'object' || !method ) {
			// check required parameters
			if (!method || typeof method.name == 'undefined') {
				$.error('The parameter "name" is required but not supplied in $().w2sidebar().');
				return;
			}
			if (typeof w2ui[method.name] != 'undefined') {
				$.error('The parameter "name" is not unique. There are other objects already created with the same name (obj: '+ method.name +').');
				return;			
			}
			// extend items
			var nodes  = method.nodes;
			var object = new w2sidebar(method); 
			$.extend(object, { handlers: [], nodes: [] });
			if (typeof nodes != 'undefined') {
				object.add(object, nodes); 
			}
			if ($(this).length != 0) {
				$(this).data('w2name', object.name);
				object.render($(this)[0]);
			}
			object.sidebar = object;
			// register new object
			w2ui[object.name] = object;
			return object;
			
		} else if (typeof $(this).data('w2name') != 'undefined') {
			var obj = w2ui[$(this).data('w2name')];
			obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
			return this;
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.w2sidebar' );
		}    
	};
	
	// ====================================================
	// -- Implementation of core functionality
	
	w2sidebar.prototype = {
		node: {
			id	 			: null,
			text	   		: '',
			count			: '',
			img 			: null,
			icon 			: null,
			parent	 		: null,		// node object
			sidebar			: null,
			nodes	  		: [],
			style 			: '',
			selected 		: false,
			expanded 		: false,
			hidden			: false,
			disabled		: false,
			group			: false, 	// if true, it will build as a group
			// events
			onClick			: null,
			onDblClick		: null,
			onContextMenu	: null,
			onOpen			: null,
			onClose			: null
		},
		
		add: function (parent, nodes) {
			if (arguments.length == 1) {
				// need to be in reverse order
				nodes  = arguments[0];
				parent = this;
			}
			if (typeof parent == 'string') parent = this.get(parent);
			return this.insert(parent, null, nodes);
		},
		
		insert: function (parent, before, nodes) {
			if (arguments.length == 2) {
				// need to be in reverse order
				nodes   = arguments[1];
				before	= arguments[0];
				var ind = this.get(before);
				if (ind == null) {
					$.error('Cannot insert node "'+ nodes[o].text +'" because cannot find node "'+ before +'" to insert before.'); 
					return null; 
				}
				parent 	= this.get(before).parent;
			}
			if (typeof parent == 'string') parent = this.get(parent);
			if (!$.isArray(nodes)) nodes = [nodes];
			for (var o in nodes) {
				if (typeof nodes[o].id == 'undefined') { 
					$.error('Cannot insert node "'+ nodes[o].text +'" because it has no id.'); 
					continue;
				}
				if (this.get(this, nodes[o].id) != null) { 
					$.error('Cannot insert node with id='+ nodes[o].id +' (text: '+ nodes[o].text + ') because another node with the same id already exists.'); 
					continue;
				}
				var tmp = $.extend({}, w2sidebar.prototype.node, nodes[o]);
				tmp.sidebar= this;
				tmp.parent = parent;
				var nd = tmp.nodes;
				tmp.nodes  = []; // very important to re-init empty nodes array
				if (before == null) { // append to the end
					parent.nodes.push(tmp);	
				} else {
					var ind = this.getIndex(parent, before);
					if (ind == null) {
						$.error('Cannot insert node "'+ nodes[o].text +'" because cannot find node "'+ before +'" to insert before.'); 
						return null; 
					}
					parent.nodes.splice(ind, 0, tmp);
				}
				if (typeof nd != 'undefined' && nd.length > 0) { this.insert(tmp, null, nd); }
			}
			this.refresh(parent.id);
			return tmp;
		},
		
		remove: function () { // multiple arguments
			var deleted = 0;
			for (var a in arguments) {
				var tmp = this.get(arguments[a]);
				if (tmp == null) continue;
				var ind  = this.getIndex(tmp.parent, arguments[a]);
				if (ind == null) continue;
				tmp.parent.nodes.splice(ind, 1);
				deleted++;
			}
			if (arguments.length == 1) this.refresh(arguments[0]); else this.refresh();
			return deleted;
		},
		
		set: function (parent, id, node) { 
			if (arguments.length == 2) {
				// need to be in reverse order
				node    = id;
				id 		= parent;
				parent 	= this;
			}
			// searches all nested nodes
			this._tmp = null;
			if (typeof parent == 'string') parent = this.get(parent);
			if (parent.nodes == null) return null;
			for (var i=0; i < parent.nodes.length; i++) {
				if (parent.nodes[i].id == id) {
					// make sure nodes inserted correctly
					var nodes  = node.nodes;
					$.extend(parent.nodes[i], node, { nodes: [] });
					if (typeof nodes != 'undefined') {
						this.add(parent.nodes[i], nodes); 
					}					
					this.refresh(id);
					return true;
				} else {
					this._tmp = this.set(parent.nodes[i], id, node);
					if (this._tmp) return true;
				}
			}
			return false;
		},
		
		get: function (parent, id) { // can be just called get(id)
			if (arguments.length == 1) {
				// need to be in reverse order
				id 		= parent;
				parent 	= this;
			}
			// searches all nested nodes
			this._tmp = null;
			if (typeof parent == 'string') parent = this.get(parent);
			if (parent.nodes == null) return null;
			for (var i=0; i < parent.nodes.length; i++) {
				if (parent.nodes[i].id == id) {
					return parent.nodes[i];
				} else {
					this._tmp = this.get(parent.nodes[i], id);
					if (this._tmp) return this._tmp;
				}
			}
			return this._tmp;
		},
		
		getIndex: function (parent, id) { 
			if (arguments.length == 1) {
				// need to be in reverse order
				id 		= parent;
				parent 	= this;
			}
			// only searches direct descendands
			if (typeof parent == 'string') parent = this.get(parent);
			if (parent.nodes == null) return null;
			for (var i=0; i < parent.nodes.length; i++) {
				if (parent.nodes[i].id == id) {
					return i;
				}
			}
			return null;
		},		

		hide: function () { // multiple arguments
			var hidden = 0;
			for (var a in arguments) {
				var tmp = this.get(arguments[a]);
				if (tmp == null) continue;
				tmp.hidden = true;
				hidden++;
			}
			if (arguments.length == 1) this.refresh(arguments[0]); else this.refresh();
			return hidden;
		},
		
		show: function () {
			var shown = 0;
			for (var a in arguments) {
				var tmp = this.get(arguments[a]);
				if (tmp == null) continue;
				tmp.hidden = false;
				shown++;
			}
			if (arguments.length == 1) this.refresh(arguments[0]); else this.refresh();
			return shown;
		},
	
		disable: function () { // multiple arguments
			var disabled = 0;
			for (var a in arguments) {
				var tmp = this.get(arguments[a]);
				if (tmp == null) continue;
				tmp.disabled = true;
				if (tmp.selected) this.unselect(tmp.id);
				disabled++;
			}
			if (arguments.length == 1) this.refresh(arguments[0]); else this.refresh();
			return disabled;
		},
		
		enable: function () { // multiple arguments
			var enabled = 0;
			for (var a in arguments) {
				var tmp = this.get(arguments[a]);
				if (tmp == null) continue;
				tmp.disabled = false;
				enabled++;
			}
			if (arguments.length == 1) this.refresh(arguments[0]); else this.refresh();
			return enabled;
		},

		select: function (id) {
			if (this.selected == id) return false;
			this.unselect(this.selected);
			var new_node = this.get(id);
			if (!new_node) return false;
			$('#sidebar_'+ this.name +' #node_'+id.replace(/\./, '\\.'))
				.addClass('w2ui-selected')
				.find('.w2ui-icon').addClass('w2ui-icon-selected');
			new_node.selected = true;
			this.selected = id;
		},
		
		unselect: function (id) {
			var current = this.get(id);
			if (!current) return false;
			current.selected = false;
			$('#sidebar_'+ this.name +' #node_'+id.replace(/\./, '\\.'))
				.removeClass('w2ui-selected')
				.find('.w2ui-icon').removeClass('w2ui-icon-selected');
			if (this.selected == id) this.selected = null;
			return true;
		},
		
		doClick: function (id, event) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'click', target: id, event: event });	
			if (eventData.stop === true) return false;
			// default action
			var nd  = this.get(id);
			var obj = this;
			if (!nd.group && !nd.disabled) {
				$('#sidebar_'+ this.name +' .w2ui-node').each(function (index, field) {
					var nid = String(field.id).replace('node_', '');
					var nd  = obj.get(nid);
					if (nd && nd.selected) {
						nd.selected = false;
						$(field).removeClass('w2ui-selected').find('.w2ui-icon').removeClass('w2ui-icon-selected');
					}
				});
				$('#sidebar_'+ this.name +' #node_'+id.replace(/\./, '\\.'))
					.addClass('w2ui-selected')
					.find('.w2ui-icon').addClass('w2ui-icon-selected');
				this.get(id).selected = true;
				this.selected = id;
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},
		
		doDblClick: function (id, event) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'dblClick', target: id, event: event });	
			if (eventData.stop === true) return false;
			// default action
			var nd = this.get(id);
			if (nd.nodes.length > 0) this.doToggle(id, event);
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},
	
		doContextMenu: function (id, event) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'contextMenu', target: id, event: event });	
			if (eventData.stop === true) return false;
			
			// default action
			// -- no actions
			
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},
		
		doToggle: function(id, event) {
			if (this.get(id).expanded) this.doClose(id, event); else this.doOpen(id, event);
		},
	
		doOpen: function (id, event) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'open', target: id, event: event });	
			if (eventData.stop === true) return false;
			// default action
			var nd = this.get(id);
			if (nd.nodes.length == 0) return;
			// expand
			$('#sidebar_'+ this.name +' #node_'+ id.replace(/\./, '\\.') +'_sub').show();
			$('#sidebar_'+ this.name +' #node_'+ id.replace(/\./, '\\.') +' .w2ui-node-dots:first-child').html('<div class="w2ui-expand">-</div>');
			nd.expanded = true;
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},
		
		doClose: function (id, event) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'close', target: id, event: event });	
			if (eventData.stop === true) return false;
			// default action
			$('#sidebar_'+ this.name +' #node_'+ id.replace(/\./, '\\.') +'_sub').hide();		
			$('#sidebar_'+ this.name +' #node_'+ id.replace(/\./, '\\.') +' .w2ui-node-dots:first-child').html('<div class="w2ui-expand">+</div>');
			this.get(id).expanded = false;
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},
		
		render: function (box) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box });	
			if (eventData.stop === true) return false;
			// default action
			if (typeof box != 'undefined' && box != null) { 
				$(this.box).html(''); 
				this.box = box;
			}
			if (!this.box) return;
			$(this.box)
				.addClass('w2ui-reset w2ui-sidebar')
				.html(
					(this.top_html != '' ? this.top_html : '') +
					'<div id="sidebar_'+ this.name +'" class="w2ui-sidebar-div" style="'+ this.style +'"></div>'+
					(this.bottom_html != '' ? this.bottom_html : '')
				);
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			// ---
			this.refresh();
		},
		
		refresh: function (id) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'refresh', target: (typeof id != 'undefined' ? id : this.name) });	
			if (eventData.stop === true) return false;
			// default action
			var obj = this;
			if (typeof id == 'undefined') {
				var node = this;
				var nm 	 = '#sidebar_'+ this.name;
			} else {
				var node = this.get(id);
				var nm 	 = '#sidebar_'+ this.name +' #node_'+ node.id.replace(/\./, '\\.') + '_sub';
			}
			if (node != this) {
				var tmp = '#sidebar_'+ this.name +' #node_'+ node.id.replace(/\./, '\\.');
				var nodeHTML = getNodeHTML(node);
				$(tmp).before('<div id="sidebar_'+ this.name + '_tmp"></div>');
				$(tmp).remove();
				$(nm).remove();
				$('#sidebar_'+ this.name + '_tmp').before(nodeHTML);
				$('#sidebar_'+ this.name + '_tmp').remove();
			}
			// refresh sub nodes
			$(nm).html('');
			for (var i=0; i < node.nodes.length; i++) {
				var nodeHTML = getNodeHTML(node.nodes[i]);
				$(nm).append(nodeHTML);
				if (node.nodes[i].nodes.length != 0) { this.refresh(node.nodes[i].id); }
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			
			function getNodeHTML(nd) {
				var html = '';
				var img  = nd.img;
				if (typeof img == 'undefined') img = this.img;
				var icon  = nd.icon;
				if (typeof icon == 'undefined') icon = this.icon;
				// -- find out level
				var tmp   = nd.parent;
				var level = 0;
				while (tmp && tmp.parent != null) {
					if (tmp.group) level--;
					tmp = tmp.parent;
					level++;
				}	
				if (nd.group) {
					html = 
						'<div class="w2ui-node-group"  id="node_'+ nd.id +'"'+
						'		onclick="w2ui[\''+ obj.name +'\'].doClick(\''+ nd.id +'\', event); w2ui[\''+ obj.name +'\'].doToggle(\''+ nd.id +'\'); '+
						'				 var sp=$(this).find(\'span:nth-child(1)\'); if (sp.html() == \'Hide\') sp.html(\'Show\'); else sp.html(\'Hide\');"'+
						'		onmouseout="$(this).find(\'span:nth-child(1)\').css(\'color\', \'transparent\')" '+
						'		onmouseover="$(this).find(\'span:nth-child(1)\').css(\'color\', \'gray\')">'+
						'	<span>'+ (!nd.hidden && nd.expanded ? 'Hide' : 'Show') +'</span>'+
						'	<span>'+ nd.text +'</span>'+
						'</div>'+
						'<div class="w2ui-node-sub" id="node_'+ nd.id +'_sub" style="'+ nd.style +';'+ (!nd.hidden && nd.expanded ? '' : 'display: none;') +'"></div>';
				} else {
					if (nd.selected && !nd.disabled) obj.selected = nd.id;
					html = 
					'<div class="w2ui-node '+ (nd.selected ? 'w2ui-selected' : '') +' '+ (nd.disabled ? 'w2ui-disabled' : '') +'" id="node_'+ nd.id +'" style="'+ (nd.hidden ? 'display: none;' : '') +'"'+
						'	ondblclick="w2ui[\''+ obj.name +'\'].doDblClick(\''+ nd.id +'\', event); /* event.stopPropagation(); */"'+
						'	oncontextmenu="w2ui[\''+ obj.name +'\'].doContextMenu(\''+ nd.id +'\', event); /* event.stopPropagation(); */ event.preventDefault();"'+
						'	onClick="w2ui[\''+ obj.name +'\'].doClick(\''+ nd.id +'\', event); /* event.stopPropagation(); */">'+
						'<table cellpadding="0" cellspacing="0" style="margin-left:'+ (level*18) +'px; padding-right:'+ (level*18) +'px"><tr>'+
						'<td class="w2ui-node-dots" nowrap onclick="w2ui[\''+ obj.name +'\'].doToggle(\''+ nd.id +'\', event);">'+ 
						'	<div class="w2ui-expand">'	+ (nd.nodes.length > 0 ? (nd.expanded ? '-' : '+') : '') + '</div>' +
						'</td>'+
						'<td class="w2ui-node-data" nowrap>'+ 
							(img ? '<div class="w2ui-node-image w2ui-icon '+ img +' '+ 
								(nd.selected && !nd.disabled ? "w2ui-icon-selected" : "") +'" style="margin-top: 3px;"></div>' : '') +
							(icon ? '<div class="w2ui-node-image"><span class="'+ icon +'"></span></div>' : '') +
							(nd.count ? 
								'<div class="w2ui-node-count">'+ nd.count +'</div>' : '') +
							'<div class="w2ui-node-caption">'+ nd.text +'</div>'+
						'</td>'+
						'</tr></table>'+
					'</div>'+
					'<div class="w2ui-node-sub" id="node_'+ nd.id +'_sub" style="'+ nd.style +';'+ (!nd.hidden && nd.expanded ? '' : 'display: none;') +'"></div>';
				}
				return html;
			}
		},
	
		resize: function (width, height) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'resize', target: this.name, width: width, height: height });
			if (eventData.stop === true) return false;
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},
		
		destroy: function () { 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'destroy', target: this.name });	
			if (eventData.stop === true) return false;
			// clean up
			$(this.box).html('');
			delete w2ui[this.name];
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));	
		}				
	}
	
	$.extend(w2sidebar.prototype, $.w2event);
	w2obj.w2sidebar = w2sidebar;
})();
