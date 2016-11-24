<?
/****************************************************************
*
*  This is security.php file, that needs to be included into
*  all pages written for the system
* 
*  -- PREPROCESS VARIABLES
*   $outsite 			= false; -- if true, it will not forward to the login page
*   $output  			= true;  -- if false, will not output any HTML 
*   $outputCloseHead 	= true   -- if false, the header tag will not be closed
*   $title   			= '';    -- tilte of the page for the browser
*   $initSecurity 		= true   -- if false, then security will not be initializaed
*   $initSession 		= true   -- if false, then sesssion will not be autostarted
*
*****************************************************************/

import_request_variables('GP');

// system db
$db = null;

// session global variables 
$ses_update 	  = false;
$ses_data   	  = '';
$ses_userid 	  = '';

// system variables
$sys_folder 	  = str_replace("/security.php", "", str_replace("\\","/",__FILE__));
$sys_path  	 	  = substr($sys_folder, strlen($_SERVER["DOCUMENT_ROOT"]));

require_once($sys_folder."/../conf.php");
if ($def_dbInit === true) require_once($sys_folder."/libs/phpDB.php");

class phpSecurity {
	// public properties
	public $time_start;
	public $time_end;
	public $time_total;
	// stats
    var $browser     	= false;
    var $browserName 	= "-unknown-";

	function __construct() {
		global $db, $sys_folder, $sys_path, $def_dbSession, $def_dbInit;
		global $sys_dbType, $sys_dbIP, $sys_dbLogin, $sys_dbPass, $sys_dbName, $sys_dbPrefix;
		global $initSession;
		
	    // page start time
	    list($usec, $sec) = explode(" ", microtime());
	    $this->time_start = (float)$usec + (float)$sec;
		
		// system database
		if ($def_dbInit === true) {
			$db = new phpDBConnection($sys_dbType);
			$db->connect($sys_dbIP, $sys_dbLogin, $sys_dbPass, $sys_dbName);
		}
		
		// db session, if any
		if ($def_dbSession == true) {
			require_once($sys_folder."/session.php");
		} else {
			if ($initSession !== 'no' && $initSession !== false) session_start();
		}
		
		$this->getBrowserName();
	}
	
	function __destruct() {		
		global $ses_update;
	    // time variable for page processing
        list($usec, $sec) = explode(" ", microtime());
        $this->time_end   = (float)$usec + (float)$sec;
        $this->time_total = round(((float)$this->time_end - (float)$this->time_start) * 1000)/1000;
		// save slow pages
		$this->saveSlowHit($this->time_total);
		// close the session	
		session_write_close();
	}

	function start() {
		global $title, $def_css, $def_encoding;
		global $sys_path, $sys_folder;
		global $output, $outside;
		global $sys_home;
		if ($sys_home != '') $_SESSION['sys_home'] = $sys_home;
		if ($outside !== true && $_SESSION['ses_userid'] == "" && $_SESSION['cp_userid'] == "") {
			print("// <!-- \n".
				  "top.location = '$sys_path/login.php?r=".$_SESSION['sys_home']."';\n".
				  "// -->".
				  "<script> top.location = '$sys_path/login.php?r=".$_SESSION['sys_home']."'; </script>");
			die();
		}
		// start output if needed
		if ($output !== 'no' && $output !== false) {
			print("<html>\n");
			print("<head>\n");
		    print("   <title>$title</title>\n");
			foreach($def_css as $k => $v) {
				print("   <link rel=\"stylesheet\" href=\"$sys_path/images/$v\" type=\"text/css\" />\n");
			}
			print("   <meta http-equiv=\"Content-Type\" content=\"$def_encoding\" />\n");
			if ($outputCloseHeader !== false) print("</head>\n");
		}
	}
	
	function saveSlowHit($PProcessTime) {
    	global $sys_dbPrefix;
		global $ses_userid;
		
		if ($PProcessTime < 0) $PProcessTime = "null";
		$userid    = ($ses_userid != null ? $ses_userid : 'null');
		// if time is over 3 seconds, record it inslow
		if ($PProcessTime > 3) {
			$sql = "INSERT INTO ".$sys_dbPrefix."log_slow(domain, url, render, userid)
					VALUES('".$_SERVER["HTTP_HOST"]."', '".$_SERVER["REQUEST_URI"]."', $PProcessTime, $userid);";
			$this->db->execute($sql);	
		}
	}
	
	function getBrowserName() {
	    $agent = strtoupper(trim($_SERVER["HTTP_USER_AGENT"]));
		$found = false;
		$browserName = $this->browserName;
	    if (!$found && strpos("-".$agent, " MSIE") > 0) 	{ $found = true; $browserName = 'IE'; }
	    if (!$found && strpos("-".$agent, "FIREFOX") > 0)   { $found = true; $browserName = 'Firefox'; }
	    if (!$found && strpos("-".$agent, "OPERA") > 0)     { $found = true; $browserName = 'Opera'; }
	    if (!$found && strpos("-".$agent, "CHROME") > 0)    { $found = true; $browserName = 'Chrome'; }
	    if (!$found && strpos("-".$agent, "SAFARI") > 0)    { $found = true; $browserName = 'Safari'; }
	    if (!$found && strpos("-".$agent, "NETSCAPE") > 0)  { $found = true; $browserName = 'Netscape'; }
	    if (!$found && strpos("-".$agent, "KONQUEROR") > 0) { $found = true; $browserName = 'Konqueror'; }
	    if (!$found && strpos("-".$agent, "GECKO") > 0)     { $found = true; $browserName = 'Gecko'; }	
		if ($found) $this->browser = true;
		$this->browserName = $browserName;
		return $browserName;
	}
	
	function readKey($keyName) {
		global $sys_dbPrefix;
		$sql = "SELECT key_data FROM ".$sys_dbPrefix."sys_params WHERE key_name = '$keyName'";
		$rs  = $this->sys_db->execute($sql);
		return $rs->fields[0];
	}
	
	function updateKey($keyName, $keyData, $hidden=false) {
		global $sys_dbPrefix;
		$sql = "SELECT paramid FROM ".$sys_dbPrefix."sys_params WHERE key_name = '$keyName'";
		$rs  = $this->sys_db->execute($sql);
		if ($rs && !$rs->EOF && $rs->fields[0] != '') { // key exists
			$sql = "UPDATE ".$sys_dbPrefix."sys_params SET key_data = '".addslashes($keyData)."', key_hidden = '".($hidden ? 't' : 'f')."'
					WHERE paramid = ".$rs->fields[0];
		} else { // key doesn't exist
			$sql = "INSERT INTO ".$sys_dbPrefix."sys_params(key_name, key_data, key_hidden)
					VALUES ('$keyName', '".addslashes($keyData)."', '".($hidden ? 't' : 'f')."')";
		}
		$this->sys_db->execute($sql);
	}
}

// --- start security

$security = new phpSecurity();
if ($initSecurity !== false) $security->start();

?>