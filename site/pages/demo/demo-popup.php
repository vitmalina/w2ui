<?
	global $site_root, $theme;
	$theme->append('site-head', "<script src=\"".$site_root."/pages/code-mirror.js\"></script>");
?>

<div class="container">
	<div class="row">
		<div class="span10">
			<h2>Popups and Overlays</h2>
			Popups and overlays are popular UI elements of modern web applications. If used right, it can significantly enhance user interaction, provide 
			clearity and improve navigation of your application. The w2ui library has both popups and overlays. A popup blocks the content of the 
			application for the duration of user interaction. An overlay, in turn, is non-blocking UI solutions that displays additional information.
		</div>
		<div class="span2">
			<br>
			<a href="<?=$site_root?>/demos#!popup" target="_blank" class="btn btn-success pull-right">
				More Demos
			</a>
		</div>
	</div>

	<div class="row spacer"></div>
	<div class="row spacer"></div>

	<div class="row">
		<div class="span12">
			<input type="button" class="btn btn-info" value="Show Popup" onclick="$('#popup1').w2popup()">
			&nbsp;&nbsp;&nbsp;
			<input type="button" class="btn btn-info" value="Show Overlay" 
				onclick="$(this).w2overlay($('#popup1 [rel=body]').html(), { css: { width: '600px', padding: '10px' } })">
		</div>
	</div>

	<div class="row spacer"></div>
	<div class="row spacer"></div>

	<div class="row">
		<div class="span4">
			<h3>Templates</h3>
			You can open a popup with content generated completely in JavaScript or load HTML file from a server.
		</div>
		<div class="span4">
			<h3>JavaScript APIs</h3>
			All functionality can be accessed from JavaScript in short, human-readble commands. 
		</div>
		<div class="span4">
			<h3>Event Driven</h3>
			There are a number of events that allows to trigger functionality exactly when you need it.
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span4">
			<h3>Overlays</h3>
			Modern look and feel of overlays and popups with clean appearance and transitions.
		</div>
		<div class="span4">
			<h3>Transitions</h3>
			Build-in transitions between old and new content of the popup.
		</div>
		<div class="span4">
			<h3>Integrated</h3>
			Easy integration with other w2ui controls such as a form.
		</div>
	</div>

	<div class="row spacer"></div>
	<div class="row spacer"></div>

	<div class="row">
		<div class="span12">
			<h2>The Code</h2>
			<textarea class="javascript">
// popup based on HTML already on the page
$('#popup1').w2popup();

// overlay based on the same HTML
$(this).w2overlay($('#popup1 [rel=body]').html(), { css: { width: '600px', padding: '10px' } });
			</textarea>
		</div>
	</div>

	<div class="row">
		<div class="span12">
			<h2>HTML Markup</h2>
			<textarea class="html">
<div id="popup1" style="display: none; width: 650px; height: 400px; overflow: auto">
    <div rel="title">
        Popup #1 Title
    </div>
    <div rel="body">
        <div style="padding: 10; font-size: 11px; line-height: 150%;">
			<div style="float:left; background-color:white; width:150px; height:80px; border: 1px solid silver; margin:5px;">
            </div>
            This is body of popup #1. You can put any text or HTML inside the body (as well as title and buttons).
            This is body of popup #1. You can put any text or HTML inside the body (as well as title and buttons).
            This is body of popup #1. You can put any text or HTML inside the body (as well as title and buttons).
            This is body of popup #1. You can put any text or HTML inside the body (as well as title and buttons).
            This is body of popup #1. You can put any text or HTML inside the body (as well as title and buttons).
            This is body of popup #1. You can put any text or HTML inside the body (as well as title and buttons).
            This is body of popup #1. You can put any text or HTML inside the body (as well as title and buttons).
            This is body of popup #1. You can put any text or HTML inside the body (as well as title and buttons).
            This is body of popup #1. You can put any text or HTML inside the body (as well as title and buttons).
            This is body of popup #1. You can put any text or HTML inside the body (as well as title and buttons).
            This is body of popup #1. You can put any text or HTML inside the body (as well as title and buttons).
        </div>
    </div>
    <div rel="buttons">
        <button class="btn" onclick="$('#popup2').w2popup()">Switch to Popup 2</button>
    </div>
</div>

<!-- Second Popup Window -->

<div id="popup2" style="display: none; width: 400px; height: 200px; overflow: auto">
    <div rel="title">
        Popup #2
    </div>
    <div rel="body">
        <div style="padding: 10; font-size: 11px; line-height: 150%;">
            Some other popup text. Some other popup text. Some other popup text. Some other popup text. Some other popup text. 
            Some other popup text. Some other popup text. Some other popup text. Some other popup text. Some other popup text. 
        </div>
    </div>
    <div rel="buttons">
        <button class="btn" onclick="$('#popup1').w2popup()">Switch to Popup 1</button>
    </div>
</div>                
			</textarea>
		</div>
	</div>
	
	<? global $feedback; print($feedback); ?>
	
</div>


<!-- Mark up for Popups -->

<div id="popup1" style="display: none; width: 650px; height: 400px; overflow: auto">
	<div rel="title">
		Popup #1 Title
	</div>
	<div rel="body">
		<div style="padding: 10; font-size: 11px; line-height: 150%;">
			<div style="float:left; background-color:white; width:150px; height:80px; border: 1px solid silver; margin:5px;">
			</div>
			This is body of popup #1. You can put any text or HTML inside the body (as well as title and buttons).
			This is body of popup #1. You can put any text or HTML inside the body (as well as title and buttons).
			This is body of popup #1. You can put any text or HTML inside the body (as well as title and buttons).
			This is body of popup #1. You can put any text or HTML inside the body (as well as title and buttons).
			This is body of popup #1. You can put any text or HTML inside the body (as well as title and buttons).
			This is body of popup #1. You can put any text or HTML inside the body (as well as title and buttons).
			This is body of popup #1. You can put any text or HTML inside the body (as well as title and buttons).
			This is body of popup #1. You can put any text or HTML inside the body (as well as title and buttons).
			This is body of popup #1. You can put any text or HTML inside the body (as well as title and buttons).
			This is body of popup #1. You can put any text or HTML inside the body (as well as title and buttons).
			This is body of popup #1. You can put any text or HTML inside the body (as well as title and buttons).
		</div>
	</div>
	<div rel="buttons">
		<button class="btn" onclick="$('#popup2').w2popup()">Switch to Popup 2</button>
	</div>
</div>
<div id="popup2" style="display: none; width: 400px; height: 200px; overflow: auto">
	<div rel="title">
		Popup #2
	</div>
	<div rel="body">
		<div style="padding: 10; font-size: 11px; line-height: 150%;">
			Some other popup text. Some other popup text. Some other popup text. Some other popup text. Some other popup text. 
			Some other popup text. Some other popup text. Some other popup text. Some other popup text. Some other popup text. 
		</div>
	</div>
	<div rel="buttons">
		<button class="btn" onclick="$('#popup1').w2popup()">Switch to Popup 1</button>
	</div>
</div>