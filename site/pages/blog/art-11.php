<? 
	$theme->assign("page-name", "HTML5 Input Types Alternative (Part 2)"); 
	$theme->append('site-head',
		'<link rel="stylesheet" type="text/css" href="/src/w2ui-fields-1.4.min.css" />'.
		'<script type="text/javascript" src="/src/w2ui-fields-1.4.min.js"></script>'
	);
?>

<style> 
.simple-list {
	margin: 10px 0px 15px 0px;
}
.simple-list li {
	margin: 5px 35px;
}
.w2ui-field * {
	box-sizing: border-box;
}
.w2ui-field {
	clear: both;
	margin: 15px 0px;
}
.w2ui-field label {
	float: left;
	width: 70px;
	text-align: right;
}
.w2ui-field > div {
	margin-left: 80px;	
}
</style>

<h2>HTML5 Input Types Alternative (Part 2)</h2>
<div class="date">July 17, 2014</div>

<? require("blog-social.php"); ?>

Some time back, I wrote a post - <a href="http://davidwalsh.name/html5-input-types-alternative">HTML5 Input Types Alternative</a> - 
where I suggested that since implementation in various browsers of new HTML5 input types is inconsistent, we should not yet use them, but 
rather use controls implemented in JavaScript. I have suggested w2ui-fields library. As I have gotten feedback and suggestions from many 
people, I have improved and updated the library which is now ready for its second release.

<h3>Control Types</h3>
The number of input controls is still the same. They can be split in the 5 categories:
<ul class="simple-list">
	<li><a href="/web/docs/form/fields-numeric">Numeric</a></li>
	<li><a href="/web/docs/form/fields-date">Date & Time</a></li>
	<li><a href="/web/docs/form/fields-list">Drop Down Lists</a></li>
	<li><a href="/web/docs/form/fields-enum">Multi Select Lists</a></li>
	<li><a href="/web/docs/form/fields-upload">Upload</a></li>
</ul>
These are most frequent control types that, I think, can provide 98% of the input needs to any project. The controls are flexible in a 
way that they are not locked to any particular format. If it is a date, you can define virtually any date format; if is is a number, you
have an option to specify its formatting rules, etc.

<h3>Demos</h3>

Below are some of the demos of the controls. For more complete coverage go to <a href="/web/demos/#!fields/fields-1">demo</a> page.
<div style="height: 20px"></div>

<div style="background-color: #f5f5f5; padding: 10px;">
<div class="w2ui-field">
	<label>Number:</label>
	<div>
		<input id="number" style="width: 150px; text-align: right">
	</div>
</div>
<div class="w2ui-field">
	<label>Money:</label>
	<div>
		<input id="money" style="width: 150px; text-align: right">
	</div>
</div>
<div class="w2ui-field">
	<label>Date:</label>
	<div>
		<input id="date" style="width: 100px">
	</div>
</div>
<div class="w2ui-field">
	<label>Color:</label>
	<div>
		<input id="color" style="width: 100px">
	</div>
</div>
<div class="w2ui-field">
	<label>List:</label>
	<div>
		<input id="list" style="width: 500px">
	</div>
</div>
<div class="w2ui-field">
	<label>Combo:</label>
	<div>
		<input id="combo" style="width: 500px">
	</div>
</div>
<div class="w2ui-field">
	<label>Multi:</label>
	<div>
		<input id="multi" style="width: 500px">
	</div>
</div>
<div class="w2ui-field">
	<label>Upload:</label>
	<div>
		<input id="upload" style="width: 500px">
	</div>
</div>
</div>

<h3>What Is New</h3>

I have worked through each comment in my previous post trying to understand and implement suggestions for improvement. As a result, the
library seems to be more user friendly.

<ul class="simple-list">
	<li>LIST - has improved visual markers, search, navigation and events</li>
	<li>MULTI SELECT - has improved keyboard support and item rendering</li>
	<li>DATE - has month and year selection (click on the month/year title)</li>
	<li>UPLOAD - has improved preview, item rendering, events</li>
</ul>

In general, I wanted these controls to be as smoothly integrated with regular &lt;INPUT&gt; as possible. Below is a sample 
example of use:
<div style="height: 20px"></div>

<textarea class="html">
<input type="text" id="id">
<script>
	// examples (one of)
	$('#id').w2field('date', options);  // for date
	$('#id').w2field('int', options);   // for int
	$('#id').w2field('color', options); // for color
	$('#id').w2field('enum', options);  // for multi select
</script>
</textarea>

Each control 
<ul class="simple-list">
	<li>Works on INPUT</li>
	<li>Dispatches DOM change event</li>
	<li>Supports keyboard (arrow keys, etc.)</li>
	<li>Has <a href="/web/docs/form/fields-numeric">customization</a> options</li>
	<li>Has clean user experience</li>
</ul>

<h3>Download</h3>
The library is only 23kb (minified and gzipped). These controls are part of <a href="/web/demos" target="_blank">w2ui 1.4</a>, but can 
also be used stand-alone. You can link it directly:

<div style="height: 20px"></div>
<textarea class="html">
<link rel="stylesheet" type="text/css" href="http://w2ui.com/src/w2ui-fields-1.4.min.css">
<script type="text/javascript" src="http://w2ui.com//src/w2ui-fields-1.4.min.js"></script>
</textarea>
<div style="height: 20px"></div>

Or download
<div style="height: 20px"></div>

<a class="btn btn-success" href="/web/downloads/w2ui-1.4.zip" style="width: 180px">Download w2ui-1.4.zip</a> - 69kb (minified & gzipped)
<div style="height: 20px"></div>
<a class="btn btn-success" href="/web/downloads/w2ui-fields-1.4.zip" style="width: 180px">Download w2ui-fiels-1.4.zip</a> - 23kb (minified & gzipped)

<div style="height: 40px"></div>
P.S. W2UI 1.4 is coming out this week too. Currently it is in RC3.
<div style="height: 20px"></div>

<script>
$(function () {
	var people = ['George Washington', 'John Adams', 'Thomas Jefferson', 'James Buchanan', 'James Madison', 'Abraham Lincoln', 'James Monroe', 'Andrew Johnson', 'John Adams', 'Ulysses Grant', 'Andrew Jackson', 'Rutherford Hayes', 'Martin VanBuren', 'James Garfield', 'William Harrison', 'Chester Arthur', 'John Tyler', 'Grover Cleveland', 'James Polk', 'Benjamin Harrison', 'Zachary Taylor', 'Grover Cleveland', 'Millard Fillmore', 'William McKinley', 'Franklin Pierce', 'Theodore Roosevelt', 'John Kennedy', 'William Howard', 'Lyndon Johnson', 'Woodrow Wilson', 'Richard Nixon', 'Warren Harding', 'Gerald Ford', 'Calvin Coolidge', 'James Carter', 'Herbert Hoover', 'Ronald Reagan', 'Franklin Roosevelt', 'George Bush', 'Harry Truman', 'William Clinton', 'Dwight Eisenhower', 'George W. Bush', 'Barack Obama'];
	$('#number').w2field('float');
	$('#money').w2field('money');
	$('#color').w2field('color');
	$('#date').w2field('date');
	$('#list').w2field('list', { items: people });
	$('#combo').w2field('combo', { items: people });
	$('#multi').w2field('enum', { items: people });
	$('#upload').w2field('file');
});
</script>
