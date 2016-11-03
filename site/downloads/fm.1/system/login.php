<?
/********************************************************
*
* -- This is a login form. You can either pass user name and pass here, or
*    it will ask for them. If it is passed, it will be logged in automaticly.
* -- Parameters it expects
*    - $login
*    - $password
*    - $url_error
*    - $url_success
*
********************************************************/

$output  = false;
$outside = true;
require("security.php");

if ($def_dbInit == true) {
	$sql = "SELECT key_data FROM ".$sys_dbPrefix."sys_params WHERE key_name = 'crm_login_image'";
	$rs  = $db->execute($sql);
	$login_image = $rs->fields[0];
} else {
	$login_image = $def_login_image;
}

if ($_GET['r'] != '') $url_success = $_GET['r'];
$error   = "";
$cportal = strpos($_GET['r'], '/cportal') !== false ? true : false;
$login   = addslashes($_POST['login']);
$pass    = addslashes($_POST['pass']);

// --- regular login
if ($login != "" && $pass != "" && $cportal === false) {	
	if ($def_dbInit == true) {
		// find user
		$sql = "SELECT userid FROM ".$sys_dbPrefix."sys_users WHERE login ILIKE '$login'";
		$rs  = $db->execute($sql);
		if ($rs & !$rs->EOF) $try_user = $rs->fields[0];
		// try to login.
		$sql = "SELECT userid, fname, lname, email, 
					CASE WHEN superuser THEN 'yes' ELSE '' END
				FROM ".$sys_dbPrefix."sys_users
				WHERE login ILIKE '$login' 
					AND (expires IS NULL OR expires >= current_date)
					AND (password = '$pass' OR password = MD5('$pass'))";
		$rs  = $db->execute($sql);
		
		if ($rs && !$rs->EOF) { // success
			// init session
			$_SESSION['ses_login']  	= $login;
			$_SESSION['ses_userid'] 	= $rs->fields[0];
			$_SESSION['ses_fname']  	= $rs->fields[1];
			$_SESSION['ses_lname']  	= $rs->fields[2];
			$_SESSION['ses_email']  	= $rs->fields[3];
			$_SESSION['ses_superuser']  = $rs->fields[4];
			
			// get user groups
			if ($rs->fields[5] == 'yes') {
				$sql = "SELECT DISTINCT groupid FROM ".$sys_dbPrefix."sys_groups ORDER BY groupid";
			} else {
				$sql = "SELECT DISTINCT groupid FROM ".$sys_dbPrefix."sys_user_groups
						WHERE userid = ".$rs->fields[0]." ORDER BY groupid";
			}
			$rss = $db->execute($sql);
			$user_groups = "";
			while ($rss && !$rss->EOF) {
				if ($user_groups != '') $user_groups .= ",";
				$user_groups .= $rss->fields[0];
				$rss->moveNext();
			}
			$_SESSION['ses_groups']  = $user_groups;
			
			// get user roles
			if ($rs->fields[5] == 'yes') {
				$sql = "SELECT DISTINCT roleid FROM ".$sys_dbPrefix."sys_roles ORDER BY roleid";
			} else {
				$sql = "SELECT DISTINCT roleid FROM ".$sys_dbPrefix."sys_user_roles 
						WHERE userid = ".$rs->fields[0]." ORDER BY roleid";
			}
			$rss = $db->execute($sql);
			$user_roles = "";
			while ($rss && !$rss->EOF) {
				if ($user_roles != '') $user_roles .= ",";
				$user_roles .= $rss->fields[0];
				$rss->moveNext();
			}
			$_SESSION['ses_roles']  = $user_roles;
			
			// update session
			$ses_userid	= $rs->fields[0];
			$ses_update = true;
			
			if (trim($url_success) == '') $url_success = '../index.php';
			saveLoginLog(true);
			header("Location: $url_success");
			die();
		} else { // cannot login
			$error = "Incorrect Login and/or Password";
			if ($url_error != "") {
				if (strpos($url_error, "?") > 0) $tmp_char = "?"; else $tmp_char = "&";
				$tmp_url = $url_error.$tmp_char."error=".$error;
				saveLoginLog(false);
				Header("Location: $tmp_url");
				die();
			}
			saveLoginLog(false);
			showLoginForm($error);
		}
	} else {
		if (strtolower($def_users[strtolower($login)]) == strtolower($pass)) {
			// init session
			$_SESSION['ses_login']  	= $login;
			$_SESSION['ses_userid'] 	= 1;
			$_SESSION['ses_superuser']  = '';
			$_SESSION['ses_groups']  	= '';
			$_SESSION['ses_roles']  	= '';
			
			header("Location: $url_success");
			die();
		} else {
			$error = "Incorrect Login and/or Password";
			if ($url_error != "") {
				if (strpos($url_error, "?") > 0) $tmp_char = "?"; else $tmp_char = "&";
				$tmp_url = $url_error.$tmp_char."error=".$error;
				Header("Location: $tmp_url");
				die();
			}
			showLoginForm($error);
		}
	}
	die();
}

// --- customer portal login
if ($login != "" && $pass != "" && $cportal === true) {	
	// find user
	$sql = "SELECT cp_userid FROM crm.cp_users WHERE login ILIKE '$login'";
	$rs  = $db->execute($sql);
	if ($rs & !$rs->EOF) $try_user = $rs->fields[0];
	// try to login.
	$sql = "SELECT cp_userid, custid, orgid, first_name, last_name, 
				CASE WHEN org_superuser THEN 'yes' ELSE '' END,
				accexec_userid
			FROM crm.cp_users INNER JOIN crm.customers USING(custid)
			WHERE login ILIKE '$login' 
				AND (expires IS NULL OR expires >= current_date)
				AND (password = '$pass' OR password = MD5('$pass'))";
	$rs  = $db->execute($sql);

	if ($rs && !$rs->EOF) { // success
		// init session
		$_SESSION['cp_login']  		= $login;
		$_SESSION['cp_userid'] 		= $rs->fields[0];
		$_SESSION['cp_custid'] 		= $rs->fields[1];
		$_SESSION['cp_orgid'] 		= $rs->fields[2];
		$_SESSION['cp_fname']  		= $rs->fields[3];
		$_SESSION['cp_lname']  		= $rs->fields[4];
		$_SESSION['cp_superuser']   = $rs->fields[5];
		$_SESSION['cp_accexec']     = $rs->fields[6];
				
		// get modules
		$sql = "SELECT mod_code, block_code FROM crm.cp_access
				WHERE cp_userid = ".$rs->fields[0]." ORDER BY mod_code";
		$rss = $db->execute($sql);
		$cp_modules = Array();
		while ($rss && !$rss->EOF) {
			$cp_modules[$rss->fields[0]] = $rss->fields[1];
			$rss->moveNext();
		}
		$_SESSION['cp_modules']  = $cp_modules;
		
		// update session
		$ses_update = true;
		
		if (trim($url_success) == '') $url_success = '../index.php';
		saveLoginLog(true);
		header("Location: $url_success");
		die();
	} else { // cannot login
		$error = "Incorrect Login and/or Password";
		if ($url_error != "") {
			if (strpos($url_error, "?") > 0) $tmp_char = "?"; else $tmp_char = "&";
			$tmp_url = $url_error.$tmp_char."error=".$error;
			saveLoginLog(false);
			Header("Location: $tmp_url");
		}
		saveLoginLog(false);
		showLoginForm($error);
	}
	die();
}

showLoginForm(); 

function saveLoginLog($status) {
	global $security, $sys_stats, $sys_dbPrefix;
	global $login, $ses_userid;
	global $try_user, $cportal;
	
	if ($def_dbInit !== true) return;
	
	$userid = ($try_user ? $try_user: 'null');
	$status = ($status ? "'t'" : "'f'");
	
	$sql = "INSERT INTO ".$sys_dbPrefix."log_login(login_ip, login_login, login_result, userid, browser, cportal)
			VALUES('".$_SERVER["REMOTE_ADDR"]."', '".addslashes($login)."', $status, $userid, '".$sys_stats->browserName."', ".($cportal ? 'true' : 'NULL').")";
	$security->sys_db->execute($sql);
}

function showLoginForm($error='') {	
	global $url_error, $url_success;
	global $login_image;
	global $sys_folder, $sys_path;
	
	if ($url_success == "") {
		$url_success = "../index.php";
	}
	$isIE = stripos($_SERVER["HTTP_USER_AGENT"], "Trident") > 0 ? true : false;
	
	//$login_image = "/dev/crm/images/pie_64x64.png";
	print("
		<html lang=\"en\">
		<head>
	    <meta name=\"application-name\" content=\"Web 2.0 CRM\"/>
	    <meta name=\"description\" content=\"Web 2.0 Customer Relations Manager\"/>
	    <link rel=\"icon\" href=\"../images/pie_48x48.png\" sizes=\"48x48\"/>
	    <link rel=\"icon\" href=\"../images/favicon.ico\"/>
		<title>Login</title>
		<style>
			table { font-family: verdana; font-size: 11px; }
			input { font-family: verdana; font-size: 11px; }
			#login_tbl {
				z-Index: 1000; 
				position: absolute; 
				border: 1px solid silver; 
				background: #ecf3f9; 
				border-radius: 5px; 
				-moz-border-radius: 5px; 
				-webkit-border-radius: 5px;
				box-shadow: 1px 1px 20px #ddd; 
				-moz-box-shadow: 1px 1px 20px #ddd;
				-webkit-box-shadow: 1px 1px 20px #ddd; 
			}
		</style>
		</head>
		<!-- 
			http://i32.photobucket.com/albums/d3/Devil044/VegasStrip.jpg
			http://img5.imageshack.us/img5/979/1280x1024background.png
			http://lh3.ggpht.com/_fxkujw2mA9U/TBBheM1m3yI/AAAAAAAAAPs/uKFlfn704Q8/e365/y_a_b_02.jpg
			http://lh6.ggpht.com/_fxkujw2mA9U/TAhwYa3EGlI/AAAAAAAAAIo/Wi7XY2Bxgrc/05_natgeo_10.jpg
			http://lh6.ggpht.com/_MhpT8rS2lx0/SgUI4fyXFWI/AAAAAAAAPKA/t50gchXqINY/4c686e9344f01deab89ba%2526690.jpg
		-->
		<body style=\"background-image: url(images/login_bg.png);\">
		<br>
		<table style='width: 100%'><tr><td align=center>
			".($login_image != "" ? "<img src=\"$login_image\"><br><br>" : "<br><br><br><br><br>")."
			".($error != "" ? "<div style='width: 300px; font-size: 12px; color: red; border: 1px solid #facd44; margin: 5px; padding: 5px; border-radius: 5px; -moz-border-radius: 5px; background-color: #ffedb6;'>$error</span></div><br><br>" : "<br><br><br>")."
			<div style='width: 300px; height: 220px; ".($isIE ? "margin-left: -300px;" : "")."'>
			<form method='post'>
				<input type=hidden name=url_error   value='$url_error'>
				<input type=hidden name=url_success value='$url_success'>
				<table id='login_tbl'><tr><td>
					<table cellspacing=4 cellpadding=3 style='margin: 10px'>
					<tr>
						<td style='padding-bottom: 10px;'> 
							<span style='color: #999; font-weight: bold;'>User Name</span> 
							<div style='height: 5px; font-size: 1px;'>&nbsp;</div> 
							<input type=text id=\"login\" name=\"login\" size=25 style=\"padding: 3px; height: 30px; border: 1px solid silver; font-size: 18px\"> 
						</td>
					</tr><tr>
						<td> 
							<span style='color: #999; font-weight: bold;'>Password</span> 
							<div style='height: 5px; font-size: 1px;'>&nbsp;</div> 
							<input type=password id=\"pass\" name=\"pass\" size=25 style=\"padding: 3px; height: 30px; border: 1px solid silver; font-size: 18px\"> 
						</td>
					</tr><tr>
						<td></td>
					</tr><tr>
						<td style='padding-bottom: 0px;' align=center> 
							<input type=submit value=\"Login\" style=\"padding: 4px; padding-left: 15px; padding-right: 15px; font-size: 14px\"> 
						</td>
					</tr>
				</table>
				</td></tr></table>
			</form>
			</div>
			".($isIE ? "<br><br><span style='color: 4e733b; font-size: 11px; font-family: verdana'>For a better user experience, please use <b>FireFox</b> or <b>Google Chrome</b> browser.</span>" : "")."
		</td></tr></table>
		
		</body>
		<script src='$sys_path/libs/jsUtils.php'></script>
		<script> 
			window.onload   = pload;
			window.onresize = resize;
			function pload() {
				document.getElementById('login').focus(); 
				//top.jsUtils.dropShadow(document.getElementById('login_tbl'), true);
			}
			function resize() {
				//top.jsUtils.clearShadow(document.getElementById('login_tbl'));
				//top.jsUtils.dropShadow(document.getElementById('login_tbl'), true);
			}
		</script>
		</html>
	");
}
?>