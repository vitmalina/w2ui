<link rel="stylesheet" type="text/css" href="../summary.css"/> 
<div class="container">
<div class="obj-property">
    <a href="w2form.actions">actions</a> <span>- Object, default = {}</span>
</div>
<div class="obj-property-desc">
    Object of event handlers for form actions.
</div>

<div class="obj-property">
    <a href="w2form.applyFocus">applyFocus</a> <span>- setFocus([focus])</span>
</div>
<div class="obj-property-desc">
    Sets focus to a field.
</div>

<div class="obj-property">
    <a href="w2form.autosize">autosize</a> <span>- Boolean, default = true</span>
</div>
<div class="obj-property-desc">
    Indicates if the form should set the height of the box where it is rendered based on the form's content.
</div>

<div class="obj-property">
    <a href="w2form.dataType">dataType</a> <span>- String, default = null</span>
</div>
<div class="obj-property-desc">
    Defines dateType for the form
</div>

<div class="obj-property">
    <a href="w2form.fields">fields</a> <span>- Object, default = []</span>
</div>
<div class="obj-property-desc">
    Array of field objects.
</div>

<div class="obj-property">
    <a href="w2form.focus">focus</a> <span>- Integer, default = 0</span>
</div>
<div class="obj-property-desc">
    Indicates what field to set focus on render.
</div>

<div class="obj-property">
    <a href="w2form.formHTML">formHTML</a> <span>- String, default = ''</span>
</div>
<div class="obj-property-desc">
    Form HTML template.
</div>

<div class="obj-property">
    <a href="w2form.formURL">formURL</a> <span>- String, default = ''</span>
</div>
<div class="obj-property-desc">
    URL of the form HTML template.
</div>

<div class="obj-property">
    <a href="w2form.header">header</a> <span>- String, default = ''</span>
</div>
<div class="obj-property-desc">
    The header of the form.
</div>

<div class="obj-property">
    <a href="w2form.httpHeaders">httpHeaders</a> <span>- Object, default = {}</span>
</div>
<div class="obj-property-desc">
    Object of http headers for AJAX calls.
</div>

<div class="obj-property">
    <a href="w2form.isGenerated">isGenerated</a> <span>- Boolean, default = false.</span>
</div>
<div class="obj-property-desc">
    Indicates if HTML template has been generated.
</div>

<div class="obj-property">
    <a href="w2form.last">last</a> <span>- Object, default see below</span>
</div>
<div class="obj-property-desc">
    Last state parameters
</div>

<div class="obj-property">
    <a href="w2form.method">method</a> <span>- String, default = null</span>
</div>
<div class="obj-property-desc">
    Override the method for this form.
</div>

<div class="obj-property">
    <a href="w2form.msgAJAXerror">msgAJAXerror</a> <span>- String, default = 'AJAX error. See console for more details.'</span>
</div>
<div class="obj-property-desc">
    Error message when server returns undefined error.
</div>

<div class="obj-property">
    <a href="w2form.msgNotJSON">msgNotJSON</a> <span>- String, default = 'Returned data is not in valid JSON format.'</span>
</div>
<div class="obj-property-desc">
    Error message when server does not return JSON structure.
</div>

<div class="obj-property">
    <a href="w2form.msgRefresh">msgRefresh</a> <span>- String, default = 'Refreshing...'</span>
</div>
<div class="obj-property-desc">
    Message that appears when form refreshes.
</div>

<div class="obj-property">
    <a href="w2form.msgSaving">msgSaving</a> <span>- String, default = 'Saving...'</span>
</div>
<div class="obj-property-desc">
    Message that appears when form is being saved.
</div>

<div class="obj-property">
    <a href="w2form.msgServerError">msgServerError</a> <span>- String, default = 'Server error'</span>
</div>
<div class="obj-property-desc">
    Default server error message that appears when server responed with an error but w/o message.
</div>

<div class="obj-property">
    <a href="w2form.multipart">multipart</a> <span>- Boolean, default = false</span>
</div>
<div class="obj-property-desc">
    Indicates if form need to be submitted as multipart/form-data
</div>

<div class="obj-property">
    <a href="w2form.nestedFields">nestedFields</a> <span>- Boolean, default = true</span>
</div>
<div class="obj-property-desc">
    Use field name containing dots as separator to look into object.
</div>

<div class="obj-property">
    <a href="w2form.original">original</a> <span>- Object, default = {}</span>
</div>
<div class="obj-property-desc">
    Original fields as they were loaded from data source.
</div>

<div class="obj-property">
    <a href="w2form.page">page</a> <span>- Integer, default = 0</span>
</div>
<div class="obj-property-desc">
    Current page.
</div>

<div class="obj-property">
    <a href="w2form.pageStyle">pageStyle</a> <span>- String, default = ''</span>
</div>
<div class="obj-property-desc">
    Additional style for each form page div
</div>

<div class="obj-property">
    <a href="w2form.postData">postData</a> <span>- Object, default = {}</span>
</div>
<div class="obj-property-desc">
    Map of additional parameter to submit to remote data source.
</div>

<div class="obj-property">
    <a href="w2form.recid">recid</a> <span>- Integer, default = null</span>
</div>
<div class="obj-property-desc">
    ID of the record.
</div>

<div class="obj-property">
    <a href="w2form.record">record</a> <span>- Object, default = {}</span>
</div>
<div class="obj-property-desc">
    Map of field values.
</div>

<div class="obj-property">
    <a href="w2form.routeData">routeData</a> <span>- String, default = ''</span>
</div>
<div class="obj-property-desc">
    Object with data for the route.
</div>

<div class="obj-property">
    <a href="w2form.tabindexBase">tabindexBase</a> <span>- Integer, default = 0</span>
</div>
<div class="obj-property-desc">
    Indicates the tabindex base value for generated form fields.
</div>

<div class="obj-property">
    <a href="w2form.tabs">tabs</a> <span>- Object, default = {}</span>
</div>
<div class="obj-property-desc">
    Tabs for the form.
</div>

<div class="obj-property">
    <a href="w2form.toolbar">toolbar</a> <span>- Object, default = {}</span>
</div>
<div class="obj-property-desc">
    Toolbar for the form.
</div>

<div class="obj-property">
    <a href="w2form.url">url</a> <span>- String or Object, default = ''</span>
</div>
<div class="obj-property-desc">
    URL to the remote data source.
</div>

</div>