<? $theme->assign("page-name", "Nested CSS Rules"); ?>
<style>
table.two {
	width: 100%;
}
table.two td {
	width: 50%;
	vertical-align: top;
}
table.two td:nth-child(2) {
	padding-left: 10px;
}
</style>

<h2>Nested CSS Rules</h2>
<div class="date">November 22, 2013</div>

<? require("blog-social.php"); ?>

I love LESS. I love almost everything about it because it makes my code clean and readable. The only
thing that I don't like is that I have to compile it to CSS. It would be so cool if most popular concepts from LESS would make its way
into the native browser support. Just like jQuery has inspired browser vendors to add document.querySelector and document.querySelectorAll, I
believe LESS will also influence browser.
<div class="spacer10"></div>

But what feature is the more important? For me it is a no-brainer. I think nested rules is the single most important feature in LESS (or SASS). 
However, when I asked my colleges, I got various answers. Some said, it's got to be variables, others could not decide. So, I have created
a little poll of what is the most coveted feature of LESS.

<h3>The Poll</h3>

<iframe src="http://files.quizsnack.com/iframe/embed.html?hash=qhps6flj&width=340&height=330&wmode=transparent&t=1385152806" width="340" height="330" seamless="seamless" scrolling="no" frameborder="0" allowtransparency="true"></iframe>

<h3>Nested CSS Rules</h3>

Here are my reasons why I think nested CSS rules is the most important feature to be implemented in standard CSS. Below are two
examples of a common HTML and CSS as we use it today:
<table class="two">
	<tr>
		<td>
<textarea class="html">
<div class="menu">
    <ul>
        <li><a href="">Home</a></li>
        <li><a href="">Products</a></li>
        <li><a href="">Features</a></li>
        <li><a href="">About</a></li>
    </ul>
</div>












.
</textarea>
		</td>
		<td>
<textarea class="css">
.menu {
    background-color: #efefef;
}
.menu ul {
    padding: 10px 0px;
    margin: 0px;
}
.menu ul li {
    float: left;
    margin-right: 10px;
}
.menu ul li:hover {
    background-color: #ccc;
}
.menu ul li a {
    text-decoration: none;
    color: blue;
}
.menu ul li a:hover {
    text-decoration: underline;
}
</textarea>
		</td>
	</tr>
</table>

And how it is implemented in LESS:

<table class="two">
	<tr>
		<td>
<textarea class="html">
<div class="menu">
    <ul>
        <li><a href="">Home</a></li>
        <li><a href="">Products</a></li>
        <li><a href="">Features</a></li>
        <li><a href="">About</a></li>
    </ul>
</div>








.
</textarea>
		</td>
		<td>
<textarea class="less">
.menu {
    background-color: #efefef;
    ul {
        padding: 10px 0px;
        margin: 0px;
        li {
            float: left;
            margin-right: 10px;
            a {
                text-decoration: none;
                color: blue;
                &:hover { text-decoration: underline; }
            }
        }
        &:hover { background-color: #ccc; }
    }
}
</textarea>
		</td>
	</tr>
</table>

<h4>1. Nested Rules Make CSS readable</h4>

Over past 10 years, I have learned one thing about CSS: "It is easy to write CSS and hard to read". Due to its structure and cascading nature, 
if you change a padding in one rule, it might cause a butterfly effect throughout the page. Sometimes, it become virtually impossible
to do a pixel perfect design and you would have to rewrite CSS rules from scratch. An ability to nest CSS rules 
makes it readable and easier to follow.
<div class="spacer20"></div>

<h4>2. It directly corresponds to the nested HTML structure</h4>

Parent-child relationship is huge in HTML. Every DOM node is somebody's child. Because of absence of nested rules CSS's expressive power is 
very week. 
<div class="spacer20"></div>

<h4>3. Nested Rules fight proliferation of classes</h4>

Instead of adding one class for the structural block, many developers add classes into every single DOM element they need 
to style because it makes their CSS less complicated. Very soon the clean HTML code from previous example becomes cluttered:

<textarea class="html">
<div class="menu">
    <ul class="menu-ul">
        <li class="menu-li selected"><a class="menu-link" href="">Home</a></li>
        <li class="menu-li"><a class="menu-link" href="">Products</a></li>
        <li class="menu-li"><a class="menu-link" href="">Features</a></li>
        <li class="menu-li"><a class="menu-link" href="">About</a></li>
    </ul>
</div>
</textarea>

It is a bad practice to create a class for each element you want to style. The chances of name collision is higher and it looks flat. 
However, if CSS would allow nested rules, we would not have to add so many classes.
<div class="spacer20"></div>

<h4>4. Nested Rules have proven themselves in LESS and SASS</h4>

It is one of the first things advertised by LESS and SASS: "You can nest CSS rules" and it catches the developer's eye. Nested rules are like
Object Oriented Programming (OOP) in CSS.
<div class="spacer20"></div>

<h4>5. Nested Rules contribute to a greater World Peace</h4>

Nested rules make developers happy. Happy developers fight less. Less fighting in the world increases World Peace.
<div class="spacer20"></div>
