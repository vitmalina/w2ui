<? 
	$theme->assign("page-name", "JavaScript Grid with One Million Records"); 
	$theme->assign('site-head',
		'<link rel="stylesheet" type="text/css" href="'.$site_root.'/js/w2ui-1.3a.min.css" />'.
		'<script type="text/javascript" src="'.$site_root.'/js/w2ui-1.3a.min.js"></script>'.
		'<script src="/web/pages/code-mirror.js"></script>'
	);
?>
<style>
	ul.simple {
		margin: 10px 0px;
		padding-left: 50px;
	}
	ul.simple li {
	}
</style>

<h2>How jQuery chaining should be</h2>
<div class="date">August 25, 2013</div>

<? require("blog-social.php"); ?>

Everyone loves jQuery's chaining feature. For me it was the single most pleasant feature I have incorporated into my own coding style.
Chaining is easy to write, easy to follow and gives a tremendous expressive power. Consider two equivalent 
code blocks:

<h5>Without Chaining</h5>
<textarea class="javascript">
var myDiv = $('#myDiv');
myDiv.addClass('selected';
myDiv.css('background-color', 'red')
myDiv.data('myVar', 'value')
myDiv.on('click', function () {
	// some function code
});
myDiv.on('mouseover', function () {
	// some function code
});
...
</textarea>

<h5>Chained</h5>
<textarea class="javascript">
$('#element')
	.addClass('selected';
	.css('background-color', 'red')
	.data('myVar', 'value')
	.on('click', function () {
		// some function code
	});
	.on('mouseover', function () {
		// some function code
	});
....
</textarea>
However, there is one problem with jQuery's chaining: it only works if the method returns jQuery object and not all method 
return jQuery object (some times it depends on submitted arguments). Below is no-exhaustive list of function that cannot be changed.
<ul class="simple">
	<li>attr(name)
	<li>ajax()
	<li>css(name)
	<li>data(key)
	<li>get(index)
	<li>hasClass(className)
	<li>height()
	<li>width()
	<li>html()
	<li>index()
	<li>innerHeight()
	<li>innerWidth()
	<li>is()
	<li>offset()
	<li>outerHeight()
	<li>outerWidth()
	<li>position()
	<li>promise()
	<li>prop(name)
	<li>queue()
	<li>scrollLeft()
	<li>scrollTop()
	<li>serialize()
	<li>serializeArray()
	<li>size()
	<li>text()
	<li>toArray()
	<li>val(str)
</ul>

<h3>Proposed Solutions</h3>
Researching this subject I have found several proposed ideas
http://ejohn.org/blog/ultra-chaining-with-jquery/


*******************
Research Deferrer in jQuery

<div class="spacer10"></div>
