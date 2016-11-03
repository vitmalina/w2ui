<?
$headers = apache_request_headers();
$hash1 	 = $headers['If-None-Match'];
$hash2   = filemtime($_SERVER['SCRIPT_FILENAME']);
header("eTag:".$hash2);
if ($hash1 == $hash2) {
	header('HTTP/1.1 304 Not Modified');
	die();
}
?>