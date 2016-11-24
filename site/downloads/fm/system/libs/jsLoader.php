<?
	$sys_folder = str_replace("/libs/jsLoader.php", "", str_replace("\\","/",__FILE__));
	$sys_path   = substr($sys_folder, strlen($_SERVER["DOCUMENT_ROOT"]));
?>

/***********************************
*
* -- This is the Loader for JS Classes
*
***********************************/

function jsLoader_class() {
	this.version      = '1.0.433';
	this.status 	  = '';
	this.domain       = String(document.location).split('/')[2];
	this.classStatus  = new Array();
	this.browser	  = (document.all ? 'IE' : 'FF');
	this.sys_path     = '<?=$sys_path?>';
	this.onLoad;
	this.loadClass	  = jsLoader_loadClass;
	this.loadFile	  = jsLoader_loadFile;
	this.loadFileDone = jsLoader_loadFileDone;
}

/***************************************
* ---- IMPLEMENTATION
*/

function jsLoader_loadFile(name) {
	if (this.classStatus[name] == 'loaded') this.loadFileDone(name);
	if (this.classStatus[name] == 'loading...') return;
	req = top.document.createElement('SCRIPT');
	req.src = '<?=str_replace('\\','/', dirname(substr(__FILE__, strlen($_SERVER["DOCUMENT_ROOT"]))))."/"?>'+name+'?ver='+this.version;
	top.document.body.appendChild(req);
	this.status            = 'loading...';
	this.classStatus[name] = 'loading...';
}

function jsLoader_loadFileDone(name) {
	if (!name) alert('The function loadFileDone() expect 1 parameter - name of the file.');
	this.classStatus[name] = 'loaded';
	for (key in this.classStatus) { if (this.classStatus[key] == 'loading...') return; }
	if (this.onLoad) this.onLoad();
}

function jsLoader_loadClass(name) {
	if (name == 'jsEdit' && !top.jsEdit) { this.loadFile("jsEdit.js"); this.loadFile("jsControls.js"); }
	if (name == 'jsList' && !top.jsList) { this.loadFile("jsList.js"); this.loadFile("jsControls.js"); }
	if (name == 'jsTabs' && !top.jsTabs) { this.loadFile("jsTabs.js"); }
	if (name == 'jsTree' && !top.jsTree) { this.loadFile("jsTree.js"); }
	if (name == 'jsMsg'  && !top.jsMsg)  { this.loadFile("jsMsg.js"); }
	if (name == 'jsToolBar'  && !top.jsToolBar)  { this.loadFile("jsToolBar.js"); }
	if (name == 'jsControls' && !top.jsControls) { this.loadFile("jsControls.js"); }
	if (name == 'jsCalendar' && !top.jsCalendar) { this.loadFile("jsCalendar.js"); }
	if (name == 'jsLayout'   && !top.jsLayout)   { this.loadFile("jsLayout.js"); }
	for (key in this.classStatus) { if (this.classStatus[key] == 'loading...') return; }
	if (this.onLoad) this.onLoad();
}

top.jsLoader = new jsLoader_class();
top.jsLoader.loadFile("jsUtils.js");