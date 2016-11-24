<?
function getTableSQL($db, $table) {
	$tbl = split("\.", $table); 
	// table fields
	$sql = "SELECT a.attname, 
				CASE WHEN (t.typlen = -1 AND t.typelem != 0) THEN (SELECT at.typname FROM pg_type at WHERE at.oid = t.typelem) || '[]' ELSE (CASE WHEN t.typname = 'bpchar' THEN 'char' ELSE t.typname END) END AS typname,
				CASE WHEN ((a.attlen = -1) AND ((a.atttypmod)::int4 = (-1)::int4)) THEN (0)::int4 ELSE CASE WHEN a.attlen = -1 THEN CASE WHEN ((t.typname = 'bpchar') OR (t.typname = 'char') OR (t.typname = 'varchar')) THEN (a.atttypmod -4)::int4 ELSE (a.atttypmod)::int4 END ELSE (a.attlen)::int4 END END AS length,
				CASE a.attnotnull when true then ' NOT NULL' else '' end as isnull,
				(SELECT ' DEFAULT ' ||adsrc FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum) AS default
			FROM pg_attribute a, pg_type t, pg_namespace as n, pg_class as c
			WHERE a.atttypid = t.oid
				AND c.relname = '".$tbl[1]."'
				AND n.oid IN (SELECT oid FROM pg_namespace WHERE nspname = '".$tbl[0]."')
				AND n.oid = c.relnamespace
				AND NOT attisdropped
				AND attrelid = c.oid
				AND attnum > 0
			ORDER BY attnum";
	$rs  = $db->execute($sql);
	$fseq = "";
	$fsql = "CREATE TABLE ".$tbl[0].".".$tbl[1]."(\\n";
	while ($rs && !$rs->EOF) {
		$f = $rs->fields; 
		$size  = '';
		$sname = '';
		if ($f[1] == 'varchar') $size = "(".$f[2].")";
		if ($f[1] == 'char') $size = "(".$f[2].")";
		if ($f[1] == 'bit') $size = "(".$f[2].")";
		if ($f[4] != '' && strpos($f[4], 'nextval(') !== false) {
			$sname = str_replace("DEFAULT nextval('", "", $f[4]);
			$sname = str_replace("')", "", $sname);
			$sname = str_replace("'::regclass)", "", $sname);
			$sname = trim(str_replace("'::text)", "", $sname));
			$fseq .= "CREATE SEQUENCE ".$tbl[0].".".$sname." INCREMENT 1 MINVALUE 1 CACHE 1;\\n";
			$sname = " DEFAULT nextval('".$tbl[0].".".$sname."')";
		}
		$fsql .= "     $f[0] ".$f[1].$size.($sname != '' ? $sname : $f[4]).$f[3];
		$rs->moveNext();
		if (!$rs->EOF) $fsql .= ", \\n";
	}
	$fsql .= "\\n) WITH OIDS;\\n";
	// -- table constraints
	$sql = "SELECT conname, contype, 
				CASE contype::varchar
					WHEN 'p' THEN 
						'ADD PRIMARY KEY('||
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
						'ADD CONSTRAINT ' || conname || ' FOREIGN KEY('||
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
						') REFERENCES ' || 
						(SELECT nspname || '.' || relname FROM pg_class, pg_namespace WHERE pg_class.oid = confrelid AND pg_namespace.oid = pg_class.relnamespace) ||
						'('||
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
						CASE WHEN condeferred THEN ' DEFERRED' ELSE '' END
					WHEN 'c' THEN 'ADD CONSTRAINT ' || conname || ' CHECK(' || consrc || ')'
					WHEN 'u' THEN
						'ADD CONSTRAINT ' || conname || ' UNIQUE('||
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
				AND pg_namespace.oid IN (SELECT oid FROM pg_namespace WHERE nspname = '".$tbl[0]."')
				AND pg_class.relname = '".$tbl[1]."'
			ORDER BY pg_constraint.oid";
	$rs  = $db->execute($sql);
	$csql = "";
	while ($rs && !$rs->EOF) {
		$f = $rs->fields; 
		$csql .= "ALTER TABLE ".$tbl[0].".".$tbl[1]." ".$f[2]."; \\n";
		$rs->moveNext();
	}
	// table indexes
	$onfields = "(SELECT attname FROM pg_attribute WHERE pg_attribute.attrelid = t.oid AND indkey[0] = attnum)\n";
	for ($i=1; $i<=50; $i++) { 
		$onfields .= "|| COALESCE(', ' ||
							(SELECT attname FROM pg_attribute WHERE pg_attribute.attrelid = t.oid AND indkey[$i] = attnum),
							'')\n";
	}
	$sql = "SELECT i.relname,
				CASE 
					WHEN indexprs IS NULL THEN $onfields 
					ELSE (SELECT CASE WHEN nspname != 'pg_catalog' THEN nspname || '.' || proname ELSE proname END
						  FROM pg_proc as p INNER JOIN pg_namespace as n ON (p.pronamespace = n.oid)
						  WHERE p.oid = replace(substring(indexprs, 'funcid.[[:digit:]]*'), 'funcid ', ''))
							|| '(' ||
						 (SELECT attname FROM pg_attribute 
						  WHERE pg_attribute.attrelid = t.oid AND attnum = replace(substring(indexprs, 'varoattno.[[:digit:]]*'), 'varoattno ', '')) 
							|| ')' 
				END,
				x.indisunique,
				x.indisprimary,
				x.indisclustered
			FROM pg_index x, pg_class i, pg_namespace as n, pg_class as t
			WHERE i.oid = x.indexrelid
				AND x.indrelid = t.oid
				AND t.relnamespace = n.oid
				AND n.oid IN (SELECT oid FROM pg_namespace WHERE nspname = '".$tbl[0]."')
				AND t.relname = '".$tbl[1]."'
				AND x.indisprimary = false
			ORDER BY i.oid";
	$rs  = $db->execute($sql);
	$isql = "";
	while ($rs && !$rs->EOF) {
		$f = $rs->fields;
		$isql .= "CREATE ".($f[2] == 't' ? 'UNIQUE ': '')."INDEX ".$f[0]." ON ".$table.
				 " USING btree(".$f[1].");\\n";

		$rs->moveNext();
	}
	// table triggers
	$sql = "SELECT tgname,
			CASE WHEN tgtype IN (5, 9, 13, 17, 21, 25, 29) THEN 'AFTER' ELSE 'BEFORE' END,
			CASE 
				WHEN tgtype IN (5, 8)   THEN 'INSERT'
				WHEN tgtype IN (9, 11)  THEN 'DELETE'
				WHEN tgtype IN (13, 15) THEN 'INSERT OR DELETE'
				WHEN tgtype IN (17, 19) THEN 'UPDATE'
				WHEN tgtype IN (21, 23) THEN 'INSERT OR UPDATE'
				WHEN tgtype IN (25, 27) THEN 'UPDATE OR DELETE'
				WHEN tgtype IN (29)     THEN 'INSERT OR UPDATE OR DELETE'
				ELSE 'INSERT OR UPDATE OR DELETE'
			END,
			pg_namespacef.nspname || '.' || proname, 
			CASE WHEN tgenabled THEN 'Yes' ELSE '' END
	   FROM pg_trigger,pg_class,pg_namespace,pg_proc,pg_namespace as pg_namespacef
	   WHERE pg_trigger.tgrelid=pg_class.oid
			AND pg_proc.oid=tgfoid
			AND pg_proc.pronamespace=pg_namespacef.oid
			AND pg_class.relnamespace=pg_namespace.oid
			AND tgisconstraint=false
			AND pg_namespace.oid IN (SELECT oid FROM pg_namespace WHERE nspname = '".$tbl[0]."')
			AND pg_class.relname = '".$tbl[1]."'
	   ORDER BY 1";
	$rs  = $db->execute($sql);
	$tsql = "";
	while ($rs && !$rs->EOF) {
		$f = $rs->fields;
		$tsql .= "CREATE TRIGGER ".$f[0]." ".$f[1]." ".$f[2]." ON ".$table." FOR EACH ROW EXECUTE PROCEDURE ".$f[3]."();\\n";
		$rs->moveNext();
	}

	// table rules
	$sql = "SELECT definition 
			FROM pg_rewrite, pg_class, pg_namespace, pg_rules
			WHERE ev_class = pg_class.oid
			   AND pg_rewrite.rulename = pg_rules.rulename
			   AND pg_rules.schemaname = '".$tbl[0]."'
			   AND pg_rules.tablename = '".$tbl[1]."'
			   AND pg_class.relnamespace = pg_namespace.oid
			   AND pg_namespace.oid IN (SELECT oid FROM pg_namespace WHERE nspname = '".$tbl[0]."')
			   AND pg_class.relname = '".$tbl[1]."'
			ORDER BY 1";
	$rs  = $db->execute($sql);
	$rsql = "";
	while ($rs && !$rs->EOF) {
		$f = $rs->fields;
		$rsql .= str_replace('"', '', str_replace('CREATE RULE', 'CREATE OR REPLACE RULE', $f[0]))."\\n";
		$rs->moveNext();
	}
	
	return Array($fseq, $fsql, $csql, $isql, $tsql, $rsql);
}
?>