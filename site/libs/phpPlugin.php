<?
/***********************************************************************************
*   Class: phpPlugin
*   This class provides basic structure for plugins
*/

$plugins = Array();

class plugin {
	public $ident;
	public $path;
	public $db;
	public $dbPrefix;
	public $path_cms	= '';
	public $path_upload = '';

	function __construct($ident, $path) {
		global $plugins;
		global $db, $sys_dbPrefix;

		if ($plugins[strtoupper($ident)] != null) {
			die("ERROR: Plugin $ident is already registered.");
		}
		$this->db		= $db;
		$this->dbPrefix = $sys_dbPrefix;
		$this->ident	= strtolower($ident);
		$this->path 	= $path;
		$plugins[$this->ident] = $this;

		// -- check if registered & register if needed

	}

	function __destruct() {
	}

	function render($param) {
		return $param;
	}
}
?>