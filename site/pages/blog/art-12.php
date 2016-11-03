<? 
	$theme->assign("page-name", "W2UI 1.4 Released"); 
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

<h2>W2UI 1.4 Released</h2>
<div class="date">July 21, 2014</div>

<? require("blog-social.php"); ?>

I am happy to announce the release of W2UI 1.4. This release has many improvements and bug fixes. New 1.4 version is not fully 
backward compatible with 1.3, however, the migration should be easy as there were only few changes that would break your previous 
code.

<h4>Input Controls</h4>
One of the biggest updates in this release is fully refactored input controls, <a href="/web/demos/#!fields/fields-1">see demos</a>. 
You can use them stand-alone (more in this <a href="/web/blog/11/HTML5-Input-Types-Alternative-(Part-2)">post</a>) or within 
a form. Input controls include:
<ul class="simple-list">
	<li>Numeric</li>
	<li>Date & Time</li>
	<li>Lists</li>
	<li>Multi List</li>
	<li>Upload</li>
</ul>

All these new input controls can be used as <a href="/web/docs/w2form.fields">field types</a> in w2form, as 
<a href="/web/docs/w2grid.searches">search field controls</a> or <a href="/web/docs/w2grid.columns">inline editing controls</a> in w2grid.
<div style="height: 10px"></div>

<h4>Route Support</h4>
I have added route property in w2sidebar node, w2toolbar item and w2tabs tab. Consider following example in case of a sidebar:
<textarea class="javascript">
$().w2sidebar({
    name : 'sidebar',
    routeData: { id: 14 },
    nodes: [ 
        { id: 'id-1', text: 'Link 1', route: '/view/:id/details' },
		{ id: 'id-2', text: 'Link 2', route: '/view/:id/sub1' },
		{ id: 'id-3', text: 'Link 3', route: '/view/:id/sub2' }
    ]
});
</textarea>
Now, clicking on the node, will follow a route with merged dynamic id.
<div style="height: 10px"></div>
In w2grid and w2form you can use dynamic routes as they pull data from the server
<textarea class="javascript">
$().w2grid({
    name : 'grid',
    routeData: { id: 14 },
    url: {
    	get   : '/item/:id', 
    	save  : '/item/:id/save', 
    	remove: '/item/:id/remove'
    }
    ...
});
</textarea>

<h4>Improved Overlays</h4>
Overlays had major improvements. Now overlays will:
<ul class="simple-list">
	<li>open up or down depending on available screen space</li>
	<li>allow to have multiple instances at the same time</li>
	<li>allow to build <a href="/web/docs/popup/overlays">context menus</a></li>
	<li>have more options</li>
</ul>
<div style="height: 10px"></div>

<h4>Form Templates</h4>

Form template auto generating is not new, but in this release it has been improved with additional options. You can 
still provide your own <a href="/web/docs/w2form.formHTML">form template</a> or specify how a template 
<a href="/web/docs/w2form.generateHTML">should be built</a>. The template for a particular field has changed.
<div style="height: 10px"></div>
FROM
<textarea class="html">
<div class="w2ui-label">First Name:</div>
<div class="w2ui-field">
	<input name="first_name" type="text" size="35"/>
</div>
</textarea>
TO
<textarea class="html">
<div class="w2ui-field">
	<label>First Name:</label>
	<div>
		<input name="first_name" type="text" size="35"/>
	</div>
</div>
</textarea>
which I think is more expressive. Still, the easiest way to generate initial templates by 
<a href="/web/docs/w2form.generateHTML">generateHTML</a>

<h4>Get all nodes, items, tabs</h4>
Now you get quickly find out all nodes in w2sidebar, items in w2toolbar or tabs w2tab by calling <a href="/web/docs/w2sidebar.get">get</a> 
method without arguments. It turned out to be quite useful. Consider the following example that disabled all nodes with one line
<textarea class="javascript">
var sb = w2ui.sidebar;
sb.disable.apply(sb, sb.get())
</textarea>

For a complete list of changes, see change log below.

<h3>Change Log</h3>
<div style="height: 10px"></div>

<h4>Layout</h4>
<ul class="simple-list">
	<li> Added <a href="/web/docs/w2layout.panels" class="method">panel.title</a> property</li>
	<li> Added <a href="/web/docs/w2layout.panels" class="method">panel.maxSize</a> property</li>
	<li> Added <a href="/web/docs/w2layout.onResizerClick" class="method">onResizerClick</a> event</li>
</ul>
<div style="height: 20px"></div>

<h4>Grid</h4>
<ul class="simple-list">
	<li> Added <a href="/web/docs/w2grid.columns" class="method">column.hideable</a> property</li>
	<li> Added <a href="/web/docs/w2grid.menu" class="method">menu</a> property</li>
	<li> Added <a href="/web/docs/w2grid.method" class="method">method</a> property</li>
	<li> Added <a href="/web/docs/w2grid.parser" class="method">parser</a> property</li>
	<li> Added <a href="/web/docs/w2grid.recid" class="method">recid</a> property</li>
	<li> Added <a href="/web/docs/w2grid.reorderColumns" class="method">reorderColumns</a> property</li>
	<li> Added <a href="/web/docs/w2grid.reorderRows" class="method">reorderRows</a> property</li>
	<li> Added <a href="/web/docs/w2grid.routeData" class="method">routeData</a> property</li>
	<li> Added <a href="/web/docs/w2grid.onContextMenu" class="method">onContextMenu</a> event</li>
	<li> Added <a href="/web/docs/w2grid.onMenuClick" class="method">onMenuClick</a> event</li>
	<li> Added <a href="/web/docs/w2grid.onStateSave" class="method">onStateSave</a> event</li>
	<li> Added <a href="/web/docs/w2grid.onStateRestore" class="method">onStateRestore</a> event</li>
	<li> Added <a href="/web/docs/w2grid.getCellValue" class="method">getCellValue()</a> method</li>
	<li> Added <a href="/web/docs/w2grid.nextCell" class="method">nextCell()</a> method</li>
	<li> Added <a href="/web/docs/w2grid.prevCell" class="method">prevCell()</a> method</li>
	<li> Added <a href="/web/docs/w2grid.nextRow" class="method">nextRow()</a> method</li>
	<li> Added <a href="/web/docs/w2grid.prevRow" class="method">prevRow()</a> method</li>
	<li> Added <a href="/web/docs/w2grid.refreshRow" class="method">refreshRow()</a> method</li>
	<li> Added <a href="/web/docs/w2grid.refreshCell" class="method">refreshCell()</a> method</li>
	<li> Added <a href="/web/docs/w2grid.stateSave" class="method">stateSave()</a> method</li>
	<li> Added <a href="/web/docs/w2grid.stateRestore" class="method">stateRestore()</a> method</li>
	<li> Added <a href="/web/docs/w2grid.stateReset" class="method">stateReset()</a> method</li>
	<li> Changed <a href="/web/docs/w2grid.find" class="method">find</a> method</li>
	<li> Changed <a href="/web/docs/w2grid.records" class="method">record.style</a> property</li>
	<li> Changed <a href="/web/docs/w2grid.records" class="method">record.render</a> property</li>
	<li> Changed <a href="/web/docs/w2grid.show" class="method">show.skipRecords</a> property</li>
	<li> Deprecated <a class="method">buffered</a> property</li>
	<li> Deprecated <a class="method">record.selected</a> property</li>
	<li> Renamed <a href="/web/docs/w2grid.markSearch" class="method">markSearchResults => markSearch</a> property</li>
	<li> Renamed <a href="/web/docs/w2grid.records" class="method">record.changed => record.changes</a> property</li>
	<li> Renamed <a href="/web/docs/w2grid.onSubmit" class="method">onSave => onSubmit</a> event</li>
	<li> Renamed <a href="/web/docs/w2grid.onSave" class="method">onSaved => onSave</a> event</li>
	<li> Renamed <a href="/web/docs/grid" class="method">search-login => searchLogic</a> in server post</li>
	<li> Removed <a href="/web/docs/grid" class="method">name</a> from server post</li>
</ul>
<div style="height: 20px"></div>

<h4>Toolbar</h4>
<ul class="simple-list">
	<li> Added <a href="/web/docs/w2toolbar.routeData" class="method">routeData</a> property</li>
	<li> Added <a href="/web/docs/w2toolbar.items" class="method">item.route</a> property</li>
	<li> Added <a href="/web/docs/w2toolbar.items" class="method">item.count</a> property</li>
	<li> Updated <a href="/web/docs/w2toolbar.get" class="method">get()</a> method</li>
</ul>
<div style="height: 20px"></div>

<h4>Sidebar</h4>
<ul class="simple-list">
	<li> Added <a href="/web/docs/w2sidebar.routeData" class="method">routeData</a> property</li>
	<li> Added <a href="/web/docs/w2sidebar.nodes" class="method">node.route</a> property</li>
	<li> Added <a href="/web/docs/w2sidebar.find" class="method">find()</a> method</li>
	<li> Updated <a href="/web/docs/w2sidebar.get" class="method">get()</a> method</li>
</ul>
<div style="height: 20px"></div>

<h4>Tabs</h4>
<ul class="simple-list">
	<li> Added <a href="/web/docs/w2tabs.routeData" class="method">routeData</a> property</li>
	<li> Added <a href="/web/docs/w2tabs.tabs" class="method">tab.route</a> property</li>
	<li> Updated <a href="/web/docs/w2tabs.get" class="method">get()</a> method</li>
</ul>
<div style="height: 20px"></div>

<h4>Form</h4>
<ul class="simple-list">
	<li> Added <a href="/web/docs/w2form.routeData" class="method">routeData</a> property</li>
	<li> Added <a href="/web/docs/w2form.getChanged" class="method">getChanged()</a> method</li>
	<li> Updated <a href="/web/docs/w2form.fields" class="method">fields</a> property</li>
	<li> Updated <a href="/web/docs/w2form.get" class="method">get()</a> method</li>
	<li> Updated <a href="/web/docs/w2form.generateHTML" class="method">generateHTML()</a> method</li>
</ul>
<div style="height: 20px"></div>

<h4>Popup</h4>
<ul class="simple-list">
	<li> Added <a href="/web/docs/w2popup.status" class="method">status</a> property</li>
</ul>
<div style="height: 20px"></div>

<h4>Utils</h4>
<ul class="simple-list">
	<li> Added <a href="/web/docs/w2utils.lock" class="method">lock()</a> method</li>
	<li> Added <a href="/web/docs/w2utils.unlock" class="method">unlock()</a> method</li>
	<li> Added <a href="/web/docs/w2utils.parseRoute" class="method">parseRoute()</a> method</li>
	<li> Added <a href="/web/docs/w2utils.settings" class="method">settings.dataType</a> property</li>
	<li> Added <a href="/web/docs/w2utils.settings" class="method">settings.currencyPrefix</a> property</li>
	<li> Added <a href="/web/docs/w2utils.settings" class="method">settings.currencySuffix</a> property</li>
	<li> Added <a href="/web/docs/w2utils.settings" class="method">settings.currencyPrecision</a> property</li>
	<li> Added <a href="/web/docs/w2utils.settings" class="method">settings.groupSymbol</a> property</li>
	<li> Deprecated <a href="/web/docs/w2utils.settings" class="method">settings.currency</a> property</li>
	<li> Deprecated <a href="/web/docs/w2utils.settings" class="method">settings.float</a> property</li>
	<li> Deprecated <a href="/web/docs/w2utils.settings" class="method">settings.RESTfull</a> property</li>
</ul>
