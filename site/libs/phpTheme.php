<?
/***********************************************************************************
*   Class: phpTheme
*   This class helps you separate the design from the program login.
*/

require("conf.php");
require("phpDB.php");
require("phpPlugin.php");

// system database
$db = new phpDBConnection($db_type);
$db->connect($db_ip, $db_user, $db_pass, $db_name, $db_port);

class phpTheme {

	// -- Public Properties

	public $db;
	public $vars 	= Array();
	public $errors 	= Array();

	public $redirVisit = true;
	public $saveVisit  = true;
	public $browser;
	public $browserName;

	// -- Constructor / Descructor

	public function __construct() {
		global $sys_dbPrefix;
		global $db;

		$this->db = $db;
		$browser  = $this->getBrowserName();

		// $redirect = "";
		// if ($this->redirVisit) {
		// 	$redir_from = trim(strtolower($_SERVER['REQUEST_URI']));
		// 	while (substr($redir_from, strlen($redir_from)-1, 1) == '/') $redir_from = substr($redir_from, 0, strlen($redir_from)-1);
		// 	$sql = "SELECT redir_to FROM ".$sys_dbPrefix."ws_redirects
		// 			WHERE LOWER(redir_from) = '$redir_from'";
		// 	$rs  = $db->execute($sql);
		// 	if ($rs->fields[0] != '') {
		// 		$redirect = $rs->fields[0];
		// 	}
		// }

		// -- save visit into the table visits
		// if ($_COOKIE['trkvis'] != @date('m/d/Y') && $this->saveVisit) {
		// 	$sql = "SELECT 1 FROM ".$sys_dbPrefix."ws_visits
		// 			WHERE visit_date = current_date AND visit_ip = '".$_SERVER['REMOTE_ADDR']."'";
		// 	$rs  = $db->execute($sql);
		// 	if ($rs->fields[0] != '1') {
		// 		if (strlen($_SERVER['REQUEST_URI'])  > 200) $_SERVER['REQUEST_URI']  = substr($_SERVER['REQUEST_URI'], 200);
		// 		$sql = "INSERT INTO ".$sys_dbPrefix."ws_visits(visit_ip, browser, redirect, entry_url)
		// 				VALUES ('".$_SERVER['REMOTE_ADDR']."', '$browser', '$redirect', '".addslashes($_SERVER['REQUEST_URI'])."')";
		// 		$rs  = $db->execute($sql);
		// 	}
		// 	setcookie("trkvis", @date('m/d/Y'), 0, "/"); // set cookie (lasts until browser is open)
		// }

		// -- check if headers save
		if ($redirect != "") {
			if (!headers_sent()) {
				setcookie("trkredir", addslashes($_SERVER['REQUEST_URI']), time() + 60*60*24*30, "/"); // set cookie (lasts 30 days)
				header("Location: ".$redirect);
				die();
			} else {
				die("<script> window.location = '$redirect'; </script>");
			}
		}
	}

	public function __descruct() {
	}

	// =================================================
	// ------- PUBLIC FUNCTIONS

	public function assign($varName, $varValue) {
		$this->vars[strtoupper($varName)] = $varValue;
	}

	public function append($varName, $varValue) {
		$this->vars[strtoupper($varName)] .= $varValue;
	}

	public function display($themeFile) {
		$html = $this->process($themeFile);
		if (count($this->errors) > 0) {
			$this->showErrors();
			return false;
		}
		print($html);
		return true;
	}

	public function includeFile($file) {
		ob_start();
		require($file);
		$html = ob_get_clean();
		return $html;
	}

	public function showErrors() {
		print("<ul class=\"errors\">");
		for ($i=0; $i<count($this->errors); $i++) {
			print("<li>".$this->errors[$i]."</li");
		}
		print("</ul>");
	}

	// =================================================
	// ------- FUNCTIONS USED INTERNALLY

	public function process($themeFile) {
		// -- init vars
		$this->errors = Array();

		// -- check if file exists
		if (!file_exists($themeFile)) {
			$this->errors[] = "Theme file \"$themeFile\" does not exists.";
			return $false;
		}

		// -- get file contents
		$file = file_get_contents($themeFile);
		$vars = $this->parse($themeFile);

		// -- process all vars
		$html = "";
		$pos1 = 0;
		foreach ($vars as $k => $v) {
			$value = "";
			if ($v['type'] == 'HEAD' || $v['type'] == 'FOOT') {
				$value = $v['value'];
				if (isset($this->vars[$v['type']])) $value = $this->vars[$v['type']];
			}
			if ($v['type'] == 'VAR') {
				$value = $v['value'];
				if (isset($this->vars[$v['name']])) $value = $this->vars[$v['name']];
			}
			if ($v['type'] == 'PLUGIN') {
				require("plugins/".strtolower($v['name'])."/plugin.php");
				$value = $plugins[strtolower($v['name'])]->render( Array($v['param1'], $v['param2'], $v['param3']) );
			}
			$html .= substr($file, $pos1, $v['pos_start']-$pos1).$value;
			$pos1 = $v['pos_stop'];
		}

		return $html;
	}

	public function parse($themeFile) {
		// -- read the file
		if (!file_exists($themeFile)) {
			return "Theme file \"$themeFile\" does not exists.";
		}
		$page = file_get_contents($themeFile);

		// --- Go thru all comments
		$vars = Array();
		$pos1 = strpos($page, '<!--');
		while ($pos1 !== false) {
			$var = Array();
			$pos2 = strpos($page, '-->', $pos1);
			$str  = trim(substr($page, $pos1+4, $pos2-$pos1-4));
			$tmp  = explode(':', $str);
			$var['type'] 		= strtoupper($tmp[0]);
			$var['name']		= strtoupper($tmp[1]);
			$var['param1']		= $tmp[2];
			$var['param2']		= $tmp[3];
			$var['param3']		= $tmp[4];
			$var['pos_start'] 	= $pos1;
			$var['pos_stop']  	= $pos2 + 3;
			$var['value'] 		= '';
			// -- find END tag if any
			$pos3 = strpos($page, '<!--', $pos2);
			if ($pos3 !== false) {
				$pos4 = strpos($page, '-->', $pos3);
				$str2 = trim(substr($page, $pos3+4, $pos4-$pos3-4));
				if (strtoupper($str2) == 'END') {
					$var['value'] = substr($page, $pos2+3, $pos3-$pos2-3);
					$var['pos_stop']  = $pos4 + 3;
					$pos2 = $pos4;
				}
			}
			$vars[] = $var;
			// -- check for end
			$pos1 = strpos($page, '<!--', $pos2);
		}
		return $vars;
	}

	public function getBrowserName() {
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

}
?>