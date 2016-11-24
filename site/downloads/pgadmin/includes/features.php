<?
// -- enable/disabled some things based on postgres version

$sql = "SHOW server_version";
$rs  = $db->execute($sql);
$db_version = $rs->fields[0];

// -- PostgreSQL features
$features = Array();

// -- super user
$sql = "SELECT 1 FROM pg_shadow";
$rs  = $db->execute($sql);
if (!$rs) $features[super_user] = 0; else $features[super_user] = 1;

// -- connection limit
if (version_compare($db_version, '8.0.0', '<')) $features[conn_limit] 	= 0; else $features[conn_limit] 	= 1;
if (version_compare($db_version, '8.0.0', '<')) $features[table_space] 	= 0; else $features[table_space] 	= 1;
if (version_compare($db_version, '8.0.0', '<')) $features[set_category] = 0; else $features[set_category] 	= 1;
if (version_compare($db_version, '8.0.0', '<')) $features[set_desc] 	= 0; else $features[set_desc] 		= 1;
if (version_compare($db_version, '8.4.0', '>='))$features[has_triggers] = 1; else $features[has_triggers] 	= 0;

?>