<?
// ================================================================================================
// -- This code only works on Apache servers.
// -- It checks if the requested file changed by last modification time taken from file system.
// -- If  it did not change, it sends a header to the browser that file did not change, and 
// -- the browser takes it from cache. Works with all browsers

$tmp_file = str_replace(".php", ".js", $_GET['page']);

if (file_exists($tmp_file) === true) {
	if (function_exists('apache_request_headers')) {
		$headers = apache_request_headers();
		$hash1 	 = $headers['If-None-Match'];
		$hash2   = filemtime($tmp_file);
		header("eTag:".$hash2);

		// -- file is the same as in browser cache
		if ($hash1 == $hash2) {
			header('HTTP/1.1 304 Not Modified');
			die();
		}
	}
	
	// -- output the file
	$sys_folder = str_replace("/libs/phpCache.php", "", str_replace("\\","/",__FILE__));
	$sys_path   = str_replace($_SERVER['DOCUMENT_ROOT'], '', $sys_folder);

	header("Content-type: text/javascript");
	
	print("var sys_path   = '$sys_path';\n");
	print("var sys_folder = '$sys_folder';\n\n");

	echo file_get_contents($tmp_file);
	
} else {
	// -- file does not exist
	header("HTTP/1.0 404 Not Found");
	header("Status: 404 Not Found");
	die();
}

?>