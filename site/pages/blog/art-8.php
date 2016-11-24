<? $theme->assign("page-name", "W2UI 1.3 Released: Goodbye Pagination, Hello Infinite Scroll"); ?>

<h2>W2UI 1.3 Released: Goodbye Pagination, Hello Infinite Scroll</h2>
<div class="date">October 29, 2013</div>

<? require("blog-social.php"); ?>

<div class="spacer10"></div>

I am happy to announce the release of <a href="/web/downloads/w2ui-1.3.zip">W2UI ver 1.3</a>. This release has many new features, 
improvements, bug fixes. New 1.3 version is not backward compatible with 1.2, however, these release notes should help you migrate. 
I have also back-ported some bug fixes into <a href="/web/downloads/w2ui-1.2.1.zip">W2UI ver 1.2.1</a> that is fully backwards compatible 
with 1.2 version. 

<h3>The short story</h3>

One of the major changes in 1.3 is deprecation of pagination in favor of infinite scroll.
My goal was to make the grid present records in a natural way so that you would not even think that there
is any other way. You scroll, you see more records (if any). You engage the scroll bar, you get the records you were hoping to 
get. And I think it turned out to be an awesome feature.
<div style="height: 10px"></div>

You can see a demo of <a href="/web/demos/#!combo/combo-9">Infinite Scroll</a> in the demo section. It works great for local data source, 
when all records are present in JavaScript, as well as for remote data source when records and retrieved from the server as user scrolls. 
If your data source is remote, the grid will initially fetch first 100 records and if user scrolls down it will
fetch next 100. Fetched records get stored in the records array and if user scrolls up - no server request will be made. 
<div style="height: 10px"></div>

I have gotten an early comment from a user that it might not be satisfying for DB intensive requests. To address this issue a new
property has been introduced - <a href="/web/docs/w2layout.autoLoad">autoLoad</a> - that indicates whether to load
more records when user scrolls down or display "Load More" button at the bottom of prefetched records.
<div style="height: 10px"></div>

I have updated <a href="/web/demos">demos</a> and <a href="/web/docs">documentation</a> to reflect changes in 1.3. 
The following is the non-exhaustive list of updates in this release:
<style> 
	.list1 { margin: 10px 40px; } .list1 li { margin: 5px 0px; } 
	.method { background-color: #e5e5e5; border-radius: 3px;  padding: 0px 4px; }
</style>
<ul class="list1">
	<li><a href="/web/demos/#!combo/combo-9">Infinite Scroll</a></li>
	<li><a href="/web/demos/#!combo/combo-4">Buffered Scroll</a></li>
	<li>Pagination is deprecated</li>
	<li>Major performance improvements (grid tested with <a href="/web/blog/7/JavaScript-Grid-with-One-Million-Records">one million records</a>)</li>
	<li>Improved cross-widget integration (see <a href="/web/demos">demos</a>)</li>
	<li><a href="/web/demos/#!combo/combo-3">Spreadsheet-like Grids</a></li>
	<li>Ability to lock grid, layout, sidebar and popup content</li>
	<li>Improved keyboard navigation in grid and sidebar</li>
</ul>

<h3>The long story</h3>

Every widget has been touched in this release. In the list below you can find all improvements and new features for each widget.

<h4>Layout</h4>
<ul class="list1">
	<li>Improved %-based panel size calculations</li>
	<li>Improved min/max calculations on window resize</li>
	<li>Implemented ability to load CSS into a hidden panel</li>
	<li>Implemented ability to defined tabs as array or w2tabs object</li>
	<li>Added <a href="/web/docs/w2layout.el" class="method">.el()</a> method</li>
	<li>Added <a href="/web/docs/w2layout.html" class="method">.html()</a> method</li>
	<li>Added <a href="/web/docs/w2layout.lock" class="method">.lock()</a> method</li>
	<li>Added <a href="/web/docs/w2layout.unlock" class="method">.unlock()</a> method</li>
	<li>Added <a href="/web/docs/w2layout.sizeTo" class="method">.sizeTo()</a> method</li>
	<li>Added <a href="/web/docs/w2layout.showToolbar" class="method">.showToolbar()</a> method</li>
	<li>Added <a href="/web/docs/w2layout.hideToolbar" class="method">.hideToolbar()</a> method</li>
	<li>Added <a href="/web/docs/w2layout.toggleToolbar" class="method">.toggleToolbar()</a> method</li>
	<li>Added <a href="/web/docs/w2layout.showTabs" class="method">.showTabs()</a> method</li>
	<li>Added <a href="/web/docs/w2layout.hideTabs" class="method">.hideTabs()</a> method</li>
	<li>Added <a href="/web/docs/w2layout.toggleTabs" class="method">.toggleTabs()</a> method</li>
	<li>Deprecated <span class="method">.doResize()</span> method (made private)</li>
	<li>Deprecated <span class="method">.startResize()</span> method (made private)</li>
	<li>Deprecated <span class="method">.stopResize()</span> method (made private)</li>
	<li>Deprecated <span class="method">.initEvents()</span> method (made private)</li>
	<li>Deprecated <span class="method">.initTabs()</span> method (made private)</li>
	<li>Deprecated <span class="method">.initToolbar()</span> method (made private)</li>
</ul>

<h4>Grid</h4>
<ul class="list1">
	<li>Implemented infinite scroll</li>
	<li>Implemented grid formatters (number, int, float, money, age, date)</li>
	<li>Improved peformance for large number of records</li>
	<li>Improved column width distribution</li>
	<li>Improved grid data table resize</li>
	<li>Improved local search (does not require search field defined to search)</li>
	<li>Improved keyboard navigation and selection with keyboard</li>
	<li>Improved grid search</li>
	<li>Added <a href="/web/docs/w2grid.onCollapse" class="method">.onCollapse</a> event</li>
	<li>Added <a href="/web/docs/w2grid.onColumnClick" class="method">.onColumnClick</a> event</li>
	<li>Added <a href="/web/docs/w2grid.onColumnOnOff" class="method">.onColumnOnOff</a> event</li>
	<li>Added <a href="/web/docs/w2grid.onColumnResize" class="method">.onColumnResize</a> event</li>
	<li>Added <a href="/web/docs/w2grid.onCopy" class="method">.onCopy</a> event</li>
	<li>Added <a href="/web/docs/w2grid.onDeleted" class="method">.onDeleted</a> event</li>
	<li>Added <a href="/web/docs/w2grid.onEditField" class="method">.onEditField</a> event</li>
	<li>Added <a href="/web/docs/w2grid.onKeydown" class="method">.onKeydown</a> event</li>
	<li>Added <a href="/web/docs/w2grid.onPaste" class="method">.onPaste</a> event</li>
	<li>Added <a href="/web/docs/w2grid.onReload" class="method">.onReload</a> event</li>
	<li>Added <a href="/web/docs/w2grid.onSaved" class="method">.onSaved</a> event</li>
	<li>Added <a href="/web/docs/w2grid.onToolbar" class="method">.onToolbar</a> event</li>
	<li>Added <a href="/web/docs/w2grid.keyboard" class="method">.keyboard</a> property</li>
	<li>Added <a href="/web/docs/w2grid.buffered" class="method">.buffered</a> property</li>
	<li>Added <a href="/web/docs/w2grid.autoLoad" class="method">.autoLoad</a> property</li>
	<li>Added <a href="/web/docs/w2grid.selectType" class="method">.selectType</a> property</li>
	<li>Added <a href="/web/docs/w2grid.limit" class="method">.limit</a> propety</li>
	<li>Added <a href="/web/docs/w2grid.offset" class="method">.offset</a> propety</li>
	<li>Added <a href="/web/docs/w2grid.recordHeight" class="method">.recordHeight</a> property</li>
	<li>Added <a href="/web/docs/w2grid.show" class="method">.show.recordTitles</a> property</li>
	<li>Added <a href="/web/docs/w2grid.records" class="method">.records[].changes</a> property</li>
	<li>Added <a href="/web/docs/w2grid.records" class="method">.records[].changed</a> property</li>
	<li>Added <a href="/web/docs/w2grid.records" class="method">.records[].expanded</a> property</li>
	<li>Added <a href="/web/docs/w2grid.keydown" class="method">.keydown()</a> method</li>
	<li>Added <a href="/web/docs/w2grid.getRecordHTML" class="method">.getRecordHTML()</a> method</li>
	<li>Added <a href="/web/docs/w2grid.getSummaryHTML" class="method">.getSummaryHTML()</a> method</li>
	<li>Added <a href="/web/docs/w2grid.skip" class="method">.skip()</a> method</li>
	<li>Added <a href="/web/docs/w2grid.columnOnOff" class="method">.columnOnOff()</a> method</li>
	<li>Added <a href="/web/docs/w2grid.columnClick" class="method">.columnClick()</a> method</li>
	<li>Added <a href="/web/docs/w2grid.scrollIntoView" class="method">.scrollIntoView()</a> method</li>
	<li>Added <a href="/web/docs/w2grid.collapse" class="method">.collapse()</a> method</li>
	<li>Added <a href="/web/docs/w2grid.toggle" class="method">.toggle()</a> method</li>
	<li>Added <a href="/web/docs/w2grid.getCellData" class="method">.getCellData()</a> method</li>
	<li>Added <a href="/web/docs/w2grid.status" class="method">.status()</a> method</li>
	<li>Added <a href="/web/docs/w2grid.mergeChanged" class="method">.mergeChanged()</a> method</li>
	<li>Added <a href="/web/docs/w2grid.copy" class="method">.copy()</a> method</li>
	<li>Added <a href="/web/docs/w2grid.paste" class="method">.paste()</a> method</li>
	<li>Added <a href="/web/docs/w2grid.addRange" class="method">.addRange()</a> method</li>
	<li>Added <a href="/web/docs/w2grid.removeRange" class="method">.removeRange()</a> method</li>
	<li>Added <a href="/web/docs/w2grid.getRange" class="method">.getRange()</a> method</li>
	<li>Refactored <a href="/web/docs/w2grid.url" class="method">.url</a> property to allow different components</li>
	<li>Refactored <a href="/web/docs/w2grid.set" class="method">.set()</a> method</li>
	<li>Refactored <a href="/web/docs/w2grid.getSelection" class="method">.getSelection()</a> method</li>
	<li>Refactored <a href="/web/docs/w2grid.lock" class="method">.lock()</a> method</li>
	<li>Refactored <a href="/web/docs/w2grid.unlock" class="method">.unlock()</a> method</li>
	<li>Refactored <a href="/web/docs/w2grid.columns" class="method">.columns[].title</a> property (can be string or function)</a></li>
	<li>Refactored <a href="/web/docs/w2grid.records" class="method">.records[].render</a> property (added extra argument column_index)</a></li>
	<li>Deprecated <span class="method">.fixedRecord</span> property</li>
	<li>Deprecated <span class="method">.recordsPerPage</span> property</li>
	<li>Deprecated <span class="method">.page</span> property</li>
	<li>Deprecated <span class="method">.record.hidden</span> property</li>
	<li>Deprecated <span class="method">.selectPage()</span> method</li>
	<li>Deprecated <span class="method">.goto()</span> method</li>
	<li>Deprecated <span class="method">.doAdd()</span> method</li>
	<li>Deprecated <span class="method">.doEdit()</span> method</li>
	<li>Renamed <span class="method">.doEdit()</span> into <a href="/web/docs/w2tabs.editField" class="method">.editField()</a></li>
	<li>Renamed <span class="method">.doExpand()</span> into <a href="/web/docs/w2tabs.expand" class="method">.expand()</a></li>
	<li>Renamed <span class="method">.doClick()</span> into <a href="/web/docs/w2tabs.click" class="method">.click()</a></li>
	<li>Renamed <span class="method">.doDblClick()</span> into <a href="/web/docs/w2tabs.dblClick" class="method">.dblClick()</a></li>
	<li>Renamed <span class="method">.doScroll()</span> into <a href="/web/docs/w2tabs.scroll" class="method">.scroll()</a></li>
	<li>Renamed <span class="method">.doSort()</span> into <a href="/web/docs/w2tabs.sort" class="method">.sort()</a></li>
	<li>Renamed <span class="method">.doSave()</span> into <a href="/web/docs/w2tabs.save" class="method">.save()</a></li>
	<li>Renamed <span class="method">.doDelete()</span> into <a href="/web/docs/w2tabs.delete" class="method">.delete()</a></li>
</ul>

<h4>Toolbar</h4>
<ul class="list1">
	<li>Renamed <span class="method">.doClick()</span> into <a href="/web/docs/w2toolbar.click" class="method">.click()</a></li>
	<li>Renamed <span class="method">.doMenuClick()</span> into <a href="/web/docs/w2toolbar.menuClick" class="method">.menuClick()</a></li>
	<li>Deprecated <span class="method">.getMenuHTML()</span> method</a></li>
</ul>

<h4>Sidebar</h4>
<ul class="list1">
	<li>Animated Expand/Collapse</li>
	<li>Keyboard Navigation</li>
	<li>Implemented Context Menu</li>
	<li>Lock/Unlock of the sidebar</li>
	<li>Added <a href="/web/docs/w2sidebar.keyboard" class="method">.keyboard</a> property</li>
	<li>Added <a href="/web/docs/w2sidebar.menu" class="method">.menu()</a> property</li>
	<li>Added <a href="/web/docs/w2sidebar.onKeydown" class="method">.onKeydown</a> event</li>
	<li>Added <a href="/web/docs/w2sidebar.onMenuClick" class="method">.onMenuClick</a> event</li>
	<li>Added <a href="/web/docs/w2sidebar.keydown" class="method">.keydown()</a> method</li>
	<li>Added <a href="/web/docs/w2sidebar.menuClick" class="method">.menuClick()</a> method</li>
	<li>Added <a href="/web/docs/w2sidebar.scrollIntoView" class="method">.scrollIntoView()</a> method</li>
	<li>Added <a href="/web/docs/w2sidebar.lock" class="method">.lock()</a> method</li>
	<li>Added <a href="/web/docs/w2sidebar.unlock" class="method">.unlock()</a> method</li>
	<li>Renamed <span class="method">.doClick()</span> into <a href="/web/docs/w2sidebar.click" class="method">.click()</a></li>
	<li>Renamed <span class="method">.doDblClick()</span> into <a href="/web/docs/w2sidebar.dblClick" class="method">.dblClick()</a></li>
</ul>

<h4>Tabs</h4>
<ul class="list1">
	<li>Renamed <span class="method">.doClick()</span> into <a href="/web/docs/w2tabs.click" class="method">.click()</a></li>
	<li>Renamed <span class="method">.doClose()</span> into <a href="/web/docs/w2tabs.animateClose" class="method">.animateClose()</a></li>
	<li>Renamed <span class="method">.doInsert()</span> into <a href="/web/docs/w2tabs.animateInsert" class="method">.animateInsert()</a></li>
</ul>

<h4>Form</h4>
<ul class="list1">
	<li>Improved Auto Template Generation</li>
	<li>Added <a href="/web/docs/w2form.focus" class="method">.focus</a> property</li>
	<li>Added <a href="/web/docs/w2form.toolbar" class="method">.toolbar</a> property</li>
	<li>Added <a href="/web/docs/w2form.onToolbar" class="method">.onToolbar</a> event</li>
	<li>Added <a href="/web/docs/w2form.onValidate" class="method">.onValidate</a> event</li>
	<li>Added <a href="/web/docs/w2form.submit" class="method">.submit()</a> method</li>
	<li>Renamed <span class="method">.doAction()</span> into <a href="/web/docs/w2form.action" class="method">.action()</a></li>
	<li>Refactored <a href="/web/docs/w2form.url" class="method">.url</a> property to allow different components</li>
	<li>Refactored <a href="/web/docs/w2form.lock" class="method">.lock()</a> method</li>
	<li>Refactored <a href="/web/docs/w2form.unlock" class="method">.unlock()</a> method</li>
	<li>Deprecated <span class="method">.focusFirst</span> property</a></li>
	<li>Deprecated <span class="method">.init()</span> method</a></li>
</ul>

<h4>Popup</h4>
<ul class="list1">
	<li>Keyboard Navigation for w2popup (esc)</li>
	<li>Keyboard Navigation for w2alert and w2confirm (esc - no, enter - yes)</li>
	<li>Added <a href="/web/docs/w2popup.onKeydown" class="method">.onKeydown</a> event</li>
	<li>Added <a href="/web/docs/w2popup.lock" class="method">.lock()</a> method</li>
	<li>Added <a href="/web/docs/w2popup.unlock" class="method">.unlock()</a> method</li>
	<li>Renamed <span class="method">.doKeydown()</span> into <a href="/web/docs/w2popup.keydown" class="method">.keydown()</a></li>
	<li>Refactored w2alert and w2confirm to work when a popup already opened</li>
	<li>Refactored Events to be fully compient with w2event as in all other widgets</li>
</ul>

<h4>Fields</h4>
<ul class="list1">
	<li>Implemented keybaord increment for number fields</li>
	<li>Implemented read only for enums</li>
	<li>Added <span class="method">options.url</span> select property</li>
	<li>Added <span class="method">options.render</span> method for enum, if returns false, no item show</li>
	<li>Added <span class="method">options.onAdd</span> enum event</li>
	<li>Added <span class="method">options.onHide</span> enum event</li>
	<li>Added <span class="method">options.onItemOut</span> enum event</li>
	<li>Added <span class="method">options.onItemOver</span> enum event</li>
	<li>Added <span class="method">options.onItemClick</span> enum event</li>
	<li>Added <span class="method">options.onRemove</span> enum event</li>
	<li>Added <span class="method">options.onShow</span> enum event</li>
	</li>
</ul>

<h4>Utils</h4>
<ul class="list1">
	<li>Implemented w2utils.keyboard object for keyboard navigation</li>
	<li>Implemented $().w2marker('string') jQuery plugin</li>
	<li>Implemented $().w2menu('string') jQuery plugin</li>
	<li>Added <a href="/web/docs/w2utils.formatNumber" class="method">.formatNumber()</a> method</li>
	<li>Added <a href="/web/docs/w2utils.formatTime" class="method">.formatTime()</a> method</li>
	<li>Added <a href="/web/docs/w2utils.formatDateTime" class="method">.formatDateTime()</a> method</li>
	<li>Added <a href="/web/docs/w2utils.lock" class="method">.lock()</a> method</li>
	<li>Added <a href="/web/docs/w2utils.unlock" class="method">.unlock()</a> method</li>
</ul>