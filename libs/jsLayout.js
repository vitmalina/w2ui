/***********************************
*
* -- This the jsLayout class
*
***********************************/

function jsLayout(name, box) {
	// public properties
    this.name  	  	= name;
    this.box      	= box; 	// HTML element that hold this element only applicable to document.body
	this.panels		= [];
	this.padding 	= 0;  // panel padding
	this.spacer     = 4;  // resizer width or height
	this.border		= 0;  // CSS border error margin (if in CSS panel has border width different from 1, then change this.
    this.width; // this vars will be set by resize
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
    this.panelObjs      = [];
	this.initEvents 	= jsLayout_initEvents;
	this.startResize 	= jsLayout_startResize;
	this.doResize	 	= jsLayout_doResize;
	this.stopResize  	= jsLayout_stopResize;
	this.panel			= jsLayout_panel;

	// register element in the top
    if (!top.jsUtils) alert('The jsUtils class is not loaded. This class is a must for the jsList class.');
	if (!top.elements) top.elements = [];
    if (top.elements[this.name]) alert('The element with this name "'+ this.name +'" is already registered.');
    top.elements[this.name] = this;
	
	// initialize object if necessary
	if (box != null && typeof(box) == 'object' && String(box) == '[object Object]') { // javascript object
		this.box = null;
		for (var e in box) { this[e] = box[e]; }
	}	

	// ==============-------------------------------
	// --- IMPLEMENTATION

	function jsLayout_output() {
		if (!this.box) return;
		// initialize panels
		if (this.panelObjs.length <= 0) {
			for (panel in this.panels) {
				var ind = this.panelObjs.length;
				this.panelObjs[ind] = new this.panel(this.panels[panel].name, this.panels[panel].caption, 
					this.panels[panel].object, this.panels[panel].size, this.panels[panel].resizable);
				this.panelObjs[ind].style = this.panels[panel].style;
				this.panelObjs[ind].owner = this;
			}
		}
		// is there is no main panel - add it
		if (!this.findPanel('main')) this.addPanel('main', null, null, null, null);
		
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
		//window.setTimeout("top.elements."+ this.name +".resize();", 500);
	}


	function jsLayout_addPanel(name, caption, object, size, resizable) {
		var ind = this.panels.length;
		if (caption != null && typeof(caption) == 'object' && String(caption) == '[object Object]') { // javascript object
			this.panels[ind] = { name: name, caption: caption.caption, object: caption.object, size: caption.size, resizable: caption.resizable };
		} else {
			this.panels[ind] = { name: name, caption: caption, object: object, size: size, resizable: resizable };
		}
		var panel = this.panels[ind];
		// initialize panel object
		this.panelObjs[ind] = new this.panel(panel.name, panel.caption, panel.object, panel.size, panel.resizable);
		this.panelObjs[ind].owner = this;
		return this.panelObjs[ind];
	}

	function jsLayout_findPanel(name) {
		var panel;
		for (var i=0; i<this.panelObjs.length; i++) {
			panel = this.panelObjs[i];
			if (!panel) continue;
			if (panel.name == name) return panel;
		}
		return null;
	}

	function jsLayout_initPanel(name, obj) {
		if (!this.box) return;
		var panel = this.findPanel(name);
		panel.object = obj;		
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

	function jsLayout_resize() {
		if (!this.box) return;
		if (this.box.tagName == 'BODY') {
			if (window.innerHeight == undefined) {
				this.width  = parseInt(this.box.ownerDocument.body.clientWidth);
				this.height = parseInt(this.box.ownerDocument.body.clientHeight);
			} else {
				this.width  = parseInt(window.innerWidth);
				this.height = parseInt(window.innerHeight);
			}
		} else {
			this.width  = parseInt(this.box.style.width);
			this.height = parseInt(this.box.style.height);
		}
		this.box.style.overflow = 'hidden';
		
		this.padding = parseInt(this.padding);
		this.spacer	 = parseInt(this.spacer);
		this.border  = parseInt(this.border);
		
		// reset width/height for panels
		var strPanels = ['top', 'left', 'main', 'right', 'bottom'];
		var pt = this.findPanel('top');		if (pt && pt.hidden) pt = null;
		var pl = this.findPanel('left');	if (pl && pl.hidden) pl = null;
		var pm = this.findPanel('main');
		var pr = this.findPanel('right');	if (pr && pr.hidden) pr = null;
		var pb = this.findPanel('bottom');	if (pb && pb.hidden) pb = null;
		
		for (key in strPanels) {
		
			// the panel is position: relative
			var ppl1 = this.box.ownerDocument.getElementById(this.name + '_panel1_'+ strPanels[key]);
			var ppl2 = this.box.ownerDocument.getElementById(this.name + '_panel2_'+ strPanels[key]);
			var ppr1 = this.box.ownerDocument.getElementById(this.name + '_panel_resize1_'+ strPanels[key]);
			var ppr2 = this.box.ownerDocument.getElementById(this.name + '_panel_resize2_'+ strPanels[key]);
			
			var panel = this.findPanel(strPanels[key]);
			if (panel) panel.size = parseInt(panel.size);
			
			if (panel == null && !panel) continue;
			if (panel.hidden) { 
				ppl1.style.display = 'none'; 
				ppl2.style.display = 'none'; 
				continue; 
			} else { 
				ppl1.style.display = ''; 
				ppl2.style.display = ''; 
			}
			
			// -- TOP PANEL
			if (panel.name == 'top') {
				panel.width  = this.width - this.padding * 2 - this.border * 2;
				panel.height = panel.size;
				
				ppl1.style.left	  = this.padding + 'px';
				ppl1.style.top	  = this.padding + 'px';
				ppl2.style.width  = String(panel.width) + 'px';
				ppl2.style.height = panel.height + 'px';
				
				//  add resizable div
				if (panel.resizable) {
					ppr1.style.left    = parseInt(ppl1.style.left) + 'px';
					ppr1.style.top 	   = (parseInt(ppl1.style.top) + this.border * 2 + panel.height) + 'px';
					ppr1.style.display = '';
					
					ppr2.style.width   = (parseInt(ppl2.style.width) + this.border * 2) + 'px';
					ppr2.style.height  = this.spacer + 'px';
					ppr2.style.display = '';
					ppr2.style.cursor  = 'N-resize';
					ppr2.onmousedown   = new Function('event', "el = top.elements['"+ this.name +"']; el.startResize('"+ panel.name +"', event); return false;");
				}
			}
			
			// -- LEFT PANEL
			if (panel.name == 'left') {
				panel.width  = panel.size;
				panel.height = this.height - this.border * 2
					- (pt ? parseInt(pt.size) + this.padding + this.border * 2 + (pt.resizable ? this.spacer : this.padding) : this.padding)
					- (pb ? parseInt(pb.size) + this.padding + this.border * 2 + (pb.resizable ? this.spacer : this.padding) : this.padding);

				ppl1.style.left	= this.padding + 'px';
				ppl1.style.top	= (this.padding 
					+ (pt ? parseInt(pt.size) + (pt.resizable ? this.spacer : this.padding) + this.border * 2 : 0)) + 'px';
				ppl2.style.width  = panel.width + 'px';
				ppl2.style.height = panel.height + 'px';

				//  add resizable div
				if (panel.resizable) {
					ppr1.style.left    = (this.padding + this.border * 2 + panel.width) + 'px';
					ppr1.style.top 	   = parseInt(ppl1.style.top) + 'px';
					ppr1.style.display = '';

					ppr2.style.width   = this.spacer + 'px';
					ppr2.style.height  = (panel.height + this.border * 2) + 'px';
					ppr2.style.display = '';
					ppr2.style.cursor  = 'E-resize';
					ppr2.onmousedown   = new Function('event', "el = top.elements['"+ this.name +"']; el.startResize('"+ panel.name +"', event); return false;");
				}
			}
			
			// -- MAIN PANEL
			if (panel.name == 'main') {
				panel.width  = this.width - this.border * 2
					- (pl ? parseInt(pl.size) + this.padding + this.border * 2 + (pl.resizable ? this.spacer : this.padding) : this.padding)
					- (pr ? parseInt(pr.size) + this.padding + this.border * 2 + (pr.resizable ? this.spacer : this.padding) : this.padding);
				panel.height = this.height - this.border * 2
					- (pt ? parseInt(pt.size) + this.padding + this.border * 2 + (pt.resizable ? this.spacer : this.padding) : this.padding)
					- (pb ? parseInt(pb.size) + this.padding + this.border * 2 + (pb.resizable ? this.spacer : this.padding) : this.padding);

				ppl1.style.left = (this.padding  
					+ (pl ? parseInt(pl.size) + this.border * 2 + (pl.resizable ? this.spacer : this.padding) : 0)) + 'px';
				ppl1.style.top = (this.padding 
					+ (pt ? parseInt(pt.size) + this.border * 2 + (pt.resizable ? this.spacer : this.padding) : 0)) + 'px';

				ppl2.style.width  = panel.width + 'px';
				ppl2.style.height = panel.height + 'px';
			}
			
			// -- RIGHT PANEL
			if (panel.name == 'right') {
				panel.width  = panel.size;
				panel.height = this.height - this.border * 2
					- (pt ? parseInt(pt.size) + this.padding + this.border * 2 + (pt.resizable ? this.spacer : this.padding) : this.padding)
					- (pb ? parseInt(pb.size) + this.padding + this.border * 2 + (pb.resizable ? this.spacer : this.padding) : this.padding);

				ppl1.style.left = (this.padding + pm.width + this.border * 2 
					+ (pl ? parseInt(pl.size) + this.border * 2 + (pl.resizable ? this.spacer : this.padding) : 0)
					+ (pr.resizable ? this.spacer : this.padding)) + 'px';
				ppl1.style.top = (this.padding
					+ (pt ? parseInt(pt.size) + this.border * 2 + (pt.resizable ? this.spacer : this.padding) : 0)) + 'px';
				ppl2.style.width  = parseInt(panel.width) + 'px';
				ppl2.style.height = parseInt(panel.height) + 'px';
				
				//  add resizable div
				if (panel.resizable) {
					ppr1.style.left    = (parseInt(ppl1.style.left) - this.spacer) + 'px';
					ppr1.style.top 	   = parseInt(ppl1.style.top) + 'px';
					ppr1.style.display = '';
					
					ppr2.style.width   = this.spacer + 'px';
					ppr2.style.height  = (panel.height + this.border * 2) + 'px';
					ppr2.style.display = '';
					ppr2.style.cursor  = 'E-resize';
					ppr2.onmousedown   = new Function('event', "el = top.elements['"+ this.name +"']; el.startResize('"+ panel.name +"', event); return false;");
				}
			}
						
			// -- BOTTOM PANEL
			if (panel.name == 'bottom') {
				panel.width  = this.width - this.padding * 2 - this.border * 2;
				panel.height = panel.size;
				
				ppl1.style.left	  = this.padding + 'px';
				ppl1.style.top	  = (this.padding
					+ (pt ? parseInt(pt.size) + this.border * 2 + (pt.resizable ? this.spacer : this.padding) : 0)
					+ (pb.resizable ? this.spacer : this.padding)
					+ pm.height + this.border * 2
					) + 'px';
				ppl2.style.width  = panel.width + 'px';
				ppl2.style.height = panel.height + 'px';
				
				//  add resizable div
				if (panel.resizable) {
					ppr1.style.left    = parseInt(ppl1.style.left) + 'px';
					ppr1.style.top 	   = (parseInt(ppl1.style.top) - this.spacer) + 'px';
					ppr1.style.display = '';
					
					ppr2.style.width   = (parseInt(ppl2.style.width) + this.border * 2) + 'px';
					ppr2.style.height  = this.spacer + 'px';
					ppr2.style.display = '';
					ppr2.style.cursor  = 'N-resize';
					ppr2.onmousedown   = new Function('event', "el = top.elements['"+ this.name +"']; el.startResize('"+ panel.name +"', event); return false;");
				}
			}
		}
		// resize objects in the layout;
		var strPanels = ['top', 'left', 'main', 'right', 'bottom'];
		for (key in strPanels) {
			var panel = this.findPanel(strPanels[key]);
			if (panel == null || !panel) continue;
			if (panel.resize) panel.resize();
			//if (panel.object && panel.object.resize) { panel.object.resize(); }
		}
		return;
	}
	
	// --- INTERNAL FUNCTIONS

	function jsLayout_initEvents() {
		// this is needed for resize of panels and resize of screen
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
	}

	function jsLayout_doResize(evnt) {
		if (!this.box) return;
		if (!evnt) evnt = window.event;
		if (this.tmp_resizing == undefined) return;
		var type = this.tmp_resizing;
		// auto-resize
		var panel = this.findPanel(type);
		if (panel.size < 10) { panel.size = 10; return; }
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
		this.tmp_x = evnt.screenX;
		this.tmp_y = evnt.screenY;
		this.resize();
	}

	function jsLayout_stopResize(evnt) {
		if (!this.box) return;
		if (!evnt) evnt = window.event;
		if (!window.addEventListener) { window.document.detachEvent('onselectstart', top.ie_no_event); }
		if (this.tmp_resizing == undefined) return;
		this.tmp_resizing = undefined;
	}	
	
	// ------------------------------------------
	// --- Panel Class
	
	function jsLayout_panel(name, caption, object, psize, resizable) {
		// public
		this.name		= name; 	// left, rigth, top, bottom, 'custom_name'
		this.hidden		= false;
		this.size		= psize;	// width or height depending on panel name
		this.resizable	= resizable;
		this.overflow	= 'hidden';
		this.object 	= object; 	// can be a layout, list, edit, etc.
		this.caption	= caption;
		this.style;
		this.width;		// readonly
		this.height;	// readonly		
		// internal
		this.owner;
		this.getHTML	= jsPanel_getHTML;
		this.init		= jsPanel_init;
		this.resize		= jsPanel_resize;
		this.refresh	= jsPanel_refresh;
		
		// ==============-------------------------------
		// --- IMPLEMENTATION

		function jsPanel_getHTML() {
			var html;
			html =  '<div id="'+ this.owner.name + '_panel1_'+ this.name +'" '+
					'		style="position: relative; left: 0px; top: 0px; width: 0px; height: 0px; padding: 0px; margin: 0px; border: 0px;">'+
					'	<div id="'+ this.owner.name + '_panel2_'+ this.name +'" class="w20-panel"'+
					'			style="position: absolute; z-Index: 10000; width: 0px; height: 0px; overflow: '+ this.overflow +';">'+
					'	</div>'+
					'</div>'+
					'<div id="'+ this.owner.name + '_panel_resize1_'+ this.name +'" style="position: relative; left: 0px; top: 0px; width: 0px; height: 0px; padding: 0px; margin: 0px; border: 0px; display: none;">'+
					'	<div id="'+ this.owner.name + '_panel_resize2_'+ this.name +'" style="position: absolute; width: 0px; height: 0px; background-color: white;"'+
					'		onmouseover = "this.style.backgroundColor=\'silver\'" onmouseout = "this.style.backgroundColor = \'white\'"'+
					'	></div>'+
					'</div>';
			return html;
		}
		
		function jsPanel_init(obj) {
			this.object = obj;
			this.refresh();
		}

		function jsPanel_resize() {
			var panel = this.owner.box.ownerDocument.getElementById(this.owner.name + '_panel2_'+ this.name);
			if (!panel) return;			
			if (this.object != null && typeof(this.object) == 'object') {
				if (this.object.resize) this.object.resize();
			}
		}

		function jsPanel_refresh() {
			var panel = this.owner.box.ownerDocument.getElementById(this.owner.name + '_panel2_'+ this.name);			
			if (!panel) return;
			if (this.style) panel.style.cssText += this.style;
			// empty panel
			if (this.object == null) {
				panel.innerHTML = '';
			}
			// HTML panel
			if (this.object != null && typeof(this.object) == 'string') {
				panel.innerHTML = this.object;
			}
			// object panel
			if (this.object != null && typeof(this.object) == 'object' && this.object.output) {
				panel.style.border  = 0;
				panel.style.padding = 0;
				panel.style.margin  = 0;
				this.object.box = panel;
				this.object.output();
			}
		}
	}
}
if (top != window) top.jsLayout = jsLayout;
