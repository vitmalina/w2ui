<?
require("w2db.php");
require("w2lib.php");

$dbType = 'postgres';

$db = new dbConnection($dbType);
$db->connect("localhost", "postgres", "kkminsk78", "crm_demo");

// $sql = "CREATE TABLE public.demo_people(
// 	userid SERIAL,
// 	fname varchar(50),
// 	lname varchar(50),
// 	email varchar(50),
// 	manager varchar(50)
// )";
// $rs = $db->execute($sql);
// die();

// $fname = Array('Vitali', 'Katie', 'John', 'Peter', 'Sue', 'Olivia', 'Thomas', 'Sergei', 'Sue', 'Frank', 'Divia',
// 	'Amy', 'Bill', 'Thomas', 'Emma', 'Gloria', 'Jack', 'April', 'Rose');
// $lname = Array('Peterson', 'Rene', 'Johnson', 'Petrov', 'Sannikov', 'Ivanov', 'Smirnov', 'Cuban', 'Twist', 'Sidorov', 'Vasiliev', 'Homchan', 'Stalone',
// 	'Cruz', 'Mascovits', 'Welldo', 'Duck', 'Green', 'Silver', 'Behe', 'Gould');


// for ($i=1; $i<=1500; $i++) {
// 	$fname1 = $fname[rand(0, count($fname)-1)];
// 	$lname1 = $lname[rand(0, count($lname)-1)];
// 	$sql = "INSERT INTO demo_people (fname, lname, email, manager)
// 			VALUES('".$fname1."',
// 				   '".$lname1."',
// 				   '".strtolower(substr($fname1, 0, 1).$lname1)."@mail.com',
// 				   '".$lname[rand(0, count($lname)-1)]."')";
// 	$db->execute($sql);
// 	if ($i % 100 == 0) { print("*"); ob_flush(); flush(); }
// }
// die();

$req = json_decode($_REQUEST['request'], true);
switch ($req['cmd']) {

    case 'get':
	case 'get-records':
		$sql  = "SELECT * FROM (SELECT * FROM demo_people ORDER BY userid LIMIT 10000) as sub
				 WHERE ~search~ ORDER BY ~sort~";
		$res = $w2grid->getRecords($sql, null, $req);
        // $res["total"] = -1; // could be -1 if unknown
		$w2grid->outputJSON($res);
		break;

	default:
		$res = Array();
		$res['status']  = 'error';
		$res['message'] = 'Command "'.$req['cmd'].'" is not recognized.';
		$res['postData']= $req;
		$w2grid->outputJSON($res);
		break;
}

?>