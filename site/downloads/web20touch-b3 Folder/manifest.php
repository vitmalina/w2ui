<?
header("Content-Type: text/cache-manifest");
$hash = "";
$data = "CACHE MANIFEST\n";

// read all files and their hashes
$dir = new RecursiveDirectoryIterator(".");
foreach(new RecursiveIteratorIterator($dir) as $file) {
	if ($file->IsFile() && $file != "./manifest.php" && substr($file->getFileName(), 0, 1) != ".") $data .= $file."\n";
	$hash .= md5_file($file);
}

// if any file changed, then manifest should be reloaded
print($data."# hash: ".md5($hash));
?>