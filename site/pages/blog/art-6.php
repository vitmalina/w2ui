<? $theme->assign("page-name", "W2UI 1.2 Released"); ?>

<h2>W2UI 1.2 Released</h2>
<div class="date">May 4, 2013</div>

<? require("blog-social.php"); ?>

<div class="spacer10"></div>

I am happy to announce the release of <b>w2ui ver 1.2</b>. This is the first release with contributions from the community.
Since the previous release, I have received a lot of positive comments and am very excited to see that w2ui has been well accepted 
by so many people. I would like to express many thanks and kudos to everyone who contributed to this release. 
<div class="spacer10"></div>

Special thanks to <a href="https://github.com/blr21560">@blr21560</a> for the help with LESS conversion and localization, to 
<a href="https://github.com/easylogic">@easylogic</a>, <a href="https://github.com/kktos">@kktos</a>, <a href="https://github.com/drewda">@drewda</a>, 
<a href="https://github.com/fungms">@fungms</a> for various improvements and bug fixes. And to everyone else who contributed by testing, submitting bugs
working on tutorials and documentation.

<h3>The short story</h3>

In short, this release has a ton of bug fixes, improvements, updated documentation and demos. I cannot hold up this release any longer because
many times when people submit request for a bug fix, it is already fixed in current version. The following is the list of updates in this release:
<style> 
	.list1 { margin: 10px 40px; } .list1 li { margin: 5px 0px; } 
	.method { background-color: #e5e5e5; border-radius: 3px;  padding: 0px 4px; }
</style>
<ul class="list1">
	<li>All CSS files are converted to LESS</li>
	<li>The library is localized and first set of languages can be found in locale folder</li>
	<li>Exposed prototypes of all major widgets in w2obj global variable for easy extensibility</li>
	<li>Major improvements to w2form widget</li>
	<li>Added support for icon fonts libraries (for example font awesome)</li>
	<li>Added tabs and toolbar support for w2layout panels</li>
	<li>Added HTML5 file upload as base64 encoded data</li>
</ul>

<h3>The long story</h3>

This release has a number of various bug changes and new features and improvements. In the list below you can find all the improvements and
new features for each widget.

<h4>Layout</h4>
<ul class="list1">
	<li>Added <span class="method">.tabs</span> and <span class="method">.toolbar</span> properties</li>
	<li>All panels are now created but hidden if not explicitly defined</li>
	<li>Added second argument for <span class="method">.get(id, returnIndex)</span> method</li>
	<li>Deprecated <span class="method">.getIndex()</span> method</li>
	<li>Deprecated <span class="method">.add()</span>, <span class="method">.remove() </span>methods</li>
	<li>Deprecated <span class="method">.width</span> and <span class="method">.height</span> properties</li>
	<li>Renamed <span class="method">.spacer</span> to <span class="method">.resizer</span> property</li>
</ul>

<h4>Grid</h4>
<ul class="list1">
	<li>Added <span class="method">.addColumn()</span>, <span class="method">.removeColumn()</span>, <span class="method">.getColumn()</span> methods</li>
	<li>Added <span class="method">.hideColumn()</span>, <span class="method">.showColumn()</span> methods</li>
	<li>Added <span class="method">.addSearch()</span>, <span class="method">.removeSearch()</span>, <span class="method">.getSearch()</span> methods</li>
	<li>Added <span class="method">.hideSearch()</span>, <span class="method">.showSearch()</span> methods</li>
	<li>Added <span class="method">.getSearchData()</span> method</li>
	<li>Added <span class="method">.initColumnOnOff()</span> method</li>
	<li>Added <span class="method">.error()</span> method and <span class="method">.onError</span> event</li>
	<li>Added <span class="method">.column.searchable</span> property</li>
	<li>Added second argument for <span class="method">.find(obj, returnRecords)</span> method</li>
	<li>Added second argument for <span class="method">.get(id, returnIndex)</span> method</li>
	<li>Deprecated <span class="method">.getIndex()</span> method</li>
	<li>Deprecated <span class="method">.width</span> and <span class="method">.height</span> properties</li>
	<li>Deprecated <span class="method">.isLoaded</span> properties</li>
	<li>Renamed <span class="method">.showStatus()</span> to <span class="method">.lock()</span> method</li>
	<li>Renamed <span class="method">.hideStatus()</span> to <span class="method">.unlock()</span> method</li>
</ul>

<h4>Toolbar</h4>
<ul class="list1">
	<li>Added icon font support</li>
	<li>Added <span class="method">.doMenuClick()</span> method</li>
	<li>Added second argument for <span class="method">.get(id, returnIndex)</span> method</li>
	<li>Deprecated <span class="method">.getIndex()</span> method</li>
	<li>Deprecated <span class="method">.doOver()</span>, <span class="method">.doOut()</span>, <span class="method">.doDown()</span>, <span class="method">.doDropOver()</span>, <span class="method">.doDropOut()</span>, </li>
</ul>

<h4>Sidebar</h4>
<ul class="list1">
	<li>Added icon font support</li>
	<li>Added <span class="method">.topHTML</span> and <span class="method">.bottomHTML</span> properties</li>
	<li>Added <span class="method">.collapseAll()</span>, <span class="method">.expandAll()</span>, <span class="method">.expandParents()</span> methods</li>
	<li>Added <span class="method">.node.plus</span> property</li>
	<li>Added second argument for <span class="method">.get(id, returnIndex)</span> method</li>
	<li>Deprecated <span class="method">.getIndex()</span> method</li>
	<li>Renamed <span class="method">.doExpand()</span> to <span class="method">.expand()</span> method</li>
	<li>Renamed <span class="method">.doCollapse()</span> to <span class="method">.collapse()</span> method</li>
	<li>Renamed <span class="method">.doToggle()</span> to <span class="method">.toggle()</span> method</li>
</ul>

<h4>Tabs</h4>
<ul class="list1">
	<li>Added <span class="method">.select()</span> method</li>
	<li>Added second argument for <span class="method">.get(id, returnIndex)</span> method</li>
	<li>Deprecated <span class="method">.getIndex()</span> method</li>
</ul>

<h4>Form</h4>
<ul class="list1">
	<li>Added <span class="method">.focusFirst</span> property</li>
	<li>Added <span class="method">.header</span> property</li>
	<li>Added <span class="method">.lock()</span>, <span class="method">.unlock()</span> methods</li>
	<li>Added <span class="method">.error()</span> method and <span class="method">.onError</span> event</li>
	<li>Deprecated <span class="method">.width</span> and <span class="method">.height</span> properties</li>
	<li>Deprecated <span class="method">.isLoaded</span> property</li>
	<li>Renamed <span class="method">.form_html</span> to <span class="method">.formHTML</span> property</li>
	<li>Renamed <span class="method">.form_url</span> to <span class="method">.formURL</span> property</li>
</ul>

<h4>Popup</h4>
<ul class="list1">
	<li>Added <span class="method">.options.maximized</span> property</li>
	<li>Added <span class="method">.min()</span>, <span class="method">.max()</span>, <span class="method">.toggle()</span> methods</li>
</ul>

<h4>Fields</h4>
<ul class="list1">
	<li>Added new type list/select</li>
	<li>Added <span class="method">.addType()</span> method</li>
	<li>Added <span class="method">.customTypes</span> property</li>
	<li>Added new field type - <span class="method">upload</span></li>
</ul>

<h4>Utils</h4>
<ul class="list1">
	<li>Added <span class="method">w2obj</span> global variable for easy extensibility</li>
	<li>Added <span class="method">.escapeId()</span> method</li>
	<li>Added <span class="method">.locale()</span> method</li>
	<li>Added <span class="method">.lang()</span> method</li>
	<li>Added <span class="method"> event.preventDefault()</span> method for all widgets that use w2event object</li>
</ul>