<script>
function init_seq() {
	var seqTabs = new top.jsTabs('seqTabs', null);
	seqTabs.style_toolbar = '';
	seqTabs.style = "background-color: white;";

	// -- TOOLBAR
	var seqTB = null;
	var seqTB = new top.jsToolBar('seqTB', null);
	seqTB.addButton('Update Sequence', 'system/includes/silk/icons/accept.png', seqTBAction, 'Update sequence values');

	// TABLE Privilege: ADD
	var seqData = new top.jsEdit('seqData', null);
	seqData.header = "Sequence Information";
	seqData.showFooter = false;
	seqData.tmpl = "<table cellpadding=\"3\" cellspacing=\"0\" style=\"width: 100%\" class=\"rText\">"+
					"	<tr>"+
					"		<td valign=\"top\" style=\"width: 100%\">~group1~</td>"+
					"	</tr>"+
					"</table>";

	group1 = seqData.addGroup('group1', 'General');
	group1.inLabel = 'width="100px"';
	group1.addField('Sequence',		'Text', 	'', 'size=50', '', '', false, 0);
	group1.addField('Cycled',		'Radio_YesNo', 	'', '', '', '', false, 0);
	group1.addField('Last Value',	'Text', 	'', 'size=30', '', '', false, 0);
	group1.addField('Increment By',	'Text', 	'', 'size=30', '', '', false, 0);
	group1.addField('Min Value',	'Text', 	'', 'size=30', '', '', false, 0);
	group1.addField('Max Value',	'Text', 	'', 'size=30', '', '', false, 0);
	group1.addField('Cache',		'Text', 	'', 'size=30', '', '', false, 0);
		
	seqData.onData  = new Function("top.elements.seqData.srvParams['db']    = top.elements.seqTabs.db;"+
							"top.elements.seqData.srvParams['seq'] = top.elements.seqTabs.seq;");
	seqData.srvFile = "includes/seq_srv.php";
	
	// SEQUENCE SCRIPT
	var seqScript = new top.jsEdit('seqScript', null);
	seqScript.header = "Script";
	seqScript.showFooter = false;
	seqScript.tmpl = "<table cellpadding=\"5\" cellspacing=\"0\" style=\"width: 100%; height: 99%;\" class=\"rText\">"+
					"	<tr>"+
					"		<td valign=\"top\" style=\"width: 100%; height: 100%;\">"+
					"			<textarea id=sql style='padding: 2px; border: 1px solid silver; width: 100%; height: 100%; font-family: verdana; font-size: 11px;'></textarea>"+
					"		</td>"+
					"	</tr>"+
					"</table>";
	seqScript.onData  = new Function("top.elements.seqScript.srvParams['db'] = top.elements.seqTabs.db;"+
							"top.elements.seqScript.srvParams['seq'] = top.elements.seqTabs.seq;");
	seqScript.srvFile = "includes/seq_srv.php";
	
	// -- TABS
	var tab = seqTabs.addTab('seqTab1', 'Data', seqTB,  seqData);
	var tab = seqTabs.addTab('seqTab2', 'SQL', 	seqTB,  seqScript);
}

function seqTBAction(cmd) {
	switch(cmd) {
		case 'seqTB_but0':
			top.elements.seqTabs.setActive(0);
			top.elements.seqData.serverCall('update');
			break;
			
			
		default: alert(cmd);
	}
}
</script>