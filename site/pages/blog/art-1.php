<? $theme->assign("page-name", "A Variation of JavaScript Module Pattern"); ?>

<h2>A Variation of JavaScript Module Pattern</h2>
<div class="date">May 25, 2012</div>

<? require("blog-social.php"); ?>

Module Pattern is one of the most popular JavaScript design patterns today. It has a number of flavors in existence but all of 
them are based on the same desire to encapsulate and protect the private state of an object. As you know, vanilla JavaScript does not have
<i>private</i> or <i>protected</i> keyword that would make a property of an object private. All of the properties and methods of
any JavaScript object are inherently public and anyone can change, overwrite or even delete them. This is where the module pattern
comes in. 
<div class="spacer15"></div>

All variations of module patterns are based on JavaScript closures. JavaScript closure provides a convenient way to 
create a private state and protect it. Module pattern has evolved over the course of almost 10 years and as a starting point I 
am going to use revealing module pattern, which we in our development team just call the module pattern.

<textarea class="javascript">
var module = (function () {
	// private variables and functions
	return {
		// public variables and functions
	}
})();
</textarea>

A self-invoking function is assigned to a variable thus creating a JavaScript closure with a private variable scope. The beauty of
this pattern is that you can expose only the properties and methods that you want keeping the rest of them protected in the closure.
<div class="spacer15"></div>

But, there is a problem with this pattern. If you start developing very complex JavaScript applications, you will notice that 
this pattern does not allow you to split the code into multiple files. All of the functions have to be within a single file. This
problem is easy to solve with the pattern below. I have also added a few methods and functions that help me demonstrate the beauty 
of this approach.

<textarea class="javascript">
var module = (function (obj) {	
	// private variables and functions
	var private = 1;
	
	// interval body of the module
	obj.buildSomething = function buildSomething() {
		// some JavaScript code
	}
	// return public part
	return obj
})(module || {});
</textarea>

This pattern allows the use of the module even before it is loaded. For example, in the course of your application, you need to 
load a module as a separate script. However, before you load it, you want to pass a few variables to it.

<textarea class="javascript">
// 1. Before module is loaded
var module = module || {};
module.id     = 12;
module.showIn = 'preview';
$.getScript('module.js');
</textarea>

In line 1, we declare the module variable as an empty object, if it was not declared before. Then, in lines 2-3 we set a few public
properties that will be passed to the module while it asynchronously loads. The content of the file module.js can be like this

<textarea class="javascript">
// 2. The module itself
var module = (function (mod) {	
	// private variables and functions
	var private = 1;
	
	// interval body of the module
	mod.render = function render() {
		// Here we use variables that we have passed 
		// before module was loaded
		console.log("id: " + mod.id);
		console.log("showIn: " + mod.showIn);
	}
	mod.render();
	
	// return public part
	return mod;
})(module || {});
</textarea>

You can augment this module at any time in the future. All you need to do is to repeat the basic structure of the module.
For example, if in addition to the code above you execute the following code

<textarea class="javascript">
// 3. Augmentation of the module
var module = (function (mod) {	
	// private variables and functions
	var private = 1;
	
	// body of the module
	mod.doSomething = function doSomething() {
		// You can put any JavaScript code here
	}
	
	// return public part
	return mod;
})(module || {});
</textarea>

it will extend the module with <i>doSomething()</i> method.

<h3>The Prettiest Form</h3>
My favorite and, arguably, the most prettiest form of the module pattern with augmentation is achieved when we 
<i>call</i> it and pass the context.

<textarea class="javascript">
var module = (function () {	
	// private variables and functions
	var private = 1;
	
	// public part
	this.doSomething = doSomething;
	this.doNothing   = doNothing;
	return this;
	
	// Module Implementation	
	function doSomething() {
		// JavaScript code
	}
	function doNothin() {
		// JavaScript code
	}
}).call(module || {});
</textarea>
Besides using <i>call</i> to invoke the module, this version also uses functional declaration for internal methods, not functional 
expressions. If you assign a function to a variable you cannot use this variable before it was declared. However, if you use functional 
declarations, you can use them before they were declared. This allows to use functions and then exit the module with <i>return this</i>, 
while the implementation of the module follows below. In my view it makes the code easier to follow in large applications.

<h3>The Private Problem</h3>
There is one grave problem with the augmented module pattern that is hard to solve. The problem is that augmented portion of the 
module has no access to the private variables of the original module. In fact, because those are two different JavaScript functions,
they have 2 different variable scopes and there is no way to share them.
<div class="spacer15"></div>

Looking for a solution, I have come across an <a href="http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth">article</a> 
by Ben Cherry that proposes to solve this problem by sealing and unsealing the private variables. While this is a solution to the
problem, I do not think it is the prettiest one. The problems with this approach are numerous:
<ol>
	<li>As a developer you have an additional burden to seal and unseal private scope.
	<li>Private scope must be encapsulated into an object or you would have to seal and unseal each and every variable.
	<li>Private scope is not completely protected because anyone can seal and unseal it if they know what they are doing.
</ol>
There is another solution - JavaScript <i>eval()</i> function. I am not a big fan of <i>eval()</i>, but if it can solve the 
problem it is worthwhile to give it a shot. Below is a simple example how <i>eval()</i> can be used
<textarea class="javascript">
var module = (function () {	
	// private variables and functions
	var private = 1;
	
	// public part
	this.doSomething = doSomething;
	this.doNothing   = doNothing;
	
	init();
	return this;
	
	// Module Implementation	
	function init() {
		$.get('module.js', function (data, error, responseObj) {
			eval(responseObj.responseText);
		}
	}
	function doSomething() {
		// JavaScript code
	}
	function doNothin() {
		// JavaScript code
	}
}).call(module || {});
</textarea>
At first I thought I can write a library where I can "hide" <i>eval()</i> and it would do the job for me, but soon I have realized that
in order to access the private scope <i>eval()</i> has to be executed where private scope is visible. Therefore, it must be used within the
module function or within any sub-function of the module function. On the bright side, you can also augment the module following the same
pattern and executing it with <i>eval()</i>.
<div class="spacer15"></div>

Lastly, there is one more resources I would recommend for further reading. Addy Osmani has written a book called
<a href="http://addyosmani.com/resources/essentialjsdesignpatterns/book/">Learning JavaScript Design Patterns</a> where he describes lots
of different design patterns from JavaScript perspective. It certainly has been a helpful resource for me.