/************************************************************
*
* -- The jsMsg class to display messages and dialogs
*
*************************************************************/

function jsMsg_class(name, boxElement) {
	// public properties
	this.name		= name;
	this.box 		= boxElement;
    this.lock		= null; // -- || --
    this.shadow		= null; // not null when shadow is on
    this.visible	= false;
    this.border 	= '1px solid gray';
    this.position   = false;
    
	// public methods
    this.show	 	= jsMsg_show;
    this.hide		= jsMsg_hide;
    this.blinkStart = new Function("top.elements['"+ this.name +"'].lock.style.MozOpacity = 0.3; top.elements['"+ this.name +"'].lock.style.filter = 'alpha(opacity=30)';");
    this.blinkEnd	= new Function("top.elements['"+ this.name +"'].lock.style.MozOpacity = 0.0; top.elements['"+ this.name +"'].lock.style.filter = 'alpha(opacity=0)';");

    // interval methods
	if (this.box) {
		if (boxElement.documentElement != undefined) {
			this.position = true;
			this.box = boxElement.createElement('DIV');
			boxElement.body.appendChild(this.box);
			this.box.style.zIndex = 100;
		}
		// window size
		if (document.all) {
			this.doc_width  = parseInt(this.box.ownerDocument.documentElement.offsetWidth)-22;
	    	this.doc_height = parseInt(this.box.ownerDocument.documentElement.offsetHeight);
		} else {
			this.doc_width  = parseInt(this.box.ownerDocument.defaultView.innerWidth);
			this.doc_height = parseInt(this.box.ownerDocument.defaultView.innerHeight);
		}
	}
	// register
    if (!top.elements) top.elements = [];
    if (top.elements[this.name]) alert('The element with this name "'+ this.name +'" is already registered.');
    top.elements[this.name] = this;
}
top.jsMsg = jsMsg_class;

// ==============-------------------------------
// -------------- IMPLEMENTATION

function jsMsg_show(msg, width, height, modal) {
	if (!this.box) return;
	if (this.visible) { return; }	
	var width  = parseInt(width);
    var height = parseInt(height);
    var wintop    = this.top  >= 0 ? this.top  : Math.floor((this.doc_height - height) / 2)-40;
    var winleft   = this.left >= 0 ? this.left : Math.floor((this.doc_width - width) / 2);
    if (wintop  < 0) wintop  = 0;
    if (winleft < 0) winleft = 0;
    if (width  > this.doc_width)  width  = this.doc_width;
    if (height > this.doc_height) height = this.doc_height;

    if (modal) {
	    //lock window
	    this.lock = this.box.ownerDocument.createElement('DIV');
	    this.lock.style.position   = 'absolute';
	    this.lock.style.left       = '0px';
	    this.lock.style.top        = '0px';
	    this.lock.style.width      = this.doc_width  + 'px';
	    this.lock.style.height     = this.doc_height + 'px';
	    this.lock.style.backgroundColor = 'gray';
	    this.lock.style.MozOpacity = 0.0;
	    this.lock.style.filter     = "alpha(opacity=0)";
	    this.lock.onmousedown	   = this.blinkStart;
	    this.lock.onmouseup		   = this.blinkEnd;
	    this.box.parentNode.insertBefore(this.lock, this.box); 
	    top.lock = this.lock;   	
    }
    // output message
    if (this.position) {
	    this.box.style.position  = 'absolute';
	    this.box.style.left      = winleft+'px';
	    this.box.style.top       = wintop+'px';
    }
    this.box.className       = 'rText';
    this.box.style.width     = width + 'px';
    this.box.style.height    = height + 'px';
    this.box.style.border    = this.border;
    this.box.style.color 	 = 'black';
    this.box.style.backgroundColor = 'white';
    //this.box.style.padding  = '2 5 5 2';
    this.box.innerHTML 		= '\n'+msg+'\n';
    this.box.style.display  = '';

    this.visible = true;
    this.shadow = top.jsUtils.dropShadow(this.box);
}

function jsMsg_hide() {
	if (!this.box) return;
	if (this.lock) {
	    this.box.parentNode.removeChild(this.lock);
    	this.lock = null;
	}
    if (this.shadow) {
	    this.box.parentNode.removeChild(this.shadow);
	    this.shadow = null;
    }
    this.box.style.display = 'none';
    this.box.innerHTML = '';
    this.visible = false;
}

// Class is Loaded
if (top.jsLoader) top.jsLoader.loadFileDone('jsMsg.js');