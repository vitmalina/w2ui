<?
	global $site_root, $theme;
	$theme->append('site-head', "<script src=\"".$site_root."/pages/code-mirror.js\"></script>");
?>

<div class="container">
	<div class="row">
		<div class="span10">
			<h2>Grid</h2>
			The most popular way to display table data is in the form of a grid. Grid is the most feature-rich widget in w2ui library. It provides a 
			variety of properties, methods and events to control behavior (render, search, sort), user interactions (selectable, searchable, sortable records), 
			server side communications (request, load, parse), etc.
		</div>
		<div class="span2">
			<br>
			<a href="<?=$site_root?>/demos#!grid" target="_blank" class="btn btn-success pull-right">
				More Demos
			</a>
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span12">
			<div id="grid" style="height: 400px;"></div>
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span4">
			<h3>JavaScript</h3>
			Grid is a client side widget written completely in JavaScript. There is absolutely no difference what server side language you use to return 
			data for the grid. 
		</div>
		<div class="span4">
			<h3>JSON Data</h3>
			Grid expect server to return data in JSON format. You can use any format you want, but do not forget to add onLoad function to parse the data.
		</div>
		<div class="span4">
			<h3>Pixel Perfect</h3>
			Grid holds dynamic data with pixel perfect layout, if you are not completely satisfied, submit a bug.
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span4">
			<h3>Local/Remote Data</h3>
			Data for the grid can be generated in JavaScript or loaded from the server. Defining the url property makes data server side.
		</div>
		<div class="span4">
			<h3>Local/Remote Search</h3>
			If data is local, the grid will perform local search. If data is remove, the grid will submit search fields to the server side.
		</div>
		<div class="span4">
			<h3>Local/Remote Sort</h3>
			If data is local, the grid will perform local sorting. If data is remove, the grid will submit sort fields to the server side.
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span4">
			<h3>Sub Grids</h3>
			Any level of nested grids (or any other HTML code) is supported out to the box and require little effort to code.
		</div>
		<div class="span4">
			<h3>Summary Records</h3>
			Summary records will appear on the bottom of the grid and always stay there, if they are defined.
		</div>
		<div class="span4">
			<h3>Events</h3>
			Flexible even system allows you to create hooks and extend functionality on practically any grid action.
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span4">
			<h3>JavaScript APIs</h3>
			All functionality can be accessed from JavaScript in short, human-readble commands. Clicks, double clicks and other events can
			be emulated.
		</div>
		<div class="span4">
			<h3>Fixed or Resizable</h3>
			The grid can autoresize based on the number of records or can have predefined height. You can resize the grid from JavaScript
			to any width/height.
		</div>
		<div class="span4">
			<h3>Inline Editing</h3>
			Records can become input fields or select controls. The data can be captured and sent to the server.
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span12">
			<h2>The Code</h2>
			<textarea class="javascript">
$('#grid').w2grid({
    name: 'grid',
    header: 'List of Names',
    show: {
        toolbar: true,
        footer: true
    },
    columns: [
        { field: 'recid', caption: 'ID', size: '50px', sortable: true, attr: 'align=center' },
        { field: 'lname', caption: 'Last Name', size: '30%', sortable: true, resizable: true },
        { field: 'fname', caption: 'First Name', size: '30%', sortable: true, resizable: true },
        { field: 'email', caption: 'Email', size: '40%', resizable: true },
        { field: 'sdate', caption: 'Start Date', size: '120px', resizable: true },
    ],
    searches: [
        { field: 'lname', caption: 'Last Name', type: 'text' },
        { field: 'fname', caption: 'First Name', type: 'text' },
        { field: 'email', caption: 'Email', type: 'text' },
    ],
    sortData: [{ field: 'recid', direction: 'ASC' }],
    records: [
        { recid: 1, fname: 'John', lname: 'doe', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
        { recid: 2, fname: 'Stuart', lname: 'Motzart', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
        { recid: 3, fname: 'Jin', lname: 'Franson', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
        { recid: 4, fname: 'Susan', lname: 'Ottie', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
        { recid: 5, fname: 'Kelly', lname: 'Silver', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
        { recid: 6, fname: 'Francis', lname: 'Gatos', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
        { recid: 7, fname: 'Mark', lname: 'Welldo', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
        { recid: 8, fname: 'Thomas', lname: 'Bahh', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
        { recid: 9, fname: 'Sergei', lname: 'Rachmaninov', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
        { recid: 20, fname: 'Jill', lname: 'Doe', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
        { recid: 21, fname: 'Frank', lname: 'Motzart', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
        { recid: 22, fname: 'Peter', lname: 'Franson', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
        { recid: 23, fname: 'Andrew', lname: 'Ottie', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
        { recid: 24, fname: 'Manny', lname: 'Silver', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
        { recid: 25, fname: 'Ben', lname: 'Gatos', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
        { recid: 26, fname: 'Doer', lname: 'Welldo', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
        { recid: 27, fname: 'Shashi', lname: 'bahh', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
        { recid: 28, fname: 'Av', lname: 'Rachmaninov', email: 'jdoe@gmail.com', sdate: '4/3/2012' }
    ]
});</textarea>
		</div>
	</div>
	
	<? global $feedback; print($feedback); ?>
	
</div>

<script>
$(function () {
	$('#grid').w2grid({
		name: 'grid',
		header: 'List of Names',
		show: {
			toolbar: true,
			footer: true
		},
		searches: [
			{ field: 'lname', caption: 'Last Name', type: 'text' },
			{ field: 'fname', caption: 'First Name', type: 'text' },
			{ field: 'email', caption: 'Email', type: 'text' },
		],
		sortData: [{ field: 'recid', direction: 'ASC' }],
		columns: [
			{ field: 'recid', caption: 'ID', size: '50px', sortable: true, attr: 'align=center' },
			{ field: 'lname', caption: 'Last Name', size: '30%', sortable: true, resizable: true },
			{ field: 'fname', caption: 'First Name', size: '30%', sortable: true, resizable: true },
			{ field: 'email', caption: 'Email', size: '40%', sortable: true, resizable: true },
			{ field: 'sdate', caption: 'Start Date', size: '120px', sortable: true, resizable: true },
		],
		records: [
			{ recid: 1, fname: 'John', lname: 'doe', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
			{ recid: 2, fname: 'Stuart', lname: 'Motzart', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
			{ recid: 3, fname: 'Jin', lname: 'Franson', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
			{ recid: 4, fname: 'Susan', lname: 'Ottie', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
			{ recid: 5, fname: 'Kelly', lname: 'Silver', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
			{ recid: 6, fname: 'Francis', lname: 'Gatos', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
			{ recid: 7, fname: 'Mark', lname: 'Welldo', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
			{ recid: 8, fname: 'Thomas', lname: 'Bahh', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
			{ recid: 9, fname: 'Sergei', lname: 'Rachmaninov', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
			{ recid: 20, fname: 'Jill', lname: 'Doe', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
			{ recid: 21, fname: 'Frank', lname: 'Motzart', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
			{ recid: 22, fname: 'Peter', lname: 'Franson', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
			{ recid: 23, fname: 'Andrew', lname: 'Ottie', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
			{ recid: 24, fname: 'Manny', lname: 'Silver', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
			{ recid: 25, fname: 'Ben', lname: 'Gatos', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
			{ recid: 26, fname: 'Doer', lname: 'Welldo', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
			{ recid: 27, fname: 'Shashi', lname: 'bahh', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
			{ recid: 28, fname: 'Av', lname: 'Rachmaninov', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 31, fname: 'John', lname: 'doe', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 32, fname: 'Stuart', lname: 'Motzart', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 33, fname: 'Jin', lname: 'Franson', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 34, fname: 'Susan', lname: 'Ottie', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 35, fname: 'Kelly', lname: 'Silver', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 36, fname: 'Francis', lname: 'Gatos', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 37, fname: 'Mark', lname: 'Welldo', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 38, fname: 'Thomas', lname: 'Bahh', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 39, fname: 'Sergei', lname: 'Rachmaninov', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 40, fname: 'Jill', lname: 'Doe', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 41, fname: 'Frank', lname: 'Motzart', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 42, fname: 'Peter', lname: 'Franson', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 43, fname: 'Andrew', lname: 'Ottie', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 44, fname: 'Manny', lname: 'Silver', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 45, fname: 'Ben', lname: 'Gatos', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 46, fname: 'Doer', lname: 'Welldo', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 47, fname: 'Shashi', lname: 'bahh', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 48, fname: 'Av', lname: 'Rachmaninov', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 51, fname: 'John', lname: 'doe', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 52, fname: 'Stuart', lname: 'Motzart', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 53, fname: 'Jin', lname: 'Franson', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 54, fname: 'Susan', lname: 'Ottie', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 55, fname: 'Kelly', lname: 'Silver', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 56, fname: 'Francis', lname: 'Gatos', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 57, fname: 'Mark', lname: 'Welldo', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 58, fname: 'Thomas', lname: 'Bahh', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 59, fname: 'Sergei', lname: 'Rachmaninov', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 60, fname: 'Jill', lname: 'Doe', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 61, fname: 'Frank', lname: 'Motzart', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 62, fname: 'Peter', lname: 'Franson', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 63, fname: 'Andrew', lname: 'Ottie', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 64, fname: 'Manny', lname: 'Silver', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 65, fname: 'Ben', lname: 'Gatos', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 66, fname: 'Doer', lname: 'Welldo', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 67, fname: 'Shashi', lname: 'bahh', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
	        { recid: 68, fname: 'Av', lname: 'Rachmaninov', email: 'jdoe@gmail.com', sdate: '4/3/2012' }
		]
	});
});
</script>