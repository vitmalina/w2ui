<script>
function init_view() {
	var viewTabs = new top.jsTabs('viewTabs', null);
	viewTabs.style_toolbar = '';
	viewTabs.style = "background-color: white;";

	// -- TOOLBAR
	var viewTB = null;
	var viewTB = new top.jsToolBar('viewTB', null);
	viewTB.addButton('Recreate View', 'system/includes/silk/icons/accept.png', viewTBAction, 'Creates or Replaces view if you have changed SQL');
	viewTB.addButton('Grant Privilege', 'system/includes/silk/icons/drive_user.png', viewTBAction, 'Grant a privilage for the view');

	// VIEW SCRIPT
	var viewScript = new top.jsEdit('viewScript', null);
	viewScript.header = "Script";
	viewScript.showFooter = false;
	viewScript.tmpl = "<table cellpadding=\"5\" cellspacing=\"0\" style=\"width: 100%; height: 99%;\" class=\"rText\">"+
					"	<tr>"+
					"		<td valign=\"top\" style=\"width: 100%; height: 100%;\">"+
					"			<textarea id=sql style='padding: 2px; border: 1px solid silver; width: 100%; height: 100%; font-family: verdana; font-size: 11px;'></textarea>"+
					"		</td>"+
					"	</tr>"+
					"</table>";
	viewScript.onData  = new Function("top.elements.viewScript.srvParams['db'] = top.elements.viewTabs.db;"+
							"top.elements.viewScript.srvParams['view'] = top.elements.viewTabs.view;");
	viewScript.srvFile = "includes/view_srv.php";
	
	// -- VIEW DATA
	var viewData = new top.jsList('viewData', null);
	viewData.header = "View Data";
	viewData.addColumn('Data', '100%', 'TEXT', '');
	viewData.onData  = new Function("top.elements.viewData.srvParams['db'] = top.elements.viewTabs.db;"+
							"top.elements.viewData.srvParams['view'] = top.elements.viewTabs.view;");
	viewData.srvFile = "includes/view_srv.php";
	
	// View Privilege: ADD
	var viewPrivAdd = new top.jsEdit('viewPrivAdd', null);
	viewPrivAdd.header = "Grant Privilege";
	viewPrivAdd.showFooter = false;
	viewPrivAdd.tmpl = "<table cellpadding=\"3\" cellspacing=\"0\" style=\"width: 100%\" class=\"rText\">"+
					"	<tr>"+
					"		<td valign=\"top\" style=\"width: 100%\">~group1~</td>"+
					"	</tr>"+
					"	<tr><td colspan=2 align=center style=\"padding: 5px; background-color: #e0e7f4; border-top: 1px solid #d5e1f1; border-bottom: 1px solid #d5e1f1;\"> ~controls~ </td></tr>"+
					"</table>";

	group1 = viewPrivAdd.addGroup('group1', 'General');
	group1.inLabel = 'width="100px"';
	group1.addField('User Or Group', 	'List', 		'user', '', '', '', true, 0);
	group1.addField('All Privileges',	'Radio_YesNo', 	'all', '', '', 'f', false, 0);
	group1.addField('SELECT',		 	'Radio_YesNo', 	'select', '', '', 'f', false, 0);
	group1.addField('INSERT',		 	'Radio_YesNo', 	'insert', '', '', 'f', false, 0);
	group1.addField('UPDATE',		 	'Radio_YesNo', 	'update', '', '', 'f', false, 0);
	group1.addField('DELETE',		 	'Radio_YesNo', 	'delete', '', '', 'f', false, 0);
	group1.addField('RULE',		 		'Radio_YesNo', 	'rule', '', '', 'f', false, 0);
	group1.addField('REFERENCES',	 	'Radio_YesNo', 	'references', '', '', 'f', false, 0);
	group1.addField('TRIGGER',		 	'Radio_YesNo', 	'trigger', '', '', 'f', false, 0);
		
	viewPrivAdd.onData  = new Function("top.elements.viewPrivAdd.srvParams['db']    = top.elements.viewTabs.db;"+
							"top.elements.viewPrivAdd.srvParams['view'] = top.elements.viewTabs.view;");
	viewPrivAdd.addControl('save', 'Save', null);
	viewPrivAdd.addControl('back', 'Cancel', null);
	viewPrivAdd.srvFile = "includes/view_srv.php";
	
	// VIEW PRIVILAGES
	var viewPriv = new top.jsList('viewPriv', null);
	viewPriv.header = "Privileges";
	viewPriv.msgDelete = "";
	viewPriv.addColumn('User', '20%', 'TEXT', '');
	viewPriv.addColumn('Rights', '60%', 'TEXT', '');
	viewPriv.addColumn('Given By', '20%', 'TEXT', '');
	viewPriv.addControl('delete', 'Revoke');
	viewPriv.onData  = new Function("top.elements.viewPriv.srvParams['db']    = top.elements.viewTabs.db;"+
							"top.elements.viewPriv.srvParams['view'] = top.elements.viewTabs.view;");
	viewPriv.srvFile = "includes/view_srv.php";	
	viewPrivAdd.onComplete = viewPriv; 
	
	// -- TABS
	var tab = viewTabs.addTab('viewTab1', 'Data', 		viewTB,  viewData);
	var tab = viewTabs.addTab('viewTab2', 'SQL', 		viewTB,  viewScript);
	var tab = viewTabs.addTab('viewTab3', 'Privileges', viewTB,  viewPriv);
}

function viewTBAction(cmd) {
	switch(cmd) {
		case 'viewTB_but0':
			if (top.elements.viewTabs.active == 1) {
				top.execCommand(document.getElementById('sql').value, 'top.elements.viewScript.output();');
			} else {
				top.elements.viewTabs.setActive(1);
				setTimeout("top.execCommand(document.getElementById('sql').value, 'top.elements.viewScript.output();');", 1000);
			}
			break;
			
		case 'viewTB_but1':
			var tab = top.elements.viewTabs.getTab('viewTab3');
			var obj = top.elements.viewPrivAdd;
			obj.box = tab.owner.box.ownerDocument.getElementById('tab_'+ tab.owner.name +'_dsp');
			obj.recid = null;
			obj.srvParams['db']    = top.elements.viewTabs.db;
			obj.srvParams['view']  = top.elements.viewTabs.view;
			obj.output();
			break;
			
		default: alert(cmd);
	}
}
</script>