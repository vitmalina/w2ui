<? require_once("features.php"); ?>
<script>
function init_server() {
	// -- table spaces
	var spaces = new top.jsList('spaces', null);
	spaces.header = "Table Spaces";
	spaces.addSearch('Name', 'TEXT', 'name', '', '', null);
	spaces.addColumn('Name', '15%', 'TEXT', '');
	spaces.addColumn('Owner', '15%', 'TEXT', '');
	spaces.addColumn('Location', '40%', 'TEXT', '');
	spaces.addColumn('Access Rights', '40%', 'TEXT', '');
	spaces.srvFile = "includes/server_srv.php";

	// -- users
	var userAdd = new top.jsEdit('userAdd', null);
	userAdd.header = "Add/Edit User";
	userAdd.showFooter = false;
	userAdd.tmpl = "<table cellpadding=\"3\" cellspacing=\"0\" style=\"width: 100%\" class=\"rText\">"+
					"	<tr>"+
					"		<td valign=\"top\" style=\"width: 100%\">~group1~</td>"+
					"	</tr>"+
					"	<tr><td colspan=2 align=center style=\"padding: 5px; background-color: #e0e7f4; border-top: 1px solid #d5e1f1; border-bottom: 1px solid #d5e1f1;\"> ~controls~ </td></tr>"+
					"</table>";

	group1 = userAdd.addGroup('group1', 'General');
	group1.inLabel = 'width="120px"';
	group1.addField('User Name', 		'Text', 		'user', 'size=40', '', '', true, 0);
	group1.addField('Password', 		'Text', 		'pass', 'size=40', '', '', false, 0);
	group1.addField('Can Create DBs', 	'Radio_YesNo', 	'create_db', '', '', 'f', false, 0);
	group1.addField('Super User', 		'Radio_YesNo', 	'create_user', '', '', 'f', false, 0);
	group1.addField('Valid Until', 		'Date', 		'valid_until', '', '', '', false, 0);
		
	userAdd.addControl('save', 'Save', null);
	userAdd.addControl('back', 'Cancel', null);
	userAdd.srvFile = "includes/server_srv.php";
	
	var users = new top.jsList('users', null);
	users.header = "Server Users";
	users.msgDelete = "";
	users.addSearch('User Name', 'TEXT', 'usename', '', '', null);
	users.addColumn('SysID', '10%', 'TEXT', '');
	users.addColumn('User Name', '25%', 'TEXT', '');
	users.addColumn('Create DB', '10%', 'TEXT', 'align=center');
	users.addColumn('Super User', '10%', 'TEXT', 'align=center');
	users.addColumn('Update Catalog', '10%', 'TEXT', 'align=center');
	users.addColumn('Valid Until', '15%', 'TEXT', '');
	users.addColumn('Configuration', '20%', 'TEXT', '');
	users.addControl('add', 'Create User');
	users.addControl('delete', 'Drop User');
	users.srvFile = "includes/server_srv.php";
	users.onAddOrEdit  = userAdd;
	userAdd.onComplete = users; 	

	// -- groups
	var groupAdd = new top.jsEdit('groupAdd', null);
	groupAdd.header = "Add/Edit Group";
	groupAdd.showFooter = false;
	groupAdd.tmpl = "<table cellpadding=\"3\" cellspacing=\"0\" style=\"width: 100%\" class=\"rText\">"+
					"	<tr>"+
					"		<td valign=\"top\" style=\"width: 100%\">~group1~</td>"+
					"	</tr>"+
					"	<tr><td colspan=2 align=center style=\"padding: 5px; background-color: #e0e7f4; border-top: 1px solid #d5e1f1; border-bottom: 1px solid #d5e1f1;\"> ~controls~ </td></tr>"+
					"</table>";

	group1 = groupAdd.addGroup('group1', 'General'); 
	group1.inLabel = 'width="120px"';
	group1.addField('Group Name',	'Text', 'user', 'size=40', '', '', true, 0);
	group1.addField('Members', 		'TextArea', 'members', 'style="width: 80%; height: 40px"', '', '', false, 0);
		
	groupAdd.addControl('save', 'Save', null);
	groupAdd.addControl('back', 'Cancel', null);
	groupAdd.srvFile = "includes/server_srv.php";
	
	var groups = new top.jsList('groups', null);
	groups.header = "Server Groups";
	groups.msgDelete = "";
	// groups.addSearch('Group Name', 'TEXT', 'groname', '', '', null);
	groups.addColumn('SysID', '10%', 'TEXT', '');
	groups.addColumn('Group Name', '25%', 'TEXT', '');
	groups.addColumn('Members', '65%', 'TEXT', '');
	groups.addControl('add', 'Create Group');
	groups.addControl('delete', 'Drop Group');
	groups.srvFile = "includes/server_srv.php";
	groups.onAddOrEdit  = groupAdd;
	groupAdd.onComplete = groups; 	

	// -- run-time
	var vars = new top.jsList('vars', null);
	vars.header = "Server Run-Time Configuration";
	<? if ($features[set_category] == 1) { ?>
	vars.addSearch('Category', 'LIST', 'category', '', '', null);
	<? } ?>
	vars.addSearch('Name', 'TEXT', 'name', 'size=65', '', null);	
	vars.addColumn('Variable', '15%', 'TEXT', '');
	vars.addColumn('Value', '10%', 'TEXT', '');
	vars.addColumn('Description', '40%', 'TEXT', '');
	vars.addColumn('Context', '7%', 'TEXT', '');
	vars.addColumn('Type', '7%', 'TEXT', '');
	vars.addColumn('Source', '7%', 'TEXT', '');
	vars.addColumn('Min', '7%', 'TEXT', '');
	vars.addColumn('Max', '7%', 'TEXT', '');
	vars.srvFile = "includes/server_srv.php";
	
	var activity = new top.jsList('activity', null);
	activity.header = "Server Run-Time Activity";
	activity.addColumn('PID', '5%', 'TEXT', '');
	activity.addColumn('Database', '10%', 'TEXT', '');
	activity.addColumn('User', '10%', 'TEXT', '');
	activity.addColumn('Query', '55%', 'TEXT', '');
	activity.addColumn('Age', '20%', 'TEXT', '');
	activity.srvFile = "includes/server_srv.php";
}
</script>
