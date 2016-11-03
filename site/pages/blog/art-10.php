<? $theme->assign("page-name", "Folder Structure for Single Page Applications"); ?>

<style>
.simple-list {
	margin: 0px;
}
.simple-list li {
	margin: 15px 30px;
}
</style>

<h2>Folder Structure for Single Page Applications</h2>
<div class="date">July 7, 2014</div>

<? require("blog-social.php"); ?>

It makes me sad to see so many people still use old, archaic folder structure for their projects. It seems that while front-end 
development has moved light years ahead, the structure people use did not change since the 90x. The general principle of 
folder structure in 90x was <b>organization by type</b>, something like this:
<div style="height: 20px"></div>

<pre>
|-- css
|   `-- global.css
|-- img
|   |-- border.jpg
|   |-- bg_top.gif
|   `-- logo.jpg
|-- js
|   |-- jquery.js
|   |-- prototype.js
|   `-- myscript.js
|-- html
|   |-- contact.html
|   |-- home.html
|   `-- products.html
`-- index.html
</pre>
<div style="height: 20px"></div>

It was useful and made people happy, as it seemed to have separated presentation from logic (JavaScript from CSS and HTML). With time
applications became bigger and more complicated but folder structure did not change.
Consider the  structure of the <a href="https://github.com/angular/angular-seed/tree/master/app">angular-seed</a> project:
<div style="height: 20px"></div>

<pre>
|-- css
|-- img
|-- js
|-- |-- app.js
|-- |-- controllers.js
|-- |-- directives.js
|-- |-- filters.js
|-- `-- services.js
|-- lib
|-- partials
|-- index-async.html
`-- index.html
</pre>

While this structure works fine for a small website or a brief demo how to use AngularJS, it quickly becomes very messy in case of a 
large JavaScript application with many views. It is the same as if you used no folder structure at all.

<h3>Need For A Change</h3>

Historically, organization by type played an important role, but because of the new tendencies in front-end development
it is no longer useful for modern web apps.

<ol class="simple-list">
	<li>
		<b>Total separation of front-end and back-end.</b> In the early days of the web, server side languages often generated
		client side code. Such technologies as PHP, ASP, JSP, and the like all have templating capabilities and can be used inline to 
		generate HTML. However, this approach was replaced by REST APIs. 
	</li>
	<li>
		<b>More business logic is moving to front-end.</b> Many of the typical server side tasks are now done on the client. It is popular
		to use JavaScript for client side tempting, partial page refreshes and virtual scrolling, aggregation of multiple APIs, client side
		data manipulation, image processing, interactive visualization, etc.
	</li>
	<li>
		<b>Rise of SPAs (Single Page Applications).</b> Unlike traditional website that have pages, SPAs run within the context of a 
		single page. A SPA would never reload entire page, but refresh parts of id dynamically. This means that one page can be constructed from
		a large number of assets.
	</li>
	<li>
		<b>Deep linking (aka routing).</b> Deep linking is an inevitable consequence of the rise of SPAs. Now, when your application
		has only one page, how do you utilize browser's back button? This is where routing provids a robust solution.		
	</li>
	<li>
		<b>Lazy loading.</b> This is another consequence of the rise of SPAs. When application is huge, you cannot make your users wait 
		while it is loading, even if it is relatively short. 
	</li>
</ol>

Each point stated above contributes to the fact that your client side code base gets really big. The large it gets the more confusing it can
become. It is not clear at first as the files grouped by type appear to be neatly organized, but it becomes painfully apparent when you 
get a new developer on the team and he starts tracing the relationship between app components to understand how they work.
<div style="height: 20px"></div>

When I come to a project that has already been under development I always start tracing the logic 
from index.html, trying to determine which files are just libraries and which are the core of the application. Then I open the core file(s) 
and try to follow the logic. Very soon I have a dozen of files opened from a number of directories and the further I go the more
difficult it is to remember how do these files work together.

<h3>Relational Structure</h3>

Relational structure is very different. The main idea is that files are organized by their relationship to each other. It is 
similar to modular organization. Consider the following structure:
<div style="height: 20px"></div>

<pre>
app
|-- admin
|-- |-- config.js
|-- |-- controller.js
|-- |-- user.css
|-- |-- user-new.html
|-- `-- user-view.html
|-- inventory
|-- |-- config.js
|-- |-- controller.js
|-- |-- model.js
|-- |-- inventory.css
|-- |-- inventory-add.html
|-- |-- inventory-list.html
|-- `-- inventory-view.html
|-- campaign
|-- |-- config.js
|-- |-- controller.js
|-- `-- new-campaign.html
|-- |-- new-campaign.css
|-- `-- email-template.html
|-- reports
|-- `-- ....
|-- settings
|-- `-- ....
`-- start.js
libs
|-- jquery
|-- |-- jquery.js
|-- |-- jquery.min.js
|-- `-- jquery.map
|-- w2ui
|-- |-- w2ui.js
|-- |-- w2ui.min.js
|-- |-- w2ui.css
|-- `-- w2ui.min.css
`-- ....
index.html
</pre>

As always the starting point is index.html, which loads all necessary libraries. Then the control for the application goes to app/start.js 
that initialized the app and loads first module. 
<div style="height: 20px"></div>

<h4>Benefits</h4>

<ol class="simple-list">
	<li>
		<b>Clear.</b> This structure provide very clear visibility into the application. If you are working on the user module 
		all the files you need are in app/user directory. There is no need to jump from folder to folder to find files you need.
	</li>
	<li>
		<b>Extensible.</b> This structure is exceptionally extensible as it is clear to know where you need to add files if 
		you are working on a user module and it is easy to decide what should you do if you want to add a new module to the 
		application.
	</li>
	<li>
		<b>Agile.</b> This structure is also agile. If you have a module that grows large, you may create more subfolder in module's folder to 
		organize your files or you can split the module into two. If you application grows to include many modules the folder structure will 
		still be quite simple.
	</li>
	<li>
		<b>Testable.</b> Organizing in modules also helps your QA team as they can only load and test modules you modified.
	</li>
</ol>

When I came on board with my current project the 
team has already defined folder structure and it happened to be modular. Having worked on a project for over 2 years I have come to appreciate 
this idea and think that it is a very useful one. I have also found a few other developers who made similar observations.

<ul style="margin: 10px 25px;">
	<li>
		<a href="http://cliffmeyers.com/blog/2013/4/21/code-organization-angularjs-javascript">Code Organization in Large 
		AngularJS and JavaScript Applications</a>
	</li>
	<li>
		<a href="http://backbonetutorials.com/organizing-backbone-using-modules/">Organizing your application using Modules</a>
	</li>
	<li>
		<a href="http://flippinawesome.org/2014/05/19/convention-based-routing-in-javascript-apps/?utm_source=javascriptweekly&utm_medium=email">
		Convention Based Routing In JavaScript Apps</a>
</ul>

I hope that arguments I presented will persuade you to adopt this approach or at least you will be open-minded to give it a try.