<?
require_once("conf.php");
require_once("system/security.php");	

// -- check for mod_rewrite
if (function_exists('apache_get_modules')) {
	$mods = apache_get_modules();
	$mod_rewrite = false;
	foreach ($mods as $key => $value) { if ($value == 'mod_rewrite') $mod_rewrite = true; }
	if (!$mod_rewrite) die("ERROR: Apache must have mod_rewrite enabled.");
}
?>

<body style="overflow: hidden;">
<div style="width: 100%; height: 100%;" id="page_body">
</div>
<iframe id=file_down frameborder=0 style='height: 1px; width: 1px; position: absolute;'></iframe>
</body>
<script src="system/includes/SWFUpload/swfupload.js"></script>
<script src="system/includes/SWFUpload/swfqueue.js"></script>
<script src="system/libs/jsUtils.php"></script>
<script src="system/libs/jsLayout.php"></script>
<script src="system/libs/jsList.php"></script>
<script src="system/libs/jsControls.php"></script>
<script src="system/libs/jsToolBar.php"></script>

<script>
var swfu;
var folder_html;

window.onload 	= pload;
window.onresize = resize;
document.title 	= 'Web 2.0 File Manager';

function pload() {
	var files = new top.jsList('files', null);
	files.showHeader = false;
	//files.showFooter = false;
	files.showTabNumber = false;
	files.items_pp = 500;
	files.divStyle = 'height: 18px; margin: 0px; margin-top: 1px;';
	files.addColumn('File', '50%', 'TEXT', '');
	files.addColumn('Size', '12%', 'TEXT', 'align=right');
	files.addColumn('Date', '10%', 'TEXT', 'align=center');
	files.addColumn('Time', '8%', 'TEXT', 'align=center');
	files.addColumn('Rights', '7%', 'TEXT', 'align=center');
	files.addColumn('Owner', '13%', 'TEXT', '');
	files.onDblClick 	 = openFolder;
	files.onData		 = getData;
	files.onDataReceived = dataReceived;
	files.srvFile = "includes/index_srv.php";

	// --- init folders
	folder_html = '<div style="font-size: 11px; font-family: verdana; padding: 5px;">'+
				'<b style="color: gray">Folders</b> <br><br>'+
				'<table cellpadding=2 cellspacing=0 class=rText>'+
				<?
				foreach($def_folders as $key => $value) {
					print("'<tr><td><img src=\"system/includes/silk/icons/folder.png\"></td><td><a href=\"javascript: openHFolder(\'$key\')\">$key</a></td></tr>'+");
				}
				?>
				'</table>'+
				'</div>';
	
	// --- Main Page Layout
	var toolHTML = '<div id=toolbar style="background-image: url(system/images/toolbar_bg.png); padding: 2px;"></div>'+
				   '<table width=100% cellpadding=2 cellspacing=0 style="border-top: 1px solid silver; border-bottom: 1px solid silver; height: 20px; padding: 2px; background-color: white;"><tr>'+
				   '<td id=path style="width: 80%; padding: 5px; padding-left: 2px;"></td>'+
				   '<td align=right id=fprogress style="padding: 0px; padding-right: 4px;"></td>'+
				   '</tr></table>'  ;
	var mLayout = new top.jsLayout('mLayout', document.getElementById('page_body'));
	mLayout.style   = 'background-color: #f2f2f2;';
	mLayout.padding = 1;
	mLayout.border  = 2;
	var panel = mLayout.addPanel('top', toolHTML, '', 56, false);
	panel.style_title = 'border: 0px; padding: 1px; margin: 1px;'
	var panel = mLayout.addPanel('left', null, '', 150, true);
	panel.style_body = 'border: 1px solid silver;'
	panel.hidden = true;
	panel.html   = folder_html;
	mLayout.output();
	mLayout.initPanel('main', top.elements.files);

	// --- Toolbar
	var filesToolbar = new top.jsToolBar('filesToolbar', document.getElementById('toolbar'));
	filesToolbar.addCheck('Folders', 'system/includes/silk/icons/folder.png', tbAction, 'Show/Hide folders');
	filesToolbar.addBreak();
	filesToolbar.addButton('', 'system/includes/silk/icons/arrow_refresh.png', tbAction, 'Refresh list of files/folders');
	filesToolbar.addButton('New Folder', 'system/includes/silk/icons/folder_add.png', tbAction, 'Create new folder');
	filesToolbar.addButton('', 'system/includes/silk/icons/pencil_add.png', tbAction, 'Rename selected file/folder');
	filesToolbar.addBreak();
	filesToolbar.addButton('', 'system/includes/silk/icons/page_white_stack.png', tbAction, 'Copy selected files/folders to clipboard');
	filesToolbar.addButton('', 'system/includes/silk/icons/page_white_paste.png', tbAction, 'Paste files/folders from clipboard');
	filesToolbar.addButton('', 'system/includes/silk/icons/cross.png', tbAction, 'Delete selected files/folders');
	filesToolbar.addBreak();
	filesToolbar.addButton('', 'system/includes/silk/icons/page_add.png', tbAction, 'Create new file');
	filesToolbar.addButton('Edit', 'system/includes/silk/icons/page_edit.png', tbAction, 'Edit selected file');
	filesToolbar.addButton('', 'system/includes/silk/icons/page_white_zip.png', tbAction, 'Archive selected files/folders');
	filesToolbar.addButton('', 'system/includes/silk/icons/lightning.png', tbAction, 'Unarchive selected file');
	filesToolbar.addBreak();
	filesToolbar.addButton('Download', 'system/includes/silk/icons/database_save.png', tbAction, 'Download selected files/folders');
	filesToolbar.addHTML('<span id="spanButtonPlaceHolder" style="padding: 0px; margin: 0px;"></span>');
	filesToolbar.addBreak();
	filesToolbar.addButton('Logout', 'system/includes/silk/icons/building_go.png', tbAction, 'Logout');
	filesToolbar.output();	
	document.getElementById('filesToolbar_right').innerHTML = 
		'<table width=100% cellpadding=0 cellspacing=0><tr><td align=right style="padding-right: 5px;"><a target="_blank" href="http://web20boom.com/fm">Web 2.0 File Manager v.1.0</a></td></tr></table>';

	// -- Show default list of Customers
	resize();
	initUpload();
}

function resize() {
	if (document.all) {
		var div1 = document.getElementById('page_body');
		div1.style.width  = document.documentElement.offsetWidth;
		div1.style.height = document.documentElement.offsetHeight;
	} else {
		var div1 = document.getElementById('page_body');
		div1.style.width  = parseInt(window.innerWidth);
		div1.style.height = parseInt(window.innerHeight);
	}
	top.elements.mLayout.resize();
}

function getData() {
 	document.getElementById('fprogress').innerHTML = '<span style="background-color: red; color: white; padding: 2px; font-weight: bold; font-size: 10px; font-family: verdana;" > Refreshing...</span>';
}

function openFolder(cmd) {
	// document.getElementById('fprogress').innerHTML = '<span style="background-color: red; color: white; padding: 2px; font-weight: bold; font-size: 10px; font-family: verdana;" > Refreshing...</span>';
	top.elements.files.serverCall('lst_get_data', 'folder::'+cmd);
}

function tbAction(cmd) {
	var d = new Date();
	switch(cmd) {
		case 'filesToolbar_but0': // folder
			var lay = top.elements.mLayout;
			var panel = lay.findPanel('left');
			if (panel.hidden) lay.showPanel('left'); else lay.hidePanel('left');
			panel.init(folder_html);
			break;
			
		case 'filesToolbar_but2': // refresh
			top.elements.files.output();
			break;
			
		case 'filesToolbar_but3': // new folder
			var name = prompt("Enter New Folder name:");
			if (!name || name == '') break;
			top.elements.files.serverCall('create_folder', 'name::'+name);
			break;
			
		case 'filesToolbar_but4': // rename
			var tmp = top.elements.files.getSelected('^^');
			if (tmp == '') { alert('No file selected.'); break; }
			if (tmp.split('^^').length > 1) { alert('Please select only one file.'); break; }
			var tmp2 = tmp;
			if (tmp2.length > 2 && tmp2.substr(tmp2.length-2, 2) == '__') tmp2 = tmp2.substr(0, tmp2.length -2);
			if (tmp == '..') break;
			var name = prompt("Rename file '"+ tmp +"' to:", tmp);
			if (!name || name == '') break;
			top.elements.files.serverCall('rename', 'old::'+tmp2+';;new::'+name);
			break;
			
		case 'filesToolbar_but6': // copy
			var tmp = top.elements.files.getSelected('^^');
			if (tmp == '') { alert('No file selected.'); break; }
			top.elements.files.serverCall('copy');
			break;

		case 'filesToolbar_but7': // paste
			document.getElementById('fprogress').innerHTML = '<span style="background-color: red; color: white; padding: 2px; font-weight: bold; font-size: 10px; font-family: verdana;"> Copying...</span>';
			top.elements.files.serverCall('paste');
			break;

		case 'filesToolbar_but8': // delete
			var tmp = top.elements.files.getSelected('^^');
			if (tmp == '') { alert('No file selected.'); break; }
			if (tmp.split('^^').length > 1) { var msg = "Please confirm you want to delete "+ tmp.split('^^').length +" files/folders?"; } 
									   else { var msg = "Please confirm you want to delete '"+ tmp +"'?"; } 
			if (tmp == '..') break;
			var ans = confirm(msg);
			if (!ans) break;
			document.getElementById('fprogress').innerHTML = '<span style="background-color: red; color: white; padding: 2px; font-weight: bold; font-size: 10px; font-family: verdana;"> Deleting...</span>';
			top.elements.files.serverCall('delete');
			break;
			
		case 'filesToolbar_but10': // touch
			var name = prompt("Enter New File name:");
			if (!name || name == '') break;
			top.elements.files.serverCall('create_file', 'name::'+name);
			break;
			
		case 'filesToolbar_but11': // edit
			var tmp = top.elements.files.getSelected('^^');
			if (tmp == '') { alert('No file selected.'); break; }
			if (tmp.split('^^').length > 1) { alert('Please select only one file.'); break; } 
			top.elements.files.serverCall('edit');
			break;
			
		case 'filesToolbar_but12': // archive
			var tmp = top.elements.files.getSelected('^^');
			if (tmp == '') { alert('No file selected.'); break; }
			document.getElementById('fprogress').innerHTML = '<span style="background-color: red; color: white; padding: 2px; font-weight: bold; font-size: 10px; font-family: verdana;"> Archiving...</span>';
			top.elements.files.serverCall('archive');
			break;
			
		case 'filesToolbar_but13': // unarchive
			var tmp = top.elements.files.getSelected('^^');
			if (tmp == '') { alert('No file selected.'); break; }
			if (tmp.split('^^').length > 1) { alert('Please select only one file.'); break; } 
			document.getElementById('fprogress').innerHTML = '<span style="background-color: red; color: white; padding: 2px; font-weight: bold; font-size: 10px; font-family: verdana;"> Unarchiving...</span>';
			top.elements.files.serverCall('unarchive');
			break;
		
		case 'filesToolbar_but15': // download
			var tmp = top.elements.files.getSelected('^^');
			if (tmp == '') { alert('No file selected.'); break; }
			document.getElementById('fprogress').innerHTML = '<span style="background-color: red; color: white; padding: 2px; font-weight: bold; font-size: 10px; font-family: verdana;"> Preparing...</span>';
			document.getElementById('file_down').src = 'includes/download.php?files='+tmp+'&rnd'+d.getTime();
			setTimeout("document.getElementById('fprogress').innerHTML = '';", 3000);
			break;
			
		case 'filesToolbar_but18': // logout
			top.location = '<?=$sys_path?>/logout.php';
			break;
			
		default: alert(cmd);
	}
}

function initUpload() {
	var settings = {
		flash_url : "system/includes/SWFUpload/swfupload.swf",
		upload_url: "<?=str_replace('index.php', '', substr(__FILE__, strlen($_SERVER['DOCUMENT_ROOT'])))?>includes/upload.php",
		post_params: { "PHPSESSID" : "<?=session_id()?>"},
		file_size_limit : "100 MB",
		file_types : "*.*",
		file_types_description : "All Files",
		file_upload_limit : 200,
		file_queue_limit : 0,
		debug: false,

		// Button settings
		button_image_url: "system/includes/SWFUpload/gray_button.png",
		button_width: "66",
		button_height: "23",
		button_placeholder_id: "spanButtonPlaceHolder",
		button_text: '<span class="theFont"></span>',
		button_text_style: ".theFont { font-size: 16; }",
		button_text_left_padding: 12,
		button_text_top_padding: 3,
		
		// The event handler functions are defined in handlers.js
		file_queued_handler : fileQueued,
		file_queue_error_handler : fileQueueError,
		file_dialog_complete_handler : fileDialogComplete,
		upload_start_handler : uploadStart,
		upload_progress_handler : uploadProgress,
		upload_error_handler : uploadError,
		upload_success_handler : uploadSuccess,
		upload_complete_handler : uploadComplete
	};
	swfu = new SWFUpload(settings);
	top.tmp_uploadFinished = "top.elements.files.output();";
 }
 
 function openHFolder(fname) {
	top.elements.files.serverCall('open_folder', 'fname::'+fname);
 	//document.getElementById('fprogress').innerHTML = '<span style="background-color: red; color: white; padding: 2px; font-weight: bold; font-size: 10px; font-family: verdana;"> Refreshing...</span>';
 }
 
 function dataReceived() {
	//if (top.elements.files.items.length > 3000) { alert('The current folder contains over 3000 files. Large number of files slows down openrations in the browser. Only first 3000 files are shown.'); }
	document.getElementById('fprogress').innerHTML = 'Total: '+ top.elements.files.count;
 }

</script>
</html>