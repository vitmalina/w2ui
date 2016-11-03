<?
	global $site_root, $theme;
	$theme->append('site-head', "<script src=\"".$site_root."/pages/code-mirror.js\"></script>");
?>

<div class="container">
	<div class="row">
		<div class="span10">
			<h2>Layout</h2>
			The layout is often invisible but quite important part of your web application. It helps to make applications that know what to do with
			the available space. Each layout consists of panels. Panels hold the content - HTML or a widget, for example, a grid. They can be easily 
			hidden, shown, resized, removed, refreshed.
		</div>
		<div class="span2">
			<br>
			<a href="<?=$site_root?>/demos#!layout" target="_blank" class="btn btn-success pull-right">
				More Demos
			</a>
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span12">
			<div id="layout" style="height: 400px;"></div>
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span4">
			<h3>Auto Resize</h3>
			Once you have rendered layout into a container, it will attach a listener to the window and will make sure it
			takes up all the width and height available from the container.
		</div>
		<div class="span4">
			<h3>6 Panels</h3>
			Layout comes with 6 default panels. You can set the content of the panel by setting HTML, loading
			from a file, or rendering a widget, for example, a grid.
		</div>
		<div class="span4">
			<h3>Nested</h3>
			If 6 default panels is not enought for you, you can nest them. A layout panel can contain another layout with 6 more panels. There is no limit
			how many layouts you can nest.
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span4">
			<h3>JavaScript Control</h3>
			A widget is good when it has clean APIs and can be manupulated from JavaScript. 
		</div>
		<div class="span4">
			<h3>Clean Syntax</h3>
			The code is clean, modern and easy to read, as you can see below.
		</div>
		<div class="span4">
			<h3>Invisible</h3>
			In the example above you can see all the panels, but by default they are invisible. 
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span12">
			<h2>The Code</h2>
			<textarea class="javascript">
$(function () {
    var pstyle = 'background-color: #F5F6F7; border: 1px solid #dfdfdf; padding: 5px;';
    $('#layout').w2layout({
        name: 'layout',
        panels: [
            { type: 'top',  size: 50, resizable: true, style: pstyle, content: 'top' },
            { type: 'left', size: 200, resizable: true, style: pstyle, content: 'left' },
            { type: 'main', style: pstyle, content: 'main' },
            { type: 'preview', size: '50%', resizable: true, style: pstyle, content: 'preview' },
            { type: 'right', size: 200, resizable: true, style: pstyle, content: 'right' },
            { type: 'bottom', size: 50, resizable: true, style: pstyle, content: 'bottom' }
        ]
    });
});
			</textarea>
		</div>
	</div>
	
	<? global $feedback; print($feedback); ?>
	
</div>

<script>
$(function () {
	var pstyle = 'background-color: #F5F6F7; border: 1px solid #dfdfdf; padding: 5px;';

	$('#layout').w2layout({
		name: 'layout',
		panels: [
			{ type: 'top',  size: 50, resizable: true, style: pstyle, content: 'top' },
			{ type: 'left', size: 200, resizable: true, style: pstyle, content: 'left' },
			{ type: 'main', style: pstyle, content: 'main' },
			{ type: 'preview', size: '50%', resizable: true, style: pstyle, content: 'preview' },
			{ type: 'right', size: 200, resizable: true, style: pstyle, content: 'right' },
			{ type: 'bottom', size: 50, resizable: true, style: pstyle, content: 'bottom' }
		]
	});
});
</script>