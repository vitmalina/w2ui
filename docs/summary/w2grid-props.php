<link rel="stylesheet" type="text/css" href="../summary.css"/> 
<div class="container">
<div class="obj-property">
    <a href="w2grid.advanceOnEdit">advanceOnEdit</a> <span>- Boolean, default = true</span>
</div>
<div class="obj-property-desc">
    Indicates if the next editable field should be focused when editing the current field is completed,
</div>

<div class="obj-property">
    <a href="w2grid.autoLoad">autoLoad</a> <span>- Boolean, default = true</span>
</div>
<div class="obj-property-desc">
    Indicates if the records should be loaded from the server automatically as user scrolls.
</div>

<div class="obj-property">
    <a href="w2grid.buttons">buttons</a> <span>- Object, default see below</span>
</div>
<div class="obj-property-desc">
    Object that contains default toolbar items
</div>

<div class="obj-property">
    <a href="w2grid.colTemplate">colTemplate</a> <span>- Object, default = {...} see below</span>
</div>
<div class="obj-property-desc">
    Default values for the column
</div>

<div class="obj-property">
    <a href="w2grid.columnGroups">columnGroups</a> <span>- Array, default = []</span>
</div>
<div class="obj-property-desc">
    Array of column group objects.
</div>

<div class="obj-property">
    <a href="w2grid.columnTooltip">columnTooltip</a> <span>- String, default = 'top|bottom'</span>
</div>
<div class="obj-property-desc">
    Defines the position of the column tooltip.
</div>

<div class="obj-property">
    <a href="w2grid.columns">columns</a> <span>- Array, default = []</span>
</div>
<div class="obj-property-desc">
    Array of column objects.
</div>

<div class="obj-property">
    <a href="w2grid.contextMenu">contextMenu</a> <span>- Array, default = []</span>
</div>
<div class="obj-property-desc">
    Array of object for context menu.
</div>

<div class="obj-property">
    <a href="w2grid.dataType">dataType</a> <span>- String, default = null</span>
</div>
<div class="obj-property-desc">
    Defines dateType for the grid
</div>

<div class="obj-property">
    <a href="w2grid.defaultOperator">defaultOperator</a> <span>- Object, default = {...} // see below</span>
</div>
<div class="obj-property-desc">
    Defines default operator for each search type group
</div>

<div class="obj-property">
    <a href="w2grid.disableCVS">disableCVS</a> <span>- Boolean, default = false</span>
</div>
<div class="obj-property-desc">
    Indicates if column vertical scsoll (virtualization) is enabled.
</div>

<div class="obj-property">
    <a href="w2grid.fixedBody">fixedBody</a> <span>- Boolean, default = true</span>
</div>
<div class="obj-property-desc">
    Indicates if the body of the grid is of fixed height.
</div>

<div class="obj-property">
    <a href="w2grid.hasFocus">hasFocus</a> <span>- Boolean, default = false</span>
</div>
<div class="obj-property-desc">
    Indicates if grid has keyboard focus. Read Only.
</div>

<div class="obj-property">
    <a href="w2grid.header">header</a> <span>- String, default = ''</span>
</div>
<div class="obj-property-desc">
    The header of the grid.
</div>

<div class="obj-property">
    <a href="w2grid.httpHeaders">httpHeaders</a> <span>- Object, default = {}</span>
</div>
<div class="obj-property-desc">
    Optional request headers.
</div>

<div class="obj-property">
    <a href="w2grid.keyboard">keyboard</a> <span>- Boolean, default = true</span>
</div>
<div class="obj-property-desc">
    Indicates if grid should listen to keyboard.
</div>

<div class="obj-property">
    <a href="w2grid.last">last</a> <span>- Object, default see below</span>
</div>
<div class="obj-property-desc">
    Internal grid's variables.
</div>

<div class="obj-property">
    <a href="w2grid.limit">limit</a> <span>- Integer, default = 100</span>
</div>
<div class="obj-property-desc">
    Number of records to return from remote data source per attempt.
</div>

<div class="obj-property">
    <a href="w2grid.lineNumberWidth">lineNumberWidth</a> <span>- Integer, default = 34</span>
</div>
<div class="obj-property-desc">
    Width for the line number column.
</div>

<div class="obj-property">
    <a href="w2grid.markSearch">markSearch</a> <span>- Boolean, default = true</span>
</div>
<div class="obj-property-desc">
    Indicates if result of the search should be highlighted.
</div>

<div class="obj-property">
    <a href="w2grid.msgAJAXerror">msgAJAXerror</a> <span>- String, default = 'AJAX error. See console for more details.'</span>
</div>
<div class="obj-property-desc">
    Error message when server returns undefined error.
</div>

<div class="obj-property">
    <a href="w2grid.msgDelete">msgDelete</a> <span>- String, default = 'Are you sure you want to delete ${count} ${records}?'</span>
</div>
<div class="obj-property-desc">
    Confirmation message when user clicks the delete button.
</div>

<div class="obj-property">
    <a href="w2grid.msgEmpty">msgEmpty</a> <span>- String, default = ''</span>
</div>
<div class="obj-property-desc">
    Message that appears in the middle of the grid when remote srouce returns no records.
</div>

<div class="obj-property">
    <a href="w2grid.msgNeedReload">msgNeedReload</a> <span>- String, default = 'Your remote data source record count has changed, reloading from the first record.'</span>
</div>
<div class="obj-property-desc">
    Message that is displaed when total number of records on the server changed, and a reload from top is needed.
</div>

<div class="obj-property">
    <a href="w2grid.msgNotJSON">msgNotJSON</a> <span>- String, default = 'Returned data is not in valid JSON format.'</span>
</div>
<div class="obj-property-desc">
    Error message when server does not return JSON structure.
</div>

<div class="obj-property">
    <a href="w2grid.msgRefresh">msgRefresh</a> <span>- String, default = 'Refreshing...'</span>
</div>
<div class="obj-property-desc">
    Message that appears when grid refreshes.
</div>

<div class="obj-property">
    <a href="w2grid.msgServerError">msgServerError</a> <span>- String, default = 'Server error'</span>
</div>
<div class="obj-property-desc">
    Default server error message that appears when server responed with an error but w/o message.
</div>

<div class="obj-property">
    <a href="w2grid.multiSearch">multiSearch</a> <span>- Boolean, default = true</span>
</div>
<div class="obj-property-desc">
    Indicates if multi field search is allowed.
</div>

<div class="obj-property">
    <a href="w2grid.multiSelect">multiSelect</a> <span>- Boolean, default = true</span>
</div>
<div class="obj-property-desc">
    Indicates if record multi select is allowed.
</div>

<div class="obj-property">
    <a href="w2grid.multiSort">multiSort</a> <span>- Boolean, default = true</span>
</div>
<div class="obj-property-desc">
    Indicates if column multi sort is allowed.
</div>

<div class="obj-property">
    <a href="w2grid.nestedFields">nestedFields</a> <span>- Boolean, default = true</span>
</div>
<div class="obj-property-desc">
    Indicates if field names should be parsed
</div>

<div class="obj-property">
    <a href="w2grid.offset">offset</a> <span>- Integer, default = 0</span>
</div>
<div class="obj-property-desc">
    Number of records to skip when retrieving records from remote source.
</div>

<div class="obj-property">
    <a href="w2grid.operators">operators</a> <span>- Object, default = {...} // see below</span>
</div>
<div class="obj-property-desc">
    Defines operators for different types of search fields
</div>

<div class="obj-property">
    <a href="w2grid.operatorsMap">operatorsMap</a> <span>- Object, default = {...} // see below</span>
</div>
<div class="obj-property-desc">
    Defines a map of search type to operator type
</div>

<div class="obj-property">
    <a href="w2grid.parser">parser</a> <span>- Function, default = null</span>
</div>
<div class="obj-property-desc">
    Function to parse server response.
</div>

<div class="obj-property">
    <a href="w2grid.postData">postData</a> <span>- Object, default = {}</span>
</div>
<div class="obj-property-desc">
    Map of additional parameter to submit to remove data source.
</div>

<div class="obj-property">
    <a href="w2grid.ranges">ranges</a> <span>- Array, default = []</span>
</div>
<div class="obj-property-desc">
    Array of all ranges defined for the grid.
</div>

<div class="obj-property">
    <a href="w2grid.recid">recid</a> <span>- String, default = null</span>
</div>
<div class="obj-property-desc">
    Name for the recid field in the records array.
</div>

<div class="obj-property">
    <a href="w2grid.recordHeight">recordHeight</a> <span>- Integer, default = 24</span>
</div>
<div class="obj-property-desc">
    Height of the record.
</div>

<div class="obj-property">
    <a href="w2grid.records">records</a> <span>- Array, default = []</span>
</div>
<div class="obj-property-desc">
    Array of record objects.
</div>

<div class="obj-property">
    <a href="w2grid.reorderColumns">reorderColumns</a> <span>- Boolean, default = false</span>
</div>
<div class="obj-property-desc">
    Indicates if reordering of columns is allowed.
</div>

<div class="obj-property">
    <a href="w2grid.reorderRows">reorderRows</a> <span>- Boolean, default = false</span>
</div>
<div class="obj-property-desc">
    Indicates if reordering of rows is allowed.
</div>

<div class="obj-property">
    <a href="w2grid.routeData">routeData</a> <span>- String, default = ''</span>
</div>
<div class="obj-property-desc">
    Object with data for the route.
</div>

<div class="obj-property">
    <a href="w2grid.searchData">searchData</a> <span>- Array, default = []</span>
</div>
<div class="obj-property-desc">
    Array of search objects (submitted to data source for record filtering).
</div>

<div class="obj-property">
    <a href="w2grid.searchMap">searchMap</a> <span>- Object, default = {}</span>
</div>
<div class="obj-property-desc">
    Map for search fields (local to remote).
</div>

<div class="obj-property">
    <a href="w2grid.searches">searches</a> <span>- Array, default = []</span>
</div>
<div class="obj-property-desc">
    Array of search objects.
</div>

<div class="obj-property">
    <a href="w2grid.selectType">selectType</a> <span>- String, default = 'row'</span>
</div>
<div class="obj-property-desc">
    Defines selection type.
</div>

<div class="obj-property">
    <a href="w2grid.show">show</a> <span>- Object, default - see below</span>
</div>
<div class="obj-property-desc">
    Map of indicators which elements of the grid are visible.
</div>

<div class="obj-property">
    <a href="w2grid.showContextMenu">showContextMenu</a> <span>- contextMenu(recid, [event])</span>
</div>
<div class="obj-property-desc">
    Displays context menu under specified record.
</div>

<div class="obj-property">
    <a href="w2grid.showExtraOnSearch">showExtraOnSearch</a> <span>- Integer, default = 0</span>
</div>
<div class="obj-property-desc">
    Number of records to show that are before and after the matched record
</div>

<div class="obj-property">
    <a href="w2grid.sortData">sortData</a> <span>- Array, default = []</span>
</div>
<div class="obj-property-desc">
    Array of sort objects (submitted to data source for record sorting).
</div>

<div class="obj-property">
    <a href="w2grid.sortMap">sortMap</a> <span>- Object, default = {}</span>
</div>
<div class="obj-property-desc">
    Map for sort fields (local to remote).
</div>

<div class="obj-property">
    <a href="w2grid.stateColProps">stateColProps</a> <span>- Object, default = {...} see below</span>
</div>
<div class="obj-property-desc">
    Defines which column properties when state is saved
</div>

<div class="obj-property">
    <a href="w2grid.stateId">stateId</a> <span>- String, default = null</span>
</div>
<div class="obj-property-desc">
    Defines state id to save to local storage
</div>

<div class="obj-property">
    <a href="w2grid.summary">summary</a> <span>- Array, default = []</span>
</div>
<div class="obj-property-desc">
    Summary records that displayed on the bottom
</div>

<div class="obj-property">
    <a href="w2grid.tabIndex">tabIndex</a> <span>- Number, default = null</span>
</div>
<div class="obj-property-desc">
    Defines tab index for the grid.
</div>

<div class="obj-property">
    <a href="w2grid.textSearch">textSearch</a> <span>- String, default = 'begins'</span>
</div>
<div class="obj-property-desc">
    Defines how the text search behaves.
</div>

<div class="obj-property">
    <a href="w2grid.toolbar">toolbar</a> <span>- Object, default = null</span>
</div>
<div class="obj-property-desc">
    Toolbar for the grid.
</div>

<div class="obj-property">
    <a href="w2grid.total">total</a> <span>- Integer, default = 0</span>
</div>
<div class="obj-property-desc">
    Total number of records.
</div>

<div class="obj-property">
    <a href="w2grid.url">url</a> <span>- String or Object, default = ''</span>
</div>
<div class="obj-property-desc">
    URL to the remote data source.
</div>

<div class="obj-property">
    <a href="w2grid.vs_extra">vs_extra</a> <span>- Number, default = 15</span>
</div>
<div class="obj-property-desc">
    Defines the number of extra records to display when virtualizing
</div>

<div class="obj-property">
    <a href="w2grid.vs_start">vs_start</a> <span>- Number, default = 150</span>
</div>
<div class="obj-property-desc">
    Defines the number of records in the grid when to start virtualization
</div>

</div>