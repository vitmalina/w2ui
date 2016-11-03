<? 
	$theme->assign("page-name", "5 Things to Know At a JavaScript Interview"); 
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

<h2>15 Questions You Need to Know To Pass a JavaScript Interview</h2>
<div class="date">July 26, 2014</div>

<? require("blog-social.php"); ?>

In the past 2 year I have interviewed over 100 people for a JavaScript developer position (disclaimer: I am not a  
recruiter). Though, the people I interviewed were already pre-screened and had at least 3-5 years of JavaScript development 
experience, my pass rate holds in the range of about 30%. I found some great people with outstanding knowledge. But also, I came 
across people who did not know the "basics," though their resume said that they have in depth JavaScript knowledge. 
<div style="height: 20px"></div>

For all of you who might be going through a JavaScript interview, let me suggest some questions that you should be ready to
answer quickly and with confidence.

<h3>Data Types</h3>
<div style="height: 10px"></div>

<h4>1. Name JavaScript data types?</h4>
<div class="answer">
	Answer:
	<pre>
	- number
	- string
	- boolean
	- object
	- function
	- null
	- undefined
	</pre>
</div>

<h4>2. What will the code below output?</h4>
<textarea class="javascript">
var a = [];
console.log('=>', typeof a);
</textarea>
Answer:
<pre class="answer">
=> object
</pre>
<div style="height: 10px"></div>

<h4>3. What will the code below output?</h4>
<textarea class="javascript">
var a = function () {}
console.log('=>', typeof a);
</textarea>
Answer:
<pre class="answer">
=> function
</pre>

<h4>Does JavaScript has Associative Arrays?</h4>
<div class="answer">
	<pre>
	No
	</pre>
</div>

<h3>Variable Scope</h3>
<div style="height: 10px"></div>

<h4>4. What will the code below output?</h4>
<textarea class="javascript">
var a = 1;
function b() {
	a = 2;
}
console.log('=>', a);
</textarea>
Answer:
<pre class="answer">
=> 1
</pre>
<div style="height: 10px"></div>


<h4>5. What will the code below output?</h4>
<textarea class="javascript">
var a = 1;
(function b() {
	a = 2;
}());
console.log('=>', a);
</textarea>
Answer:
<pre class="answer">
=> 2
</pre>
<div style="height: 10px"></div>

<h4>6. What will the code below output?</h4>
<textarea class="javascript">
var a = 1;
(function b() {
	var a = 2;
}());
console.log('=>', a);
</textarea>
Answer:
<pre class="answer">
=> 1
</pre>
<div style="height: 10px"></div>

<h4>7. What will the code below output?</h4>
<textarea class="javascript">
var a = 1;
(function b() {
	window.a = 2;
}());
console.log('=>', a);
</textarea>
Answer:
<pre class="answer">
=> 2
</pre>
<div style="height: 10px"></div>

<h4>8. What will the code below output?</h4>
<textarea class="javascript">
var a = 1;
(function b() {
	this.a = 2;
}());
console.log('=>', a);
</textarea>
Answer:
<pre class="answer">
=> 2
</pre>
<div style="height: 10px"></div>

<h3>Asynchronous JavaScript</h3>
