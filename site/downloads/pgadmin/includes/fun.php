<script>
function init_fun() {
	var funTabs = new top.jsTabs('funTabs', null);
	funTabs.style_toolbar = '';
	funTabs.style = "background-color: white;";

	// -- TOOLBAR
	var funTB = null;
	var funTB = new top.jsToolBar('funTB', null);
	funTB.addButton('Update Function', 'system/includes/silk/icons/accept.png', funTBAction, 'Update funcation');
	funTB.addButton('Grant Privilege', 'system/includes/silk/icons/drive_user.png', funTBAction, 'Grant a privilage for the function');
	
	// FUNCTION SCRIPT
	var funScript = new top.jsEdit('funScript', null);
	funScript.header = "Script";
	funScript.showFooter = false;
	funScript.tmpl = "<table cellpadding=\"5\" cellspacing=\"0\" style=\"width: 100%; height: 99%;\" class=\"rText\">"+
					"	<tr>"+
					"		<td valign=\"top\" style=\"width: 100%; height: 100%;\">"+
					"			<textarea id=sql style='padding: 2px; border: 1px solid silver; width: 100%; height: 100%; font-family: verdana; font-size: 11px;'></textarea>"+
					"		</td>"+
					"	</tr>"+
					"</table>";
	funScript.onData  = new Function("top.elements.funScript.srvParams['db'] = top.elements.funTabs.db;"+
							"top.elements.funScript.srvParams['fun'] = top.elements.funTabs.fun;"+
							"document.getElementById('file_down').src = 'includes/fun_srv.php?cmd=get_script&fun='+ top.elements.funTabs.fun +'&db='+ top.elements.funTabs.db;");
	funScript.srvFile = "includes/fun_srv.php";
	
	// Function Privilege: ADD
	var funPrivAdd = new top.jsEdit('funPrivAdd', null);
	funPrivAdd.header = "Grant Privilege";
	funPrivAdd.showFooter = false;
	funPrivAdd.tmpl = "<table cellpadding=\"3\" cellspacing=\"0\" style=\"width: 100%\" class=\"rText\">"+
					"	<tr>"+
					"		<td valign=\"top\" style=\"width: 100%\">~group1~</td>"+
					"	</tr>"+
					"	<tr><td colspan=2 align=center style=\"padding: 5px; background-color: #e0e7f4; border-top: 1px solid #d5e1f1; border-bottom: 1px solid #d5e1f1;\"> ~controls~ </td></tr>"+
					"</table>";

	group1 = funPrivAdd.addGroup('group1', 'General');
	group1.inLabel = 'width="100px"';
	group1.addField('User Or Group', 	'List', 		'user', '', '', '', true, 0);
	group1.addField('All Privileges',	'Radio_YesNo', 	'all', '', '', 'f', false, 0);
	group1.addField('EXECUTE',		 	'Radio_YesNo', 	'execute', '', '', 'f', false, 0);
		
	funPrivAdd.onData  = new Function("top.elements.funPrivAdd.srvParams['db']    = top.elements.funTabs.db;"+
							"top.elements.funPrivAdd.srvParams['fun'] = top.elements.funTabs.fun;");
	funPrivAdd.addControl('save', 'Save', null);
	funPrivAdd.addControl('back', 'Cancel', null);
	funPrivAdd.srvFile = "includes/fun_srv.php";
	
	// VIEW PRIVILAGES
	var funPriv = new top.jsList('funPriv', null);
	funPriv.header = "Privileges";
	funPriv.msgDelete = "";
	funPriv.addColumn('User', '20%', 'TEXT', '');
	funPriv.addColumn('Rights', '60%', 'TEXT', '');
	funPriv.addColumn('Given By', '20%', 'TEXT', '');
	funPriv.addControl('delete', 'Revoke');
	funPriv.onData  = new Function("top.elements.funPriv.srvParams['db']    = top.elements.funTabs.db;"+
							"top.elements.funPriv.srvParams['fun'] = top.elements.funTabs.fun;");
	funPriv.srvFile = "includes/fun_srv.php";	
	funPrivAdd.onComplete = funPriv; 
	
	// -- TABS
	var tab = funTabs.addTab('funTab1', 'SQL', 	funTB,  funScript);
	var tab = funTabs.addTab('funTab2', 'Privileges', 	funTB,  funPriv);
}

function funTBAction(cmd) {
	switch(cmd) {
		case 'funTB_but0':
			top.elements.funTabs.setActive(0);
			top.execCommand(document.getElementById('sql').value, 'top.elements.funScript.output();');
			break;
			
		case 'funTB_but1':
			top.elements.funTabs.setActive(1);
			var tab = top.elements.funTabs.getTab('funTab2');
			var obj = top.elements.funPrivAdd;
			obj.box = tab.owner.box.ownerDocument.getElementById('tab_'+ tab.owner.name +'_dsp');
			obj.recid = null;
			obj.srvParams['db']    = top.elements.funTabs.db;
			obj.srvParams['view']  = top.elements.funTabs.fun;
			obj.output();
			break;
			
		default: alert(cmd);
	}
}
</script>