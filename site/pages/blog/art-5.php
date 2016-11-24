<? $theme->assign("page-name", "JavaScript W2UI 1.1 Released"); ?>

<h2>JavaScript W2UI 1.1 Released</h2>
<div class="date">February 9, 2013</div>

<? require("blog-social.php"); ?>

Finally, after many sleepless nights and lots of re-writes and re-thinking the w2ui 1.1 is out. This is an 
important milestone for me. I am releasing a JavaScript UI library that is very small, hight quality and I believe
it is simply amazing. 37Kb of pure poetry!
<div class="spacer10"></div>

The w2ui is a complete set of UI widgets for data-driven web applications. It consists of:
<ul>
	<li>layout</li>
	<li>grid</li>
	<li>toolbar</li>
	<li>sidebar</li>
	<li>tabs</li>
	<li>popup</li>
	<li>form</li>
	<li>fields</li>
	<li>utilities</li>
</ul>
All major browsers are supported: Chrome, FireFox, IE9+, Safari, Opera. Chrome is my personal browser of choice and the first
browser I test in, so with Chrome the experience should be superb.
<div class="spacer20"></div>

<a class="btn btn-primary" href="<?=$site_root?>/downloads/w2ui-1.1.zip">Download w2ui</a>
&nbsp;&nbsp;
<a class="btn btn-success" href="<?=$site_root?>/demos" target="_blank">See the Demos</a>
<div class="spacer20"></div>

I am also releasing complete documentation on each widget. The documentation proved to be a much harder task than
I originally anticipated, but the exercise has proven to be extremely helpful. I noticed that writing documentation helped me
critically analyze my approaches and trigged many re-writes, clean ups, and re-thinking.
<div class="spacer20"></div>

Many thanks and kudos to so many people from JavaScript community. Recently, the quality of JavaScript open source projects 
went up and I cannot hold my gratitude to all the people who write JavaScript and critically analyze various 
approaches. I have found a source of inspiration and joy in learning the way of other JavaScript developers and adopted many 
tricks into my practice.
<div class="spacer20"></div>

I truly hope that w2ui will help you in your web projects. But as it is popular to say, "It comes with no warranties
of any kind. Use it at your own risk." The code is licensed under MIT license. 
I would be happy to hear your feedback and comments. Feel free to drop me a line (my email is in the footer) or follow me
on twitter <a href="https://twitter.com/vitmalina">twitter.com/vitmalina</a> or <a href="https://github.com/vitmalina">github.com/vitmalina</a>. 
<div class="spacer20"></div>

<h3>Another JavaScript UI Library! Really?</h3>

Why do we need another JavaScript UI library? There are so many out there already. To name a few: jQuery UI, ExtJS, 
Kendo UI, DHTMLX, a host of jQuery plugins (jqGrid, DataTables, etc.), Dojo, Prototype. In a few statements below I describe my concerns
about available JavaScript UI libraries. By no means I want to belittle the work of so many great developers that contributed so much
into open source space. These are just my personal thoughts.

<h4>jQuery UI</h4>
Though jQuery is by far the most popular general purpose JavaScript library, jQuery UI leaves much to be desired. Apart from
the date picker and autocomplete, many of its widgets are useless (IMHO). And some important widgets are not there (Grid
and Tree). I have been watching jQuery UI for a long time and there is little movement in its community. One might argue that
the lack of jQuery UI widgets is filled by the abundance of jQuery plugins. Theoretically you can build a killer "Frankenstein"
framework that will fulfill all your needs. I personally do not like zombies, do you?

<h4>ExtJS</h4>
I have been watching ExtJS and its community for a number of years and have no issues with the quality of the product.
Everyone who worked with it gives positive feedback and high quality remarks. However, there are few things that I want to say 
about ExtJS. (1) It is not free. (2) It is huge: 454 Kb on minified and gzipped JavaScript (compare to 37 Kb of w2ui).
You might argue that in the age of fast internet connections the size does not matter. Connection does not 
matter, but the run time JavaScript does. (3) And it looks dated. Its look and feel from the day and age of Windows XP, whereas 
the web moved forward and many controls that were good 10 years ago are now obsolete. Plus, there is this thing called HTML5 and
CSS3 that is hardly used in ExtJS. It is still my first choice, when I need to write something for IE6 :).

<h4>Kendo UI</h4>
This is a newer, fresher library and overall I like it. It looks and feels modern. It is clear that those guys use HTML5 and CSS3.
But there is this annoying problem of licensing and GPL that stops me (and many others) from truly taking advantage of the library. 
Besides, it is kind of big: 225 Kb of minified and gripped JavaScript.

<h4>Dojo, Prototype and Others</h4>

There are so many other libraries and frameworks that historically played a huge role. However, with jQuery spreading like a wild fire 
and becoming a library of choice for so many teams, it has become apparent that if the framework is not based on jQuery it is hard 
for it to get big adoption. Originally, I have started writing w2ui as a standalone library, but when I came across jQuery there was love
from the first line of code. Few years later w2ui is rewritten with jQuery in mind.