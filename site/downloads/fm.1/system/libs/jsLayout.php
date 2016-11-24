<? require("phpCache.php"); ?>
/***********************************
*
* -- This the jsLayout class
*
***********************************/

function jsLayoutPanel(name, title, object, psize, resizable) {
	// internal
	this.name			= name; 	// left, rigth, top, bottom, 'custom_name'
	this.hidden			= false;
	this.size			= psize;	// width or height depending on panel name
	this.resizable		= resizable;
	// public propreties	this.object 		= object; 	// can be a layout, list, edit, etc.
	this.title			= title;
	this.style_title 	= '';
	this.style_body		= '';
	this.width;		// readonly
	this.height;	// readonly
	// public methods
	this.init		= jsLayoutPanel_init;
	this.refresh	= jsLayoutPanel_refresh;
	// internal
	this.owner;
	this.getHTML	= jsLayoutPanel_getHTML;
	this.resize		= jsLayoutPanel_resize;
	
	// ==============-------------------------------
	// --- IMPLEMENTATION

	function jsLayoutPanel_getHTML() {
		var html;
		html =  '<div id="'+ this.owner.name + '_panel_'+ this.name +'" '+
				'	style="position: absolute; left: 0px; top: 0px; width: 0px; height: 0px; overflow: hidden;"'+
				'>'+
				'<table cellpadding=0 cellspacing=0 style="width: 100%; height: 100%;">'+
				'<tr><td id="'+ this.owner.name + '_panel_'+ this.name +'_title" class="pTitle"></td></tr>'+
				'<tr><td valign=top id="'+ this.owner.name + '_panel_'+ this.name +'_body" class="pBody">'+
				'</td></tr>'+
				'</table>'+
				'</div>'+
				'<div id="'+ this.owner.name + '_panel_resize_'+ this.name +'" style="font-size: 1px; position: absolute; display: none"></div>';
		return html;
	}

	function jsLayoutPanel_resize() {
		var body  = this.owner.box.ownerDocument.getElementById(this.owner.name + '_panel_'+ this.name +'_body');
		var title = this.owner.box.ownerDocument.getElementById(this.owner.name + '_panel_'+ this.name +'_title');
		var notitle;
		if (this.title != '' && this.title != null && String(this.title) != 'undefined') { notitle = false; } else { notitle = true; }
		// refresh body
		if (this.object != null && typeof(this.object) == 'object') {
			body.style.border  = 0;
			body.style.padding = 0;
			body.style.margin  = 0;
		}
		try { // -- for IE
			body.style.width   = this.width;
			body.style.height  = parseInt(this.height) - (notitle ? 0 : 26);
		} catch (e) {}
	}

	function jsLayoutPanel_init(obj) {
		this.object = obj;
		this.refresh();
	}

	function jsLayoutPanel_refresh() {
		var body  = this.owner.box.ownerDocument.getElementById(this.owner.name + '_panel_'+ this.name +'_body');
		var title = this.owner.box.ownerDocument.getElementById(this.owner.name + '_panel_'+ this.name +'_title');
		if (!body) return;
		// refresh title
		if (this.title != '' && this.title != null && String(this.title) != 'undefined') {
			var notitle = false;
			title.innerHTML  	= this.title;
			title.style.cssText = 'height: 26px;' + this.style_title;
		} else {
			var notitle = true;
			if (title) title.style.cssText = "display: none; height: 0px;";
		}
		// refresh body
		body.style.cssText += this.style_body;
		if (this.object == null) {
			body.innerHTML = '';
		}
		if (this.object != null && typeof(this.object) == 'object') {
			body.style.border  = 0;
			body.style.padding = 0;
			body.style.margin  = 0;
			try { // -- for IE
				body.style.width   = this.width;
				body.style.height  = parseInt(this.height) - (notitle ? 0 : 26);
			} catch (e) {}
			// --
			this.object.box = body;
			this.object.output();
		}
		if (this.object != null && typeof(this.object) == 'string') {
			body.innerHTML = this.object;
		}
	}
}

function jsLayout(name, box) {
	// public properties
    this.name  	  	= name;
    this.box      	= box; 	// HTML element that hold this element only applicable to document.body
    this.panels     = [];
	this.padding 	= 0;
	this.border     = 3;
	this.style		= '';
    // public readonly
    this.left;	// this vars will be set by resize
    this.top;
    this.width;
    this.height;
    // public methods
    this.addPanel		= jsLayout_addPanel;
	this.initPanel		= jsLayout_initPanel;
    this.findPanel		= jsLayout_findPanel;
	this.hidePanel		= jsLayout_hidePanel;
	this.showPanel		= jsLayout_showPanel;
	this.togglePanel 	= jsLayout_togglePanel;
    this.output 		= jsLayout_output;
    this.resize			= jsLayout_resize;

	// internal
	this.initEvents 	= jsLayout_initEvents;
	this.startResize 	= jsLayout_startResize;
	this.doResize	 	= jsLayout_doResize;
	this.stopResize  	= jsLayout_stopResize;

	// register element in the top
    if (!top.jsUtils) alert('The jsUtils class is not loaded. This class is a must for the jsList class.');
	if (!top.elements) top.elements = [];
    if (top.elements[this.name]) alert('The element with this name "'+ this.name +'" is already registered.');
    top.elements[this.name] = this;

    // initialization
    this.addPanel('main', null, null, null, null);
	if (this.box) { this.initEvents(); }
	
	// ==============-------------------------------
	// --- IMPLEMENTATION

	function jsLayout_output() {
		if (!this.box) return;
		var strPanels = ['top', 'left', 'main', 'right', 'bottom'];
		var html = '';
		var panel;
		// top panel if any
		panel = this.findPanel('top');    if (panel != null) html += panel.getHTML();
		panel = this.findPanel('left');	  if (panel != null) html += panel.getHTML();
		panel = this.findPanel('main');   if (panel != null) html += panel.getHTML();
		panel = this.findPanel('right');  if (panel != null) html += panel.getHTML();
		panel = this.findPanel('bottom'); if (panel != null) html += panel.getHTML();
		// output
		this.box.innerHTML = html;
		this.box.style.cssText += this.style;
		this.resize();
		if (window.attachEvent) setTimeout(new Function("top.elements['"+ this.name + "'].resize()"), 1);
		// refresh objects in the layout;
		for (key in strPanels) {
			panel = this.findPanel(strPanels[key]);
			if (panel == null) continue;
			panel.refresh();
		}
		// reinit events
		this.initEvents();
		window.setTimeout("top.elements."+ this.name +".resize();", 200); // some bug
		window.setTimeout("top.elements."+ this.name +".resize();", 900);
	}

	function jsLayout_resize() {
		if (!this.box) return;
		if (this.box.tagName == 'BODY') {
			this.left = 0;
			this.top  = 0;
			if (window.innerHeight == undefined) {
				this.width  = this.box.ownerDocument.body.clientWidth;
				this.height = this.box.ownerDocument.body.clientHeight;
			} else {
				this.width  = window.innerWidth;
				this.height = window.innerHeight;
			}
		} else {
			this.left 	= parseInt(this.box.style.left);
			this.top 	= parseInt(this.box.style.top);
			this.width  = parseInt(this.box.style.width);
			this.height = parseInt(this.box.style.height);
		}
		this.box.style.overflow = 'hidden';
		// reset width/height for panels
		var strPanels = ['top', 'left', 'main', 'right', 'bottom'];
		pt = this.findPanel('top');		if (pt && pt.hidden) pt = null;
		pl = this.findPanel('left');	if (pl && pl.hidden) pl = null;
		pm = this.findPanel('main');
		pr = this.findPanel('right');	if (pr && pr.hidden) pr = null;
		pb = this.findPanel('bottom');	if (pb && pb.hidden) pb = null;
		for (key in strPanels) {
			var ppl = this.box.ownerDocument.getElementById(this.name + '_panel_'+ strPanels[key]);
			panel = this.findPanel(strPanels[key]);
			if (panel == null && !panel) continue;
			if (panel.hidden) { ppl.style.display = 'none'; continue; } else { ppl.style.display = ''; }
			if (panel.name == 'top') {
				panel.width      = parseInt(this.width) - parseInt(this.padding)*2;
				panel.height     = parseInt(panel.size);
				try {
					ppl.style.left	 = parseInt(this.padding);
					ppl.style.top	 = parseInt(this.padding);
					ppl.style.width  = parseInt(panel.width);
					ppl.style.height = parseInt(panel.height);
				} catch(e) {}
				//  add resizable div
				if (panel.resizable) {
					var ppr = this.box.ownerDocument.getElementById(this.name + '_panel_resize_'+ strPanels[key]);
					ppr.style.left 	  = parseInt(ppl.style.left);
					ppr.style.top 	  = parseInt(ppl.style.top) + parseInt(panel.height);
					ppr.style.width   = parseInt(ppl.style.width);
					ppr.style.height  = parseInt(this.border);
					ppr.style.zIndex  = 1001;
					ppr.style.display = '';
					ppr.style.cursor  = 'N-resize';
					ppr.onmousedown   = new Function('event', "el = top.elements['"+ this.name +"']; el.startResize('"+ panel.name +"', event); return false;");
				}
			}
			if (panel.name == 'left') {
				panel.width      = parseInt(panel.size);
				panel.height     = parseInt(this.height)
									- (pt ? parseInt(pt.size) + parseInt(this.border) + parseInt(this.padding) : parseInt(this.padding))
									- (pb ? parseInt(pb.size) + parseInt(this.border) + parseInt(this.padding) : parseInt(this.padding));
				try {
					ppl.style.left	 = parseInt(this.padding);
					ppl.style.top	 = parseInt(this.padding)
										+ (pt ? parseInt(pt.size) + parseInt(this.border) : 0);
					ppl.style.width  = parseInt(panel.width);
					ppl.style.height = parseInt(panel.height);
				} catch(e) {}
				//  add resizable div
				if (panel.resizable) {
					var ppr = this.box.ownerDocument.getElementById(this.name + '_panel_resize_'+ strPanels[key]);
					ppr.style.left 	  = parseInt(ppl.style.left) + parseInt(ppl.style.width);
					ppr.style.top 	  = parseInt(ppl.style.top);
					ppr.style.width   = parseInt(this.border);
					ppr.style.height  = parseInt(ppl.style.height);
					ppr.style.zIndex  = 100;
					ppr.style.display = '';
					ppr.style.cursor  = 'E-resize';
					ppr.onmousedown   = new Function('event', "el = top.elements['"+ this.name +"']; el.startResize('"+ panel.name +"', event); return false;");
				}
			}
			if (panel.name == 'main') {
				panel.width      = parseInt(this.width)
									- (pl ? parseInt(pl.size) + parseInt(this.border) + parseInt(this.padding) : parseInt(this.padding))
									- (pr ? parseInt(pr.size) + parseInt(this.border) + parseInt(this.padding) : parseInt(this.padding));
				panel.height     = parseInt(this.height)
									- (pt ? parseInt(pt.size) + parseInt(this.border) + parseInt(this.padding) : parseInt(this.padding))
									- (pb ? parseInt(pb.size) + parseInt(this.border) + parseInt(this.padding) : parseInt(this.padding));
				try { 					
					ppl.style.left	 = parseInt(this.padding)
										+ (pl ? parseInt(pl.size) + parseInt(this.border) : 0);
					ppl.style.top	 = parseInt(this.padding)
										+ (pt ? parseInt(pt.size) + parseInt(this.border) : 0);
					ppl.style.width  = parseInt(panel.width);
					ppl.style.height = parseInt(panel.height);
				} catch(e) {}
			}
			if (panel.name == 'right') {
				panel.width      = parseInt(panel.size);
				panel.height     = parseInt(this.height)
									- (pt ? parseInt(pt.size) + parseInt(this.border) + parseInt(this.padding) : parseInt(this.padding))
									- (pb ? parseInt(pb.size) + parseInt(this.border) + parseInt(this.padding) : parseInt(this.padding));
				try {
					ppl.style.left	 = parseInt(this.width) 
										- parseInt(panel.size) - parseInt(this.padding);
					ppl.style.top	 = parseInt(this.padding)
										+ (pt ? parseInt(pt.size) + parseInt(this.border) : 0);
					ppl.style.width  = parseInt(panel.width);
					ppl.style.height = parseInt(panel.height);
				} catch(e) {}
				//  add resizable div
				if (panel.resizable) {
					var ppr = this.box.ownerDocument.getElementById(this.name + '_panel_resize_'+ strPanels[key]);
					ppr.style.left 	  = parseInt(ppl.style.left) - parseInt(this.border);
					ppr.style.top 	  = parseInt(ppl.style.top);
					ppr.style.width   = parseInt(this.border);
					ppr.style.height  = parseInt(ppl.style.height);
					ppr.style.zIndex  = 100;
					ppr.style.display = '';
					ppr.style.cursor  = 'E-resize';
					ppr.onmousedown   = new Function('event', "el = top.elements['"+ this.name +"']; el.startResize('"+ panel.name +"', event); return false;");
				}
			}
			if (panel.name == 'bottom') {
				panel.width      = this.width - parseInt(this.padding)*2;
				panel.height     = parseInt(panel.size);
				try {
					ppl.style.left	 = parseInt(this.padding);
					ppl.style.top	 = parseInt(this.height) - parseInt(panel.height) - parseInt(this.padding);
					ppl.style.width  = parseInt(panel.width);
					ppl.style.height = parseInt(panel.height);
				} catch(e) {}
				//  add resizable div
				if (panel.resizable) {
					var ppr = this.box.ownerDocument.getElementById(this.name + '_panel_resize_'+ strPanels[key]);
					ppr.style.left    = parseInt(ppl.style.left);
					ppr.style.top 	  = parseInt(ppl.style.top) - parseInt(this.border);
					ppr.style.width   = parseInt(ppl.style.width);
					ppr.style.height  = parseInt(this.border);
					ppr.style.zIndex  = 100;
					ppr.style.display = '';
					ppr.style.cursor  = 'N-resize';
					ppr.onmousedown   = new Function('event', "el = top.elements['"+ this.name +"']; el.startResize('"+ panel.name +"', event); return false;");
				}
			}
		}
		// resize objects in the layout;
		var strPanels = ['top', 'left', 'main', 'right', 'bottom'];
		for (key in strPanels) {
			panel = this.findPanel(strPanels[key]);
			if (panel == null || !panel) continue;
			if (panel.resize) panel.resize();
			if (panel.object && panel.object.resize) { panel.object.resize(); }
		}
		return;
	}

	function jsLayout_addPanel(name, title, object, psize, resizable) {
		var ind = this.panels.length;
		this.panels[ind] = new top.jsLayoutPanel(name, title, object, psize, resizable);
		this.panels[ind].owner = this;
		return this.panels[ind];
	}

	function jsLayout_findPanel(name) {
		var panel;
		for (var i=0; i<this.panels.length; i++) {
			panel = this.panels[i];
			if (panel.name == name) return panel;
		}
		return null;
	}

	function jsLayout_initPanel(name, obj) {
		if (!this.box) return;
		var panel = this.findPanel(name);
		panel.init(obj);
		panel.refresh();
	}

	function jsLayout_togglePanel(name, status) {
		var panel = this.findPanel(name);
		if (name == 'main') return;
		if (panel) panel.hidden = (String(status) == 'undefined' ? !panel.hidden : status);
		this.resize();
	}

	function jsLayout_hidePanel(name) { this.togglePanel(name, true); }
	function jsLayout_showPanel(name) { this.togglePanel(name, false); }

	// --- INTERNAL FUNCTIONS

	function jsLayout_initEvents() {
		if (window.addEventListener) {
			top.addEventListener('resize', 	new Function("if (top.elements) top.elements['"+ this.name + "'].resize()"), false);
			top.addEventListener('mousemove', 	new Function("event", "if (top.elements) top.elements['"+ this.name + "'].doResize(event)"), false);
			top.addEventListener('mouseup',   	new Function("event", "if (top.elements) top.elements['"+ this.name + "'].stopResize(event)"), false);
			if (this.box) this.box.addEventListener('resize', 	 new Function("if (top.elements) top.elements['"+ this.name + "'].resize()"), false);
			if (this.box) this.box.addEventListener('mousemove', new Function("event", "if (top.elements) top.elements['"+ this.name + "'].doResize(event)"), false);
			if (this.box) this.box.addEventListener('mouseup',   new Function("event", "if (top.elements) top.elements['"+ this.name + "'].stopResize(event)"), false);
		} else {
			window.attachEvent('onresize', 	  new Function("if (top.elements) top.elements['"+ this.name + "'].resize()"));
			window.document.attachEvent('onmousemove',  new Function("if (top.elements) top.elements['"+ this.name + "'].doResize()"));
			window.document.attachEvent('onmouseup',    new Function("if (top.elements) top.elements['"+ this.name + "'].stopResize()"));
		}
		top.ie_no_event = new Function("return false;");
	}

	function jsLayout_startResize(type, evnt) {
		if (!this.box) return;
		if (!evnt) evnt = window.event;
		if (!window.addEventListener) { window.document.attachEvent('onselectstart', top.ie_no_event); }
		this.tmp_resizing = type;
		this.tmp_x = evnt.screenX;
		this.tmp_y = evnt.screenY;
		// process event
		var ppr = this.box.ownerDocument.getElementById(this.name + '_panel_resize_'+ type);
		ppr.style.backgroundColor = 'gray';
		this.tmp_left = parseInt(ppr.style.left);
		this.tmp_top  = parseInt(ppr.style.top);
	}

	function jsLayout_doResize(evnt) {
		if (!this.box) return;
		if (!evnt) evnt = window.event;
		if (this.tmp_resizing == undefined) return;
		type = this.tmp_resizing;

		var prl = this.box.ownerDocument.getElementById(this.name + '_panel_resize_'+ type);
		switch(type) 
		{
			case 'bottom':
			case 'top':
				prl.style.top = this.tmp_top + (evnt.screenY - this.tmp_y);
				break;

			case 'left':
			case 'right':
				prl.style.left = this.tmp_left + (evnt.screenX - this.tmp_x);
				break;
		}
	}

	function jsLayout_stopResize(evnt) {
		if (!this.box) return;
		if (!evnt) evnt = window.event;
		if (!window.addEventListener) { window.document.detachEvent('onselectstart', top.ie_no_event); }
		if (this.tmp_resizing == undefined) return;
		type = this.tmp_resizing;
		// stop resize
		var ppr = this.box.ownerDocument.getElementById(this.name + '_panel_resize_'+ type);
		ppr.style.backgroundColor = '';
		panel = this.findPanel(type);
		switch(type) {
			case 'top':
				panel.size = parseInt(panel.size) + parseInt(evnt.screenY - this.tmp_y);
				break;
			case 'bottom':
				panel.size = parseInt(panel.size) - parseInt(evnt.screenY - this.tmp_y);
				break;
			case 'left':
				panel.size = parseInt(panel.size) + parseInt(evnt.screenX - this.tmp_x);
				break;
			case 'right':
				panel.size = parseInt(panel.size) - parseInt(evnt.screenX - this.tmp_x);
				break;
		}
		if (panel.size < 10) panel.size = 10;
		this.resize();
		this.tmp_resizing = undefined;
	}	
}
if (top != window) top.jsLayout = jsLayout;
if (top != window) top.jsLayoutPanel = jsLayoutPanel;
