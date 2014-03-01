<?php

require("w2db.php");
require("w2lib.php");

$db = new dbConnection("mysql");
$db->connect("127.0.0.1", "root", "", "test", "3306");

switch ($_REQUEST['name']."::".$_REQUEST['cmd']) {

	case 'users::get-records':
		$sql  = "SELECT * FROM users
				 WHERE ~search~ ORDER BY ~sort~";
		$res = $w2grid->getRecords($sql, null, $_REQUEST);
		$w2grid->outputJSON($res);
		break;

	case 'users::delete-records':
		$res = $w2grid->deleteRecords("users", "userid", $_REQUEST);
		$w2grid->outputJSON($res);
		break;

	case 'user_edit::get-record':
		$sql = "SELECT userid, fname, lname, email, login, password
				FROM users 
				WHERE userid = ".$_REQUEST['recid'];
		$res = $w2grid->getRecord($sql);
		$w2grid->outputJSON($res);
		break;

	case 'user_edit::save-record':
		$res = $w2grid->saveRecord('users', 'userid', $_REQUEST);
		$w2grid->outputJSON($res);
		break;

	default:
		$res = Array();
		$res['status']  = 'error';
		$res['message'] = 'Command "'.$_REQUEST['cmd'].'" is not recognized.';
		$res['postData']= $_REQUEST;
		$w2grid->outputJSON($res);
		break;
}
