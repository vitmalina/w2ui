<div class="toolbar">
	<h1>Lists</h1>
	<a class="button back" onclick="jsTouch.loadPage('pages/home.php', { transition: 'slide-right' });"><span></span>Back</a>
</div>
<div class="content">
<div>
	<h2>Select List</h2>
	<ul class="rounded">
		<li><a onclick="jsTouch.loadPage('pages/list-rounded.php', { transition: 'slide-left' });">Rounded</a></li>
		<li><a onclick="jsTouch.loadPage('pages/list-edgetoedge.php', { transition: 'slide-left' });">Edge to Edge</a></li>
		<li><a onclick="jsTouch.loadPage('pages/list-edgetoedge.php', { transition: 'flip-top', target: 'myTouch2' });">Right Panel</a></li>
	</ul>
	<div style="padding: 5px 15px">
		There are two kinds of lists: rounded and edgetoedge
	</div>
</div>
</div>