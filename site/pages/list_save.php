<?
$output  = false;
$outside = true;

require("../../dev/crm/system/security.php");
require("../../dev/crm/system/libs/phpDBLib.php");

$fname = addslashes($_POST['fname']);
$lname = addslashes($_POST['lname']);
$email = addslashes($_POST['email']);

if ($_POST['list'] == 1) {
	// check if already added
	$sql = "SELECT 1 FROM crm_dev.demo.list_w2ui WHERE email = '$email'";
	$rs  = $db->execute($sql);
	if ($rs->fields[0] == '1') die('<span style="color: red">Email "'.$email.'" is already on the list.</span>');
	// add email
	$sql = "INSERT INTO crm_dev.demo.list_w2ui(fname, lname, email) 
			VALUES ('$fname', '$lname', '$email')";
	$db->execute($sql);
	if ($db->res_errMsg == "") die('Your email "'.$email.'" is added to the w2ui mailing list.');
}

if ($_POST['list'] == 2) {
	// check if already added
	$sql = "SELECT 1 FROM crm_dev.demo.list_w2touch WHERE email = '$email'";
	$rs  = $db->execute($sql);
	if ($rs->fields[0] == '1') die('<span style="color: red">Email "'.$email.'" is already on the list.</span>');
	// add email
	$sql = "INSERT INTO crm_dev.demo.list_w2touch(fname, lname, email) 
			VALUES ('$fname', '$lname', '$email')";
	$db->execute($sql);
	if ($db->res_errMsg == "") die('Your email "'.$email.'" is added to the w2touch mailing list.');
}
?>