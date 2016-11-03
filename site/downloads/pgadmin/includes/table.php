<script>
function init_table() {
	var tableTabs = new top.jsTabs('tableTabs', null);
	tableTabs.style_toolbar = '';
	tableTabs.style = "background-color: #f6f9fc;";
	//tableTabs.tabWidth = '75px';

	// -- TOOLBAR
	var tableTB = null;
	var tableTB = new top.jsToolBar('tableTB', null);
	tableTB.addButton('Add Field', 'system/includes/silk/icons/table_row_insert.png', tableTBAction, 'Add a new field to the table');
	tableTB.addButton('Add Constraint', 'system/includes/silk/icons/table_error.png', tableTBAction, 'Add a Primary/Foreign/Unique Key or Check to the table');
	tableTB.addButton('Create Index', 'system/includes/silk/icons/page_white_lightning.png', tableTBAction, 'Create a new index for the table');
	tableTB.addButton('', 'system/includes/silk/icons/table_gear.png', tableTBAction, 'Create a new trigger for the table');
	tableTB.addButton('', 'system/includes/silk/icons/arrow_switch.png', tableTBAction, 'Create a new rule for the table');
	tableTB.addButton('', 'system/includes/silk/icons/drive_user.png', tableTBAction, 'Grant a privilage for the table');
	tableTB.addBreak();
	tableTB.addButton('Export', 'system/includes/silk/icons/database_lightning.png', tableTBAction, 'PgExport Table Structure/Data');
	tableTB.addButton('', 'system/includes/silk/icons/table_lightning.png', tableTBAction, 'Generate Table SQL Structure/Data');

	// TABLE FIELDS: ADD
	var tableFieldAdd = new top.jsEdit('tableFieldAdd', null);
	tableFieldAdd.header = "Add/Edit Field";
	tableFieldAdd.showFooter = false;
	tableFieldAdd.tmpl = "<table cellpadding=\"3\" cellspacing=\"0\" style=\"width: 100%\" class=\"rText\">"+
					"	<tr>"+
					"		<td valign=\"top\" style=\"width: 70%\">~group1~</td>"+
					"		<td valign=\"top\" style=\"width: 30%\">~group2~</td>"+
					"	</tr>"+
					"	<tr><td colspan=2 align=center style=\"padding: 5px; background-color: #e0e7f4; border-top: 1px solid #d5e1f1; border-bottom: 1px solid #d5e1f1;\"> ~controls~ </td></tr>"+
					"</table>";

	group1 = tableFieldAdd.addGroup('group1', 'General');
	group1.height  = 150;
	group1.inLabel = 'width="40px"';
	group1.addField('Name', 'Text', 		'field', 'size=60', '', '', true, 0);
	group1.addField('Type', 'List', 		'type', '', '', '', true, 0);
	group1.addField('Size', 'Int', 			'size', 'size=4', '', '', false, 0);
	group1.addField('Default', 'Text', 		'default', 'size=60', '', '', false, 0);
	group1.addField('Comments', 'TextArea',	'comments', 'style="width: 100%; height: 40px;"', '', '', false, 0);
	
	group2 = tableFieldAdd.addGroup('group2', 'Additional');
	group2.height = 150;
	group2.inLabel = 'width="40px"';
	group2.addField('Primary', 	'RADIO_YESNO', 'primary', '', '', 'f', false, 0);
	group2.addBreak(1);
	group2.addField('Not Null', 'RADIO_YESNO', 'not_null', '', '', 'f', false, 0);
	group2.addBreak(1);
	group2.addField('Unique', 	'RADIO_YESNO', 'unique', '', '', 'f', false, 0);
		
	tableFieldAdd.onSave	 = new Function("var el1 = document.getElementById('tableFieldAdd_field1');"+
											"var el2 = document.getElementById('tableFieldAdd_field2');"+ 
											"if (el1.value in ['char', 'varchar', 'bit'] && el2.value == '') { "+
											"	alert('Selected type requires size to be defined.'); "+
											"	return false; "+
											"}");
	tableFieldAdd.onData  = new Function("top.elements.tableFieldAdd.srvParams['db']    = top.elements.tableTabs.db;"+
							"top.elements.tableFieldAdd.srvParams['table'] = top.elements.tableTabs.table;");
	tableFieldAdd.addControl('save', 'Save', null);
	tableFieldAdd.addControl('back', 'Cancel', null);
	tableFieldAdd.srvFile = "includes/table_srv.php";
	
	// -- TABLE FIELDS
	var tableFields = new top.jsList('tableFields', null);
	tableFields.header = "Fields";
	tableFields.msgDelete = '';
	tableFields.items_pp = 200;
	tableFields.addColumn('Field', '20%', 'TEXT', '');
	tableFields.addColumn('Type', '10%', 'TEXT', '');
	tableFields.addColumn('Size', '5%', 'TEXT', 'align=right');
	tableFields.addColumn('Prim.', '5%', 'TEXT', 'align=center');
	tableFields.addColumn('!Null', '5%', 'TEXT', 'align=center');
	tableFields.addColumn('Uniq.', '5%', 'TEXT', 'align=center');
	tableFields.addColumn('Default', '25%', 'TEXT', '');
	tableFields.addColumn('Comments', '25%', 'TEXT', '');
	tableFields.addControl('delete', 'Delete');
	tableFields.onData  = new Function("top.elements.tableFields.srvParams['db']    = top.elements.tableTabs.db;"+
							"top.elements.tableFields.srvParams['table'] = top.elements.tableTabs.table;");
	tableFields.srvFile = "includes/table_srv.php";	
	tableFields.onAddOrEdit  = editTableField;		
	tableFieldAdd.onComplete = tableFields;

	// TABLE Constraints: ADD
	var tableConstAdd = new top.jsEdit('tableConstAdd', null);
	tableConstAdd.header = "Add Constraint";
	tableConstAdd.showFooter = false;
	tableConstAdd.tmpl = "<table cellpadding=\"3\" cellspacing=\"0\" style=\"width: 100%\" class=\"rText\">"+
					"	<tr><td valign=\"top\" style=\"width: 100%\">~group1~</td></tr>"+
					"	<tr id=cGroup2><td valign=\"top\" style=\"width: 100%\">~group2~</td></tr>"+
					"	<tr id=cGroup3 style='display: none'><td valign=\"top\" style=\"width: 100%\">~group3~</td></tr>"+
					"	<tr><td colspan=2 align=center style=\"padding: 5px; background-color: #e0e7f4; border-top: 1px solid #d5e1f1; border-bottom: 1px solid #d5e1f1;\"> ~controls~ </td></tr>"+
					"</table>";

	selList1 = '<select id=selList12 size=10 name=selList1 style="width: 250px; height: 110px; border: 1px solid silver;" onclick="selList_click(this, document.getElementById(\'tableConstAdd_field2\'))">'+
			   '</select>';
	group1 = tableConstAdd.addGroup('group1', 'General');
	group1.inLabel = 'width="74px"';
	group1.addField('Type',  	'List', 'type', 'onchange="refreshList1(this.value)"', '', '', true, 0, ['FK::Foreign Key', 'CH::Check', 'PK::Primary Key', 'UK::Unique Key']);
	group1.addField('Name',  	'Text', 'name', 'size=60', '', '', true, 0);
	group1.addField('Field(s)', 'List', 'fields', 'size=10 style="width: 250px; height: 110px;" onclick="selList_click(this, document.getElementById(\'selList12\'))"', selList1, '', false, 0);
	
	selList2 = '<select id=selList22 size=10 name=selList2 style="width: 250px; height: 110px; border: 1px solid silver;" onclick="selList_click(this, document.getElementById(\'tableConstAdd_field4\'))">'+
			   '</select>';
	group2 = tableConstAdd.addGroup('group2', 'Foreign Table');
	group2.inLabel = 'width="80px"';
	fl = group2.addField('Table',  	 'LookUp', 	'for_table', 'width: 350px;', '', '', false, 0);
	fl.onSelect = 'top.elements.tableConstAdd.srvParams[\'fk_table\'] = this.value; top.elements.tableConstAdd.serverCall(\'fk_table\');';
	group2.addField('Field(s)',  'List', 	'for_fields', 'size=10 style="width: 250px; height: 110px;" onclick="selList_click(this, document.getElementById(\'selList22\'))"', selList2, '', false, 0);
	group2.addField('On Delete', 'List', 	'onDelete', '', '', '', false, 1, ['No Action::No Action', 'Restrict::Restrict', 'Cascade::Cascade', 'Set Null::Set Null', 'Set Default::Set Default']);
	group2.addField('Deferrable','Radio_YesNo','deferrable', '', '', 'f', false, 0);
	group2.addField('On Update', 'List', 	'onUpdate', '', '', '', false, 1, ['No Action::No Action', 'Restrict::Restrict', 'Cascade::Cascade', 'Set Null::Set Null', 'Set Default::Set Default']);
	group2.addField('Check Time','List', 	'check_time', '', '', '', false, 0, ['Immediate::Immediate', 'Deferred::Deferred']);
	
	group3 = tableConstAdd.addGroup('group3', 'Check Parameters');
	group3.inLabel = 'width="80px"';
	group3.addField('Condition', 'TextArea',	'check_cond', 'style="width: 100%; height: 60px;"', '', '', false, 0);

	group1.addField('sel_fields1',	'Hidden', 'sel_fields1', '', '', '', false, 0);
	group1.addField('sel_fields2',	'Hidden', 'sel_fields2', '', '', '', false, 0);
	
	tableConstAdd.onComplete = tableConst;
	tableConstAdd.onData  = new Function("top.elements.tableConstAdd.srvParams['db']    = top.elements.tableTabs.db;"+
							"top.elements.tableConstAdd.srvParams['table'] = top.elements.tableTabs.table;");
	tableConstAdd.addControl('save', 'Save', null);
	tableConstAdd.addControl('back', 'Cancel', null);
	tableConstAdd.srvFile = "includes/table_srv.php";
	
	// TABLE CONSTRAINTS
	var tableConst = new top.jsList('tableConst', null);
	tableConst.header = "Constraints";
	tableConst.msgDelete = '';
	tableConst.addColumn('Constraint', '20%', 'TEXT', '');
	tableConst.addColumn('Type', '15%', 'TEXT', '');
	tableConst.addColumn('Definition', '65%', 'TEXT', '');
	tableConst.addControl('delete', 'Delete');
	tableConst.onData  = new Function("top.elements.tableConst.srvParams['db']    = top.elements.tableTabs.db;"+
							"top.elements.tableConst.srvParams['table'] = top.elements.tableTabs.table;");
	tableConst.srvFile = "includes/table_srv.php";	
	tableConstAdd.onComplete = tableConst; 

	// TABLE INDEX: ADD
	var tableIndxAdd = new top.jsEdit('tableIndxAdd', null);
	tableIndxAdd.header = "Create Index";
	tableIndxAdd.showFooter = false;
	tableIndxAdd.tmpl = "<table cellpadding=\"3\" cellspacing=\"0\" style=\"width: 100%\" class=\"rText\">"+
					"	<tr>"+
					"		<td valign=\"top\" style=\"width: 100%\">~group1~</td>"+
					"	</tr>"+
					"	<tr><td colspan=2 align=center style=\"padding: 5px; background-color: #e0e7f4; border-top: 1px solid #d5e1f1; border-bottom: 1px solid #d5e1f1;\"> ~controls~ </td></tr>"+
					"</table>";

	group1 = tableIndxAdd.addGroup('group1', 'General');
	group1.inLabel = 'width="70px"';
	group1.addField('Name', 	'Text', 		'name', 'size=60', '', '', true, 0);
	group1.addField('Type', 	'List', 		'type', '', '', '', true, 0, ['btree::btree', 'rtree::rtree', 'hash::hash', 'gist::gist']);
	group1.addField('Unique', 	'Radio_YesNo', 	'unique', '', '', 'f', false, 0);
	group1.addField('Function', 'List', 		'functional', '', '', '', false, 0);
	selList1 = '<select id=selList size=10 name=selList style="width: 250px; height: 110px; border: 1px solid silver;" onclick="selInd_click(this, document.getElementById(\'tableIndxAdd_field4\'))">'+
			   '</select>';
	group1.addField('Field(s)', 'List', 'fields', 'size=10 style="width: 250px; height: 110px;" onclick="selInd_click(this, document.getElementById(\'selList\'))"', selList1, '', false, 0);
	group1.addField('Field(s)',	'Hidden', 'sel_fields', '', '', '', true, 0);
		
	tableIndxAdd.onData  = new Function("top.elements.tableIndxAdd.srvParams['db']    = top.elements.tableTabs.db;"+
							"top.elements.tableIndxAdd.srvParams['table'] = top.elements.tableTabs.table;");
	tableIndxAdd.addControl('save', 'Save', null);
	tableIndxAdd.addControl('back', 'Cancel', null);
	tableIndxAdd.srvFile = "includes/table_srv.php";
	
	// TABLE INDEXES
	var tableIndx = new top.jsList('tableIndx', null);
	tableIndx.header = "Indexes";
	tableIndx.msgDelete = '';
	tableIndx.addColumn('Index', '20%', 'TEXT', '');
	tableIndx.addColumn('On Fields', '56%', 'TEXT', '');
	tableIndx.addColumn('Unique', '8%', 'TEXT', 'align=center');
	tableIndx.addColumn('Primary', '8%', 'TEXT', 'align=center');
	tableIndx.addColumn('Clustered', '8%', 'TEXT', 'align=center');
	tableIndx.addControl('delete', 'Delete');
	tableIndx.onDblClick = 'cluster';
	tableIndx.onData  = new Function("top.elements.tableIndx.srvParams['db']    = top.elements.tableTabs.db;"+
							"top.elements.tableIndx.srvParams['table'] = top.elements.tableTabs.table;");
	tableIndx.srvFile = "includes/table_srv.php";	
	tableIndxAdd.onComplete = tableIndx; 

	// TABLE TRIGGERS: ADD
	var tableTriggerAdd = new top.jsEdit('tableTriggerAdd', null);
	tableTriggerAdd.header = "Create Trigger";
	tableTriggerAdd.showFooter = false;
	tableTriggerAdd.tmpl = "<table cellpadding=\"3\" cellspacing=\"0\" style=\"width: 100%\" class=\"rText\">"+
					"	<tr>"+
					"		<td valign=\"top\" style=\"width: 100%\">~group1~</td>"+
					"	</tr>"+
					"	<tr><td colspan=2 align=center style=\"padding: 5px; background-color: #e0e7f4; border-top: 1px solid #d5e1f1; border-bottom: 1px solid #d5e1f1;\"> ~controls~ </td></tr>"+
					"</table>";

	group1 = tableTriggerAdd.addGroup('group1', 'General');
	group1.inLabel = 'width="70px"';
	group1.addField('Name', 		'Text', 		'name', 'size=60', '', '', true, 0);
	group1.addField('Timing', 		'List', 		'timing', '', '', '', true, 0, ['BEFORE::Before', 'AFTER::After']);
	group1.addField('On Insert', 	'Radio_YesNo', 	'insert', '', '', 'f', false, 0);
	group1.addField('On Update', 	'Radio_YesNo', 	'update', '', '', 'f', false, 0);
	group1.addField('On Delete', 	'Radio_YesNo', 	'delete', '', '', 'f', false, 0);
	group1.addField('Function', 	'List', 		'function', '', '', '', true, 0);
		
	tableTriggerAdd.onData  = new Function("top.elements.tableTriggerAdd.srvParams['db']    = top.elements.tableTabs.db;"+
							"top.elements.tableTriggerAdd.srvParams['table'] = top.elements.tableTabs.table;");
	tableTriggerAdd.addControl('save', 'Save', null);
	tableTriggerAdd.addControl('back', 'Cancel', null);
	tableTriggerAdd.srvFile = "includes/table_srv.php";
	
	// TABLE TRIGGERS
	var tableTriggers = new top.jsList('tableTriggers', null);
	tableTriggers.header = "Triggers";
	tableTriggers.msgDelete = '';
	tableTriggers.addColumn('Trigger', '20%', 'TEXT', '');
	tableTriggers.addColumn('Timing', '10%', 'TEXT', '');
	tableTriggers.addColumn('Event', '20%', 'TEXT', '');
	tableTriggers.addColumn('Function', '42%', 'TEXT', '');
	tableTriggers.addColumn('Enabled', '8%', 'TEXT', 'align=center');
	tableTriggers.addControl('delete', 'Delete');
	tableTriggers.onDblClick = 'disable';
	tableTriggers.onData  = new Function("top.elements.tableTriggers.srvParams['db']    = top.elements.tableTabs.db;"+
							"top.elements.tableTriggers.srvParams['table'] = top.elements.tableTabs.table;");
	tableTriggers.srvFile = "includes/table_srv.php";	
	tableTriggerAdd.onComplete = tableTriggers; 

	// TABLE RULE: ADD
	var tableRuleAdd = new top.jsEdit('tableRuleAdd', null);
	tableRuleAdd.header = "Create Rule";
	tableRuleAdd.showFooter = false;
	tableRuleAdd.tmpl = "<table cellpadding=\"3\" cellspacing=\"0\" style=\"width: 100%\" class=\"rText\">"+
					"	<tr>"+
					"		<td valign=\"top\" style=\"width: 100%\">~group1~</td>"+
					"	</tr>"+
					"	<tr><td colspan=2 align=center style=\"padding: 5px; background-color: #e0e7f4; border-top: 1px solid #d5e1f1; border-bottom: 1px solid #d5e1f1;\"> ~controls~ </td></tr>"+
					"</table>";

	group1 = tableRuleAdd.addGroup('group1', 'General');
	group1.inLabel = 'width="70px"';
	group1.addField('Name', 	'Text', 		'name', 'size=60', '', '', true, 0);
	group1.addField('Event', 	'List', 		'event', '', '', '', true, 0, ['SELECT::SELECT', 'INSERT::INSERT', 'UPDATE::UPDATE', 'DELETE::DELETE']);
	group1.addField('Instead?',	'Radio_YesNo', 	'instead', '', '', 'f', false, 0);
	group1.addField('Condition','Text', 		'condition', 'size=60', '', '', false, 0);
	group1.addField('Action', 	'TextArea', 	'action', 'style="width: 90%; height: 120px;"', '', '', false, 0);
		
	tableRuleAdd.onData  = new Function("top.elements.tableRuleAdd.srvParams['db']    = top.elements.tableTabs.db;"+
							"top.elements.tableRuleAdd.srvParams['table'] = top.elements.tableTabs.table;");
	tableRuleAdd.addControl('save', 'Save', null);
	tableRuleAdd.addControl('back', 'Cancel', null);
	tableRuleAdd.srvFile = "includes/table_srv.php";
	
	// TABLE RULES
	var tableRules = new top.jsList('tableRules', null);
	tableRules.header = "Rules";
	tableRules.msgDelete = "";
	tableRules.addColumn('Rule', '20%', 'TEXT', '');
	tableRules.addColumn('Event', '10%', 'TEXT', '');
	tableRules.addColumn('Inst.', '5%', 'TEXT', 'align=center');
	tableRules.addColumn('Cond.', '5%', 'TEXT', 'align=center');
	tableRules.addColumn('Statement', '60%', 'TEXT', '');
	tableRules.addControl('delete', 'Delete');
	tableRules.onData  = new Function("top.elements.tableRules.srvParams['db']    = top.elements.tableTabs.db;"+
							"top.elements.tableRules.srvParams['table'] = top.elements.tableTabs.table;");
	tableRules.srvFile = "includes/table_srv.php";	
	tableRules.onAddOrEdit  = editTableRule;
	tableRuleAdd.onComplete = tableRules; 
	
	// TABLE Privilege: ADD
	var tablePrivAdd = new top.jsEdit('tablePrivAdd', null);
	tablePrivAdd.header = "Grant Privilege";
	tablePrivAdd.showFooter = false;
	tablePrivAdd.tmpl = "<table cellpadding=\"3\" cellspacing=\"0\" style=\"width: 100%\" class=\"rText\">"+
					"	<tr>"+
					"		<td valign=\"top\" style=\"width: 100%\">~group1~</td>"+
					"	</tr>"+
					"	<tr><td colspan=2 align=center style=\"padding: 5px; background-color: #e0e7f4; border-top: 1px solid #d5e1f1; border-bottom: 1px solid #d5e1f1;\"> ~controls~ </td></tr>"+
					"</table>";

	group1 = tablePrivAdd.addGroup('group1', 'General');
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
		
	tablePrivAdd.onData  = new Function("top.elements.tablePrivAdd.srvParams['db']    = top.elements.tableTabs.db;"+
							"top.elements.tablePrivAdd.srvParams['table'] = top.elements.tableTabs.table;");
	tablePrivAdd.addControl('save', 'Save', null);
	tablePrivAdd.addControl('back', 'Cancel', null);
	tablePrivAdd.srvFile = "includes/table_srv.php";
	
	// TABLE PRIVILAGES
	var tablePriv = new top.jsList('tablePriv', null);
	tablePriv.header = "Privileges";
	tablePriv.msgDelete = "";
	tablePriv.addColumn('User', '20%', 'TEXT', '');
	tablePriv.addColumn('Rights', '60%', 'TEXT', '');
	tablePriv.addColumn('Given By', '20%', 'TEXT', '');
	tablePriv.addControl('delete', 'Revoke');
	tablePriv.onData  = new Function("top.elements.tablePriv.srvParams['db']    = top.elements.tableTabs.db;"+
							"top.elements.tablePriv.srvParams['table'] = top.elements.tableTabs.table;");
	tablePriv.srvFile = "includes/table_srv.php";	
	tablePrivAdd.onComplete = tablePriv; 
	
	// TABLE SCRIPT
	var tableScript = new top.jsEdit('tableScript', null);
	tableScript.header = "Script";
	tableScript.showFooter = false;
	tableScript.tmpl = "<table cellpadding=\"5\" cellspacing=\"0\" style=\"width: 100%; height: 99%;\" class=\"rText\">"+
					"	<tr>"+
					"		<td valign=\"top\" style=\"width: 100%; height: 100%;\">"+
					"			<textarea id=sql style='padding: 2px; border: 1px solid silver; width: 100%; height: 100%; font-family: verdana; font-size: 11px;'></textarea>"+
					"		</td>"+
					"	</tr>"+
					"</table>";
	tableScript.onData  = new Function("top.elements.tableScript.srvParams['db']    = top.elements.tableTabs.db;"+
							"top.elements.tableScript.srvParams['table'] = top.elements.tableTabs.table;");
	tableScript.srvFile = "includes/table_srv.php";
	
	// -- TABLE DATA
	var tableData = new top.jsList('tableData', null);
	tableData.header = "Table Data";
	tableData.addColumn('Data', '100%', 'TEXT', '');
	tableData.onData  = new Function("top.elements.tableData.srvParams['db']    = top.elements.tableTabs.db;"+
							"top.elements.tableData.srvParams['table'] = top.elements.tableTabs.table;");
	tableData.srvFile = "includes/table_srv.php";	
	
	// TABLE Data: ADD
	var tableDataAdd = new top.jsEdit('tableDataAdd', null);
	tableDataAdd.header = "Add/Edit Data";
	tableDataAdd.showFooter = false;
	tableDataAdd.tmpl = "<table cellpadding=\"3\" cellspacing=\"0\" style=\"width: 100%\" class=\"rText\">"+
					"	<tr>"+
					"		<td valign=\"top\" style=\"width: 100%\">~group1~</td>"+
					"	</tr>"+
					"	<tr><td colspan=2 align=center style=\"padding: 5px; background-color: #e0e7f4; border-top: 1px solid #d5e1f1; border-bottom: 1px solid #d5e1f1;\"> ~controls~ </td></tr>"+
					"</table>";

	group1 = tableDataAdd.addGroup('group1', 'All Fields');
	group1.inLabel = 'width="70px"';
	// group1.addField('User Or Group', 	'List', 		'user', '', '', '', true, 0);
		
	tableDataAdd.onData  = new Function("top.elements.tableDataAdd.srvParams['db']    = top.elements.tableTabs.db;"+
							"top.elements.tableDataAdd.srvParams['table'] = top.elements.tableTabs.table;");
	tableDataAdd.addControl('back', 'Cancel', null);
	tableDataAdd.srvFile = "includes/table_srv.php";
	tableDataAdd.onComplete = tableData;
	tableData.onAddOrEdit   = tableDataAdd;
	
	// -- TABS
	var tab = tableTabs.addTab('tableTab1', 'Fields', 		tableTB,  tableFields);
	var tab = tableTabs.addTab('tableTab2', 'Constraints', 	tableTB,  tableConst);
	var tab = tableTabs.addTab('tableTab3', 'Indexes', 		tableTB,  tableIndx);
	var tab = tableTabs.addTab('tableTab4', 'Triggers', 	tableTB,  tableTriggers);
	var tab = tableTabs.addTab('tableTab5', 'Rules', 		tableTB,  tableRules);
	var tab = tableTabs.addTab('tableTab6', 'Privileges', 	tableTB,  tablePriv);
	var tab = tableTabs.addTab('tableTab7', 'Script', 		tableTB,  tableScript);
	var tab = tableTabs.addTab('tableTab8', 'Data', 		tableTB,  tableData);
} 

function refreshList1(val) {
	document.getElementById('cGroup2').style.display = 'none';
	document.getElementById('cGroup3').style.display = 'none';
	if (val == 'FK') {
		document.getElementById('cGroup2').style.display = '';
	}
	if (val == 'CH') {
		document.getElementById('cGroup3').style.display = '';
	}
}

function selList_click(el1, el2) {
	var oOption = document.createElement("OPTION");
	oOption.text  = el1.options[el1.selectedIndex].text;
	oOption.value = el1.options[el1.selectedIndex].text;
	el2.options.add(oOption, el2.options.length);
	el1.remove(el1.selectedIndex);
	// refresh fields
	var el = document.getElementById('selList12');
	var tmp = '';
	for (i=0; i<el.options.length; i++) {
		if (tmp != '') tmp += ',';
		tmp += el.options[i].text;
	}
	document.getElementById('tableConstAdd_field10').value = tmp;
	var el = document.getElementById('selList22');
	var tmp = '';
	for (i=0; i<el.options.length; i++) {
		if (tmp != '') tmp += ',';
		tmp += el.options[i].text;
	}
	document.getElementById('tableConstAdd_field11').value = tmp;
}

function selInd_click(el1, el2) {
	var oOption = document.createElement("OPTION");
	oOption.text  = el1.options[el1.selectedIndex].text;
	oOption.value = el1.options[el1.selectedIndex].text;
	el2.options.add(oOption, el2.options.length);
	el1.remove(el1.selectedIndex);
	// refresh fields
	var el = document.getElementById('selList');
	var tmp = '';
	for (i=0; i<el.options.length; i++) {
		if (tmp != '') tmp += ',';
		tmp += el.options[i].text;
	}
	document.getElementById('tableIndxAdd_field5').value = tmp;
}

function tableTBAction(id) {
	switch (id) {
		case 'tableTB_but0': 
			top.elements.tableTabs.setActive(0);
			var tab = top.elements.tableTabs.getTab('tableTab1');
			var obj = top.elements.tableFieldAdd;
			obj.box = tab.owner.box.ownerDocument.getElementById('tab_'+ tab.owner.name +'_dsp');
			obj.recid = null;
			obj.output();
			break;
			
		case 'tableTB_but1': 
			top.elements.tableTabs.setActive(1);
			var tab = top.elements.tableTabs.getTab('tableTab2');
			var obj = top.elements.tableConstAdd;
			obj.box = tab.owner.box.ownerDocument.getElementById('tab_'+ tab.owner.name +'_dsp');
			obj.recid = null;
			obj.srvParams['db']    = top.elements.tableTabs.db;
			obj.srvParams['table'] = top.elements.tableTabs.table;			
			obj.output();
			break;
			
		case 'tableTB_but2': 
			top.elements.tableTabs.setActive(2);
			var tab = top.elements.tableTabs.getTab('tableTab3');
			var obj = top.elements.tableIndxAdd;
			obj.box = tab.owner.box.ownerDocument.getElementById('tab_'+ tab.owner.name +'_dsp');
			obj.recid = null;
			obj.srvParams['db']    = top.elements.tableTabs.db;
			obj.srvParams['table'] = top.elements.tableTabs.table;			
			obj.output();
			break;
			
		case 'tableTB_but3': 
			top.elements.tableTabs.setActive(3);
			var tab = top.elements.tableTabs.getTab('tableTab4');
			var obj = top.elements.tableTriggerAdd;
			obj.box = tab.owner.box.ownerDocument.getElementById('tab_'+ tab.owner.name +'_dsp');
			obj.recid = null;
			obj.srvParams['db']    = top.elements.tableTabs.db;
			obj.srvParams['table'] = top.elements.tableTabs.table;			
			obj.output();
			break;
			
		case 'tableTB_but4': 
			top.elements.tableTabs.setActive(4);
			var tab = top.elements.tableTabs.getTab('tableTab5');
			var obj = top.elements.tableRuleAdd;
			obj.box = tab.owner.box.ownerDocument.getElementById('tab_'+ tab.owner.name +'_dsp');
			obj.recid = null;
			obj.srvParams['db']    = top.elements.tableTabs.db;
			obj.srvParams['table'] = top.elements.tableTabs.table;			
			obj.output();
			break;
			
		case 'tableTB_but5': 
			top.elements.tableTabs.setActive(5);
			var tab = top.elements.tableTabs.getTab('tableTab6');
			var obj = top.elements.tablePrivAdd;
			obj.box = tab.owner.box.ownerDocument.getElementById('tab_'+ tab.owner.name +'_dsp');
			obj.recid = null;
			obj.srvParams['db']    = top.elements.tableTabs.db;
			obj.srvParams['table'] = top.elements.tableTabs.table;			
			obj.output();
			break;
			
		case 'tableTB_but7':
			top.elements.mLayout.initPanel('main', top.elements.pgexport);
			top.elements.pgexport.groups[0].fields[2].value = String(top.elements.tableTabs.table).split('.')[2];
			top.elements.pgexport.refresh();
			break;
			
		case 'tableTB_but8':
			top.elements.tableTabs.setActive(6);
			top.elements.tableScript.serverCall('get_data');
			break;
			
		default: alert(id);
	}
}

function editTableField(id) {
	var tab = top.elements.tableTabs.getTab('tableTab1');
	var obj = top.elements.tableFieldAdd;
	obj.box = tab.owner.box.ownerDocument.getElementById('tab_'+ tab.owner.name +'_dsp');
	obj.recid = id;
	obj.output();
}

function editTableRule(id) {
	var tab = top.elements.tableTabs.getTab('tableTab5');
	var obj = top.elements.tableRuleAdd;
	obj.box = tab.owner.box.ownerDocument.getElementById('tab_'+ tab.owner.name +'_dsp');
	obj.recid = id;
	obj.output();
}
</script>