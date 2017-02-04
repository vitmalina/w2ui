<? 
	$theme->assign("page-name", "HTML5 Input Types Alternative"); 
	$theme->assign('site-head',
		'<link rel="stylesheet" type="text/css" href="/src/w2ui-fields-1.0.min.css" />'.
		'<script type="text/javascript" src="/src/w2ui-fields-1.0.min.js"></script>'.
		'<script src="/web/pages/code-mirror.js"></script>'.
		'<meta http-equiv="Content-Type" content="text/html; charset=utf-8">'.
		'<link rel="stylesheet" type="text/css" media="screen" href="/web/js/font-awesome/font-awesome.css" />'
	);
?>
			<style>
.w2ui-label {
  float: left;
  margin-top: 6px;
  margin-bottom: 3px;
  width: 100px;
  padding: 0px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
  min-height: 20px;
}
.w2ui-field {
  margin-bottom: 3px;
  margin-left: 108px;
  padding: 3px;
  min-height: 20px;
}
span.legend {
	padding-left: 20px;
	color: #888;
}
</style>

<h2>HTML5 Input Types Alternative</h2>
<div class="date">January 22, 2014</div>

<? require("blog-social.php"); ?>

As you may know, HTML5 has introduced several new input types: number, date, color, range, etc. The question is: should you 
start using these controls or not? As much as I want to say "Yes", I think they are not yet ready for any real life 
project. The main reason is inconsistent implementation by different browsers. 
<div style="height: 20px;"></div>
In the form below you can see some of the HTML5 input types. Depending on your browser you might or might not see any difference 
from a regular input control. 
<div style="height: 20px;"></div>

<div class="w2ui-label"> Number: </div>
<div class="w2ui-field"> <input type="number"> </div>
<div class="w2ui-label"> Date: </div>
<div class="w2ui-field"> <input type="date"> </div>
<div class="w2ui-label"> Color: </div>
<div class="w2ui-field"> <input type="color"> </div>
<div class="w2ui-label"> Range: </div>
<div class="w2ui-field"> <input type="range"> </div>
<div style="height: 20px;"></div>

What, then, should you use? You can develop your own input types, or use an existing library. Everyone is probably familiar with
jQuery date picker or other jQuery plug-ins that come to rescue. However, I have not yet found a comprehensive library that would suit all
my input needs, so I decided to put together my own that would  be small, consistent and would cover following areas:
<ul style="margin: 10px 50px;">
	<li><a href="#numeric">Numeric Inputs</a></li>
	<li><a href="#date">Date and Time</a></li>
	<li><a href="#list">Drop Down Lists</a></li>
	<li><a href="#multi">Multi Selects</a></li>
	<li><a href="#file">File Upload</a></li>
</ul>
<div id="numeric" style="height: 10px;"></div>
I've worked on these controls over the course of past several years as part of a large library called 
<a href="http://w2ui.com">W2UI</a>. However, I've realized
that a stand-alone library with just input controls might be quite useful.

<h3>Numeric Inputs</h3>

Numeric inputs will only allow you to type numbers. They will completely ignore all other characters. 
Full keyboard support is implemented. Try using up/down arrow keys, ctr + up/down (command + up/down on mac) to increase numbers. 
When the number is changed it will be validated and formatted (if needed).
<div style="height: 20px;"></div>

<b>General</b>
<div style="height: 5px; clear: both"></div>

<div class="w2ui-label"> Integer: </div>
<div class="w2ui-field"> <input id="w2int" style="text-align: right; width: 150px"> </div>
<div class="w2ui-label"> Float: </div>
<div class="w2ui-field"> <input id="w2float" style="text-align: right; width: 150px"> </div>
<div class="w2ui-label"> Hex: </div>
<div class="w2ui-field"> <input id="w2hex" style="text-align: right; width: 150px"> </div>
<div class="w2ui-label"> Color: </div>
<div class="w2ui-field"> <input id="w2color" style="width: 100px"> </div>
<div style="height: 20px; clear: both"></div>

<b>US Format</b>
<div style="height: 5px; clear: both"></div>

<div class="w2ui-label"> Integer: </div>
<div class="w2ui-field"> <input id="us-int" style="text-align: right; width: 150px" value="0"> </div>
<div class="w2ui-label"> Float: </div>
<div class="w2ui-field"> <input id="us-float" style="text-align: right; width: 150px" value="0"> </div>
<div class="w2ui-label"> Money: </div>
<div class="w2ui-field"> <input id="us-money" style="text-align: right; width: 150px" value="0"> </div>
<div class="w2ui-label"> Percent: </div>
<div class="w2ui-field"> <input id="us-percent" style="text-align: right; width: 150px" value="0"> </div>
<div style="height: 20px; clear: both"></div>

<b>EU Common Format</b>
<div style="height: 5px; clear: both"></div>

<div class="w2ui-label"> Integer: </div>
<div class="w2ui-field"> <input id="eu-int" style="text-align: right; width: 150px" value="0"> </div>
<div class="w2ui-label"> Float: </div>
<div class="w2ui-field"> <input id="eu-float" style="text-align: right; width: 150px" value="0"> </div>
<div class="w2ui-label"> Money: </div>
<div class="w2ui-field"> <input id="eu-money" style="text-align: right; width: 150px" value="0"> </div>
<div class="w2ui-label"> Percent: </div>
<div class="w2ui-field"> <input id="eu-percent" style="text-align: right; width: 150px" value="0"> </div>
<div style="height: 20px; clear: both"></div>

<script>
$(function () {
	$('#w2int').w2field('int', { autoFormat: false });
	$('#w2float').w2field('float', { autoFormat: false });
	$('#w2hex').w2field('hex');
	$('#w2color').w2field('color');

	$('#us-int').w2field('int');
	$('#us-float').w2field('float', { precision: 3 });
	$('#us-money').w2field('money', { moneySymbol: '$' });
	$('#us-percent').w2field('percent', { precision: 1, min: 0, max: 100 });

	$('#eu-int').w2field('int', { groupSymbol: ' ' });
	$('#eu-float').w2field('float', { groupSymbol: ' ', precision: 3 });
	$('#eu-money').w2field('money', { groupSymbol: ' ', currencyPrefix: '', currencySuffix: '€' });
	$('#eu-percent').w2field('percent', { precision: 1, min: 0, max: 100 });
});
</script>

<b>JavaScript</b>
<textarea class="javascript">
// General
$('#w2int').w2field('int', { autoFormat: false });
$('#w2float').w2field('float', { autoFormat: false });
$('#w2hex').w2field('hex');
$('#w2color').w2field('color');

// US Format
$('#us-int').w2field('int', { autoFormat: true });
$('#us-float').w2field('float', { precision: 3 });
$('#us-money').w2field('money', { moneySymbol: '$' });
$('#us-percent').w2field('percent', { precision: 1, min: 0, max: 100 });

// EU Common Format
$('#eu-int').w2field('int', { autoFormat: true, groupSymbol: ' ' });
$('#eu-float').w2field('float', { groupSymbol: ' ', precision: 3 });
$('#eu-money').w2field('money', { groupSymbol: ' ', currencyPrefix: '', currencySuffix: '€' });
$('#eu-percent').w2field('percent', { precision: 1, min: 0, max: 100 });
</textarea>

Second argument is a list of options, that include the following:
<textarea class="javascript">
options = {
	min             : null,
	max             : null,
	placeholder     : '',
	autoFormat      : true,
	currencyPrefix  : '$',
	currencySuffix  : '',
	groupSymbol     : ',',
	arrows          : false,
	keyboard        : true,
	precision       : null,
	silent          : true,
	prefix          : '',
	suffix          : ''
}
</textarea>
<div id="date" style="height: 10px;"></div>

<h3>Date and Time</h3>

For DATE and TIME types you can use keyboard to increment by a day (or a minute) if you click up/down arrow keys. You can also use
ctr + up/down (command + up/down on mac) to increment by a month (or an hour).
<div style="height: 20px;"></div>

<b>US Format</b>
<div style="height: 5px; clear: both"></div>

<div class="w2ui-label"> Date: </div>
<div class="w2ui-field"> <input type="us-date" style="width: 100px"> </div>
<div class="w2ui-label"> From-To: </div>
<div class="w2ui-field"> <input type="us-dateA" style="width: 100px"> <span class="legend">(from 10th to 20th of current month)</span></div>
<div class="w2ui-label"> Blocked Days: </div>
<div class="w2ui-field"> <input type="us-dateB" style="width: 100px"> <span class="legend">(12,13,14 of current month are blocked)</span></div>
<div class="w2ui-label"> Date Range: </div>
<div class="w2ui-field"> <input type="us-date1" style="width: 100px"> - <input type="us-date2" style="width: 100px"> </div>
<div class="w2ui-label"> Time: </div>
<div class="w2ui-field"> <input type="us-time" style="width: 100px"> </div>
<div class="w2ui-label"> From-To: </div>
<div class="w2ui-field"> <input type="us-timeA" style="width: 100px"> <span class="legend">(from 8:00 am to 4:30 pm)</span></div>
<div style="height: 20px; clear: both"></div>

<b>EU Common Format</b>
<div style="height: 5px; clear: both"></div>

<div class="w2ui-label"> Date: </div>
<div class="w2ui-field"> <input type="eu-date" style="width: 100px"> </div>
<div class="w2ui-label"> From-To: </div>
<div class="w2ui-field"> <input type="eu-dateA" style="width: 100px"> <span class="legend">(from 10th to 20th of current month)</span></div>
<div class="w2ui-label"> Blocked Days: </div>
<div class="w2ui-field"> <input type="eu-dateB" style="width: 100px"> <span class="legend">(12,13,14 of current month are blocked)</span></div>
<div class="w2ui-label"> Date Range: </div>
<div class="w2ui-field"> <input type="eu-date1" style="width: 100px"> - <input type="eu-date2" style="width: 100px"> </div>
<div class="w2ui-label"> Time: </div>
<div class="w2ui-field"> <input type="eu-time" style="width: 100px"> </div>
<div class="w2ui-label"> From-To: </div>
<div class="w2ui-field"> <input type="eu-timeA" style="width: 100px"> <span class="legend">(from 8:00 am to 4:30 pm)</span></div>
<div style="height: 20px; clear: both"></div>

<script>
$(function () {
	var month = (new Date()).getMonth() + 1;
	var year  = (new Date()).getFullYear();

	// US Format
	$('input[type=us-date]').w2field('date');
	$('input[type=us-dateA]').w2field('date', { format: 'm/d/yyyy', start:  month + '/10/' + year, end: month + '/20/' + year });
	$('input[type=us-dateB]').w2field('date', { format: 'm/d/yyyy', blocked: [ month+'/12/2014',month+'/13/2014',month+'/14/' + year,]});
	$('input[type=us-date1]').w2field('date', { format: 'm/d/yyyy', end: $('input[type=us-date2]') });
	$('input[type=us-date2]').w2field('date', { format: 'm/d/yyyy', start: $('input[type=us-date1]') });
	$('input[type=us-time]').w2field('time', { format: 'h12' });
	$('input[type=us-timeA]').w2field('time', { format: 'h12', start: '8:00 am', end: '4:30 pm' });

	// EU Common Format
	$('input[type=eu-date]').w2field('date', { format: 'd.m.yyyy' });
	$('input[type=eu-dateA]').w2field('date', { format: 'd.m.yyyy', start:  '10.' + month + '.' + year, end: '20.' + month + '.' + year });
	$('input[type=eu-dateB]').w2field('date', { format: 'd.m.yyyy', blocked: ['12.' + month + '.' + year, '13.' + month + '.' + year, '14.' + month + '.' + year]});
	$('input[type=eu-date1]').w2field('date', { format: 'd.m.yyyy', end: $('input[type=eu-date2]') });
	$('input[type=eu-date2]').w2field('date', { format: 'd.m.yyyy', start: $('input[type=eu-date1]') });
	$('input[type=eu-time]').w2field('time', { format: 'h24' });
	$('input[type=eu-timeA]').w2field('time', { format: 'h24', start: '8:00 am', end: '4:30 pm' });
});
</script>

<b>JavaScript</b>
<textarea class="javascript">
var month = (new Date()).getMonth() + 1;
var year  = (new Date()).getFullYear();

// US Format
$('input[type=us-date]').w2field('date');
$('input[type=us-dateA]').w2field('date', { format: 'm/d/yyyy', start:  month + '/5/' + year, end: month + '/25/' + year });
$('input[type=us-dateB]').w2field('date', { format: 'm/d/yyyy', blocked: [ month+'/12/2014',month+'/13/2014',month+'/14/' + year,]});
$('input[type=us-date1]').w2field('date', { format: 'm/d/yyyy', end: $('input[type=us-date2]') });
$('input[type=us-date2]').w2field('date', { format: 'm/d/yyyy', start: $('input[type=us-date1]') });
$('input[type=us-time]').w2field('time',  { format: 'h12' });
$('input[type=us-timeA]').w2field('time', { format: 'h12', start: '8:00 am', end: '4:30 pm' });

// EU Common Format
$('input[type=eu-date]').w2field('date',  { format: 'd.m.yyyy' });
$('input[type=eu-dateA]').w2field('date', { format: 'd.m.yyyy', start:  '5.' + month + '.' + year, end: '25.' + month + '.' + year });
$('input[type=eu-dateB]').w2field('date', { format: 'd.m.yyyy', blocked: ['12.' + month + '.' + year, '13.' + month + '.' + year, '14.' + month + '.' + year]});
$('input[type=eu-date1]').w2field('date', { format: 'd.m.yyyy', end: $('input[type=eu-date2]') });
$('input[type=eu-date2]').w2field('date', { format: 'd.m.yyyy', start: $('input[type=eu-date1]') });
$('input[type=eu-time]').w2field('time',  { format: 'h24' });
$('input[type=eu-timeA]').w2field('time', { format: 'h24', start: '8:00 am', end: '4:30 pm' });
</textarea>

Options for DATE
<textarea class="javascript">
options = {
	format      : 'm/d/yyyy',  // date format
	placeholder : '',
	keyboard    : true,
	silent      : true,
	start       : '',          // string or jquery object
	end         : '',          // string or jquery object
	blocked     : {},          // { '4/11/2011': 'yes' }
	colored     : {}           // { '4/11/2011': 'red:white' }
};
</textarea>

Options for TIME
<textarea class="javascript">
options = {
	format      : 'hh:mi pm',
	placeholder : '',
	keyboard    : true,
	silent      : true,
	start       : '',
	end         : ''
};
</textarea>
<div id="list" style="height: 10px;"></div>

<h3>Drop Down Lists</h3>
Regular &lt;select&gt; input is nice, but quite limited. For example, it is hard to use this control on a large set of options. 
To provide a solution, I have implemented drop down list based on a text input filed but with a dynamic list of options that 
get filtered as you type.
<div style="height: 30px;"></div>

<div class="w2ui-label"> List: </div>
<div class="w2ui-field"> <input type="list" style="width: 200px"> <span class="legend">Cannot type any text, but only items from the list</span> </div>
<div class="w2ui-label"> Combo: </div>
<div class="w2ui-field"> <input type="combo" style="width: 200px"> <span class="legend">You can type any text</span> </div>
<div style="height: 30px;"></div>

<script>
	var people = ['George Washington', 'John Adams', 'Thomas Jefferson', 'James Buchanan', 'James Madison', 'Abraham Lincoln', 'James Monroe', 'Andrew Johnson', 'John Adams', 'Ulysses Grant', 'Andrew Jackson', 'Rutherford Hayes', 'Martin VanBuren', 'James Garfield', 'William Harrison', 'Chester Arthur', 'John Tyler', 'Grover Cleveland', 'James Polk', 'Benjamin Harrison', 'Zachary Taylor', 'Grover Cleveland', 'Millard Fillmore', 'William McKinley', 'Franklin Pierce', 'Theodore Roosevelt', 'John Kennedy', 'William Howard', 'Lyndon Johnson', 'Woodrow Wilson', 'Richard Nixon', 'Warren Harding', 'Gerald Ford', 'Calvin Coolidge', 'James Carter', 'Herbert Hoover', 'Ronald Reagan', 'Franklin Roosevelt', 'George Bush', 'Harry Truman', 'William Clinton', 'Dwight Eisenhower', 'George W. Bush', 'Barack Obama'];
	$('input[type=list]').w2field('list', { items: people });
	$('input[type=combo]').w2field('combo', { items: people });
</script>
<div style="height: 20px;"></div>
Full keyboard support is implemented and it comes with lots of configuration parameters:
pulling list of options dynamically from a URL, custom render functions, events, etc.
<div style="height: 20px;"></div>

<b>JavaScript</b>
<textarea class="javascript">
var people = ['George Washington', 'John Adams', 'Thomas Jefferson', 'James Buchanan', ...];
$('input[type=list]').w2field('list', { items: people });
$('input[type=combo]').w2field('combo', { items: people });
// if you need to get to the selected items, use:
// $('#id').data('selected');
</textarea>
<div style="height: 20px;"></div>

Options for LIST
<textarea class="javascript">
options = {
	items       : [],
	selected    : {},           // selected item as {}
	placeholder : '',
	url         : null,         // url to pull data from
	cacheMax    : 500,
	maxWidth    : null,         // max width for input control to grow
	maxHeight   : 350,          // max height for input control to grow
	match       : 'contains',   // ['contains', 'is', 'begins with', 'ends with']
	silent      : true,
	onSearch    : null,         // when search needs to be performed
	onRequest   : null,         // when request is submitted
	onLoad      : null,         // when data is received
	render      : null,         // render function for drop down item
	showAll     : false,        // weather to apply filter or not when typing
	markSearch  : true
};
</textarea>
<div id="multi" style="height: 10px;"></div>

<h3>Multi-Select Drop Down Lists</h3>

Another control I am proud of is multi-select. I cannot image how I used to live without it. It simplified all my UI designs
where I need to select multiple items and now I do not have to use two bulky lists of Available and Selected items.
<div style="height: 30px;"></div>

<div class="w2ui-label"> Multi-Select: </div>
<div class="w2ui-field"> <input id="enum" style="width: 540px"/> </div>
<div class="w2ui-label"> Max 2 Items: </div>
<div class="w2ui-field"> <input id="enum-max" style="width: 540px;"/> </div>
<div class="w2ui-label"> Custom: </div>
<div class="w2ui-field"> <input id="enum-custom" style="width: 540px"/> </div>
<div style="height: 30px;"></div>

<script>
	var pstyle = 'padding-right: 3px; color: #828AA7; text-shadow: 1px 1px 3px white;';
	var people = ['George Washington', 'John Adams', 'Thomas Jefferson', 'James Buchanan', 'James Madison', 'Abraham Lincoln', 'James Monroe', 'Andrew Johnson', 'John Adams', 'Ulysses Grant', 'Andrew Jackson', 'Rutherford Hayes', 'Martin VanBuren', 'James Garfield', 'William Harrison', 'Chester Arthur', 'John Tyler', 'Grover Cleveland', 'James Polk', 'Benjamin Harrison', 'Zachary Taylor', 'Grover Cleveland', 'Millard Fillmore', 'William McKinley', 'Franklin Pierce', 'Theodore Roosevelt', 'John Kennedy', 'William Howard', 'Lyndon Johnson', 'Woodrow Wilson', 'Richard Nixon', 'Warren Harding', 'Gerald Ford', 'Calvin Coolidge', 'James Carter', 'Herbert Hoover', 'Ronald Reagan', 'Franklin Roosevelt', 'George Bush', 'Harry Truman', 'William Clinton', 'Dwight Eisenhower', 'George W. Bush', 'Barack Obama'];
	$('#enum').w2field('enum', { 
		items: people,
		selected: [{ id: 0, text: 'John Adams' }, { id: 0, text: 'Thomas Jefferson' }]
	});
	$('#enum-max').w2field('enum', { 
		items: people, 
		max: 2 
	});
	$('#enum-custom').w2field('enum', { 
		items: people, 
		onAdd: function (event) {
			if (Math.random() > 0.8) {
				event.item.bgColor = 'rgb(255, 232, 232)';
				event.item.border  = '1px solid red';
			}
		},
		itemRender: function (item, index, remove) {
			var html =  
				'<li style="'+ (item.bgColor ? 'background-color: '+ item.bgColor + ';' : '') +
					(item.border ? 'border: '+ item.border + ';' : '') +'" index="'+ index +'">'+
					remove +	
					'<span class="fa fa-trophy" style="'+ pstyle +'; margin-left: -4px;"></span>' + 
					item.text +
				'</li>';
			return html;
		},
		render: function (item, options) {
			return '<span class="fa fa-star" style="'+ pstyle +'"></span>' + item.text;
		}
	});
</script>
<div style="height: 20px;"></div>
Just like the drop down list, it comes with full keyboard support and lots of configuration options (even more then a drop 
down list). I hope you would enjoy it just as I have over the course of past few years.
<div style="height: 20px;"></div>

<b>JavaScript</b>
<textarea class="javascript">
var pstyle = 'padding-right: 3px; color: #828AA7; text-shadow: 1px 1px 3px white;';
var people = ['George Washington', 'John Adams', 'Thomas Jefferson', 'James Buchanan', ...];
$('#enum').w2field('enum', { 
	items: people,
	selected: [{ id: 0, text: 'John Adams' }, { id: 0, text: 'Thomas Jefferson' }]
});
$('#enum-max').w2field('enum', { 
	items: people, 
	max: 2 
});
$('#enum-custom').w2field('enum', { 
	items: people, 
	onAdd: function (event) {
		if (Math.random() > 0.8) {
			event.item.bgColor = 'rgb(255, 232, 232)';
			event.item.border  = '1px solid red';
		}
	},
	itemRender: function (item, index, remove) {
		var html =  
			'<li style="'+ (item.bgColor ? 'background-color: '+ item.bgColor + ';' : '') +
				(item.border ? 'border: '+ item.border + ';' : '') +'" index="'+ index +'">'+
				remove +
				'<span class="fa fa-trophy" style="'+ pstyle +'; margin-left: -4px;"></span>' + 
				item.text +
			'</li>';
		return html;
	},
	render: function (item, options) {
		return '<span class="fa fa-star" style="'+ pstyle +'"></span>' + item.text;
	}
});
// if you need to get to the selected items, use:
// $('#id').data('selected');
</textarea>
<div style="height: 20px;"></div>

Options for ENUM
<textarea class="javascript">
options = {
	items       : [],
	selected    : [],
	placeholder : '',
	max         : 0,            // max number of selected items, 0 - unlim
	url         : null,         // not implemented
	cacheMax    : 500,
	maxWidth    : null,         // max width for input control to grow
	maxHeight   : 350,          // max height for input control to grow
	match       : 'contains',   // ['contains', 'is', 'begins with', 'ends with']
	silent      : true,
	showAll     : false,        // weather to apply filter or not when typing
	markSearch  : true,
	render      : null,         // render function for drop down item
	itemRender  : null,         // render selected item
	itemsHeight : 350,          // max height for the control to grow
	itemMaxWidth: 250,          // max width for a single item
	onSearch    : null,         // when search needs to be performed
	onRequest   : null,         // when request is submitted
	onLoad      : null,         // when data is received
	onClick     : null,         // when an item is clicked
	onAdd       : null,         // when an item is added
	onRemove    : null,         // when an item is removed
	onMouseOver : null,         // when an item is mouse over
	onMouseOut  : null          // when an item is mouse out
};
</textarea>
<div style="height: 10px;"></div>

<h3>File Upload</h3>

And of course, the controls library would not be complete without a file uploader. I have used HTML5 FileReader API
(will not work in old browsers, including IE9) to read the file, encode it into base64 and provide to you as a variable that
you can submit with any AJAX request.
<div style="height: 30px;"></div>

<div class="w2ui-label"> Attach Files: </div>
<div class="w2ui-field"> <input id="file" style="width: 540px; min-height: 50px"/> </div>
<div style="height: 20px;"></div>

<script>
	$('#file').w2field('file');
</script>
<div style="height: 20px;"></div>
This approach is new to me, but I kind of like it. It simplifies my file uploads, though has some limitations. The biggest I 
found so far is the limitation of file size (slow with files over 50MB), however it is comparable to email attachments, which 
in fact are also base64 encoded into email body.
<div style="height: 20px;"></div>
On a positive side, once you have file encoded into base64, you can use data url API to preview it (if it is an image) or event 
resize it before submitting to the server with the HTML5 canvas trick.
<div style="height: 20px;"></div>

<b>JavaScript</b>
<textarea class="javascript">
$('#file').w2field('file', {});
// if you need to get to the selected files, use:
// $('#file').data('selected');
</textarea>
<div style="height: 20px;"></div>

Options for FILE
<textarea class="javascript">
options = {
	selected     : [],
	placeholder  : 'Attach files by dragging and dropping or Click to Select',
	max          : 0,
	maxSize      : 0,        // max size of all files, 0 - unlim
	maxFileSize  : 0,        // max size of a single file, 0 -unlim
	maxWidth     : null,     // max width for input control to grow
	maxHeight    : 350,      // max height for input control to grow
	silent       : true,
	itemRender   : null,     // render selected item
	itemMaxWidth : 250,      // max width for a single item
	itemsHeight  : 350,      // max height for the control to grow
	onClick      : null,     // when an item is clicked
	onAdd        : null,     // when an item is added
	onRemove     : null,     // when an item is removed
	onMouseOver  : null,     // when an item is mouse over
	onMouseOut   : null      // when an item is mouse out
}
</textarea>
<div id="file" style="height: 10px;"></div>


<h3>Download</h3>
All these controls are part of <a href="http://w2ui.com">W2UI</a> 1.4 (which is in early beta right now). 
For your convenience, I have put together a small downloadable package with the files you need:
<div style="height: 30px;"></div>

<a href="http://w2ui.com/web/downloads/w2ui-fields-1.0.zip">w2ui-fields-1.0.zip</a>

<div style="height: 30px;"></div>
In order to use it, you will need to include w2ui-fields-1.0.js and w2ui-fields-1.0.css into your app or its minified counterparts. 
As far as file size goes, it is only 18Kb for the JS file and 6Kb for CSS (minified and gzipped) and has only one dependency - jQuery.

<div style="height: 30px;"></div>