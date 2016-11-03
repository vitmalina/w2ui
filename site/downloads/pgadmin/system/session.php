<?
/****************************************************************
*
*  This is session.php file, that needs to be included into security.php
*  It can possibly be included into other files to provide db sessions
*  capabilities.
*
*  -- REQUIRES security.php file before it
*
*****************************************************************/

function ses_read($sesid) {
    global $db, $dbPrefix;
	global $def_timeToLive;
	global $sys_stats; // object with statistics
	global $ses_data, $ses_userid, $ses_update;

	$SQL = "SELECT ses_data, ses_time2live, ses_userid, null,
				CASE WHEN now() + interval '5 minutes' > ses_expire THEN 'Y' ELSE 'N' END,
				CASE WHEN now() > ses_expire THEN 'Y' ELSE 'N' END
			FROM ".$dbPrefix."sys_session
			WHERE ses_id = '$sesid'";
    $rs = $db->execute($SQL);
	// read or initiate session
    if (!$rs || $rs->EOF || $rs->fields[5] == 'Y') {
    	$ret = '';
    	$sesTime2Live = isset($def_timeToLive) ? $def_timeToLive : 1200;
		if ($sys_stats->browserName == '- unknown =') $bname = '-- bot --'; else $bname = $sys_stats->browserName;
        $SQL = "DELETE FROM ".$dbPrefix."sys_session WHERE ses_expire < current_timestamp;
        	    INSERT INTO ".$dbPrefix."sys_session(ses_id, ses_data, ses_start, ses_expire,
        				ses_ip, ses_time2live, ses_browser, ses_host, ses_userid)
        	    VALUES('$sesid', '', now(), now() + interval '$sesTime2Live sec',
                	    '".$_SERVER["REMOTE_ADDR"]."', $sesTime2Live, '".$bname."',
                	    '".$_SERVER["HTTP_HOST"]."', ".($ses_userid != null ? $ses_userid : "NULL").")";
        $db->execute($SQL);
        $sys_stats->ses_initiated = true;
    } else {
        $ret = $rs->fields[0];
        $ses_data   = $ret;
        $ses_userid = $rs->fields[2];
        $ses_update = ($rs->fields[4] == 'Y' ? true : false);
		$sys_stats->ses_initiated = false;		
    }

    return $ret;
}

function ses_write($sesid, $sesdata) {
    global $db, $dbPrefix, $def_timeToLive;
	global $sys_stats; // object with statistics
	global $ses_data, $ses_userid, $ses_update;

	$sesTime2Live = isset($def_timeToLive) ? $def_timeToLive : 1200;
	if ($ses_update || $sesdata != $ses_data) {
	    if ($sys_stats->browser === false) {
	      $SQL = "UPDATE ".$dbPrefix."sys_session SET
	                  ses_data   = '$sesdata',
	                  ses_expire = current_timestamp + interval '$sesTime2Live sec',
	                  ses_userid = ".($ses_userid != null ? $ses_userid : "NULL")."
	              WHERE ses_browser = '".$sys_stats->browserName."'";
	    } else {
	      $SQL = "UPDATE ".$dbPrefix."sys_session SET
	                  ses_data   = '$sesdata',
	                  ses_expire = current_timestamp + interval '$sesTime2Live sec',
	                  ses_userid = ".($ses_userid != null ? $ses_userid : "NULL")."
	              WHERE ses_id = '$sesid'";
		}
	    if ($db) $db->execute($SQL);
	 	return $rs ? true : false;
	}
	return true; 
}

function ses_open($save_path, $session_name) {
    return true;
}

function ses_close() {
    global $db;
    return true;
}

function ses_destroy($sesid) {
    global $db, $dbPrefix;
    $SQL = "DELETE FROM ".$dbPrefix."sys_session WHERE ses_id = '$sesid'";
    $rs = $db->execute($SQL);

    return $rs ? true : false;
}

function ses_clean($maxLifeTime = null) {
    global $db, $dbPrefix;

    $SQL = "DELETE FROM ".$dbPrefix."sys_session WHERE ses_expire < current_timestamp";
    $rs = $db->execute($SQL);

    return $rs ? true : false;
}

// start session
if ($def_dbSession == true) {
	ini_set("session.bug_compat_warn", "0");
	session_module_name("user");
	session_set_save_handler("ses_open", "ses_close", "ses_read", "ses_write", "ses_destroy", "ses_clean");
}

if ($initSession !== 'no' && $initSession !== false) session_start();
?>