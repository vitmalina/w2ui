<? $theme->assign("page-name", "CSS Scoping"); ?>

<h2>CSS Scoping</h2>
<div class="date">August 27, 2012</div>

<? require("blog-social.php"); ?>

The biggest problem with CSS is absence of scoping. For simple HTML pages scoping has little sense, however modern web applications
are far from simple pages. Modern web applications widely use ajax techniques refreshing portions of the page and often the entire page never 
fully reloads. Imaging you are developing a web application where you insert a block of HTML code into the page, then you apply some
CSS rules to the inserted section. However, the browser will apply all applicable CSS files from all included CSS files and all &lt;style&gt; blocks
present on the page to the newly inserted HTML section. And there is no way to prevent browser from doing so.
<br><br>
This is why all CSS files are so difficult to read and extend. It takes no small amount of time to track how the web of CSS rules is applied 
and where to tackle to fix it. If you do not agree that this is a problem, open jQuery UI CSS file and try to customize it beyond just 
changing colors. Even changing font family or font size will cause you lots of grief trying to make you design pixel perfect.
<br><br>
I believe that most of the problems can be avoided if you apply sound CSS scoping techniques early in the development of your application.
I would recommend following 3 simple rules that will make your CSS files more readable and logical.

<h3>Rule #1: Use global CSS definitions sparingly</h3>
By global CSS definitions I mean CSS rules that apply to a large number of elements. In this sense all of the following css definitions are
global: 
<textarea class="css">
h1, h2, h3 {
   ...
}

a {
   ...
}

.class1 {
   ...
}

#id1 {
   ...
}

.class2, #id2 {
	...
}

input[type=text] {
	...
}
</textarea>
No doubt, you need global declarations, but try not to abuse them. Another mistake is to have global definitions in multiple files. As you
know CSS is Cascading Style Sheets, which means it will combine multiple CSS rules to the same element if it applies in the order they are
present in the document.

<h3>Rule #2: Scope all logical CSS sections</h3>
The best way to demonstrate CSS scoping is by a good example. Lets consider the following CSS

<div class="spacer15"></div>
<textarea class="css">
table.grid1 {
	border-collapse: collapse;
	font-size: 11px;
	font-family: verdana;
}

table.grid1 > tbody > tr > td {
	padding: 3px;
	border: 1px solid gray;
	width: 100px;
}

table.grid1 > tbody > tr:first-child > td {
	background-color: silver;
}
</textarea>

<div class="spacer15"></div>
and HTML
<div class="spacer15"></div>

<textarea class="html">
<table class="grid1">
	<tr> <td>1.1</td> <td>1.2</td> <td>1.3</td> </tr>
	<tr> <td>2.1</td> <td>2.2</td> <td>2.3</td> </tr>
	<tr> <td>3.1</td> <td>3.2</td> <td>3.3</td> </tr>
	<tr> <td>4.1</td> <td>4.2</td> <td>4.3</td> </tr>
</table>
</textarea>

<div class="spacer15"></div>
which will produce the following table:
<div class="spacer15"></div>

<style>
table.grid1 {
	border-collapse: collapse;
	font-size: 11px;
	font-family: verdana;
}

table.grid1 > tbody > tr > td {
	padding: 3px;
	border: 1px solid gray;
	width: 100px;
}

table.grid1 > tbody > tr:first-child > td {
	background-color: silver;
}
</style>
<table class="grid1">
	<tr> <td>1.1</td> <td>1.2</td> <td>1.3</td> </tr>
	<tr> <td>2.1</td> <td>2.2</td> <td>2.3</td> </tr>
	<tr> <td>3.1</td> <td>3.2</td> <td>3.3</td> </tr>
	<tr> <td>4.1</td> <td>4.2</td> <td>4.3</td> </tr>
</table>

<div class="spacer15"></div>
Note that:
<ol>
	<li>Applying one class I applied CSS rules to the entire structure</li>
	<li>If you have a table inside the table, CSS rules will not apply to the nested table</li>
	<li>If you had global declaration for the table, it would have messed up our structure (see Rule #1)</li>
	<li>The code is clean and easy to modify</li>
</ol>
For those of you who do not know what is > in CSS, I recommend to get a crush course of CSS selectors. It you are to use CSS scoping 
effectively, you need to be able to write effective selectors. You can start by reviewing
<a href="http://www.w3schools.com/cssref/css_selectors.asp">this article</a>.

<h3>Rule #3: Use CSS dynamically</h3>
It is common to use .innerHTML or $.html() to refresh sections of HTML of the page. However, I have read little about inserting CSS dynamically, and
in my opinion it is a great practice. There are two way to do so:
<ol>
	<li>Insert &lt;link&gt; tag that point to a css file</li>
	<li>Insert &lt;style&gt; tag into the document</li>
</ol>
If you add &lt;style&gt; or &lt;link&gt; it will get applied to the page, if you remove it, its rules will be removed from the page as well.
Here is an example:

<div class="spacer15"></div>
<b>File:</b> file1.html
<div class="spacer15"></div>

<textarea class="html">
<style>
table.grid1 {
	border-collapse: collapse;
	font-size: 11px;
	font-family: verdana;
}

table.grid1 > tbody > tr > td {
	padding: 3px;
	border: 1px solid gray;
	width: 100px;
}

table.grid1 > tbody > tr:first-child > td {
	background-color: silver;
}
</style>

<table class="grid1">
	<tr> <td>1.1</td> <td>1.2</td> <td>1.3</td> </tr>
	<tr> <td>2.1</td> <td>2.2</td> <td>2.3</td> </tr>
	<tr> <td>3.1</td> <td>3.2</td> <td>3.3</td> </tr>
	<tr> <td>4.1</td> <td>4.2</td> <td>4.3</td> </tr>
</table>
</textarea>

<div class="spacer15"></div>
JavaScript
<div class="spacer15"></div>

<textarea class="javascript">
$.get('file1.html', function (data) {
	$('#id1').html(data);
});
</textarea>
Here are the advantages of this approach:
<ol>
	<li>Your page will render faster because you have less nodes in the document tree</li>
	<li>Your pages will be easier to troubleshoot because you will know which CSS broke your pixel perfect page</li>
</ol>

<h3>Conclusion</h3>
By no means this is a perfect solution, but before the global community comes with a better way we are stuck with it. I have seen some
articles (for example <a href="http://www.webmonkey.com/2012/04/html5-offers-scoped-css-for-precision-styling/">
http://www.webmonkey.com/2012/04/html5-offers-scoped-css-for-precision-styling/</a>) that talk about new attribute for CSS scoping,
but current implementation lack flexibility and usefulness.
