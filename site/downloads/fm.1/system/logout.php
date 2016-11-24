<?
/********************************************************
*
* -- This is a logout form.
* -- Parameters it expects
*    - $url_success
*
********************************************************/

$output  = false;
require("security.php");

// clear session data
$sys_home   = $_SESSION['sys_home'];
if ($_GET['r'] != '') $sys_home = $_GET['r'];
$_SESSION   = Array();
$ses_userid = null;
$ses_update = true;

if ($url_success) {
	header("Location: $url_success");
} else {
	header("Location: login.php?r=$sys_home"); 
}
?>