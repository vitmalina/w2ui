<?
$output = false;
require_once("../system/security.php");
require_once($sys_folder."/libs/phpDB.php");
require_once($sys_folder."/libs/phpDBLib.php");
require("dbLib.php");

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
	case "tableFields::lst_get_data":
		$tbl = split("\.", $lstParams['table']); 
		$sql = "SELECT a.attname, a.attname,
	                CASE WHEN (t.typlen = -1 AND t.typelem != 0) THEN (SELECT at.typname FROM pg_type at   WHERE at.oid = t.typelem) || '[]' ELSE (CASE WHEN t.typname = 'bpchar' THEN 'char' ELSE t.typname END) END AS typname,
	                CASE WHEN ((a.attlen = -1) AND ((a.atttypmod)::int4 = (-1)::int4)) THEN (0)::int4 ELSE CASE WHEN a.attlen = -1 THEN CASE WHEN ((t.typname = 'bpchar') OR (t.typname = 'char') OR (t.typname = 'varchar')) THEN (a.atttypmod -4)::int4 ELSE (a.atttypmod)::int4 END ELSE (a.attlen)::int4 END END AS length,
	                CASE (SELECT indisprimary FROM pg_index i, pg_class ic, pg_attribute ia  WHERE i.indrelid = a.attrelid AND i.indexrelid = ic.oid AND ic.oid = ia.attrelid AND ia.attname = a.attname  AND indisprimary IS NOT NULL  ORDER BY indisprimary DESC LIMIT 1) when true then 'x' else '' end  AS primarykey,
	                CASE a.attnotnull when true then 'x' else '' end as isnull,
	                (SELECT case contype when 'u' then 'x' else '' end FROM pg_constraint WHERE a.attrelid = conrelid AND contype = 'u' AND (a.attnum = conkey[1] OR a.attnum = conkey[2] OR a.attnum = conkey[3] OR a.attnum = conkey[4])  LIMIT 1) as isunique,
	                (SELECT substr(adsrc, 1, 30) FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum) AS default,
	                (SELECT substr(description, 1, 30) FROM pg_description WHERE a.attrelid = objoid AND attnum = objsubid) as descr
	            FROM pg_attribute a, pg_type t, pg_namespace as n, pg_class as c
	            WHERE a.atttypid = t.oid
	                AND c.relname = '".$tbl[2]."'
	                AND n.oid IN (SELECT oid FROM pg_namespace WHERE nspname = '".$tbl[1]."')
	                AND n.oid = c.relnamespace
	                AND NOT attisdropped
	                AND attrelid = c.oid
	                AND attnum > 0
	            ORDER BY attnum";
		list_process($db, $lstParams, $sql);
		break;
		
	case "tableFields::lst_del_records":
		$sql = "";
		$ids = split(',', $lstParams['req_ids']);
		foreach($ids as $k => $v) {
			$sql .= "ALTER TABLE ".$lstParams['table']." DROP COLUMN $v;\\n";
		}
		print("top.execCommand(\"".$sql."\", 'top.elements.tableFields.output();');");
		break;
		
	case "tableFields::rename_table":
		$sql = "ALTER TABLE ".$lstParams['table']." RENAME TO ".$lstParams['newName'].";\\n";
		print("top.execCommand(\"".$sql."\", 'renameTableDone(\'".$lstParams['nodeId']."\', \'".$lstParams['newName']."\')');");
		break;
		
	case "tableFieldAdd::edit_get_data":
		$tbl = split("\.", $lstParams['table']); 
		$sql = "SELECT a.attname, 
	                CASE WHEN (t.typlen = -1 AND t.typelem != 0) THEN (SELECT at.typname FROM pg_type at   WHERE at.oid = t.typelem) || '[]' ELSE (CASE WHEN t.typname = 'bpchar' THEN 'char' ELSE t.typname END) END AS typname,
	                CASE WHEN ((a.attlen = -1) AND ((a.atttypmod)::int4 = (-1)::int4)) THEN (0)::int4 ELSE CASE WHEN a.attlen = -1 THEN CASE WHEN ((t.typname = 'bpchar') OR (t.typname = 'char') OR (t.typname = 'varchar')) THEN (a.atttypmod -4)::int4 ELSE (a.atttypmod)::int4 END ELSE (a.attlen)::int4 END END AS length,
	                (SELECT adsrc FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum) AS default,
	                (SELECT description FROM pg_description WHERE a.attrelid = objoid AND attnum = objsubid) as descr,
	                CASE (SELECT indisprimary FROM pg_index i, pg_class ic, pg_attribute ia  WHERE i.indrelid = a.attrelid AND i.indexrelid = ic.oid AND ic.oid = ia.attrelid AND ia.attname = a.attname  AND indisprimary IS NOT NULL  ORDER BY indisprimary DESC LIMIT 1) WHEN true THEN 't' ELSE 'f' END  AS primarykey,
	                CASE a.attnotnull WHEN true THEN 't' else 'f' end as isnull,
	                (SELECT case contype WHEN 'u' THEN 't' else 'f' end FROM pg_constraint WHERE a.attrelid = conrelid AND contype = 'u' AND (a.attnum = conkey[1] OR a.attnum = conkey[2] OR a.attnum = conkey[3] OR a.attnum = conkey[4])  LIMIT 1) as isunique
	            FROM pg_attribute a, pg_type t, pg_namespace as n, pg_class as c
	            WHERE a.atttypid = t.oid
	                AND c.relname = '".$tbl[2]."'
	                AND n.oid IN (SELECT oid FROM pg_namespace WHERE nspname = '".$tbl[1]."')
	                AND n.oid = c.relnamespace
	                AND NOT attisdropped
	                AND attrelid = c.oid
	                AND attnum > 0
					AND a.attname = '".$lstParams['req_recid']."'
	            ";
		edit_process($db, $lstParams, $sql);
		break;
		
	case "tableFieldAdd::edit_field_list":
		$types = Array('-- numeric --', 'int2', 'int4', 'int8', 'float4', 'float8', 'numeric', 'money', 'serial', 'bigserial',
					   '-- text --', 'char', 'varchar', 'text',
					   '-- date/time --', 'date', 'time',  'timetz', 'timestamp', 'timestamptz', 'interval', 
					   '-- logic --', 'bool', 'bit', 'varbit', 
					   '-- geometric --', 'box', 'circle', 'line', 'lseg', 'path', 'point', 'polygon', 
					   '-- network --', 'cidr', 'inet', 'macaddr');
		$sql = "";
		foreach ($types as $k => $v) {
			if ($sql != '') $sql .= " UNION ALL ";
			if (substr($v, 0, 1) == '-') {
				$addk = '';
				$adds = ", 'style=\\'background-color: silver;\\''"; 
			} else {
				$addk = $v;
				$adds = ", ''";
			}
			$sql .= "SELECT '$addk', '$v' $adds"; 
		}
		buildOptions($db, $lstParams, $sql);
		break;
	
	case "tableFieldAdd::edit_save_data": 
		if ($lstParams['req_recid'] == 'null') {
			$p = $_POST;
			if ($p['type'] == 'char') $p['type'] = str_replace('char', 'char('.$p['size'].')', $p['type']);
			if ($p['type'] == 'varchar') $p['type'] = str_replace('varchar', 'varchar('.$p['size'].')', $p['type']);
			if ($p['type'] == 'bit') $p['type'] = str_replace('bit', 'bit('.$p['size'].')', $p['type']);
			$sql = "ALTER TABLE ".$lstParams['table']." ADD COLUMN ".$p['field']." ".$p['type'];
			if ($p['primary'] == 't')  $sql .= " PRIMARY KEY";
			if ($p['not_null'] == 't') $sql .= " NOT NULL";
			if ($p['unique'] == 't')   $sql .= " UNIQUE";
			if ($p['default'] != '')   $sql .= " DEFAULT ".$p['default'];
			$sql .= ";\n";
			if ($_POST['comments'] != '') $sql .= "COMMENT ON COLUMN ".$lstParams['table'].".".$p['field']." IS '".$_POST['comments']."';";
		} else {
			$p = $_POST;
			if ($p['type'] == 'char') $p['type'] = str_replace('char', 'char('.$p['size'].')', $p['type']);
			if ($p['type'] == 'varchar') $p['type'] = str_replace('varchar', 'varchar('.$p['size'].')', $p['type']);
			if ($p['type'] == 'bit') $p['type'] = str_replace('bit', 'bit('.$p['size'].')', $p['type']);
			$sql = "";
			// get current table data and see what is changed
			$tbl = split("\.", $lstParams['table']); 
			$ssql = "SELECT a.attname, 
		                CASE WHEN (t.typlen = -1 AND t.typelem != 0) THEN (SELECT at.typname FROM pg_type at   WHERE at.oid = t.typelem) || '[]' ELSE (CASE WHEN t.typname = 'bpchar' THEN 'char' ELSE t.typname END) END AS typname,
		                CASE WHEN ((a.attlen = -1) AND ((a.atttypmod)::int4 = (-1)::int4)) THEN (0)::int4 ELSE CASE WHEN a.attlen = -1 THEN CASE WHEN ((t.typname = 'bpchar') OR (t.typname = 'char') OR (t.typname = 'varchar')) THEN (a.atttypmod -4)::int4 ELSE (a.atttypmod)::int4 END ELSE (a.attlen)::int4 END END AS length,
		                (SELECT adsrc FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum) AS default,
		                (SELECT description FROM pg_description WHERE a.attrelid = objoid AND attnum = objsubid) as comment,
		                CASE (SELECT indisprimary FROM pg_index i, pg_class ic, pg_attribute ia  WHERE i.indrelid = a.attrelid AND i.indexrelid = ic.oid AND ic.oid = ia.attrelid AND ia.attname = a.attname  AND indisprimary IS NOT NULL  ORDER BY indisprimary DESC LIMIT 1) WHEN true THEN 't' ELSE 'f' END  AS primarykey,
		                CASE a.attnotnull WHEN true THEN 't' else 'f' end as isnull,
		                (SELECT case contype WHEN 'u' THEN 't' else 'f' end FROM pg_constraint WHERE a.attrelid = conrelid AND contype = 'u' AND (a.attnum = conkey[1] OR a.attnum = conkey[2] OR a.attnum = conkey[3] OR a.attnum = conkey[4])  LIMIT 1) as isunique
		            FROM pg_attribute a, pg_type t, pg_namespace as n, pg_class as c
		            WHERE a.atttypid = t.oid
		                AND c.relname = '".$tbl[2]."'
		                AND n.oid IN (SELECT oid FROM pg_namespace WHERE nspname = '".$tbl[1]."')
		                AND n.oid = c.relnamespace
		                AND NOT attisdropped
		                AND attrelid = c.oid
		                AND attnum > 0
						AND a.attname = '".$lstParams['req_recid']."'
		            ";
			$rs  = $db->execute($ssql);
			if ($_POST['field'] != $rs->fields[0]) { // name
				$sql .= "ALTER TABLE ".$lstParams['table']." RENAME COLUMN ".$rs->fields[0]." TO ".$p['field'].";\n";
			}
			if ($_POST['type'] != $rs->fields[1] || $_POST['size'] != $rs->fields[2] ) { // type or size
				$sql .= "ALTER TABLE ".$lstParams['table']." ALTER COLUMN ".$rs->fields[0]." TYPE ".$p['type']." USING(".$rs->fields[0]."::".$p['type'].");\n";
			}
			if ($_POST['default'] != $rs->fields[3]) { // default
				if ($_POST['default'] == "") {
					$sql .= "ALTER TABLE ".$lstParams['table']." ALTER COLUMN ".$p['field']." DROP DEFAULT;\n";
				} else {
					$sql .= "ALTER TABLE ".$lstParams['table']." ALTER COLUMN ".$p['field']." SET DEFAULT ".$p['default'].";\n";
				}
			}
			if ($_POST['primary'] != $rs->fields[5]) { // primary
				if ($_POST['primary'] == "f") {
					//$sql .= "ALTER TABLE ".$lstParams['table']." DROP PRIMARY KEY(".$p['field'].");\n";
				} else {
					$sql .= "ALTER TABLE ".$lstParams['table']." ADD PRIMARY KEY(".$p['field'].");\n";
				}
			}
			if ($_POST['not_null'] != $rs->fields[6]) { // not null
				if ($_POST['not_null'] == "f") {
					$sql .= "ALTER TABLE ".$lstParams['table']." ALTER COLUMN ".$p['field']." DROP NOT NULL;\n";
				} else {
					$sql .= "ALTER TABLE ".$lstParams['table']." ALTER COLUMN ".$p['field']." SET NOT NULL;\n";
				}
			}
			if ($_POST['unique'] != $rs->fields[7]) { // unique
				if ($_POST['unique'] == "t") {
					$sql .= "ALTER TABLE ".$lstParams['table']." ADD UNIQUE(".$p['field'].");\n";
				} else {
					//$sql .= "ALTER TABLE ".$lstParams['table']." DROP UNIQUE(".$p['field'].");\n";
				}
			}
			if ($_POST['comments'] != $rs->fields[4]) { // comments
				$sql .= "COMMENT ON COLUMN ".$lstParams['table'].".".$p['field']." IS '".$_POST['comments']."';";
			}
		}
		if ($sql != '') {
			print(" <textarea id=sql>$sql</textarea>
					<script> 
						top.execCommand(document.getElementById('sql').value, 'top.elements.tableFieldAdd.saveDone()');
					</script>");
		} else {
			print(" <script> top.elements.tableFieldAdd.saveDone();	</script>");
		}
		break;
		
	case "tableConst::lst_get_data":
		$tbl = split("\.", $lstParams['table']); 
		// -- table constraints
		$sql = "SELECT conname, conname, 
					CASE contype::varchar
						WHEN 'p' THEN 'Primary Key'
						WHEN 'f' THEN 'Foreign Key'
						WHEN 'c' THEN 'Check'
						WHEN 'u' THEN 'Unique Key'
						--ELSE contype
					END,
					CASE contype::varchar
						WHEN 'p' THEN 
							'('||
							(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[1]) ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[2]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[3]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[4]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[5]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[6]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[7]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[8]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[9]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[10]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[11]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[12]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[13]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[14]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[15]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[16]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[17]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[18]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[19]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[20]), '') ||
							')'
						WHEN 'f' THEN 
							'('||
							(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[1]) ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[2]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[3]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[4]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[5]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[6]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[7]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[8]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[9]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[10]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[11]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[12]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[13]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[14]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[15]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[16]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[17]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[18]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[19]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[20]), '') ||
							') = ' || 
							(SELECT nspname || '.' || relname FROM pg_class, pg_namespace WHERE pg_class.oid = confrelid AND pg_namespace.oid = pg_class.relnamespace) ||
							' ('||
							(SELECT attname FROM pg_attribute WHERE attrelid = confrelid AND attnum = confkey[1]) ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = confrelid AND attnum = confkey[2]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = confrelid AND attnum = confkey[3]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = confrelid AND attnum = confkey[4]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = confrelid AND attnum = confkey[5]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = confrelid AND attnum = confkey[6]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = confrelid AND attnum = confkey[7]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = confrelid AND attnum = confkey[8]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = confrelid AND attnum = confkey[9]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = confrelid AND attnum = confkey[10]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = confrelid AND attnum = confkey[11]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = confrelid AND attnum = confkey[12]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = confrelid AND attnum = confkey[13]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = confrelid AND attnum = confkey[14]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = confrelid AND attnum = confkey[15]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = confrelid AND attnum = confkey[16]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = confrelid AND attnum = confkey[17]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = confrelid AND attnum = confkey[18]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = confrelid AND attnum = confkey[19]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = confrelid AND attnum = confkey[20]), '') ||
							')' ||
							' ON UPDATE ' || (CASE confupdtype WHEN 'c' THEN 'Cascade' WHEN 'd' THEN 'Set Default' WHEN 'n' THEN 'Set Null' WHEN 'a' THEN 'No Action' WHEN 'r' THEN 'Restrict' END) ||
							' ON DELETE ' || (CASE confdeltype WHEN 'c' THEN 'Cascade' WHEN 'd' THEN 'Set Default' WHEN 'n' THEN 'Set Null' WHEN 'a' THEN 'No Action' WHEN 'r' THEN 'Restrict' END) ||
							CASE WHEN condeferrable THEN ' DEFERRABLE' ELSE '' END ||
							CASE WHEN condeferred THEN ' DEFERRED' ELSE ' IMMEDIATE' END
						WHEN 'c' THEN consrc
						WHEN 'u' THEN
							'('||
							(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[1]) ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[2]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[3]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[4]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[5]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[6]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[7]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[8]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[9]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[10]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[11]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[12]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[13]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[14]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[15]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[16]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[17]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[18]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[19]), '') ||
							COALESCE(', ' ||(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = conkey[20]), '') ||
							')'
					END
	            FROM pg_constraint, pg_class, pg_namespace
	            WHERE pg_constraint.conrelid = pg_class.oid
					AND pg_class.relnamespace = pg_namespace.oid
					AND pg_namespace.oid IN (SELECT oid FROM pg_namespace WHERE nspname = '".$tbl[1]."')
					AND pg_class.relname = '".$tbl[2]."'
				ORDER BY pg_constraint.oid";
		list_process($db, $lstParams, $sql);
		break;
		
	case "tableConst::lst_del_records":
		$sql = "";
		$ids = split(',', $lstParams['req_ids']);
		foreach($ids as $k => $v) {
			$sql .= "ALTER TABLE ".$lstParams['table']." DROP CONSTRAINT $v;\\n";
		}
		print("top.execCommand(\"".$sql."\", 'top.elements.tableConst.output();');");
		break;
		
	case "tableConstAdd::edit_get_data":
		$sql = "SELECT null";
		edit_process($db, $lstParams, $sql);
		break;

	case "tableConstAdd::edit_field_list":
		if($lstParams['req_field'] == 'for_fields') {
			$sql = 'SELECT null';
		} else {
			$tbl = split("\.", $lstParams['table']);
			$sql = "SELECT a.attname, a.attname
		            FROM pg_attribute a, pg_type t, pg_namespace as n, pg_class as c
		            WHERE a.atttypid = t.oid
		                AND c.relname = '".$tbl[2]."'
		                AND n.oid IN (SELECT oid FROM pg_namespace WHERE nspname = '".$tbl[1]."')
		                AND n.oid = c.relnamespace
		                AND NOT attisdropped
		                AND attrelid = c.oid
		                AND attnum > 0
					ORDER BY attnum
		            ";
		}
		buildOptions($db, $lstParams, $sql, true, false);
		break;		
		
	case "tableConstAdd::edit_lookup":
		$sql = "SELECT nspname || '.' || relname, nspname || '.' || relname
				FROM pg_class, pg_namespace
				WHERE relkind = 'r' 
					AND pg_namespace.oid = relnamespace
					AND nspname || '.' || relname ILIKE '%".$lstParams['lookup_search']."%'
				ORDER BY 2";
		edit_lookup_process($db, $lstParams, $sql);
		break;
		
	case "tableConstAdd::fk_table":
		$lstParams['req_index'] = 4;
		$lstParams['req_field'] = 'for_fields';		
		$tbl = split("\.", $lstParams['fk_table']);
		$sql = "SELECT a.attname, a.attname
	            FROM pg_attribute a, pg_type t, pg_namespace as n, pg_class as c
	            WHERE a.atttypid = t.oid
	                AND c.relname = '".$tbl[1]."'
	                AND n.oid IN (SELECT oid FROM pg_namespace WHERE nspname = '".$tbl[0]."')
	                AND n.oid = c.relnamespace
	                AND NOT attisdropped
	                AND attrelid = c.oid
	                AND attnum > 0
				ORDER BY attnum
	            ";
		//$db->debug= true;
		$rs  = $db->execute($sql);
		$opt = '';
		while ($rs && !$rs->EOF) {
			$opt .= "
				var oOption = document.createElement(\"OPTION\");
				oOption.text  = '".$rs->fields[0]."';
				oOption.value = '".$rs->fields[0]."';
				obj.options.add(oOption, obj.options.length);
			";
			$rs->moveNext();
		}
				
		print("
			var obj = document.getElementById('tableConstAdd_field4');
			for (var i=obj.options.length-1; i > -1; i--) { obj.remove(i); }
			$opt
			");
		break;
		
	case "tableConstAdd::edit_save_data":
		if ($_POST['type'] == 'FK') {
			$sql = "ALTER TABLE ".$lstParams['table']." ADD CONSTRAINT ".$_POST['name']." FOREIGN KEY (".$_POST['sel_fields1'].") ".
				   "REFERENCES ".$_POST['for_table']."(".$_POST['sel_fields2'].") ".
				   "ON DELETE ".$_POST['onDelete']." ON UPDATE ".$_POST['onUpdate'].
				   ($_POST['deferrable'] == 't' ? " DEFERRABLE INITIALLY ".$_POST['check_time'] : "").";\n";
		}
		if ($_POST['type'] == 'PK') {
			$sql = "ALTER TABLE ".$lstParams['table']." ADD CONSTRAINT ".$_POST['name']." PRIMARY KEY (".$_POST['sel_fields1'].");\n";
		}
		if ($_POST['type'] == 'UK') {
			$sql = "ALTER TABLE ".$lstParams['table']." ADD CONSTRAINT ".$_POST['name']." UNIQUE(".$_POST['sel_fields1'].");\n";
		}
		if ($_POST['type'] == 'CH') {
			$sql = "ALTER TABLE ".$lstParams['table']." ADD CONSTRAINT ".$_POST['name']." CHECK(".$_POST['check_cond'].");\n";
		}
		print(" <textarea id=sql>$sql</textarea>
				<script> 
					top.execCommand(document.getElementById('sql').value, 'top.elements.tableConstAdd.saveDone()');
				</script>");
		break;
		
	case "tableIndx::lst_get_data":
		$tbl = split("\.", $lstParams['table']); 
		$onfields = "(SELECT attname FROM pg_attribute WHERE pg_attribute.attrelid = t.oid AND indkey[0] = attnum)\n";
		for ($i=1; $i<=50; $i++) { 
			$onfields .= "|| COALESCE(', ' ||
								(SELECT attname FROM pg_attribute WHERE pg_attribute.attrelid = t.oid AND indkey[$i] = attnum),
								'')\n";
		}
		// -- table indexes
		$sql = "SELECT i.relname, i.relname,
					CASE 
						WHEN indexprs IS NULL THEN $onfields 
						ELSE (SELECT CASE WHEN nspname != 'pg_catalog' THEN nspname || '.' || proname ELSE proname END
						      FROM pg_proc as p INNER JOIN pg_namespace as n ON (p.pronamespace = n.oid)
       						  WHERE p.oid = replace(substring(indexprs, 'funcid.[[:digit:]]*'), 'funcid ', '')::int)
								|| '(' ||
							 (SELECT attname FROM pg_attribute 
							  WHERE pg_attribute.attrelid = t.oid AND attnum = replace(substring(indexprs, 'varoattno.[[:digit:]]*'), 'varoattno ', '')::int) 
							    || ')' 
					END,
                    CASE x.indisunique WHEN true THEN 'x' ELSE '' END,
					CASE x.indisprimary WHEN true THEN 'x' ELSE '' END,
					CASE x.indisclustered WHEN true THEN 'x' ELSE '' END,
	                (SELECT description FROM pg_description where classoid = x.indexrelid)
				FROM pg_index x, pg_class i, pg_namespace as n, pg_class as t
	            WHERE i.oid = x.indexrelid
	                AND x.indrelid = t.oid
	                AND t.relnamespace = n.oid
	                AND n.oid IN (SELECT oid FROM pg_namespace WHERE nspname = '".$tbl[1]."')
	                AND t.relname = '".$tbl[2]."'
	            ORDER BY i.oid";
		list_process($db, $lstParams, $sql);
		break;
		
	case "tableIndx::lst_del_records":
		$tbl = split("\.", $lstParams['table']); 
		$sql = "";
		$ids = split(',', $lstParams['req_ids']);
		foreach($ids as $k => $v) {
			$sql .= "DROP INDEX ".$tbl[1].".$v;\\n";
		}
		print("top.execCommand(\"".$sql."\", 'top.elements.tableIndx.output();');");
		break;
		
	case "tableIndx::cluster":
		$ids = split(',', $lstParams['req_ids']);
		$tbl = split("\.", $lstParams['table']); 
		$sql = "SELECT x.indisclustered
				FROM pg_index x, pg_class i, pg_namespace as n, pg_class as t
	            WHERE i.oid = x.indexrelid
	                AND x.indrelid = t.oid
	                AND t.relnamespace = n.oid
	                AND n.oid IN (SELECT oid FROM pg_namespace WHERE nspname = '".$tbl[1]."')
	                AND t.relname = '".$tbl[2]."'
					AND i.relname = '".$ids[0]."'
	            ORDER BY i.oid";
		$rs = $db->execute($sql);
		if ($rs->fields[0] == 't') $action = 'SET WITHOUT CLUSTER'; else $action = 'CLUSTER ON '.$ids[0];
		
		$sql = "ALTER TABLE ".$lstParams['table']." ".$action.";";
		print("top.execCommand(\"".$sql."\", 'top.elements.tableIndx.output();');");
		break;
		break;
		
	case "tableIndxAdd::edit_get_data":
		$sql = "SELECT null";
		edit_process($db, $lstParams, $sql);
		break;
		
	case "tableIndxAdd::edit_save_data":
		$p = $_POST;
		$sql = "CREATE ".($p['unique'] == 't' ? 'UNIQUE ': '')."INDEX ".$p['name']." ON ".$lstParams['table'].
			   " USING ".$p['type']."(".($p['functional'] != '' ? $p['functional'].'(' : '').$p['sel_fields'].")".($p['functional'] != '' ? ')' : '').";";
		print("<script>top.execCommand(\"".$sql."\", 'top.elements.tableIndx.output();');</script>");
		break;
		
	case "tableIndxAdd::edit_field_list":
		if($lstParams['req_field'] == 'functional') {
			$sql = "SELECT null, '-- none --' UNION ALL SELECT 'LOWER', 'LOWER' UNION ALL SELECT 'UPPER', 'UPPER'";
		} else {
			$tbl = split("\.", $lstParams['table']);
			$sql = "SELECT a.attname, a.attname
					FROM pg_attribute a, pg_type t, pg_namespace as n, pg_class as c
					WHERE a.atttypid = t.oid
						AND c.relname = '".$tbl[2]."'
						AND n.oid IN (SELECT oid FROM pg_namespace WHERE nspname = '".$tbl[1]."')
						AND n.oid = c.relnamespace
						AND NOT attisdropped
						AND attrelid = c.oid
						AND attnum > 0
					ORDER BY attnum
					";
		}
		buildOptions($db, $lstParams, $sql, true, false);
		break;		
	
	case "tableTriggers::lst_get_data":
		$tbl = split("\.", $lstParams['table']); 
		$sql = "SELECT tgname, tgname,
					CASE WHEN tgtype IN (5, 9, 13, 17, 21, 25, 29) THEN 'After' ELSE 'Before' END,
					CASE 
						WHEN tgtype IN (5, 8)   THEN 'Insert'
						WHEN tgtype IN (9, 11)  THEN 'Delete'
						WHEN tgtype IN (13, 15) THEN 'Insert, Delete'
						WHEN tgtype IN (17, 19) THEN 'Update'
						WHEN tgtype IN (21, 23) THEN 'Insert, Update'
						WHEN tgtype IN (25, 27) THEN 'Update, Delete'
						WHEN tgtype IN (29)     THEN 'Insert, Update, Delete'
						ELSE 'Insert, Update, Delete'
					END,
					pg_namespacef.nspname || '.' || proname, 
					tgenabled
	           FROM pg_trigger,pg_class,pg_namespace,pg_proc,pg_namespace as pg_namespacef
	           WHERE pg_trigger.tgrelid = pg_class.oid
					AND pg_proc.oid = tgfoid
					AND pg_proc.pronamespace = pg_namespacef.oid
					AND pg_class.relnamespace = pg_namespace.oid
					AND tgisconstraint = false
					AND pg_namespace.oid IN (SELECT oid FROM pg_namespace WHERE nspname = '".$tbl[1]."')
					AND pg_class.relname = '".$tbl[2]."'
               ORDER BY 1";
		list_process($db, $lstParams, $sql);
		break;
		
	case "tableTriggers::lst_del_records":
		$sql = "";
		$ids = split(',', $lstParams['req_ids']);
		foreach($ids as $k => $v) {
			$sql .= "DROP TRIGGER $v ON ".$lstParams['table'].";\\n";
		}
		print("top.execCommand(\"".$sql."\", 'top.elements.tableTriggers.output();');");
		break;
		
	case "tableTriggers::disable":
		$ids = split(',', $lstParams['req_ids']);
		$tbl = split("\.", $lstParams['table']); 
		$sql = "SELECT tgname, tgenabled
	            FROM pg_trigger, pg_class, pg_namespace, pg_proc, pg_namespace as pg_namespacef
	            WHERE pg_trigger.tgrelid=pg_class.oid
					AND pg_proc.oid=tgfoid
					AND pg_proc.pronamespace=pg_namespacef.oid
					AND pg_class.relnamespace=pg_namespace.oid
					AND tgisconstraint=false
					AND pg_namespace.oid IN (SELECT oid FROM pg_namespace WHERE nspname = '".$tbl[1]."')
					AND pg_class.relname = '".$tbl[2]."'
					AND tgname = '".$ids[0]."'
                ORDER BY 1";
		$rs = $db->execute($sql);
		if ($rs->fields[1] == 't') $action = 'DISABLE'; else $action = 'ENABLE';
		
		$sql = "ALTER TABLE ".$lstParams['table']." $action TRIGGER ".$ids[0].";";
		print("top.execCommand(\"".$sql."\", 'top.elements.tableTriggers.output();');");
		break;
		
	case "tableTriggerAdd::edit_get_data":
		$sql = "SELECT null";
		edit_process($db, $lstParams, $sql);
		break;
		
	case "tableTriggerAdd::edit_field_list":
		$sql = "SELECT pg_namespace.nspname || '.' || proname, pg_namespace.nspname || '.' || proname
				FROM pg_proc, pg_type, pg_namespace
	            WHERE pg_type.oid=prorettype
	                AND typname='trigger'
	                AND pronamespace=pg_namespace.oid
   	                AND nspname != 'pg_catalog'
	            ORDER BY 1";
		buildOptions($db, $lstParams, $sql);
		break;
		
	case "tableTriggerAdd::edit_save_data":
		$p = $_POST;
		$action = '';
		if ($_POST['insert'] == 't') $action .= 'INSERT';
		if ($action != '' && $_POST['update'] == 't') $action .= ' OR ';
		if ($_POST['update'] == 't') $action .= 'UPDATE';
		if ($action != '' && $_POST['delete'] == 't') $action .= ' OR ';
		if ($_POST['delete'] == 't') $action .= 'DELETE';
		$sql = "CREATE TRIGGER ".$p['name']." ".$p['timing']." $action ON ".$lstParams['table']." FOR EACH ROW EXECUTE PROCEDURE ".$_POST['function']."();";
		print("<script>top.execCommand(\"".$sql."\", 'top.elements.tableTriggers.output();');</script>");
		break;
		
	case "tableRules::lst_get_data":
		$tbl = split("\.", $lstParams['table']); 
		$sql = "SELECT pg_rewrite.rulename, pg_rewrite.rulename, 
					CASE ev_type WHEN '1' THEN 'SELECT' WHEN '2' THEN 'UPDATE' WHEN '3' THEN 'INSERT' WHEN '4' THEN 'DELETE' ELSE ev_type END,
				    CASE is_instead WHEN 't' THEN 'x' ELSE '' END,
					CASE 
						WHEN strpos(definition, ' WHERE ') > 0 THEN 'x' 
						ELSE ''
					END,
					replace(substring(definition, strpos(definition, ' DO ') + 4), 'INSTEAD ', '')
	            FROM pg_rewrite, pg_class, pg_namespace, pg_rules
	            WHERE ev_class = pg_class.oid
	               AND pg_rewrite.rulename = pg_rules.rulename
				   AND pg_rules.schemaname = '".$tbl[1]."'
				   AND pg_rules.tablename = '".$tbl[2]."'
	               AND pg_class.relnamespace = pg_namespace.oid
	               AND pg_namespace.oid IN (SELECT oid FROM pg_namespace WHERE nspname = '".$tbl[1]."')
	               AND pg_class.relname = '".$tbl[2]."'
	            ORDER BY 1";
		list_process($db, $lstParams, $sql);
		break;
		
	case "tableRules::lst_del_records":
		$sql = "";
		$ids = split(',', $lstParams['req_ids']);
		foreach($ids as $k => $v) {
			$sql .= "DROP RULE $v ON ".$lstParams['table'].";\\n";
		}
		print("top.execCommand(\"".$sql."\", 'top.elements.tableRules.output();');");
		break;
		
	case "tableRuleAdd::edit_get_data":
		$tbl = split("\.", $lstParams['table']); 
		$sql = "SELECT pg_rewrite.rulename, 
					CASE ev_type WHEN 1 THEN 'SELECT' WHEN 2 THEN 'UPDATE' WHEN 3 THEN 'INSERT' ELSE 'DELETE' END,
					is_instead,
					CASE 
						WHEN strpos(definition, ' WHERE ') > 0
						THEN substring(definition, strpos(definition, ' WHERE ') + 7, strpos(definition, ' DO ') - strpos(definition, ' WHERE ') - 7)
						ELSE ''
					END,
					replace(substring(definition, strpos(definition, ' DO ') + 4), 'INSTEAD ', '')
	            FROM pg_rewrite, pg_class, pg_namespace, pg_rules
	            WHERE ev_class=pg_class.oid
	               AND pg_rewrite.rulename = pg_rules.rulename
				   AND pg_rules.schemaname = '".$tbl[1]."'
				   AND pg_rules.tablename = '".$tbl[2]."'
	               AND pg_class.relnamespace = pg_namespace.oid
	               AND pg_namespace.oid IN (SELECT oid FROM pg_namespace WHERE nspname = '".$tbl[1]."')
	               AND pg_class.relname = '".$tbl[2]."'
	                AND pg_rules.rulename = '".$lstParams['req_recid']."'
	            ORDER BY 1";
		edit_process($db, $lstParams, $sql);
		break;
		
	case "tableRuleAdd::edit_save_data":
		$p = $_POST;
		$action = '';
		if ($p['condition'] != '') $action = " WHERE ".$p['condition']; else $action = '';
		$sql = "CREATE OR REPLACE RULE ".$p['name']." AS ON ".$p['event']." TO ".$lstParams['table'].$action.
			   " DO ".($p['instead'] == 't' ? 'INSTEAD ' : '')."(".$p['action'].");";
		print("<script>top.execCommand(\"".$sql."\", 'top.elements.tableRules.output();');</script>");
		break;
		
	case "tablePriv::lst_get_data":
		$tbl = split("\.", $lstParams['table']); 
		// -- table rules
		$sql = "SELECT relacl FROM pg_class
				WHERE relnamespace IN (SELECT oid FROM pg_namespace WHERE nspname = '".$tbl[1]."') AND relname = '".$tbl[2]."'";
		$rs  = $db->execute($sql);
		$sql = "";
		while ($rs && !$rs->EOF) {
			$tmp = split(',', trim(trim($rs->fields[0], '{'), '}'));
			foreach ($tmp as $k => $v) {
				$t    = split('=', $v);
				$tt   = split('/', $t[1]);
				if ($sql != '') $sql .= " UNION ALL ";
				$rights = "";
				if (strpos($tt[0], 'r') !== false) $rights .= " SELECT,";
				if (strpos($tt[0], 'w') !== false) $rights .= " UPDATE,";
				if (strpos($tt[0], 'a') !== false) $rights .= " INSERT,";
				if (strpos($tt[0], 'd') !== false) $rights .= " DELETE,";
				if (strpos($tt[0], 'x') !== false) $rights .= " REFERENCES,";
				if (strpos($tt[0], 't') !== false) $rights .= " TRIGGER,";
				if (strpos($tt[0], 'X') !== false) $rights .= " EXECUTE,";
				if (strpos($tt[0], 'U') !== false) $rights .= " USAGE,";
				if (strpos($tt[0], 'C') !== false) $rights .= " CREATE,";
				if (strpos($tt[0], 'c') !== false) $rights .= " CONNECT,";
				if (strpos($tt[0], 'T') !== false) $rights .= " TEMPORARY,";
				if (strpos($tt[0], 'R') !== false) $rights .= " RULE,";
				if (strpos($tt[0], '*') !== false) $rights .= "'Preceding privilege'";
				if ($rights == "") continue;
				$rights = substr($rights, 0, strlen($rights)-1);
				$sql .= "(SELECT '".($t[0] != '' ? $t[0] : 'PUBLIC')."', '".($t[0] != '' ? $t[0] : 'PUBLIC')."', '".$rights."', '".$tt[1]."')"; 
			}
			$rs->moveNext();
		}
		if ($sql == "") $sql = "SELECT 1 FROM ".$tbl[1].".".$tbl[2]." WHERE 1=2";
		list_process($db, $lstParams, $sql);
		break;
		
	case "tablePriv::lst_del_records":
		$sql = "";
		$ids = split(',', $lstParams['req_ids']);
		foreach($ids as $k => $v) {
			$sql .= "REVOKE ALL PRIVILEGES ON ".$lstParams['table']." FROM $v;\\n";
		}
		print("top.execCommand(\"".$sql."\", 'top.elements.tablePriv.output();');");
		break;
		
	case "tablePrivAdd::edit_get_data":
		$sql = "SELECT null"; 
		edit_process($db, $lstParams, $sql);
		break;
		
	case "tablePrivAdd::edit_field_list":
		$sql = "SELECT 'PUBLIC', 'PUBLIC'
				UNION ALL
				(SELECT usename, usename FROM  pg_user ORDER BY usename)
				UNION ALL
				(SELECT 'GROUP ' || groname, 'GROUP: ' || groname FROM  pg_group ORDER BY groname)";
		buildOptions($db, $lstParams, $sql);
		break;
		
	case "tablePrivAdd::edit_save_data":
		$p = $_POST;
		$sql = "REVOKE ALL ON ".$lstParams['table']." FROM ".$p['user'].";\\n";
		if ($p['select'] == 't') 	$sql .= "GRANT SELECT ON ".$lstParams['table']." TO ".$p['user'].";\\n";
		if ($p['insert'] == 't') 	$sql .= "GRANT INSERT ON ".$lstParams['table']." TO ".$p['user'].";\\n";
		if ($p['update'] == 't') 	$sql .= "GRANT UPDATE ON ".$lstParams['table']." TO ".$p['user'].";\\n";
		if ($p['delete'] == 't') 	$sql .= "GRANT DELETE ON ".$lstParams['table']." TO ".$p['user'].";\\n";
		if ($p['rule'] == 't') 		$sql .= "GRANT RULE ON ".$lstParams['table']." TO ".$p['user'].";\\n";
		if ($p['references'] == 't')$sql .= "GRANT REFERENCES ON ".$lstParams['table']." TO ".$p['user'].";\\n";
		if ($p['trigger'] == 't') 	$sql .= "GRANT TRIGGER ON ".$lstParams['table']." TO ".$p['user'].";\\n";
		if ($p['all'] == 't') 		$sql  = "GRANT ALL ON ".$lstParams['table']." TO ".$p['user'].";\\n";
		print("<script>top.execCommand(\"".$sql."\", 'top.elements.tablePriv.output();');</script>");
		break;
		
	case "tableScript::edit_get_data":
		// -- table structure
		$tbl  = split("\.", $lstParams['table']); 
		$meta = getTableSQL($db, $tbl[1].".".$tbl[2]);
		$sql  = "";
		foreach ($meta as $key => $value) {
			if ($value != '') $sql .= $value."\\n";
		}
		// -- process edit
		print("document.getElementById('sql').value = \"".$sql."\";");
		print("top.elements['tableScript'].dataReceived();");
		break;
		
	case "tableScript::get_data":
		// -- table structure
		$tbl  = split("\.", $lstParams['table']); 
		$meta = getTableSQL($db, $tbl[1].".".$tbl[2]);
		$sqll  = "";
		foreach ($meta as $key => $value) {
			if ($value != '') $sqll .= $value."\\n";
		}
		// -- get data
		$sql = "SELECT * FROM ".$tbl[1].".".$tbl[2];
		$rs  = $db->execute($sql);
		$data = "";
		while ($rs && !$rs->EOF) {
			$fields = "";
			for ($i=0; $i<$rs->fieldCount; $i++) {
				if ($fields != '') $fields .= ",";
				if ($rs->fields[$i] == null) {
					$fields .= "NULL";
				} else {
					$fields .= "'".pg_escape_string($rs->fields[$i])."'";
				}
			}
			$data .= "INSERT INTO ".$tbl[1].".".$tbl[2]." VALUES($fields);\\n";
			$rs->moveNext();
		}
		// -- get sequence setup
		$sql = "SELECT a.attname, (SELECT adsrc
						FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum) AS default
	            FROM pg_attribute a, pg_type t, pg_namespace as n, pg_class as c
	            WHERE a.atttypid = t.oid
	                AND c.relname = '".$tbl[2]."'
	                AND n.oid IN (SELECT oid FROM pg_namespace WHERE nspname = '".$tbl[1]."')
	                AND n.oid = c.relnamespace
	                AND NOT attisdropped
	                AND attrelid = c.oid
	                AND attnum > 0
	            ORDER BY attnum
				LIMIT 1";
		$rs  = $db->execute($sql);
		if (!$rs->EOF && substr($rs->fields[1], 0, 8) == 'nextval(') {
			$sname = str_replace("nextval('", "", $rs->fields[1]);
			$sname = str_replace("')", "", $sname);
			$sname = str_replace("'::regclass)", "", $sname);
			$sname = str_replace("'::text)", "", $sname);
			$data .= "\\nSELECT setval('".$tbl[1].".".$sname."', (SELECT max(".$rs->fields[0].") FROM ".$tbl[1].".".$tbl[2]."));";
		}
		
		print("document.getElementById('sql').value = \"$sqll\\n$data\";");
		break;
		
	case "tableData::lst_get_data":
		$tbl = split("\.", $lstParams['table']); 
		if ($lstParams['req_search'] == '') {
			// -- get fields
			$sql = "SELECT a.attname,
		                CASE WHEN (t.typlen = -1 AND t.typelem != 0) THEN (SELECT at.typname FROM pg_type at   WHERE at.oid = t.typelem) || '[]' ELSE (CASE WHEN t.typname = 'bpchar' THEN 'char' ELSE t.typname END) END AS typname,
		                CASE WHEN ((a.attlen = -1) AND ((a.atttypmod)::int4 = (-1)::int4)) THEN (0)::int4 ELSE CASE WHEN a.attlen = -1 THEN CASE WHEN ((t.typname = 'bpchar') OR (t.typname = 'char') OR (t.typname = 'varchar')) THEN (a.atttypmod -4)::int4 ELSE (a.atttypmod)::int4 END ELSE (a.attlen)::int4 END END AS length,
		                CASE (SELECT indisprimary FROM pg_index i, pg_class ic, pg_attribute ia  WHERE i.indrelid = a.attrelid AND i.indexrelid = ic.oid AND ic.oid = ia.attrelid AND ia.attname = a.attname  AND indisprimary IS NOT NULL  ORDER BY indisprimary DESC LIMIT 1) when true then 'x' else '' end  AS primarykey,
		                CASE a.attnotnull when true then 'x' else '' end as isnull,
		                (SELECT case contype when 'u' then 'x' else '' end FROM pg_constraint WHERE a.attrelid = conrelid AND contype = 'u' AND (a.attnum = conkey[1] OR a.attnum = conkey[2] OR a.attnum = conkey[3] OR a.attnum = conkey[4])  LIMIT 1) as isunique,
		                (SELECT adsrc FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum) AS default
		            FROM pg_attribute a, pg_type t, pg_namespace as n, pg_class as c
		            WHERE a.atttypid = t.oid
		                AND c.relname = '".$tbl[2]."'
		                AND n.oid IN (SELECT oid FROM pg_namespace WHERE nspname = '".$tbl[1]."')
		                AND n.oid = c.relnamespace
		                AND NOT attisdropped
		                AND attrelid = c.oid
		                AND attnum > 0
		            ORDER BY attnum";
			//$sql = "SELECT * FROM ".$lstParams['table']." LIMIT 1";
			$rs  = $db->execute($sql);
			print("top.elements.tableData.columns  = [];\n");
			print("top.elements.tableData.searches = [];\n");
			print("top.elements.tableDataAdd.fieldIndex = 0;\n".
				  "top.elements.tableDataAdd.groups[0].fields = [];\n".
				  "var group = top.elements.tableDataAdd.groups[0];\n");
			if ($rs->fields['primarykey'] == 'x') $pk = $rs->fields['attname']; else $pk = '';
			while ($rs && !$rs->EOF) {
				$v = $rs->fields['attname'];
				$t = $rs->fields['typname'];
				$out = $t.($t == 'varchar' || $t == 'char' ? "(".$rs->fields['length'].")" : "");
				if ($rs->fields['primarykey'] == 'x') $out .= ", <span style=\"color: red\">PK</span>";
				if ($rs->fields['isnull'] == 'x') $out .= ", <span style=\"color: red\">!Null</span>";
				if ($rs->fields['isunique'] == 'x') $out .= ", <span style=\"color: red\">Uniq.</span>";
				if ($rs->fields['default'] != '') $out .= ", <span style=\"cursor: pointer; color: green;\" title=\"".addslashes($rs->fields['default'])."\">Def.</span>";
				// --
				$tp   = "TEXT";
				$adds = "";
				if ($t == 'int2' || $t == 'int4' || $t == 'int8') $tp = "INT";
				if ($t == 'float4' || $t == 'float8' || $t == 'numeric' || $t == 'money') $tp = "FLOAT";
				if ($t == 'text') { $tp = "TEXTAREA"; $adds = "style=\"width: 503px; height: 80px;\""; }
				if ($t == 'date') $tp = "DATE";
				if ($t == 'time' || $t == 'timetz') $tp = "TIME";
				if ($t == 'varchar' || $t == 'char') $adds = "maxlength=\"".$rs->fields['length']."\"";
				$tp2 = $tp;
				if ($tp2 == "TEXTAREA") $tp2 = "TEXT";
				// --
				print("top.elements.tableData.addColumn('$v', '', 'Text', '');\n");
				print("top.elements.tableData.addSearch('$v', '$tp2', '$v', 'size=40', '', null, null);\n");
				print("group.addField('$v', '$tp', '$v', 'size=80 $adds', '&nbsp;$out', '', false, 0);\n");
				$rs->moveNext();
			}
			if (true) { // only works with oids
				print("
					top.elements.tableData.controls = [];
					top.elements.tableData.addControl('add', 'Add New');
					top.elements.tableData.addControl('delete', 'Delete');
					top.elements.tableDataAdd.controls = [];
					top.elements.tableDataAdd.addControl('save', 'Save', null);
					top.elements.tableDataAdd.addControl('back', 'Cancel', null);
				");
			} else {
				print("
					top.elements.tableData.controls = [];
					top.elements.tableDataAdd.controls = [];
					top.elements.tableDataAdd.addControl('back', 'Cancel', null);
				");
			}
		}
		// -- table data
		$sql = "SELECT oid, * FROM ".$tbl[1].".".$tbl[2]." WHERE ~SEARCH~";
		list_process($db, $lstParams, $sql);
		break;
		
	case "tableData::lst_del_records":
		$tbl = split("\.", $lstParams['table']); 
		list_delete($db, $lstParams, $tbl[1].".".$tbl[2], 'oid');
		break;
		
	case "tableDataAdd::edit_get_data":
		$sql = "SELECT * FROM ".$lstParams['table']." WHERE oid = '".$lstParams['req_recid']."'";
		if ($lstParams['req_recid'] == 'null') $sql = "SELECT null";
		edit_process($db, $lstParams, $sql);
		break;
		
	case "tableDataAdd::edit_save_data":
		$tbl = split("\.", $lstParams['table']); 
		edit_save($db, $lstParams, $_POST, $tbl[1].".".$tbl[2], 'oid');
		break;
		
	default:
		print("alert('List command is not recognized:  ".$lstParams['req_name']."::".$lstParams['req_cmd']."');");
		break;
}

?>