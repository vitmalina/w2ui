<? $theme->assign("page-name", "Spearch Bubble in Pure CSS"); ?>

<h2>Speech Bubble in Pure CSS</h2>
<div class="date">June 2, 2012</div>

<? require("blog-social.php"); ?>

<style>
div.my-tooltip {
	background: rgba(40,40,40,0.8) !important;
	display: inline-block;
	border-radius: 4px;
	color: white;
	box-shadow: 1px 1px 3px #aaa;
	padding: 5px 10px;
	margin: 5px 10px;
	line-height: 120%;
	font-size: 12px;
}
div.my-tooltip:before, div.my-tooltip:after {
	content: "";
	position: absolute;
	width: 0;
	height: 0;
}
div.my-tooltip.left-top:before {
	border-top: 5px solid transparent;
	border-right: 5px solid rgba(40,40,40,0.8);
	border-bottom: 5px solid transparent;
	margin: 0px 0 0 -15px;
}
div.my-tooltip.left-bottom:after {
	display:block;
	border-top: 5px solid transparent;
	border-right: 5px solid rgba(40,40,40,0.8);
	border-bottom: 5px solid transparent;
	margin: -10px 0 0 -15px;
}
div.my-tooltip.top:before {
	border-left: 5px solid transparent;
	border-right: 5px solid transparent;
	border-bottom: 5px solid rgba(40,40,40,0.8);
	margin: -10px 0 0 0px;
}
div.my-tooltip.bottom:after {
	display: block;
	border-left: 5px solid transparent;
	border-right: 5px solid transparent;
	border-top: 5px solid rgba(40,40,40,0.8);
	margin: 5px 0 0 0px;
}

div.bubble {
	background: white;
	display: inline-block;
	border: 1px solid #aaa;
	border-radius: 4px;
	color: black;
	box-shadow: 2px 2px 8px #ddd;
	padding: 5px 10px;
	margin: 5px 10px;
	line-height: 130%;
	font-size: 13px;
}
div.bubble.left-top:before, div.bubble.top:before {
	content: "";
	position: absolute;
	width: 8px;
	height: 8px;
	border-left: 1px solid #aaa;
	border-left-color: inherit;
	border-top: 1px solid #aaa;
	border-top-color: inherit;
	background-color: inherit;
}
div.bubble.left-bottom:after, div.bubble.bottom:after {
	content: "";
	position: absolute;
	width: 8px;
	height: 8px;
	border-left: 1px solid #aaa;
	border-left-color: inherit;
	border-top: 1px solid #aaa;
	border-top-color: inherit;
	background-color: inherit;
}
div.bubble.left-top:before {
	margin: 1px 0 0 -15px;
	-moz-transform: rotate(-45deg);
	-ms-transform: rotate(-45deg);
	-o-transform: rotate(-45deg);
	-webkit-transform: rotate(-45deg);
}
div.bubble.left-bottom:after {
	display:block;
	margin: -11px 0 0 -15px;
	-moz-transform: rotate(-45deg);
	-ms-transform: rotate(-45deg);
	-o-transform: rotate(-45deg);
	-webkit-transform: rotate(-45deg);
}
div.bubble.top:before {
	margin: -10px 0 0 0px;
	-moz-transform: rotate(45deg);
	-ms-transform: rotate(45deg);
	-o-transform: rotate(45deg);
	-webkit-transform: rotate(45deg);
}
div.bubble.bottom:after {
	display: block;
	margin: 2px 0 0 0px;
	-moz-transform: rotate(-135deg);
	-ms-transform: rotate(-135deg);
	-o-transform: rotate(-135deg);
	-webkit-transform: rotate(-135deg);
}
</style>

Not so long ago, I have discovered two new CSS3 pseudo elements - <i>:before</i> and <i>:after</i> (They are actually CSS2 features, 
but lets discuss it in the context of CSS3). I have read about them long ago but was uninterested due to lack of practical use 
until recently I came across this <a href="http://nicolasgallagher.com/pure-css-speech-bubbles/demo/">blog post</a> by Nicolas Gallagher,
where he shows how to use them to create a speech bubble.
<div class="spacer15"></div>

The beauty of this approach is that ANY DIV can look like a speech bubble WITHOUT the use of any additional SUPPORTING ELEMENTS. The CSS is
simple so is HTML. Here is the CSS:

<textarea class="css">
div.my-tooltip {
	background: rgba(40,40,40,0.8);
	display: inline-block;
	border-radius: 4px;
	color: white;
	box-shadow: 1px 1px 3px #aaa;
	padding: 5px 10px;
	margin: 5px 10px;
	line-height: 100%;
	font-size: 11px;
}
div.my-tooltip.left-top:before {
	content: "";
	position: absolute;
	width: 0;
	height: 0;
	border-top: 5px solid transparent;
	border-right: 5px solid rgba(40,40,40,0.8);
	border-bottom: 5px solid transparent;
	margin: 1px 0 0 -15px;
}</textarea>

Here is the HTML:
<textarea class="html">
	<div class="my-tooltip left-top">Some Text</div>
</textarea>

Here is the result: <br><br>
Simon Says: <div class="my-tooltip left-top">Turn left and clap 3 times</div>
<div class="spacer15"></div>

<h3>How it works</h3>
You can create various speech bubbles and put text of any length. You can also overlay this bubbles on top of other elements if you make
position absolute. I have found it useful in form validation. I display an error messages after the field that has an error. Here are
some more examples:

<div style="margin: 20px 0px;">
	<div class="my-tooltip left-top">Multiline tooltop<br> Has two lines</div>
	<div class="my-tooltip left-bottom">Multiline tooltop<br> Has two lines</div>
	<div class="my-tooltip top">Multiline tooltop<br> Has two lines</div>
	<div class="my-tooltip bottom">Multiline tooltop<br> Has two lines</div>
</div>

To achieve the corner effect, is uses border trick. What will happen if you define a border for TOP as a 5px solid line and border for LEFT
and RIGHT as 5px but transparent? Exactly! it will create a nice triangular shape.
<div class="spacer15"></div>

It needs to be noted that if you want to keep the bubble expandable you can only put corner in 4 places: left-top, left-bottom or top-left,
bottom-left. I did not figure out a pure CSS solution how to make it in other corners and still have it resized based on the amount of
text inside. Here is entires CSS for this

<textarea class="css">
div.my-tooltip {
	background: rgba(40,40,40,0.8);
	display: inline-block;
	border-radius: 4px;
	color: white;
	box-shadow: 1px 1px 3px #aaa;
	padding: 5px 10px;
	margin: 5px 10px;
	line-height: 120%;
	font-size: 12px;
}
div.my-tooltip:before, div.my-tooltip:after {
	content: "";
	position: absolute;
	width: 0;
	height: 0;
}
div.my-tooltip.left-top:before {
	border-top: 5px solid transparent;
	border-right: 5px solid rgba(40,40,40,0.8);
	border-right-color: inherit;
	border-bottom: 5px solid transparent;
	margin: 0px 0 0 -15px;
}
div.my-tooltip.left-bottom:after {
	display:block;
	border-top: 5px solid transparent;
	border-right: 5px solid rgba(40,40,40,0.8);
	border-right-color: inherit;
	border-bottom: 5px solid transparent;
	margin: -10px 0 0 -15px;
}
div.my-tooltip.top:before {
	border-left: 5px solid transparent;
	border-right: 5px solid transparent;
	border-bottom: 5px solid rgba(40,40,40,0.8);
	border-bottom-color: inherit;
	margin: -10px 0 0 0px;
}
div.my-tooltip.bottom:after {
	display: block;
	border-left: 5px solid transparent;
	border-right: 5px solid transparent;
	border-top: 5px solid rgba(40,40,40,0.8);
	border-top-color: inherit;
	margin: 5px 0 0 0px;
}
</textarea>

<h3>A Background Color Problem and Solution</h3>
One of the problems with this approach is that you will not be able to create a bubble with a background different from the border color. 
This problem is inherit with the approach when you create a triangle based on border width. The article I mentioned above has a solution to
this, but it was not very pretty, it used arbitrary margin and padding, which makes it content depended. If you add more content into your
bubble, it will not work correctly.
<div class="spacer15"></div>

I've found a much better solution, but it uses CSS3 property. All you need to do is to turn the <i>:before</i> or <i>:after</i> element.
Here are a few examples:

<div style="margin: 20px 0px;">
	<div class="bubble left-top">Multiline tooltip<br> Has two lines</div>
	<div class="bubble left-bottom">Multiline tooltip<br> Has two lines</div>
	<div class="bubble top" style="background-color: #FF88F3;  border-color: #72006E">Multiline tooltip<br> Has two lines</div>
	<div class="bubble bottom">Multiline tooltip<br> Has two lines</div>
</div>

Here is HTML
<textarea class="html">
<div class="bubble left-top">Multiline tooltip<br> Has two lines</div>
<div class="bubble left-bottom">Multiline tooltip<br> Has two lines</div>
<div class="bubble top" style="background-color: #FF88F3; border-color: #72006E">
	Multiline tooltip<br> Has two lines
</div>
<div class="bubble bottom">Multiline tooltip<br> Has two lines</div>
</textarea>

Here is CSS
<textarea class="css">
div.bubble {
	background: white;
	display: inline-block;
	border: 1px solid #aaa;
	border-radius: 4px;
	color: black;
	box-shadow: 2px 2px 8px #ddd;
	padding: 5px 10px;
	margin: 5px 10px;
	line-height: 130%;
	font-size: 13px;
}
div.bubble.left-top:before, div.bubble.top:before {
	content: "";
	position: absolute;
	width: 8px;
	height: 8px;
	border-left: 1px solid #aaa;
	border-left-color: inherit;
	border-top: 1px solid #aaa;
	border-top-color: inherit;
	background-color: inherit;
}
div.bubble.left-bottom:after, div.bubble.bottom:after {
	content: "";
	position: absolute;
	width: 8px;
	height: 8px;
	border-left: 1px solid #aaa;
	border-left-color: inherit;
	border-top: 1px solid #aaa;
	border-top-color: inherit;
	background-color: inherit;
}
div.bubble.left-top:before {
	margin: 1px 0 0 -15px;
	-moz-transform: rotate(-45deg);
	-ms-transform: rotate(-45deg);
	-o-transform: rotate(-45deg);
	-webkit-transform: rotate(-45deg);
}
div.bubble.left-bottom:after {
	display:block;
	margin: -11px 0 0 -15px;
	-moz-transform: rotate(-45deg);
	-ms-transform: rotate(-45deg);
	-o-transform: rotate(-45deg);
	-webkit-transform: rotate(-45deg);
}
div.bubble.top:before {
	margin: -10px 0 0 0px;
	-moz-transform: rotate(45deg);
	-ms-transform: rotate(45deg);
	-o-transform: rotate(45deg);
	-webkit-transform: rotate(45deg);
}
div.bubble.bottom:after {
	display: block;
	margin: 2px 0 0 0px;
	-moz-transform: rotate(-135deg);
	-ms-transform: rotate(-135deg);
	-o-transform: rotate(-135deg);
	-webkit-transform: rotate(-135deg);
}
</textarea>
The last example uses <i>inherit</i> property to read background color and border color if you decide to change it in inline style.