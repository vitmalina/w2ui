<?
	global $site_root, $theme;
	$theme->append('site-head', "<script src=\"".$site_root."/pages/code-mirror.js\"></script>");
?>

<div class="container">
	<div class="row">
		<div class="span10">
			<h2>Form</h2>
			The form object helps to steamline common tasks related to data input and user interaction. You can use a number of useful
			field types (autocomplete, date, int, float, etc.) with automatic validation. The object helps you populate data from the 
			server and submit changed back to the server.
		</div>
		<div class="span2">
			<br>
			<a href="<?=$site_root?>/demos#!forms" target="_blank" class="btn btn-success pull-right">
				More Demos
			</a>
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span12">
			<div id="form" style="height: 480px"></div>
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span4">
			<h3>Field Types</h3>
			Autocomplete, date, int, float, date or just a simple text or text area are all build-in field types.
		</div>
		<div class="span4">
			<h3>Validation</h3>
			Input values are automatically validated to comply with field type. Required fields are enforced before submitting.
		</div>
		<div class="span4">
			<h3>Multi Page</h3>
			If you have lots of fields that do not fit one page, you can created multiple pages for the same form.
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span4">
			<h3>Event Driven</h3>
			A number of useful events (onChange, onSubmit, onSave etc.) are all supported for your convenience.
		</div>
		<div class="span4">
			<h3>Templates</h3>
			Form offers a flexible way to use HTML templates loaded from a file or generated in JavaScript. 
		</div>
		<div class="span4">
			<h3>JavaScript APIs</h3>
			All functionality can be accessed from JavaScript in short, human-readble commands. 
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span12">
			<h2>HTML Markup</h2>
			<p>
				There is no restrictions on HTML template used for the form. You can use custom HTML with custom CSS. The example below uses default CSS 
				classes. The only requirement is to provide names for input controls for data binding and names for action buttons.
			</p>
			<textarea class="html">
<div id="form" style="height: 480px">
	<div class="w2ui-page page-0">
		<div class="w2ui-field w2ui-span8" style="clear: both">
			<label>Text:</label>
			<div>
				<input name="field_text" type="text" maxlength="100" style="width: 250px !important;">
			</div>
		</div>
		<div class="w2ui-field w2ui-span8" style="clear: both">
			<label>Text (alpha-numeric):</label>
			<div>
				<input name="field_alpha" type="text" maxlength="100" style="width: 250px !important;">
			</div>
		</div>
		<div class="w2ui-field w2ui-span8" style="clear: both">
			<label>Number (int):</label>
			<div>
				<input name="field_int" type="text" maxlength="100" style="width: 150px">
			</div>
		</div>
		<div class="w2ui-field w2ui-span8" style="clear: both">
			<label>Number (float):</label>
			<div>
				<input name="field_float" type="text" maxlength="100" style="width: 150px">
			</div>
		</div>
		<div class="w2ui-field w2ui-span8" style="clear: both">
			<label>Date:</label>
			<div>
				<input name="field_date" type="text" maxlength="100" style="width: 90px">
			</div>
		</div>
		<div class="w2ui-field w2ui-span8" style="clear: both">
			<label>List:</label>
			<div>
				<input name="field_list" type="text" maxlength="100" style="width: 300px !important">
			</div>
		</div>
		<div class="w2ui-field w2ui-span8" style="clear: both">
			<label>Multi Select:</label>
			<div>
				<input name="field_enum" type="text" maxlength="100"  style="width: 300px !important;">
			</div>
		</div>
		<div class="w2ui-field w2ui-span8" style="clear: both">
			<label>Text Area:</label>
			<div>
				<textarea name="field_textarea" type="text" style="width: 450px; height: 80px; resize: none"/>
			</div>
		</div>
	</div>

	<div class="w2ui-buttons">
		<button class="btn" name="reset">Reset</button>
		<button class="btn" name="save">Save</button>
	</div>
</div>
			</textarea>
			<h2>The Code</h2>
			<textarea class="javascript">
$('#form').w2form({ 
	name     : 'form',
	header   : 'Form',	
	url      : 'server/post',
	formURL  : '../pages/demo/demo-forms.html', 
	fields: [
		{ name: 'field_text', type: 'text', required: true },
		{ name: 'field_alpha', type: 'alphanumeric', required: true },
		{ name: 'field_int', type: 'int', required: true },
		{ name: 'field_float', type: 'float', required: true },
		{ name: 'field_date', type: 'date' },
		{ name: 'field_list', type: 'list', required: true, 
			options: { items: ['Adams, John', 'Johnson, Peter', 'Lewis, Frank', 'Cruz, Steve', 'Donnun, Nick'] } },
		{ name: 'field_enum', type: 'enum', required: true, 
			options: { items: ['Adams, John', 'Johnson, Peter', 'Lewis, Frank', 'Cruz, Steve', 'Donnun, Nick'] } },
		{ name: 'field_textarea', type: 'text'}
	],
	actions: {
		reset: function () {
			this.clear();
		},
		save: function () {
			var obj = this;
			this.save({}, function (data) { 
				if (data.status == 'error') {
					console.log('ERROR: '+ data.message);
					return;
				}
				obj.clear();
			});
		}
	}
});
// all event listener
w2ui['form'].on('*', function (event) {
	console.log(event);
});
		</textarea>
		</div>
	</div>
	<? global $feedback; print($feedback); ?>
</div>

<script>
$(function () {
	$('#form').w2form({ 
		name     : 'form',
		header   : 'Form',
		url      : 'server/post',
		formURL  : '../pages/demo/demo-forms.html', 
		fields: [
			{ name: 'field_text', type: 'text', required: true },
			{ name: 'field_alpha', type: 'alphanumeric', required: true },
			{ name: 'field_int', type: 'int', required: true },
			{ name: 'field_float', type: 'float', required: true },
			{ name: 'field_date', type: 'date' },
			{ name: 'field_list', type: 'list', required: true, 
				options: { items: ['Adams, John', 'Johnson, Peter', 'Lewis, Frank', 'Cruz, Steve', 'Donnun, Nick'] } },
			{ name: 'field_enum', type: 'enum', required: true, 
				options: { items: ['Adams, John', 'Johnson, Peter', 'Lewis, Frank', 'Cruz, Steve', 'Donnun, Nick'] } },
			{ name: 'field_textarea', type: 'text'}
		],
		actions: {
			reset: function () {
				this.clear();
			},
			save: function () {
				var obj = this;
				this.save({}, function (data) { 
					if (data.status == 'error') {
						console.log('ERROR: '+ data.message);
						return;
					}
					obj.clear();
				});
			}
		}
	});
	w2ui['form'].on('*', function (event) {
		console.log(event);
	});
});
</script>