<? 
	$theme->assign("page-name", "Info Bubbles in the Grid"); 
	$theme->append('site-head',
		'<link rel="stylesheet" type="text/css" href="/src/w2ui-1.4.min.css" />'.
		'<script type="text/javascript" src="/src/w2ui-1.4.min.js"></script>'
	);
?>

<style> 
.simple-list {
	margin: 10px 0px 15px 0px;
}
.simple-list li {
	margin: 5px 35px;
}
</style>

<h2>Info Bubbles in the Grid</h2>
<div class="date">December 12, 2015</div>

<? require("blog-social.php"); ?>

It has been over a year since 1.4 release and I've heard from many people who are anxious to get new version. Though, it is still in development 
(getting really close), I decided to write a couple of articles about new features that are coming out. One of such features is
info bubbles in the grid.
<br><br>
<img src="/web/pages/blog/img/info-bubble.png">
</br></br>

<h3>Super Easy to Define</h3>

This is a frequently needed feature and the goal was to make it super easy to use while still being very flexible. So, while defining columns
for the grid, all you need to do is to set info flag to true. Consider the following code:

<textarea class="javascript">
...
columns: [
	...
	{ field: 'first-name', caption: 'First Name', info: true }
	...
]
...
</textarea>

Super easy, ha!? When icon is clicked, it will show all the fields that are in the grid for that record (including hidden ones) in an bubble. 
So, then, you can hide some of the less important fields to conserve space. 

<h3>Flexible</h3>
<div style="height: 10px"></div>

Showing all fields in the bubble is only a single use case. As I developer, I want to have a full control of how I build the info
bubble. I want to do the the following:

<ol style="margin: 20px 20px 20px 50px">
	<li>Define a custom icon</li>
	<li>Specify what fields I want to display</li>
	<li>Specify field groups</li>
	<li>Specify custom (computable) fields</li>
	<li>Define a custom render function</li>
</ol>

All of these actions are easy to do just setting up various info properties. Below it the list of all properties that are available.

<textarea class="javascript">
...
columns: [
	...
	{ field: 'first-name', caption: 'First Name', 
		info: {
			icon      : 'icon-info', 	 // icon class (comes from icon font)
			fields    : [],			   // list of fields to display
			showEmpty : false,			// show empty fields
			maxLength : 0,				// if defined, will truncate field value
			render    : function (rec) {} // custom render function
		} 
	}
]
</textarea>

To define field groups (3), set a field in fields array as "--" and it will become a divider. 
Computable fields (4) and custom render functions (5) are done int the following way:

<textarea class="javascript">
...
columns: [
	...
	{ field: 'first-name', caption: 'First Name', 
		info: {
			icon   : 'icon-info',
			render : function (rec) {
			    var name = rec.fname + ' ' + rec.lname;
				return  '<table>'+
				   '   <tr><td>Name</td><td>'+ name +'</td></tr>'+
				   '   <tr><td>Field1</td><td>Value1</td></tr>'+
				   '   <tr><td>Field2</td><td>Some value</td></tr>'+
				   '</table>';
			}
		} 
	}
]
</textarea>

I hope it will saves a bit of your development time. Any suggestions and comments, see section below.
