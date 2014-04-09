<?php
/**************************************************
*	This class helps streamline w2ui requests
* 
*	Global Variables (it is assumed that there are several global variables)
*	- $db - connection to the database
* 	- $dbType - type of the db, can be mysql or postgres
*/

$w2grid = new w2grid_class();

class w2grid_class {
	// constructor/destructor
	public function __construct() {}
	public function __destruct() {}

	public function getRecords($sql, $cql, $request) {
		global $db, $dbType;

		// prepare search
		$str = "";
		if (isset($request['search']) && is_array($request['search'])) {
			foreach ($request['search'] as $s => $search) {
				if ($str != "") $str .= " ".$request['search-logic']." ";
				$operator = "=";
				$field 	  = $search['field'];
				$value    = "'".$search['value']."'";
				switch (strtolower($search['operator'])) {

					case 'begins':
						$operator = ($dbType == "postgres" ? "ILIKE" : "LIKE");
						$value 	  = "'".$search['value']."%'";
						break;

					case 'ends':
						$operator = ($dbType == "postgres" ? "ILIKE" : "LIKE");
						$value 	  = "'%".$search['value']."'";
						break;

					case 'contains':
						$operator = ($dbType == "postgres" ? "ILIKE" : "LIKE");
						$value 	  = "'%".$search['value']."%'";
						break;

					case 'is':
						$operator = "=";
						if (!is_int($search['value']) && !is_float($search['value'])) {
							$field = "LOWER($field)";
							$value = "LOWER('".$search['value']."')";
						} else {
							$value = "'".$search['value']."'";
						}
						break;

					case 'between':
						$operator = "BETWEEN";
						$value 	  = "'".$search['value'][0]."' AND '".$search['value'][1]."'";
						break;

					case 'in':
						$operator = "IN";
						$value 	  = "[".$search['value']."]";
						break;
				}
				$str .= $field." ".$operator." ".$value;
			}
		}
		if ($str == "") $str = " 1=1 ";

		// prepare sort
		$str2 = "";
		if (isset($request['sort']) && is_array($request['sort'])) {
			foreach ($request['sort'] as $s => $sort) {
				if ($str2 != "") $str2 .= ", ";
				$str2 .= $sort['field']." ".$sort['direction'];
			}
		}
		if ($str2 == "") $str2 = "1=1";

		// build sql
		$sql = str_ireplace("~search~", $str, $sql);
		$sql = str_ireplace("~order~", "~sort~", $sql);
		$sql = str_ireplace("~sort~", $str2, $sql);

		// build cql (for counging)
		if ($cql == null || $cql == "") {
			$cql = "SELECT count(1) FROM ($sql) as grid_list_1";
		}
		if (!isset($request['limit']))  $request['limit']  = 50;
		if (!isset($request['offset'])) $request['offset'] = 0;

		$sql .= " LIMIT ".$request['limit']." OFFSET ".$request['offset'];

		$data = Array();		

		// count records
		$rs = $db->execute($cql);
		$data['status'] = 'success';
		$data['total']  = $rs->fields[0];

		// execute sql
		$rs = $db->execute($sql);
		//print($sql);

		// check for error
		if ($db->res_errMsg != '') {
			$data = Array();
			$data['status'] = 'error';
			$data['message'] = $db->res_errMsg;
			return $data;
		}
		$data['records'] = array();

		$len = 0;
		while($rs && !$rs->EOF) {
			$data['records'][$len] = Array();
			$data['records'][$len]['recid'] = $rs->fields[0];
			foreach ($rs->fields as $k => $v) {
				if (intval($k) > 0 || $k == "0") continue;
				$data['records'][$len][$k] = $v;
			}
			$len++;
			$rs->moveNext();
		}
		return $data;
	}

	public function deleteRecords($table, $keyField, $data) {
		global $db;
		$res = Array();

		$recs = "";
		foreach ($data['selected'] as $k => $v) {
			if ($recs != "") $recs .= ", ";
			$recs .= "'".addslashes($v)."'";
		}
		$sql = "DELETE FROM $table WHERE $keyField IN ($recs)";
		$rs = $db->execute($sql);
		// check for error
		if ($db->res_errMsg != '') {
			$res['status'] = 'error';
			$res['message'] = $db->res_errMsg;
			return $res;
		}
		$res['status']  = 'success';
		$res['message'] = '';
		return $res;
	}

	public function getRecord($sql) {
		global $db;
		$data = Array();

		// execute sql
		$rs = $db->execute($sql);
		// check for error
		if ($db->res_errMsg != '') {
			$data = Array();
			$data['status'] = 'error';
			$data['message'] = $db->res_errMsg;
			return $data;
		}

		$data['status'] = 'success';
		$data['record']	= Array();
		while ($rs && !$rs->EOF) {
			foreach ($rs->fields as $k => $v) {
				if (intval($k) > 0 || $k == "0") continue;
				$data['record'][$k] = $v;
			}
			break;
		}
		return $data;
	}

	public function saveRecord($table, $keyField, $data) {
		global $db;

		if ($data['recid'] == '' || $data['recid'] == '0') {
			$fields = "";
			$values = "";
			foreach ($data['record'] as $k => $v) {
				if ($k == $keyField) continue; // key field should not be here
				if ($fields != '') $fields .= ", ";
				if ($values != '') $values .= ", ";
				$fields .= addslashes($k);
				if (substr($v, 0, 2) == "__") {
					$values .= addslashes(substr($v, 2));
				} else {
					$values .= ($v == "" ? "null" : "'".addslashes($v)."'");
				}
			}
			$sql = "INSERT INTO $table($fields) VALUES($values)";
		} else {
			$values = "";
			foreach ($data['record'] as $k => $v) {
				if ($k == $keyField) continue; // key field should not be here
				if ($values != '') $values .= ", ";
				if (substr($v, 0, 2) == "__") {
					$values .= addslashes($k)." = ".addslashes(substr($v, 2));
				} else {
					$values .= addslashes($k)." = ".($v == "" ? "null" : "'".addslashes($v)."'");
				}
			}
			$sql = "UPDATE $table SET $values WHERE $keyField = ".addslashes($data['recid']);
		}
		// execute sql
		$rs = $db->execute($sql);
		// check for error
		if ($db->res_errMsg != '') {
			$res = Array();
			$res['status'] = 'error';
			$res['message'] = $db->res_errMsg;
			return $res;
		}

		$res = Array();
		$res['status']  = 'success';
		$res['message'] = '';
		return $res;
	}

	public function newRecord($table, $data) {
		global $db;

		$res    = Array();
		$fields = '';
		$values = '';

		foreach ($data as $k => $v) {
			if ($fields != '') $fields .= ",";
			if ($values != '') $values .= ",";
			$fields .= $k;
			if (substr($v, 0, 2) == "__") {
				$values .= addslashes(substr($v, 2));
			} else {
				$values .= ($v == "" ? "null" : "'".addslashes($v)."'");
			}
		}

		$sql = "INSERT INTO $table($fields) VALUES ($values)";
		$db->execute($sql);
		if ($db->res_errMsg != '') {
			$res['status']  = 'error';
			$res['message'] = $db->res_errMsg;
		} else {
			$res['status']  = 'success';
		}
		return $res;	
	}	

	public function getItems($sql) {
		global $db;
		$data = Array();

		// execute sql
		$rs = $db->execute($sql);
		// check for error
		if ($db->res_errMsg != '') {
			$data = Array();
			$data['status'] = 'error';
			$data['message'] = $db->res_errMsg;
			return $data;
		}

		$len = 0;
		$data['status']  = 'success';
		$data['total'] 	 = $db->res_rowCount;
		$data['items'] = Array();
		while ($rs && !$rs->EOF) {
			$data['items'][$len] = Array();
			$data['items'][$len]['id']   = $rs->fields[0];
			$data['items'][$len]['text'] = $rs->fields[1];
			foreach ($rs->fields as $k => $v) {
				if (intval($k) > 0 || $k == "0") continue;
				$data['items'][$len][$k] = $v;
			}
			$len++;
			if ($len >= $_REQUEST['max']) break;
			$rs->moveNext();
		}
		return $data;
	}

	public function outputJSON($data) {
		header("Content-Type: application/json;charset=utf-8");
		echo json_encode($data);
	}
}
