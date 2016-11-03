<?
$output = false;
require_once("../system/security.php");
require_once($sys_folder."/libs/phpDB.php");
require_once($sys_folder."/libs/phpDBLib.php");

$lstParams = js_unescape($cmd);

if ($lstParams['db'] == '') $lstParams['db'] = 'template1';

$tmp = split(":", $_SESSION['ses_database']);
$sys_dbType 	= 'postgres';
$sys_dbIP		= $tmp[0];
$sys_dbPort		= $tmp[1]; 
$sys_dbLogin	= $tmp[2];
$sys_dbPass		= $tmp[3];
$sys_dbName		= $lstParams['db'];

$db = new phpDBConnection($sys_dbType);
$db->connect($sys_dbIP, $sys_dbLogin, $sys_dbPass, $sys_dbName, $sys_dbPort);

require("features.php");

switch ($lstParams['req_name']."::".$lstParams['req_cmd']) 
{
	case "databases::refresh":

		// -- get postgres version
		$sql = "SHOW server_version";
		$rs  = $db->execute($sql);
		$db_version = $rs->fields[0];
		
		// -- databases
		if ($features[super_user] == 1) {
			$sql = "SELECT datname, usename, pg_encoding_to_char(encoding), datistemplate, datallowconn, 
						".($features[conn_limit] == 0 ? "null" : "datconnlimit").",  datconfig, datacl
					FROM pg_database, pg_user
					WHERE pg_database.datdba = pg_user.usesysid
					ORDER BY datname";
		} else {
			$sql = "SELECT datname, usename, pg_encoding_to_char(encoding), datistemplate, datallowconn, 
						".($features[conn_limit] == 0 ? "null" : "datconnlimit").",  datconfig, datacl
					FROM pg_database, pg_user
					WHERE pg_database.datdba = pg_user.usesysid
						AND usename = '$sys_dbLogin'
					ORDER BY datname";
		}
		$rs  = $db->execute($sql);
		$dbs = '';
		$templates = '';
		while ($rs && !$rs->EOF) {
			if ($rs->fields['datistemplate'] == 't') {
				if ($rs->fields['datallowconn'] == 't') {
					$templates .= "var node = dbTree.addNode(templates, 'db_".$rs->fields[0]."', '".$rs->fields[0]."');
								   node.picture = 'system/includes/silk/icons/database.png'; 
								   dbTree.addNode(node, 'tmp_".$rs->fields[0]."', '...');";
				}
			} else {
				$dbs .= "var node = dbTree.addNode(dbs, 'db_".$rs->fields[0]."', '".$rs->fields[0]."');
						 node.picture = 'system/includes/silk/icons/database.png'; 
						 dbTree.addNode(node, 'tmp_".$rs->fields[0]."', '...');";
			}
			$rs->moveNext();
		}

		print(" top.superuser =  ".($features[super_user] == 1 ? 'true' : 'false').";
		
				top.elements.databases.header = \"DB Server: <span style='font-weight: normal'>$sys_dbIP</span> &nbsp;&nbsp;\"+
					\"User: <span style='font-weight: normal'>$sys_dbLogin</span>  &nbsp;&nbsp;\"+
					\"PostgresSQL: <span style='font-weight: normal'>v. $db_version</span>\";
				document.title = \"Web 2.0 PgAdmin | DB: $sys_dbIP | User: $sys_dbLogin\";
				
				top.elements.dbTree = null;
				dbTree = new jsTree_class('dbTree', null);
				dbTree.onOpen  = db_open;
				dbTree.onClose = db_close;
				dbTree.onClick = db_click;
				
				dbTree.style = 'border: 1px solid silver; background-color: white; overflow: auto;';
				var dbs = dbTree.addNode(dbTree, 'databases', 'Databases');
				dbs.picture  = 'system/includes/silk/icons/database.png';
				dbs.expanded = true;
				$dbs				
				var system = dbTree.addNode(dbTree, 'system', 'Server');
				system.picture  = 'system/includes/silk/icons/database_gear.png';
				var runtime = dbTree.addNode(system, 'runtime', 'Run-Time');
				runtime.picture  = 'system/includes/silk/icons/database_lightning.png';
				var activity = dbTree.addNode(runtime, 'activity', 'Activity');
				activity.picture  = 'system/includes/silk/icons/database_lightning.png';
				var vars = dbTree.addNode(runtime, 'vars', 'Variables');
				vars.picture  = 'system/includes/silk/icons/database_table.png';
				var templates = dbTree.addNode(system, 'templates', 'Templates');
				templates.picture  = 'system/includes/silk/icons/database_key.png';
				$templates
				var spaces = dbTree.addNode(system, 'spaces', 'Table Spaces');
				spaces.picture  = 'system/includes/silk/icons/database_save.png';
				var users = dbTree.addNode(system, 'users', 'DB Users');
				users.picture = 'system/includes/silk/icons/user.png';
				var users = dbTree.addNode(system, 'groups', 'User Groups');
				users.picture = 'system/includes/silk/icons/group.png';
				
				top.elements.mLayout.initPanel('left', top.elements.dbTree);
				top.elements.mLayout.initPanel('main', top.elements.databases);
			");
		break;		
		
	case "databases::lst_get_data":
	
		if ($features[super_user] == 1) {
			$sql = "SELECT datname, datname, usename, pg_encoding_to_char(encoding), 
						CASE WHEN datistemplate THEN 'yes' ELSE '' END, 
						CASE WHEN datallowconn THEN 'yes' ELSE '' END, 
						".($features[conn_limit] == 0 ? "null" : "datconnlimit").",  datconfig, datacl
					FROM pg_database, pg_user
					WHERE pg_database.datdba = pg_user.usesysid
					ORDER BY datname";
		} else {
			$sql = "SELECT datname, datname, usename, pg_encoding_to_char(encoding), 
						CASE WHEN datistemplate THEN 'yes' ELSE '' END, 
						CASE WHEN datallowconn THEN 'yes' ELSE '' END, 
						".($features[conn_limit] == 0 ? "null" : "datconnlimit").",  datconfig, datacl
					FROM pg_database, pg_user
					WHERE pg_database.datdba = pg_user.usesysid
						AND (usename = '$sys_dbLogin' OR datistemplate = true)
					ORDER BY datname";
		}
		list_process($db, $lstParams, $sql);
		break;
		
	case "databaseAdd::edit_get_data":
		$sql = "SELECT null";
		edit_process($db, $lstParams, $sql);
		break;
		
	case "databaseAdd::edit_field_list":
		$sql = "SELECT null";
		if ($lstParams['req_field'] == 'owner') {
			$sql = "SELECT null, '-- default --' UNION ALL (SELECT usename, usename FROM pg_user ORDER BY usename)";
		}
		if ($lstParams['req_field'] == 'template') {
			// -- databases
			if ($features[super_user] == 1) {
				$sql = "SELECT null, '-- default --' UNION ALL (SELECT datname, datname FROM pg_database WHERE datistemplate ORDER BY datname) UNION ALL ".
					   "SELECT null, '-- other databases --' UNION ALL (SELECT datname, datname FROM pg_database WHERE NOT datistemplate ORDER BY datname)";
			} else {
				$sql = "SELECT null, '-- default --' UNION ALL (SELECT datname, datname FROM pg_database WHERE datistemplate ORDER BY datname) UNION ALL ".
					   "SELECT null, '-- other databases --' UNION ALL (SELECT datname, datname FROM pg_database, pg_user
						WHERE pg_database.datdba = pg_user.usesysid
							AND usename = '$sys_dbLogin' AND NOT datistemplate 
						ORDER BY datname)";
			}
		}
		buildOptions($db, $lstParams, $sql, true, false);
		break;
		
	case "databaseAdd::edit_save_data":
		$p = $_POST;
		$sql = "CREATE DATABASE ".$p['dbname'].($p['encoding'] != '' ? " ENCODING '".strtolower($p['encoding'])."'" : "").($p['owner'] != '' ? " OWNER ".$p['owner'] : "").
			   ($p['template'] != '' ? " TEMPLATE ".$p['template'] : "").";\n";
		if ($sql != '') {
			print(" <textarea id=sql>$sql</textarea>
					<script> 
						top.execCommand(document.getElementById('sql').value, 'top.elements.databaseAdd.saveDone(); top.elements.databases.serverCall(\"refresh\");');
					</script>");
		} else {
			print(" <script> top.elements.databaseAdd.saveDone();	</script>");
		}
		break;
		
	case "templates::lst_get_data":
		$sql = "SELECT datname, datname, usename, pg_encoding_to_char(encoding), 
					CASE WHEN datistemplate THEN 'yes' ELSE '' END, 
					CASE WHEN datallowconn THEN 'yes' ELSE '' END, 
					".($features[conn_limit] == 0 ? "null" : "datconnlimit").",  datconfig, datacl
				FROM pg_database, pg_user
				WHERE pg_database.datdba = pg_user.usesysid AND datistemplate = true
				ORDER BY datname";
		list_process($db, $lstParams, $sql);
		break;
		
	case "dbConnect::edit_get_data":
		$sql = "SELECT null";
		edit_process($db, $lstParams, $sql);
		break;
		
	case "dbConnect::edit_field_list":
		$sql = "SELECT null, '-- select host --'";
		foreach ($sys_dbs as $k => $v) {
			if ($sql != '') $sql .= " UNION ALL ";
			$sql .= "SELECT '$v', '$k'";
		}
		buildOptions($db, $lstParams, $sql, true, false);
		break;
		
	case "dbConnect::edit_save_data":
		$p = $_POST;
		$db = new phpDBConnection('postgres');
		$db->connect($p['host'], $p['user'], $p['pass'], 'template1', $p['port']);
		if ($db->dbConn == null) {
			print("<script>
						frm = parent.document.getElementById('".$lstParams["req_frame"]."');
						frm.style.border  = '';
						frm.style.width   = '99%';
						frm.style.height  = '200px';
				   </script>");
			die();
		}
		$_SESSION['ses_database']= $p['host'].":".$p['port'].":".$p['user'].":".$p['pass'];
		print("<script>
			top.elements.databases.serverCall('refresh');
		</script>");
		break;
		
	case "databases::get_schemas":
		// -- schemas
		$sql = "SELECT nspname, nspname,
					COALESCE(tblcnt,0) as tblcnt,
					COALESCE(vwcnt,0) as vwcnt,
					COALESCE(prcnt,0) as prcnt,
					COALESCE(seqcnt,0) as seqcnt,
					to_char(COALESCE(tsize,0) + COALESCE(isize,0), '999,999,999,999') || ' Kb' as sz
				FROM pg_namespace
					LEFT OUTER JOIN (SELECT count(1) as tblcnt, relnamespace FROM pg_class
									WHERE relkind = 'r' GROUP BY relnamespace) as tbl ON tbl.relnamespace = pg_namespace.oid
					LEFT OUTER JOIN (SELECT count(1) as vwcnt, relnamespace FROM pg_class
									WHERE relkind = 'v' GROUP BY relnamespace) as vw ON vw.relnamespace = pg_namespace.oid
					LEFT OUTER JOIN (SELECT count(1) as prcnt, pronamespace FROM pg_proc GROUP BY pronamespace) as prcnt ON prcnt.pronamespace = pg_namespace.oid
					LEFT OUTER JOIN (SELECT count(1) as seqcnt, relnamespace FROM pg_class
									WHERE relkind = 'S' GROUP BY relnamespace) as seq ON seq.relnamespace = pg_namespace.oid
					LEFT OUTER JOIN (SELECT SUM(COALESCE(relpages,0)*8) as tsize, relnamespace
									FROM pg_class
									WHERE relkind = 'r' GROUP BY relnamespace) as tsize ON tsize.relnamespace = pg_namespace.oid
					LEFT OUTER JOIN (SELECT SUM(COALESCE(relpages,0)*8) as isize,relnamespace
									FROM pg_index, pg_class
									WHERE pg_class.oid = pg_index.indexrelid GROUP BY relnamespace) as isize ON isize.relnamespace = pg_namespace.oid
				WHERE nspname NOT LIKE 'pg_%' AND nspname != 'information_schema'
				ORDER BY nspname";
		$rs  = $db->execute($sql);
		print("var dbnode = dbTree.getNode('".$lstParams['nodeid']."');
			   dbnode.nodes = []; ");
		while ($rs && !$rs->EOF) {
			print("
				 var schema = dbTree.addNode(dbnode, 'sch_".$lstParams['db'].".".$rs->fields[0]."', '".$rs->fields[0]."');
				 schema.picture = 'system/includes/silk/icons/database_table.png';
				 var nd = dbTree.addNode(schema, 'tbls_".$lstParams['db'].".".$rs->fields[0]."', 'Tables (".$rs->fields[2].")');
				 nd.picture = 'system/includes/silk/icons/table.png';
				 dbTree.addNode(nd, '".$lstParams['nodeid']."_ttmp_".$rs->fields[0]."', '...');
				 var nd = dbTree.addNode(schema, 'views_".$lstParams['db'].".".$rs->fields[0]."', 'Views (".$rs->fields[3].")');
				 nd.picture = 'system/includes/silk/icons/table_sort.png';
				 dbTree.addNode(nd, '".$lstParams['nodeid']."_vtmp_".$rs->fields[0]."', '...');
				 var nd = dbTree.addNode(schema, 'seqs_".$lstParams['db'].".".$rs->fields[0]."', 'Sequences (".$rs->fields[5].")');
				 nd.picture = 'system/includes/silk/icons/table_key.png';
				 dbTree.addNode(nd, '".$lstParams['nodeid']."_stmp_".$rs->fields[0]."', '...');
				 var nd = dbTree.addNode(schema, 'funs_".$lstParams['db'].".".$rs->fields[0]."', 'Functions (".$rs->fields[4].")');
				 nd.picture = 'system/includes/silk/icons/chart_curve.png';
				 dbTree.addNode(nd, '".$lstParams['nodeid']."_ftmp_".$rs->fields[0]."', '...');
			");
			$rs->moveNext();
		}
		print("var nd = dbTree.addNode(dbnode, 'sys_".$lstParams['db']."', 'System');
			   nd.picture = 'system/includes/silk/icons/cog.png';
			   dbTree.addNode(nd, 'systmp_".$lstParams['db'].".".$rs->fields[0]."', '...');
			   dbTree.refresh(dbnode);");
		break;
		
	case "databases::get_schemas2":
		// -- schemas
		$sql = "SELECT nspname, nspname,
					COALESCE(tblcnt,0) as tblcnt,
					COALESCE(vwcnt,0) as vwcnt,
					COALESCE(prcnt,0) as prcnt,
					COALESCE(seqcnt,0) as seqcnt,
					to_char(COALESCE(tsize,0) + COALESCE(isize,0), '999,999,999,999') || ' Kb' as sz
				FROM pg_namespace
					LEFT OUTER JOIN (SELECT count(1) as tblcnt, relnamespace FROM pg_class
									WHERE relkind = 'r' GROUP BY relnamespace) as tbl ON tbl.relnamespace = pg_namespace.oid
					LEFT OUTER JOIN (SELECT count(1) as vwcnt, relnamespace FROM pg_class
									WHERE relkind = 'v' GROUP BY relnamespace) as vw ON vw.relnamespace = pg_namespace.oid
					LEFT OUTER JOIN (SELECT count(1) as prcnt, pronamespace FROM pg_proc GROUP BY pronamespace) as prcnt ON prcnt.pronamespace = pg_namespace.oid
					LEFT OUTER JOIN (SELECT count(1) as seqcnt, relnamespace FROM pg_class
									WHERE relkind = 'S' GROUP BY relnamespace) as seq ON seq.relnamespace = pg_namespace.oid
					LEFT OUTER JOIN (SELECT SUM(COALESCE(relpages,0)*8) as tsize, relnamespace
									FROM pg_class
									WHERE relkind = 'r' GROUP BY relnamespace) as tsize ON tsize.relnamespace = pg_namespace.oid
					LEFT OUTER JOIN (SELECT SUM(COALESCE(relpages,0)*8) as isize,relnamespace
									FROM pg_index, pg_class
									WHERE pg_class.oid = pg_index.indexrelid GROUP BY relnamespace) as isize ON isize.relnamespace = pg_namespace.oid
				WHERE nspname IN ('pg_catalog', 'pg_temp_1', 'pg_toast', 'information_schema')
				ORDER BY nspname";
		$rs  = $db->execute($sql);
		print("var dbnode = dbTree.getNode('".$lstParams['nodeid']."');
			   dbnode.nodes = []; ");
		while ($rs && !$rs->EOF) {
			print("
				 var schema = dbTree.addNode(dbnode, 'sch_".$lstParams['db'].".".$rs->fields[0]."', '".$rs->fields[0]."');
				 schema.picture = 'system/includes/silk/icons/database_table.png';
				 var nd = dbTree.addNode(schema, 'tbls_".$lstParams['db'].".".$rs->fields[0]."', 'Tables (".$rs->fields[2].")');
				 nd.picture = 'system/includes/silk/icons/table.png';
				 dbTree.addNode(nd, '".$lstParams['nodeid']."_ttmp_".$rs->fields[0]."', '...');
				 var nd = dbTree.addNode(schema, 'views_".$lstParams['db'].".".$rs->fields[0]."', 'Views (".$rs->fields[3].")');
				 nd.picture = 'system/includes/silk/icons/table_sort.png';
				 dbTree.addNode(nd, '".$lstParams['nodeid']."_vtmp_".$rs->fields[0]."', '...');
				 var nd = dbTree.addNode(schema, 'seqs_".$lstParams['db'].".".$rs->fields[0]."', 'Sequences (".$rs->fields[5].")');
				 nd.picture = 'system/includes/silk/icons/table_key.png';
				 dbTree.addNode(nd, '".$lstParams['nodeid']."_stmp_".$rs->fields[0]."', '...');
				 var nd = dbTree.addNode(schema, 'funs_".$lstParams['db'].".".$rs->fields[0]."', 'Functions (".$rs->fields[4].")');
				 nd.picture = 'system/includes/silk/icons/chart_curve.png';
				 dbTree.addNode(nd, '".$lstParams['nodeid']."_ftmp_".$rs->fields[0]."', '...');
			");
			$rs->moveNext();
		}
		print("dbTree.refresh(dbnode);");
		break;
		
	case "schemaAdd::edit_get_data":
		$sql = "SELECT null";
		edit_process($db, $lstParams, $sql);
		break;
		
	case "schemaAdd::edit_save_data":
		$p = $_POST;
		$sql = "CREATE SCHEMA ".$p['name'].";\n";
		if ($sql != '') {
			print(" <textarea id=sql>$sql</textarea>
					<script> 
						top.execCommand(document.getElementById('sql').value, 'top.elements.schemaAdd.saveDone(); top.db_open({id: \'db_".$lstParams[db]."\'});');
					</script>");
		} else {
			print(" <script> top.elements.schemaAdd.saveDone(); </script>");
		}
		break;
		
	case "databases::get_tables":
		// -- table
		$sql = "SELECT pg_class.oid, relname
				FROM pg_class
				WHERE relkind = 'r' AND relnamespace IN (SELECT oid FROM pg_namespace WHERE nspname = '".$lstParams['schema']."')
				ORDER BY relname";
		$rs  = $db->execute($sql);
		print("var node = dbTree.getNode('".$lstParams['nodeid']."');
			   node.nodes = []; ");
		while ($rs && !$rs->EOF) {
			print("
				 var schema = dbTree.addNode(node, 'tbl_".$lstParams['db'].".".$lstParams['schema'].".".$rs->fields[1]."', '".$rs->fields[1]."');
				 schema.picture = 'system/includes/silk/icons/table.png';
			");
			$rs->moveNext();
		}
		print("node.text = 'Tables ('+ node.nodes.length + ')';");
		print("dbTree.refresh(node);");
		break;
		
	case "databases::get_views":
		// -- views
		$sql = "SELECT pg_class.oid, relname
				FROM pg_class
				WHERE relkind = 'v' AND relnamespace IN (SELECT oid FROM pg_namespace WHERE nspname = '".$lstParams['schema']."')
				ORDER BY relname";
		$rs  = $db->execute($sql);
		print("var node = dbTree.getNode('".$lstParams['nodeid']."');
			   node.nodes = []; ");
		while ($rs && !$rs->EOF) {
			print("
				 var nd = dbTree.addNode(node, 'view_".$lstParams['db'].".".$lstParams['schema'].".".$rs->fields[1]."', '".$rs->fields[1]."');
				 nd.picture = 'system/includes/silk/icons/table_sort.png';
			");
			$rs->moveNext();
		}
		print("node.text = 'Views ('+ node.nodes.length + ')';");
		print("dbTree.refresh(node);");
		break;

	case "databases::get_seqs":
		// -- sequences
		$sql = "SELECT pg_class.oid, relname
				FROM pg_class
				WHERE relkind = 'S' AND relnamespace IN (SELECT oid FROM pg_namespace WHERE nspname = '".$lstParams['schema']."')
				ORDER BY relname";
		$rs  = $db->execute($sql);
		print("var node = dbTree.getNode('".$lstParams['nodeid']."');
			   node.nodes = []; ");
		while ($rs && !$rs->EOF) {
			print("
				 var nd = dbTree.addNode(node, 'seq_".$lstParams['db'].".".$lstParams['schema'].".".$rs->fields[1]."', '".$rs->fields[1]."');
				 nd.picture = 'system/includes/silk/icons/table_key.png';
			");
			$rs->moveNext();
		}
		print("node.text = 'Sequences ('+ node.nodes.length + ')';");
		print("dbTree.refresh(node);");
		break;
		
	case "databases::get_funs":
		// -- functions
		$sql = "SELECT pg_proc.oid, proname || '(' || oidvectortypes(proargtypes) || ')',
	                    (SELECT typname FROM pg_type WHERE prorettype=pg_type.oid),
	                    (SELECT lanname FROM pg_language WHERE prolang = pg_language.oid)
	            FROM pg_proc
	            WHERE pronamespace IN (SELECT oid FROM pg_namespace WHERE nspname = '".$lstParams['schema']."')
	            ORDER BY proname		
					";
		$rs  = $db->execute($sql);
		print("var node = dbTree.getNode('".$lstParams['nodeid']."');
			   node.nodes = []; ");
		while ($rs && !$rs->EOF) {
			print("
				 var nd = dbTree.addNode(node, 'fun_".$lstParams['db'].".".$lstParams['schema'].".".$rs->fields[1]."::".$rs->fields[0]."', '".$rs->fields[1]."');
				 nd.picture = 'system/includes/silk/icons/chart_curve.png';
			");
			$rs->moveNext();
		}
		print("node.text = 'Functions ('+ node.nodes.length + ')';");
		print("dbTree.refresh(node);");
		break;
		
	case "schemas::lst_get_data":
		// -- schemas
		$sql = "SELECT nspname, nspname,
					COALESCE(tblcnt,0) as tblcnt,
					COALESCE(vwcnt,0) as vwcnt,
					COALESCE(prcnt,0) as prcnt,
					COALESCE(seqcnt,0) as seqcnt,
					to_char(COALESCE(tsize,0) + COALESCE(isize,0), '999,999,999,999') || ' Kb' as sz
				FROM pg_namespace
					LEFT OUTER JOIN (SELECT count(1) as tblcnt, relnamespace FROM pg_class
									WHERE relkind = 'r' GROUP BY relnamespace) as tbl ON tbl.relnamespace = pg_namespace.oid
					LEFT OUTER JOIN (SELECT count(1) as vwcnt, relnamespace FROM pg_class
									WHERE relkind = 'v' GROUP BY relnamespace) as vw ON vw.relnamespace = pg_namespace.oid
					LEFT OUTER JOIN (SELECT count(1) as prcnt, pronamespace FROM pg_proc GROUP BY pronamespace) as prcnt ON prcnt.pronamespace = pg_namespace.oid
					LEFT OUTER JOIN (SELECT count(1) as seqcnt, relnamespace FROM pg_class
									WHERE relkind = 'S' GROUP BY relnamespace) as seq ON seq.relnamespace = pg_namespace.oid
					LEFT OUTER JOIN (SELECT SUM(COALESCE(relpages,0)*8) as tsize, relnamespace
									FROM pg_class
									WHERE relkind = 'r' GROUP BY relnamespace) as tsize ON tsize.relnamespace = pg_namespace.oid
					LEFT OUTER JOIN (SELECT SUM(COALESCE(relpages,0)*8) as isize,relnamespace
									FROM pg_index, pg_class
									WHERE pg_class.oid = pg_index.indexrelid GROUP BY relnamespace) as isize ON isize.relnamespace = pg_namespace.oid
				WHERE nspname NOT LIKE 'pg_%' AND nspname != 'information_schema'
				ORDER BY nspname";
		list_process($db, $lstParams, $sql);
		break;
		
	case "schemas::lst_del_records":
		$sql = "";
		$ids = split(',', $lstParams['req_ids']);
		foreach($ids as $k => $v) {
			$sql .= "DROP SCHEMA $v CASCADE;\\n";
		}
		print("top.execCommand(\"".$sql."\", 'top.elements.schemas.output(); top.db_open({id: \'db_".$lstParams[db]."\'});');");
		break;
		
	case "tables::lst_get_data":
		// -- tables
		$sql = "SELECT '".$lstParams['schema'].".' || relname, 
						relname || COALESCE((SELECT '<span style=''color: gray''> /* ' || description || ' */</span>' FROM pg_description WHERE oid = objoid AND objsubid = 0), '') as descr,
						CASE WHEN relnatts > 0 		THEN relnatts ELSE 0 END, /* number of columns */
						CASE WHEN relhaspkey  		THEN '*' ELSE '' END, /* has primary key (or once had) */
						CASE WHEN relchecks > 0		THEN '*' ELSE '' END, /* has checks */
						CASE WHEN relhasindex 		THEN '*' ELSE '' END, /* has indexes */
						CASE WHEN relhasrules 		THEN '*' ELSE '' END, /* has rules */
						CASE WHEN ".($features[has_triggers] ? "relhastriggers" : "reltriggers > 0")." THEN '*' ELSE '' END, /* has triggers */
						CASE WHEN relhassubclass 	THEN '*' ELSE '' END, /* has children */
						to_char(reltuples,  '999,999,999,999'),
						to_char((SELECT (coalesce(t.s,0) + coalesce(i.s,0)) FROM
							(SELECT SUM(COALESCE(relpages,0)*8) as s
	                         FROM pg_class as t
	                         WHERE relkind = 'r'  AND t.oid = pg_class.oid) as t,
	                    (SELECT SUM(COALESCE(i.relpages,0)*8) as s
	                     FROM pg_index, pg_class as i, pg_class as t
	                     WHERE i.oid = pg_index.indexrelid AND t.oid = indrelid AND t.oid = pg_class.oid)as i), '999,999,999,999') || ' Kb',
						 CASE WHEN relacl IS NOT NULL AND relacl != '{}' THEN '*' ELSE '' END,
						(SELECT usename FROM pg_user WHERE relowner = usesysid)
				FROM pg_class
				WHERE relkind = 'r' AND relnamespace IN (SELECT oid FROM pg_namespace WHERE nspname = '".$lstParams['schema']."')
				ORDER BY relname";
		list_process($db, $lstParams, $sql);
		break;
		
	case "tables::lst_del_records":
		$sql = "";
		$ids = split(',', $lstParams['req_ids']);
		foreach($ids as $k => $v) {
			$sql .= "DROP TABLE $v CASCADE;\\n";
		}
		print("top.execCommand(\"".$sql."\", 'top.elements.tables.output(); top.db_open({id: \'tbls_".$lstParams[db].".".$lstParams[schema]."\'});');");
		break;
		
	case "tableAdd::edit_get_data":
		$sql = "SELECT null";
		edit_process($db, $lstParams, $sql);
		break;
		
	case "tableAdd::edit_field_list":
		// -- schemas
		if ($lstParams['req_field'] == 'schema') {
		$sql = "SELECT nspname, nspname
				FROM pg_namespace
				WHERE nspname NOT LIKE 'pg_%' AND nspname != 'information_schema'
				ORDER BY nspname";
		}
		if ($lstParams['req_field'] == 'like') {
			$sql = "SELECT null, '-- none --' UNION ALL  
				   (SELECT nspname || '.' || relname, nspname || '.' || relname
					FROM pg_class, pg_namespace
					WHERE relkind = 'r' AND relnamespace = pg_namespace.oid
						AND nspname NOT LIKE 'pg_%' AND nspname != 'information_schema'
					ORDER BY 1)";
		}
		buildOptions($db, $lstParams, $sql, true, false);
		break;
		
	case "tableAdd::edit_save_data":
		$p = $_POST;
		$sql = "CREATE TABLE ".$p['schema'].".".$p['name']."(".($p['like'] != '' ? ' LIKE '.$p['like'].' ' : '').")".
				($p['oids'] == 't' ? ' WITH OIDS' : '').($p['tablespace'] != '' ? ' TABLESPACE '.$p['tablespace'] : '').";\n";
		if ($sql != '') {
			print(" <textarea id=sql>$sql</textarea>
					<script> 
						top.execCommand(document.getElementById('sql').value, 
							'top.elements.tableAdd.saveDone(); top.db_open({id: \'tbls_".$lstParams[db].".".$p[schema]."\'});');
					</script>");
		} else {
			print(" <script> top.elements.tableAdd.saveDone(); </script>");
		}
		break;
		
	case "views::lst_get_data":
		// -- views
		$sql = "SELECT '".$lstParams['schema'].".' || relname, 
						relname,
						CASE WHEN relnatts > 0 		THEN relnatts ELSE 0 END, /* number of columns */
						(SELECT '<span style=''color: gray''> /* ' || description || ' */</span>' FROM pg_description WHERE oid = objoid AND objsubid = 0),
						CASE WHEN relacl IS NOT NULL AND relacl != '{}' THEN '*' ELSE '' END,
						(SELECT usename FROM pg_user WHERE relowner = usesysid)
				FROM pg_class
				WHERE relkind = 'v' AND relnamespace IN (SELECT oid FROM pg_namespace WHERE nspname = '".$lstParams['schema']."')
				ORDER BY relname";
		list_process($db, $lstParams, $sql);
		break;
		
	case "views::lst_del_records":
		$sql = "";
		$ids = split(',', $lstParams['req_ids']);
		foreach($ids as $k => $v) {
			$sql .= "DROP VIEW $v;\\n";
		}
		print("top.execCommand(\"".$sql."\", 'top.elements.views.output(); top.db_open({id: \'views_".$lstParams[db].".".$lstParams[schema]."\'});');");
		break;
		
	case "viewAdd::edit_get_data":
		$sql = "SELECT null";
		edit_process($db, $lstParams, $sql);
		break;
		
	case "viewAdd::edit_field_list":
		// -- schemas
		if ($lstParams['req_field'] == 'schema') {
		$sql = "SELECT nspname, nspname
				FROM pg_namespace
				WHERE nspname NOT LIKE 'pg_%' AND nspname != 'information_schema'
				ORDER BY nspname";
		}
		buildOptions($db, $lstParams, $sql, true, false);
		break;
		
	case "viewAdd::edit_save_data":
		$p = $_POST;
		$sql = "CREATE OR REPLACE VIEW ".$p['schema'].".".$p['name']." AS \n".$p['sql'];
		if ($sql != '') {
			print(" <textarea id=sql>$sql</textarea>
					<script> 
						top.execCommand(document.getElementById('sql').value, 
							'top.elements.viewAdd.saveDone(); top.db_open({id: \'views_".$lstParams[db].".".$p[schema]."\'});');
					</script>");
		} else {
			print(" <script> top.elements.viewAdd.saveDone(); </script>");
		}
		break;
		
	case "seqs::lst_get_data":
		// get all sequences for the schema and gets their maxs
		$seq = Array();
		$sql = "SELECT nspname, relname, a.attname, (SELECT adsrc FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum) AS default
				FROM pg_attribute a, pg_namespace as n, pg_class as c
				WHERE n.oid IN (SELECT oid FROM pg_namespace WHERE nspname = '".$lstParams['schema']."')
				        AND n.oid = c.relnamespace
				        AND NOT attisdropped
				        AND attrelid = c.oid
				        AND attnum > 0
					AND atthasdef = true";
		$rs  = $db->execute($sql);
		while ($rs && !$rs->EOF) {
			$f = $rs->fields;
			$seq[$f[0].".".$f[1].".".$f[2]] = $f[3];
			$rs->moveNext();
		}
		// -- sequences
		$sql = "SELECT relname,
	                 '<span style=''color: gray''>/* ' || 
					 (SELECT description FROM pg_description WHERE oid = objoid AND objsubid = 0) 
					 || ' */</span>'
				FROM pg_class
				WHERE relkind = 'S' AND relnamespace IN (SELECT oid FROM pg_namespace WHERE nspname = '".$lstParams['schema']."')
				ORDER BY relname";
		$rs  = $db->execute($sql);
		$sql = "";
		while ($rs && !$rs->EOF) {
			if ($sql != '') $sql .= " UNION ALL ";
			$sname  = $rs->fields[0];
			$sfname = $lstParams['schema'].".".$rs->fields[0];
			$sseq = '';
			$smax = '';
			foreach ($seq as $k => $v) {
				if (strpos($v, $sname) !== false) { 
					$t = split("\.", $k);
					$s = "SELECT max(".$t[2].") FROM ".$t[0].".".$t[1]." ";
					$r = $db->execute($s);
					$smax = $r->fields[0];
					$sseq = $k; 
					break; 
				}
			}
			$smax = intval($smax);
			$sql .= "SELECT '$sfname', '$sname ".$rs->fields[1]."', 
						CASE WHEN last_value < $smax THEN '<span style=''color: red''>' ELSE '<span>' END || to_char(last_value, '9,999,999,999') || '</span>',  
						increment_by, '$sseq', to_char($smax, '9,999,999,999')
					 FROM $sfname ";
			$rs->moveNext();
		}
		if ($sql != '') $sql .= " ORDER BY 1";
		list_process($db, $lstParams, $sql);
		break;
		
	case "seqs::lst_del_records":
		$sql = "";
		$ids = split(',', $lstParams['req_ids']);
		foreach($ids as $k => $v) {
			$sql .= "DROP SEQUENCE $v;\\n";
		}
		print("top.execCommand(\"".$sql."\", 'top.elements.seqs.output(); top.db_open({id: \'seqs_".$lstParams[db].".".$lstParams[schema]."\'});');");
		break;
		
	case "seqAdd::edit_get_data":
		$sql = "SELECT null";
		edit_process($db, $lstParams, $sql);
		break;
		
	case "seqAdd::edit_field_list":
		// -- schemas
		if ($lstParams['req_field'] == 'schema') {
		$sql = "SELECT nspname, nspname
				FROM pg_namespace
				WHERE nspname NOT LIKE 'pg_%' AND nspname != 'information_schema'
				ORDER BY nspname";
		}
		buildOptions($db, $lstParams, $sql, true, false);
		break;
		
	case "seqAdd::edit_save_data":
		$p = $_POST;
		$sql = "CREATE SEQUENCE ".$p['schema'].".".$p['name'].
				($p['start'] != '' ? " START WITH ".$p['start'] : "").
				($p['inc'] != '' ? " INCREMENT BY ".$p['inc'] : "").
				($p['min'] != '' ? " MINVALUE ".$p['min'] : " NO MINVALUE").
				($p['max'] != '' ? " MAXVALUE ".$p['max'] : " NO MAXVALUE").
				($p['cache'] != '' ? " CACHE ".$p['cache'] : "").
				($p['cycle'] != 't' ? " CYCLE" : " NO CYCLE").";";
		if ($sql != '') {
			print(" <textarea id=sql>$sql</textarea>
					<script> 
						top.execCommand(document.getElementById('sql').value, 
							'top.elements.seqAdd.saveDone(); top.db_open({id: \'seqs_".$lstParams[db].".".$p[schema]."\'});');
					</script>");
		} else {
			print(" <script> top.elements.seqAdd.saveDone(); </script>");
		}
		break;
		
	case "funs::lst_get_data":
		// -- functions
		$sql = "SELECT proname || '(' || oidvectortypes(proargtypes) || ')', 
					proname || '(' || oidvectortypes(proargtypes) || ')' || 
	                COALESCE('<span style=''color: gray''>/* ' || (SELECT description FROM pg_description WHERE oid = objoid AND objsubid = 0) || ' */</span>', ''),
					(SELECT lanname FROM pg_language WHERE prolang = pg_language.oid),
					CASE proretset WHEN true THEN 'SET OF: ' ELSE '' END || (SELECT typname FROM pg_type WHERE prorettype=pg_type.oid),
					CASE proisagg WHEN true THEN '*' ELSE '' END,
					CASE WHEN proacl IS NOT NULL AND proacl != '{}' THEN '*' ELSE '' END,
					(SELECT usename FROM pg_user WHERE proowner = usesysid)
	            FROM pg_proc
	            WHERE pronamespace IN (SELECT oid FROM pg_namespace WHERE nspname = '".$lstParams['schema']."')
	            ORDER BY proname";
		list_process($db, $lstParams, $sql);
		break;		
		
	case "funs::lst_del_records":
		$sql = "";
		$ids = split(',', $lstParams['req_ids']);
		foreach($ids as $k => $v) {
			$sql .= "DROP FUNCTION ".$lstParams['schema'].".$v;\\n";
		}
		print("top.execCommand(\"".$sql."\", 'top.elements.funs.output(); top.db_open({id: \'funs_".$lstParams[db].".".$lstParams[schema]."\'});');");
		break;
		
	case "funAdd::edit_get_data":
		$sql = "SELECT null";
		edit_process($db, $lstParams, $sql);
		break;
		
	case "funAdd::edit_field_list":
		// -- schemas
		if ($lstParams['req_field'] == 'schema') {
			$sql = "SELECT nspname, nspname
					FROM pg_namespace
					WHERE nspname NOT LIKE 'pg_%' AND nspname != 'information_schema'
					ORDER BY nspname";
		}
		if ($lstParams['req_field'] == 'lang') {
			$sql = "SELECT lanname, lanname FROM pg_language ORDER BY 1";
		}
		buildOptions($db, $lstParams, $sql, true, false);
		break;
		
	case "funAdd::edit_save_data":
		$p = $_POST;
		$sql = "CREATE OR REPLACE FUNCTION ".$p['schema'].".".$p['name']."(".($p['arg'] != '' ? $p['arg'] : "").")\n".
			   "    RETURNS ".$p['ret']."\n".
			   "    ".$p['onnull']."\n".
			   "    ".$p['type']."\n".
			   "    ".$p['security']."\n".
			   "    LANGUAGE ".$p['lang']."\n".
			   "AS\n'".str_replace("'", "''", $p['body'])."';";
		if ($sql != '') {
			print(" <textarea id=sql>$sql</textarea>
					<script> 
						top.execCommand(document.getElementById('sql').value, 
							'top.elements.funAdd.saveDone(); top.db_open({id: \'funs_".$lstParams[db].".".$p[schema]."\'});');
					</script>");
		} else {
			print(" <script> top.elements.funAdd.saveDone(); </script>");
		}
		break;
		
	case "pgexport::edit_get_data":
		$sql = "SELECT null";
		edit_process($db, $lstParams, $sql);
		break;
		
	case "pgexport::edit_field_list":
		// -- schemas
		if ($lstParams['req_field'] == 'schema') {
			$sql = "SELECT nspname, nspname
					FROM pg_namespace
					WHERE nspname NOT LIKE 'pg_%' AND nspname != 'information_schema'
					ORDER BY nspname";
		} 
		if ($lstParams['req_field'] == 'table') {
			$sql = "SELECT relname, relname
					FROM pg_class
					WHERE relkind = 'r' AND relnamespace IN (SELECT oid FROM pg_namespace WHERE nspname = '".$lstParams['schema']."')
					ORDER BY relname";
		} 
		buildOptions($db, $lstParams, $sql, true);
		break;
		
	case "pgexport::edit_save_data":
		ini_set('memory_limit', '512M');
		set_time_limit(10800); // 3 hours
		$p = $_POST;
		$param = '';
		if ($p['schema'] != '') $param .= " -n ".$p['schema'];
		if ($p['table'] != '') $param .= " -t ".$p['table'];
		if ($p['type'] == 's') $param .= " -s";
		if ($p['type'] == 'd') $param .= " -a";
		if ($p['insert_type'] == 'i') $param .= " -d";
		$cmd = "pg_dump$param -U $sys_dbLogin -if /tmp/temp.sql ".$p['database'];
		shell_exec($cmd);
		// -- zip if necessary and download
		if ($p['compress'] == 't') {
			shell_exec("tar -cjvf /tmp/temp.sql.gz /tmp/temp.sql");
			header('Content-Type: application/zip;');
			header('Content-Disposition: attachment; filename="'.$p['database'].'.sql.gz";');				
			header('Content-Length: '.filesize("/tmp/temp.sql.gz").";");
			echo file_get_contents("/tmp/temp.sql.gz");
		} else {
			header('Content-Type: application/text;');
			header('Content-Disposition: attachment; filename="'.$p['database'].'.sql";');				
			header('Content-Length: '.filesize("/tmp/temp.sql").';');
			echo file_get_contents("/tmp/temp.sql");
		}
		break;
	default:
		print("alert('List command is not recognized:  ".$lstParams['req_name']."::".$lstParams['req_cmd']."');");
		break;
}

?>