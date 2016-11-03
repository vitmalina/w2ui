<div class="toolbar">
	<h1>Overlays</h1>
	<a class="button back" onclick="jsTouch.loadPage('pages/home.php', { transition: 'slide-right' });"><span></span>Back</a>
	<a class="button" onclick="jsTouch.overlayPage('pages/overlay-list.php', { transition: 'slide-left' });">Info</a>
</div>
<div class="content">
<div>
	<div style="padding: 5px 15px">
		Overlays are popups that display additional information. 
	</div>
	<ul class="rounded">
		<li><a onclick="jsTouch.overlayPage('pages/overlay-msg.php', { width: 300, height: 200 });">Simple Message</a></li>
		<li><a onclick="jsTouch.overlayPage('pages/overlay-msg2.php', { width: 300, height: 300 });">Message with Title</a></li>
		<li><a onclick="jsTouch.overlayPage('pages/overlay-list.php');">List Items</a></li>
		<li><a onclick="jsTouch.overlayPage('pages/overlay-buttons.php', { modal: true });">Question With Buttons</a></li>
	</ul>
	<div style="padding: 0px 15px">
		There can be only one overlay at any given time. Before an overlay is displayed the screen 
		is locked with an absolute div.
	</div>
	<div style="clear: both; height: 45px"></div>
</div>
</div>