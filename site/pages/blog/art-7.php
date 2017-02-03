<? 
	$theme->assign("page-name", "JavaScript Grid with One Million Records"); 
	$theme->assign('site-head',
		'<link rel="stylesheet" type="text/css" href="//w2ui.com/src/w2ui-1.3.min.css" />'.
		'<script type="text/javascript" src="//w2ui.com/src/w2ui-1.3.min.js"></script>'
	);
?>

<style>
table.results {
	margin: 20px 0px;
	border-collapse: collapse;
}
table.results td {
	padding: 5px 20px;
	border: 1px solid silver;
	text-align: center;
}
ul.list {
	margin: 10px 0px;
	margin-left: 40px;
}
.best {
	background-color: #95FF93; 
}
.second {
	background-color: #F7FF9C; 
}
.bad { 
	background-color: #FFD9D7;
}
.medium {
	background-color: #FFF0D6; 
}
</style>

<h2>JavaScript Grid with One Million Records</h2>
<div class="date">July 5, 2013</div>

<? require("blog-social.php"); ?>

Some time ago, I got a comment from a user who wanted to use the grid as a log table. He quickly put 
10,000 records into the grid without paginating, but found that it got really, really slow. This got me wondering, 
can it be optimized to handle 10k of records or it is too much for the browser.

<h3>Establishing the Baseline</h3>

For my initial test I have used w2ui ver 1.2, created a simple grid with 4 columns, populated it with random data and rendered 
into a 1024x768 container. I have started my testing with recordsPerPage set to 50 and tried 25, 250, 2.5K, 25K, 250K and 
1MIL records in the grid. To my surprise the grid performed well. It was responsive and fast, I could go from page to page 
and perform other grid functions. 
<div class="spacer10"></div>

It was an unexpected and pleasant surprise. It meant that JavaScript can handle large data sets, which was awesome. As a 
next step, I have set recordsPerPage to 1,000,000 and repeated my tests. The table below shows my findings:

<table class="results">
	<tr>
		<td># of Records</td>
		<td>Render Time</td>
		<td># of DOM Nodes</td>
	</tr>
	<tr>
		<td>25</td>
		<td>0.047 sec</td>
		<td>329</td>
	</tr>
	<tr>
		<td>250</td>
		<td>0.466 sec</td>
		<td>2,354</td>
	</tr>
	<tr>
		<td>2,500</td>
		<td class="bad">14.425 sec</td>
		<td class="medium">22,604</td>
	</tr>
	<tr>
		<td>25,000</td>
		<td class="bad">crashed</td>
		<td class="bad">??</td>
	</tr>
	<tr>
		<td>250,000</td>
		<td class="bad">crashed</td>
		<td class="bad">??</td>
	</tr>
	<tr>
		<td>1,000,000</td>
		<td class="bad">crashed</td>
		<td class="bad">??</td>
	</tr>
</table>

I have found that if the number of records in the grid becomes more then just a few thousands the grid gets very slow because the 
rendering speed is directly related to the number of nodes in the DOM. If the number of nodes in the DOM is more then 40-50k 
(depending on your computer configuration and amount of memory), your browser will crash or will become unresponsive. 
<div class="spacer10"></div>

So, I decided to set out on a quest to do two things: (1) dynamically create records as user 
scrolls (2) optimize grid to handle large data sets. After a few weeks of work, the grid was optimized and 
ready for testing. I have repeated my original tests:

<table class="results">
	<tr>
		<td># of Records</td>
		<td>Render Time</td>
		<td># of DOM Nodes</td>
	</tr>
	<tr>
		<td>25</td>
		<td>0.021 sec</td>
		<td>355</td>
	</tr>
	<tr>
		<td>250</td>
		<td>0.112 sec</td>
		<td>2,605</td>
	</tr>
	<tr>
		<td>2,500</td>
		<td>0.036 sec</td>
		<td>705</td>
	</tr>
	<tr>
		<td>25,000</td>
		<td>0.051 sec</td>
		<td>705</td>
	</tr>
	<tr>
		<td>250,000</td>
		<td>0.198 sec</td>
		<td>705</td>
	</tr>
	<tr>
		<td>1,000,000</td>
		<td>0.676 sec</td>
		<td>705</td>
	</tr>
</table>
Wow! The results were awesome! Now the grid was capable of handling large data sets that not so long ago only a database server could.
If you are wondering why 2500 records performed better than 250, the answer is very simple: I have defined a parameter in the 
grid not to use buffered scroll if number of records below 300. So, when there are less then 300 records - all of them
are rendered in the grid. If there are more then 300 records, only the ones that are in the view, plus a few items on top and 
bottom for smooth scrolling.
<div class="spacer10"></div>

<h3>Example of the grid</h3>
Below you can find an example of the grid with random 25K records. You can generate a different amount and play with it for 
yourself. Please note that different browsers can handle different number of records, though pretty much all of them can handle 1MIL 
of records.
<div class="spacer20"></div>

Generate: 
<input type="button" value="25K Records" onclick="generate(25)">
<input type="button" value="250K Records" onclick="generate(250)">
<input type="button" value="1MIL Records" onclick="generate(1000)">
<div id="grid" style="width: 100%; height: 450px; margin: 20px 0px;"></div>

<h3>Sorting & Searching</h3>
The next challenge was to make local sorting and searching fast. In the table below you can see results before 
optimization:
<table class="results">
	<tr>
		<td># of Records</td>
		<td>Sorting (int)</td>
		<td>Sorting (Text)</td>
		<td>Searching (int)</td>
		<td>Searching (text)</td>
	</tr>
	<tr>
		<td>25</td>
		<td>0.000 sec</td>
		<td>0.000 sec</td>
		<td>0.005 sec</td>
		<td>0.005 sec</td>
	</tr>
	<tr>
		<td>250</td>
		<td>0.002 sec</td>
		<td>0.002 sec</td>
		<td>0.029 sec</td>
		<td>0.029 sec</td>
	</tr>
	<tr>
		<td>2,500</td>
		<td>0.022 sec</td>
		<td>0.010 sec</td>
		<td>0.239 sec</td>
		<td>0.245 sec</td>
	</tr>
	<tr>
		<td>25,000</td>
		<td>0.243 sec</td>
		<td>0.066 sec</td>
		<td class="medium">2.539 sec</td>
		<td class="medium">2.282 sec</td>
	</tr>
	<tr>
		<td>250,000</td>
		<td class="bad">3.046 sec</td>
		<td>0.632 sec</td>
		<td class="bad">25.725 sec</td>
		<td class="bad">25.204 sec</td>
	</tr>
	<tr>
		<td>1,000,000</td>
		<td class="bad">14.804 sec</td>
		<td class="medium">2.353 sec</td>
		<td class="bad">??</td>
		<td class="bad">??</td>
	</tr>
</table>

As it is seen from the data, the sorting performed well (I used Array.sort() for this) and the search was increasingly slow with the
increase in the number of records. I found that the biggest issue with the search was the use of eval() to parse nested record sets, 
which turned out to be slow. I have re-factored the code and repeated the tests

<table class="results">
	<tr>
		<td># of Records</td>
		<td>Sorting (int)</td>
		<td>Sorting (Text)</td>
		<td>Searching (int)</td>
		<td>Searching (text)</td>
	</tr>
	<tr>
		<td>25</td>
		<td>0.000 sec</td>
		<td>0.000 sec</td>
		<td>0.000 sec</td>
		<td>0.000 sec</td>
	</tr>
	<tr>
		<td>250</td>
		<td>0.001 sec</td>
		<td>0.001 sec</td>
		<td>0.001 sec</td>
		<td>0.001 sec</td>
	</tr>
	<tr>
		<td>2,500</td>
		<td>0.019 sec</td>
		<td>0.006 sec</td>
		<td>0.006 sec</td>
		<td>0.008 sec</td>
	</tr>
	<tr>
		<td>25,000</td>
		<td>0.275 sec</td>
		<td>0.069 sec</td>
		<td>0.058 sec</td>
		<td>0.052 sec</td>
	</tr>
	<tr>
		<td>250,000</td>
		<td class="bad">3.622 sec</td>
		<td>0.702 sec</td>
		<td>0.589 sec</td>
		<td>0.523 sec</td>
	</tr>
	<tr>
		<td>1,000,000</td>
		<td class="bad">16.301 sec</td>
		<td class="medium">2.789 sec</td>
		<td class="medium">2.456 sec</td>
		<td class="medium">2.019 sec</td>
	</tr>
</table>

<h3>Infinite Scroll</h3>

Now, rendering, sorting and searching was fast on large data sets, but still was not good enough if the number of records goes
over 250K. I did not know any other way to make it faster and I think it hits the performance ceiling just because there is 
nothing else you can do to optimize it. There is no way to create indexes in JavaScript, but database already have this functionality.
So, to make your grid work on large data set you can use Infinite Scroll, which I have also implemented in the grid.
<div class="spacer10"></div>

I have created a Postgres database with 1 million records and implemented infinite scroll in the grid, buffering
100 records at a time. All my test have shown that it was never over 0.2 seconds to sort and search through this record set.

<h3>Browsers Test</h3>

Initially, I have done all my tests in Chrome. Now, I wanted to repeat them on other browsers too. 
Though Chrome performed better in most categories, the test have shown that other 
browsers can do a pretty good job with large data sets. I have recorded best of 5 tries for each browser in each category.
<div class="spacer20"></div>

<b>Render</b> - (green - best, yellow - second best)
<table class="results">
	<tr>
		<td># of Records</td>
		<td>Chrome</td>
		<td>FireFox</td>
		<td>Safari 6</td>
		<td>Opera</td>
		<td>IE 9</td>
	</tr>
	<tr>
		<td>25</td>
		<td class="second">0.028 sec</td> 
		<td>0.047 sec</td> 
		<td class="best">0.022 sec</td> 
		<td>0.037 sec</td> 
		<td>0.044 sec</td> 
	</tr>
	<tr>
		<td>250</td>
		<td class="second">0.153 sec</td>
		<td>0.251 sec</td>
		<td class="best">0.131 sec</td>
		<td>0.197 sec</td>
		<td>0.401 sec</td>
	</tr>
	<tr>
		<td>2,500</td>
		<td class="second">0.043 sec</td>
		<td>0.068 sec</td>
		<td class="best">0.034 sec</td>
		<td>0.055 sec</td>
		<td>0.072 sec</td>
	</tr>
	<tr>
		<td>25,000</td>
		<td class="best">0.058 sec</td>
		<td class="second">0.075 sec</td>
		<td>0.080 sec</td>
		<td>0.077 sec</td>
		<td>0.088 sec</td>
	</tr>
	<tr>
		<td>250,000</td>
		<td>0.220 sec</td>
		<td class="best">0.116 sec</td>
		<td class="second">0.124 sec</td>
		<td>0.270 sec</td>
		<td>0.252 sec</td>
	</tr>
	<tr>
		<td>1,000,000</td>
		<td>0.734 sec</td>
		<td class="best">0.254 sec</td>
		<td class="second">0.393 sec</td>
		<td>1.002 sec</td>
		<td>0.797 sec</td>
	</tr>
</table>

<div class="spacer20"></div>
<b>Sort</b> - (green - best, yellow - second best)
<table class="results">
	<tr>
		<td># of Records</td>
		<td>Chrome</td>
		<td>FireFox</td>
		<td>Safari 6</td>
		<td>Opera</td>
		<td>IE 9</td>
	</tr>
	<tr>
		<td>25</td>
		<td>0.000 sec</td>
		<td>0.000 sec</td>
		<td>0.000 sec</td>
		<td>0.000 sec</td>
		<td>0.000 sec</td>
	</tr>
	<tr>
		<td>250</td>
		<td class="best">0.001 sec</td>
		<td>0.004 sec</td>
		<td>0.004 sec</td>
		<td class="second">0.002 sec</td>
		<td class="second">0.002 sec</td>
	</tr>
	<tr>
		<td>2,500</td>
		<td class="second">0.013 sec</td>
		<td>0.023 sec</td>
		<td>0.028 sec</td>
		<td>0.014 sec</td>
		<td class="best">0.007 sec</td>
	</tr>
	<tr>
		<td>25,000</td>
		<td class="best">0.071 sec</td>
		<td>0.197 sec</td>
		<td>0.358 sec</td>
		<td>0.134 sec</td>
		<td class="second">0.106 sec</td>
	</tr>
	<tr>
		<td>250,000</td>
		<td class="best">0.754 sec</td>
		<td>2.176 sec</td>
		<td>5.134 sec</td>
		<td class="second">1.421 sec</td>
		<td>1.719 sec</td>
	</tr>
	<tr>
		<td>1,000,000</td>
		<td class="best">2.907 sec</td>
		<td>9.347 sec</td>
		<td>24.038 sec</td>
		<td class="second">6.040 sec</td>
		<td>7.709 sec</td>
	</tr>
</table>

<div class="spacer20"></div>
<b>Search</b> - (green - best, yellow - second best)
<table class="results">
	<tr>
		<td># of Records</td>
		<td>Chrome</td>
		<td>FireFox</td>
		<td>Safari 6</td>
		<td>Opera</td>
		<td>IE 9</td>
	</tr>
	<tr>
		<td>25</td>
		<td>0.000 sec</td>
		<td>0.001 sec</td>
		<td>0.000 sec</td>
		<td>0.000 sec</td>
		<td>0.000 sec</td>
	</tr>
	<tr>
		<td>250</td>
		<td>0.001 sec</td>
		<td>0.001 sec</td>
		<td>0.001 sec</td>
		<td>0.001 sec</td>
		<td>0.001 sec</td>
	</tr>
	<tr>
		<td>2,500</td>
		<td class="second">0.008 sec</td>
		<td>0.013 sec</td>
		<td>0.009 sec</td>
		<td>0.012 sec</td>
		<td class="best">0.005 sec</td>
	</tr>
	<tr>
		<td>25,000</td>
		<td>0.082 sec</td>
		<td class="best">0.050 sec</td>
		<td>0.089 sec</td>
		<td>0.114 sec</td>
		<td class="second">0.070 sec</td>
	</tr>
	<tr>
		<td>250,000</td>
		<td class="best">0.807 sec</td>
		<td>1.728 sec</td>
		<td>1.225 sec</td>
		<td class="second">0.932 sec</td>
		<td>1.114 sec</td>
	</tr>
	<tr>
		<td>1,000,000</td>
		<td class="best">3.332 sec</td>
		<td>7.674 sec</td>
		<td>4.903 sec</td>
		<td class="second">3.581 sec</td>
		<td>5.079 sec</td>
	</tr>
</table>

The table below shows a winner, where I have given a browser a point if it were the best in the category and half a point if it 
were second best:
<table class="results">
	<tr>
		<td>Chrome</td>
		<td class="best">9.5</td>
	</tr>
	<tr>
		<td>Safari 6</td>
		<td class="second">4.0</td>
	</tr>
	<tr>
		<td>FireFox</td>
		<td>3.5</td>
	</tr>
	<tr>
		<td>IE 9</td>
		<td>3.5</td>
	</tr>
	<tr>
		<td>Opera</td>
		<td>2.5</td>
	</tr>
</table>

<h3>Browser Limits</h3>
I have discovered an interested browser limitation - the height of the div has a limit (so is scrollable area in the div). 
Hence, number of scrollable records has a limit since one record is 25px. I have created a simple page with one div and by trial 
and error I have discovered the max height of the div:

<table class="results">
	<tr>
		<td>Browser</td>
		<td>Height Limit</td>
		<td>Record Limit</td>
	</tr>
	<tr>
		<td>Opera 12</td>
		<td style="text-align: right">1,677,720,027,136 px</td>
		<td style="text-align: right">67,108,801,085</td>
	</tr>
	<tr>
		<td>Safari 6</td>
		<td style="text-align: right">1,677,720,518 px</td>
		<td style="text-align: right">66,708,820</td>
	</tr>
	<tr>
		<td>Chrome 28</td>
		<td style="text-align: right">33,554,420 px</td>
		<td style="text-align: right">1,342,176</td>
	</tr>
	<tr>
		<td>FireFox 22</td>
		<td style="text-align: right">17,895,697 px</td>
		<td style="text-align: right">715,827</td>
	<tr>
	<tr>
		<td>IE 9</td>
		<td style="text-align: right">10,739,975 px</td>
		<td style="text-align: right">429,599</td>
	<tr>
</table>

Different browsers behave differently when you try to create a div with height over the limit. Opera will simply max it up to the limit
and ignore anything over it. FireFox will set the height of the div to 0 if height it too big. Safari, will display distorted
view if it is too large and Chrome will display a black box at the bottom. I have also discovered that Chrome has a smaller limit of height
for the body. For the body, height can be no more then 16,777,201 px.

<h3>Important Lessons</h3>

During this exercise I have learned several important things:
<ul class="list">
	<li>Large number of DOM nodes make rendering slow</li>
	<li>JavaScript arrays can handle large data sets</li>
	<li>Looping through large arrays is fast</li>
	<li>Sorting arrays by providing custom function to Array.sort() is fast</li>
	<li>eval() is slow, should not be used in large loops</li>
	<li>To achieve smooth scrolling render a few hidden records on top and bottom outside of the visible area</li>
</ul>
I think that 1MIL of records for JavaScript is too much, though it is doable. If user has to wait over a second it makes
user experience sluggish and unpleasant. But as seen in the tables above any browser can give you a good user experience with
100K of records or less.


<script>
$(function () {
	$('#grid').w2grid({ 
		name	: 'grid', 
		show: { 
			toolbar: true,
			footer: true,
		},
		columns: [				
			{ field: 'personid', caption: 'ID', size: '100px', sortable: true, resizable: true, searchable: 'int' },
			{ field: 'fname', caption: 'First Name', size: '200px', sortable: true, resizable: true, searchable: true },
			{ field: 'lname', caption: 'Last Name', size: '200px', sortable: true, resizable: true, searchable: true },
			{ field: 'email', caption: 'Email', size: '100%', resizable: true, sortable: true }
		],
	});
	generate(25);
});

function generate(num) {
	var fname = ['Vitali', 'Katsia', 'John', 'Peter', 'Sue', 'Olivia', 'Thomas', 'Sergei', 'Alexander', 'Anton', 'Divia'];
	var lname = ['Peterson', 'Rene', 'Johnson-Petrov', 'Cuban', 'Twist', 'Sidorov', 'Vasiliev', 'Hertz', 'Volkov'];
	w2ui.grid.records = [];
	for (var i = 0; i < num * 1000; i++) {
		w2ui['grid'].records.push({ 
			recid : i+1,
			personid: i+1,
			fname: fname[Math.floor(Math.random() * fname.length)], 
			lname: lname[Math.floor(Math.random() * lname.length)],
			email: 'vm@gmail.com', sdate: '1/1/2013', manager: '--'
		});
	}
	w2ui.grid.buffered = w2ui.grid.records.length;
	w2ui.grid.total = w2ui.grid.buffered
	w2ui.grid.refresh();
}
</script>