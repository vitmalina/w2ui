<script>
var encoding = ['UNICODE::Unicode (UTF-8)', 'SQL_ASCII::ASCII', 'EUC_JP::Japanese EUC', 'EUC_CN::Chinese EUC',
	'EUC_KR::Korean EUC', 'JOHAB::Korean EUC (Hangle base)', 'EUC_TW::Taiwan EUC', 'MULE_INTERNAL::Mule internal code',
	'LATIN1::ISO 8859-1/ECMA 94 (Latin alphabet no.1)', 'LATIN2::ISO 8859-2/ECMA 94 (Latin alphabet no.2)',
	'LATIN3::ISO 8859-3/ECMA 94 (Latin alphabet no.3)', 'LATIN4::ISO 8859-4/ECMA 94 (Latin alphabet no.4)', 
	'LATIN5::ISO 8859-9/ECMA 128 (Latin alphabet no.5)','LATIN6::ISO 8859-10/ECMA 144 (Latin alphabet no.6)',
	'LATIN7::ISO 8859-13 (Latin alphabet no.7)', 'LATIN8::ISO 8859-14 (Latin alphabet no.8)', 
	'LATIN9::ISO 8859-15 (Latin alphabet no.9)', 'LATIN10::ISO 8859-16/ASRO SR 14111 (Latin alphabet no.10)',
	'ISO_8859_5::ISO 8859-5/ECMA 113 (Latin/Cyrillic)', 'ISO_8859_6::ISO 8859-6/ECMA 114 (Latin/Arabic)', 
	'ISO_8859_7::ISO 8859-7/ECMA 118 (Latin/Greek)', 'ISO_8859_8::ISO 8859-8/ECMA 121 (Latin/Hebrew)', 
	'KOI8::KOI8-R(U)', 'ALT::Windows CP866', 'WIN874::Windows CP874 (Thai)', 'WIN1250::Windows CP1250',
	'WIN::Windows CP1251','WIN1256::Windows CP1256 (Arabic)', 'TCVN::TCVN-5712/Windows CP1258 (Vietnamese)'];
	
function init_database() {
	document.title = "Web 2.0 PgAdmin | <?="DB: ".$sys_dbIP." | User: ".$sys_dbLogin?>";
	// -- databases
	var databases = new top.jsList('databases', null);
	databases.header = "DB Server: <span style='font-weight: normal'><?=$sys_dbIP."</span> &nbsp;&nbsp;User: <span style='font-weight: normal'>".$sys_dbLogin."</span>  &nbsp;&nbsp;PostgresSQL: <span style='font-weight: normal'>v. ".$db_version."</span>"?> ";
	databases.addColumn('Database', '20%', 'TEXT', '');
	databases.addColumn('Owner', '10%', 'TEXT', 'align=center');
	databases.addColumn('Encoding', '10%', 'TEXT', 'align=center');
	databases.addColumn('Is Template', '10%', 'TEXT', 'align=center');
	databases.addColumn('Can Connect', '10%', 'TEXT', 'align=center');
	databases.addColumn('Conn. Limit', '10%', 'TEXT', 'align=right');
	databases.addColumn('Configuration', '15%', 'TEXT', 'align=right');
	databases.addColumn('Access Rights', '15%', 'TEXT', 'align=right');
	databases.srvParams['super'] = top.superuser ? 1 : 0;
	databases.srvFile = "includes/database_srv.php";
	
	var databaseAdd = new top.jsEdit('databaseAdd', null);
	databaseAdd.header = "Create Database";
	databaseAdd.showFooter = false;
	databaseAdd.tmpl = "<table cellpadding=\"3\" cellspacing=\"0\" style=\"width: 100%\" class=\"rText\">"+
					"	<tr>"+
					"		<td valign=\"top\" style=\"width: 100%\">~group1~</td>"+
					"	</tr>"+
					"	<tr><td colspan=2 align=center style=\"padding: 5px; background-color: #e0e7f4; border-top: 1px solid #d5e1f1; border-bottom: 1px solid #d5e1f1;\"> ~controls~ </td></tr>"+
					"</table>";

	group1 = databaseAdd.addGroup('group1', 'General'); 
	group1.inLabel = 'width="120px"';
	group1.addField('DB Name',		'Text', 'dbname', 'size=40', '', '', true, 0);
	group1.addField('Encoding',		'List', 'encoding', '', '', '', true, 0, encoding);
	group1.addField('Owner',		'List', 'owner', '', '', '', false, 0);
	group1.addField('Template',		'List', 'template', '', '', '', false, 0);
	group1.addBreak(1);
		
	databaseAdd.addControl('save', 'Save', null);
	databaseAdd.addControl('back', 'Cancel', null);
	databaseAdd.srvFile = "includes/database_srv.php";
	databaseAdd.onComplete = databases;

	// -- templates
	var templates = new top.jsList('templates', null);
	templates.header = "Database Templates";
	templates.addColumn('Database', '20%', 'TEXT', '');
	templates.addColumn('Owner', '10%', 'TEXT', 'align=center');
	templates.addColumn('Encoding', '10%', 'TEXT', 'align=center');
	templates.addColumn('Is Template', '10%', 'TEXT', 'align=center');
	templates.addColumn('Can Connect', '10%', 'TEXT', 'align=center');
	templates.addColumn('Conn. Limit', '10%', 'TEXT', 'align=right');
	templates.addColumn('Configuration', '15%', 'TEXT', 'align=right');
	templates.addColumn('Access Rights', '15%', 'TEXT', 'align=right');
	templates.srvParams['super'] = top.superuser ? 1 : 0;
	templates.srvFile = "includes/database_srv.php";

	var dbConnect = new top.jsEdit('dbConnect', null);
	dbConnect.header = "Connect To...";
	dbConnect.showFooter = false;
	dbConnect.tmpl = "<table cellpadding=\"3\" cellspacing=\"0\" style=\"width: 100%\" class=\"rText\">"+
					"	<tr>"+
					"		<td valign=\"top\" style=\"width: 100%\">~group1~</td>"+
					"	</tr>"+
					"	<tr><td colspan=2 align=center style=\"padding: 5px; background-color: #e0e7f4; border-top: 1px solid #d5e1f1; border-bottom: 1px solid #d5e1f1;\"> ~controls~ </td></tr>"+
					"</table>";

	group1 = dbConnect.addGroup('group1', 'General'); 
	group1.inLabel = 'width="80px"';
	group1.addField('Predefined',	'List', 'dbname', 'onchange="dbChange(this.value)"', '', '', false, 0);
	group1.addField('Host',			'text', 'host', 'size=40', '', '', true, 0);
	group1.addField('Port',			'text', 'port', 'size=10', '&nbsp; default is 5432', '', false, 0);
	group1.addField('DB User',		'text', 'user', 'size=40', '', '', false, 0);
	group1.addField('Password',		'password', 'pass', 'size=40', '', '', false, 0);
	group1.addBreak(1);
		
	dbConnect.addControl('save', 'Connect', null);
	dbConnect.srvFile = "includes/database_srv.php";
	
	// -- schemas
	var schemas = new top.jsList('schemas', null);
	schemas.header = "Schemas";
	schemas.msgDelete = '';
	schemas.addColumn('Schema', '40%', 'TEXT', '');
	schemas.addColumn('Tables', '10%', 'TEXT', 'align=center');
	schemas.addColumn('Views', '10%', 'TEXT', 'align=center');
	schemas.addColumn('Functions', '10%', 'TEXT', 'align=center');
	schemas.addColumn('Sequences', '10%', 'TEXT', 'align=center');
	schemas.addColumn('Size', '20%', 'TEXT', 'align=right');
	schemas.addControl('link', 'Export', 'javascript: top.elements.mLayout.initPanel(\'main\', top.elements.pgexport);', 'system/includes/silk/icons/database_lightning.png');
	schemas.addControl('delete', 'Delete');
	schemas.srvFile = "includes/database_srv.php";

	var schemaAdd = new top.jsEdit('schemaAdd', null);
	schemaAdd.header = "Create Schema";
	schemaAdd.showFooter = false;
	schemaAdd.tmpl = "<table cellpadding=\"3\" cellspacing=\"0\" style=\"width: 100%\" class=\"rText\">"+
					"	<tr>"+
					"		<td valign=\"top\" style=\"width: 100%\">~group1~</td>"+
					"	</tr>"+
					"	<tr><td colspan=2 align=center style=\"padding: 5px; background-color: #e0e7f4; border-top: 1px solid #d5e1f1; border-bottom: 1px solid #d5e1f1;\"> ~controls~ </td></tr>"+
					"</table>";

	group1 = schemaAdd.addGroup('group1', 'General'); 
	group1.inLabel = 'width="120px"';
	group1.addField('Schema Name',		'Text', 'name', 'size=40', '', '', true, 0);
	group1.addBreak(1);
		
	schemaAdd.addControl('save', 'Save', null);
	schemaAdd.addControl('back', 'Cancel', null);
	schemaAdd.onOutput  = new Function("top.elements.schemaAdd.srvParams['db'] = top.currentDB;");
	schemaAdd.srvFile = "includes/database_srv.php";
	schemaAdd.onComplete = schemas;
	
	var tables = new top.jsList('tables', null);
	tables.header = "Tables";
	tables.msgDelete = '';
	tables.addColumn('Table', '30%', 'TEXT', '');
	tables.addColumn('Cols', '4%', 'TEXT', 'align=center');
	tables.addColumn('PK', '4%', 'TEXT', 'align=center');
	tables.addColumn('CHK', '4%', 'TEXT', 'align=center');
	tables.addColumn('IND', '4%', 'TEXT', 'align=center');
	tables.addColumn('RUL', '4%', 'TEXT', 'align=center');
	tables.addColumn('TRG', '4%', 'TEXT', 'align=center');
	tables.addColumn('CHLD', '5%', 'TEXT', 'align=center');
	tables.addColumn('Rows', '12%', 'TEXT',  'align=right');
	tables.addColumn('Size', '14%', 'TEXT',  'align=right');
	tables.addColumn('Rights', '8%', 'TEXT', 'align=center');
	tables.addColumn('Owner', '15%', 'TEXT', '');
	tables.addControl('link', 'Export', 'javascript: top.elements.pgexport.groups[0].fields[2].value = null; top.elements.mLayout.initPanel(\'main\', top.elements.pgexport);', 'system/includes/silk/icons/database_lightning.png');
	tables.addControl('delete', 'Delete');
	tables.srvFile = "includes/database_srv.php";	

	var tableAdd = new top.jsEdit('tableAdd', null);
	tableAdd.header = "Create Table";
	tableAdd.showFooter = false;
	tableAdd.tmpl = "<table cellpadding=\"3\" cellspacing=\"0\" style=\"width: 100%\" class=\"rText\">"+
					"	<tr>"+
					"		<td valign=\"top\" style=\"width: 75%\">~group1~</td>"+
					"		<td valign=\"top\" style=\"width: 25%\">~group2~</td>"+
					"	</tr>"+
					"	<tr><td colspan=2 align=center style=\"padding: 5px; background-color: #e0e7f4; border-top: 1px solid #d5e1f1; border-bottom: 1px solid #d5e1f1;\"> ~controls~ </td></tr>"+
					"</table>";

	group1 = tableAdd.addGroup('group1', 'General'); 
	group1.height = 150;
	group1.inLabel = 'width="120px"';
	group1.addField('Schema',			'List', 'schema', '', '', top.currentSchema, true, 0);
	group1.addField('Table Name',		'Text', 'name', 'size=40', '', '', true, 0);
	group1.addField('With OIDs',		'Radio_YesNo', 'oids', '', '', 't', true, 0);
	group1.addBreak(10);
	group1.addField('Copy Fields From',	'List', 'like', '', '', '', false, 0);
	group1.addBreak(1);
	
	group2 = tableAdd.addGroup('group2', 'Info'); 
	group2.height = 150;
	group2.addField('',	'Title', '', '', 'After table is created, you will be able to define fields.', '', false, 0);
		
	tableAdd.addControl('save', 'Save', null);
	tableAdd.addControl('back', 'Cancel', null);
	tableAdd.onOutput  = new Function("top.elements.tableAdd.srvParams['db'] = top.currentDB;");
	tableAdd.onDataReceived  = new Function("document.getElementById('tableAdd_field0').value = top.currentSchema;");
	tableAdd.srvFile = "includes/database_srv.php";
	tableAdd.onComplete = tables;
	
	var views = new top.jsList('views', null);
	views.header    = "Views";
	views.msgDelete = '';
	views.addColumn('View', '35%', 'TEXT', '');
	views.addColumn('Cols', '5%', 'TEXT', 'align=right');
	views.addColumn('Comments', '40%', 'TEXT',  '');
	views.addColumn('Rights', '5%', 'TEXT', 'align=center');
	views.addColumn('Owner', '15%', 'TEXT', '');
	views.addControl('delete', 'Delete');
	views.srvFile = "includes/database_srv.php";	
	
	var viewAdd = new top.jsEdit('viewAdd', null);
	viewAdd.header = "Create View";
	viewAdd.showFooter = false;
	viewAdd.tmpl = "<table cellpadding=\"3\" cellspacing=\"0\" style=\"width: 100%\" class=\"rText\">"+
					"	<tr>"+
					"		<td valign=\"top\" style=\"width: 100%\">~group1~</td>"+
					"	</tr>"+
					"	<tr><td colspan=2 align=center style=\"padding: 5px; background-color: #e0e7f4; border-top: 1px solid #d5e1f1; border-bottom: 1px solid #d5e1f1;\"> ~controls~ </td></tr>"+
					"</table>";

	group1 = viewAdd.addGroup('group1', 'General'); 
	group1.inLabel = 'width="120px"';
	group1.addField('Schema',			'List', 'schema', '', '', top.currentSchema, true, 0);
	group1.addField('View Name',		'Text', 'name', 'size=40', '', '', true, 0);
	group1.addField('SQL Statement',	'TextArea', 'sql', 'style="width: 90%; height: 120px;"', '', '', true, 0);
	group1.addBreak(1);
		
	viewAdd.addControl('save', 'Save', null);
	viewAdd.addControl('back', 'Cancel', null);
	viewAdd.onOutput  = new Function("top.elements.viewAdd.srvParams['db'] = top.currentDB;");
	viewAdd.onDataReceived  = new Function("document.getElementById('tableAdd_field0').value = top.currentSchema;");
	viewAdd.srvFile = "includes/database_srv.php";
	viewAdd.onComplete = views;
	
	var seqs = new top.jsList('seqs', null);
	seqs.header = "Sequences";
	seqs.msgDelete = '';
	seqs.addColumn('Sequence', '35%', 'TEXT', '');
	seqs.addColumn('Current', '10%', 'TEXT', 'align=right');
	seqs.addColumn('Increment', '10%', 'TEXT', 'align=center');
	seqs.addColumn('Linked To', '35%', 'TEXT', '');
	seqs.addColumn('Field Max', '10%', 'TEXT', 'align=right');
	seqs.addControl('delete', 'Delete');
	seqs.srvFile = "includes/database_srv.php";	

	var seqAdd = new top.jsEdit('seqAdd', null);
	seqAdd.header = "Create Sequence";
	seqAdd.showFooter = false;
	seqAdd.tmpl = "<table cellpadding=\"3\" cellspacing=\"0\" style=\"width: 100%\" class=\"rText\">"+
					"	<tr>"+
					"		<td valign=\"top\" style=\"width: 100%\">~group1~</td>"+
					"	</tr>"+
					"	<tr><td colspan=2 align=center style=\"padding: 5px; background-color: #e0e7f4; border-top: 1px solid #d5e1f1; border-bottom: 1px solid #d5e1f1;\"> ~controls~ </td></tr>"+
					"</table>";

	group1 = seqAdd.addGroup('group1', 'General'); 
	group1.inLabel = 'width="120px"';
	group1.addField('Schema',			'List', 'schema', '', '', top.currentSchema, true, 0);
	group1.addField('Sequence Name',	'Text', 'name', 'size=40', '', '', true, 0);
	group1.addField('Cycle',			'Radio_YesNo', 'cycle', '', '', 'f', true, 0);
	group1.addField('Start',			'Int', 'start', '', '', '1', false, 0);
	group1.addField('Increment By',		'Int', 'inc', '', '', '1', false, 0);
	group1.addField('Minimum',			'Int', 'min', '', '', '', false, 0);
	group1.addField('Maximum',			'Int', 'max', '', '', '', false, 0);
	group1.addField('Cache',			'Int', 'cache', '', '', '', false, 0);
	group1.addBreak(1);
		
	seqAdd.addControl('save', 'Save', null);
	seqAdd.addControl('back', 'Cancel', null);
	seqAdd.onOutput  = new Function("top.elements.seqAdd.srvParams['db'] = top.currentDB;");
	seqAdd.onDataReceived  = new Function("document.getElementById('seqAdd_field0').value = top.currentSchema;");
	seqAdd.srvFile = "includes/database_srv.php";
	seqAdd.onComplete = seqs;
	
	var funs = new top.jsList('funs', null);
	funs.header = "Functions";
	funs.msgDelete = '';
	funs.addColumn('Function', '45%', 'TEXT', '');
	funs.addColumn('Language', '10%', 'TEXT', '');
	funs.addColumn('Returns', '20%', 'TEXT', '');
	funs.addColumn('Agg', '5%', 'TEXT', 'align=center');
	funs.addColumn('Rights', '5%', 'TEXT', 'align=center');
	funs.addColumn('Owner', '15%', 'TEXT', '');
	funs.addControl('delete', 'Delete');
	funs.srvFile = "includes/database_srv.php";	
	
	var funAdd = new top.jsEdit('funAdd', null);
	funAdd.header = "Create Function";
	funAdd.showFooter = false;
	funAdd.tmpl = "<table cellpadding=\"3\" cellspacing=\"0\" style=\"width: 100%\" class=\"rText\">"+
					"	<tr>"+
					"		<td valign=\"top\" style=\"width: 100%\">~group1~</td>"+
					"	</tr>"+
					"	<tr><td colspan=2 align=center style=\"padding: 5px; background-color: #e0e7f4; border-top: 1px solid #d5e1f1; border-bottom: 1px solid #d5e1f1;\"> ~controls~ </td></tr>"+
					"</table>";

	group1 = funAdd.addGroup('group1', 'General'); 
	group1.inLabel = 'width="120px"';
	group1.addField('Schema',			'List', 'schema', '', '', top.currentSchema, true, 0);
	group1.addField('Function Name',	'Text', 'name', 'size=40', '', '', true, 0);
	group1.addField('Arguments',		'Text', 'arg', 'size=40', '&nbsp;[ argname ] argtype [, ...]', '', false, 0);
	group1.addField('Returns Type',		'Text', 'ret', 'size=20', '', '', true, 0);
	group1.addField('Language',			'List', 'lang', '', '', '', true, 0);
	group1.addField('Call Type',		'List', 'type', '', '', '', true, 0, ['IMMUTABLE::IMMUTABLE', 'STABLE::STABLE', 'VOLATILE::VOLATILE']);
	group1.addField('On Null Input',	'List', 'onnull', '', '', '', true, 0, ['CALLED ON NULL INPUT::CALLED ON NULL INPUT', 'RETURNS NULL ON NULL INPUT::RETURNS NULL ON NULL INPUT', 'STRICT::STRICT']);
	group1.addField('Security',			'List', 'security', '', '', '', true, 0, ['SECURITY INVOKER::SECURITY INVOKER', 'SECURITY DEFINER::SECURITY DEFINER']);
	group1.addField('Function Body',	'TextArea', 'body', 'style="width: 90%; height: 200px;"', '', '', true, 0);
	group1.addBreak(1);
		
	funAdd.addControl('save', 'Save', null);
	funAdd.addControl('back', 'Cancel', null);
	funAdd.onOutput  = new Function("top.elements.funAdd.srvParams['db'] = top.currentDB;");
	funAdd.onDataReceived  = new Function("document.getElementById('funAdd_field0').value = top.currentSchema;");
	funAdd.srvFile = "includes/database_srv.php";
	funAdd.onComplete = funs;
	
	var pgexport = new top.jsEdit('pgexport', null);
	pgexport.header = "Export";
	pgexport.showFooter = false;
	pgexport.tmpl = "<table cellpadding=\"3\" cellspacing=\"0\" style=\"width: 100%\" class=\"rText\">"+
					"	<tr>"+
					"		<td valign=\"top\" style=\"width: 100%\">~group1~</td>"+
					"	</tr>"+
					"	<tr><td colspan=2 align=center style=\"padding: 5px; background-color: #e0e7f4; border-top: 1px solid #d5e1f1; border-bottom: 1px solid #d5e1f1;\"> ~controls~ </td></tr>"+
					"</table>";

	group1 = pgexport.addGroup('group1', 'General'); 
	group1.inLabel = 'width="100px"';
	group1.addField('Database',		'Text', 'database', 'size=40 readonly', '', top.currentDB, true, 0);
	group1.addField('Only Schema',	'List', 'schema', 'onchange="top.elements.pgexport.srvParams[\'schema\'] = this.value; top.elements.pgexport.refreshList(\'table\');"', '', top.currentSchema, false, 0);
	group1.addField('Only Table',	'List', 'table', '', '', '', false, 0);
	group1.addBreak(10);
	group1.addField('Export Type',		'List', 'type', '', '', 'a', false, 0, ['a::Structure & Data', 's::Structure Only', 'd::Data Only']);
	group1.addField('Export Data As',	'List', 'insert_type', '', 'commands', 'i', false, 0, ['i::INSERT', 'c::COPY']);
	group1.addBreak(10);
	group1.addField('Zip Output',	'Radio_YesNo', 'compress', '', '', 'f', false, 0);
	group1.addBreak(1);
		
	pgexport.addControl('save', 'Export', null);
	pgexport.onOutput  = new Function("top.elements.pgexport.srvParams['db'] = top.currentDB;");
	pgexport.onDataReceived  = new Function("document.getElementById('pgexport_field0').value = top.currentDB; "+
											"document.getElementById('pgexport_field1').value = top.currentSchema;"+
											"top.elements.pgexport.srvParams['schema'] = top.currentSchema == null ? '' : top.currentSchema; "+
											"top.elements.pgexport.refreshList('table'); "+
											"");
	pgexport.srvFile = "includes/database_srv.php";
} 

function dbChange(val) {
	tmp = val.split(':');
	document.getElementById('dbConnect_field1').value = tmp[0];
	document.getElementById('dbConnect_field2').value = tmp[1];
	document.getElementById('dbConnect_field3').value = tmp[2];
	document.getElementById('dbConnect_field4').value = tmp[3];
}
</script>