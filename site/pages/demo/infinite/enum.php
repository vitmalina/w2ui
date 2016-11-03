<?
require("w2db.php");
require("w2lib.php");

$dbType = 'postgres';

$db = new dbConnection($dbType);
$db->connect("localhost", "postgres", "kkminsk78", "crm_demo");

$fname = $_REQUEST['search'];
$lname = $_REQUEST['search'];

if (strpos($_REQUEST['search'], ' ') > 0) {
	$tmp = split(' ', $_REQUEST['search']);
	$fname = $tmp[0];
	$lname = $tmp[1];	
}

// pull data from database
$sql = "SELECT * FROM (SELECT * FROM demo_people ORDER BY userid LIMIT 10000) as sub
		WHERE lname ILIKE '{$lname}%' OR fname ILIKE '{$fname}%' ORDER BY lname";
$res = $w2grid->getItems($sql);
foreach ($res['items'] as $key => $value) {
	$res['items'][$key]['text'] = $res['items'][$key]['fname'] . ' ' . $res['items'][$key]['lname'];
}
$w2grid->outputJSON($res);
?>