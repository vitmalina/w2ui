<?
	global $site_root, $theme;
	$theme->append('site-head', "<script src=\"".$site_root."/pages/code-mirror.js\"></script>");
?>

<div class="container">
	<div class="row" style="height: 20px">&nbsp;</div>
	<div class="row">
		<div class="span2">
			<div class="row" style="height: 20px">&nbsp;</div>
			<? require("mobile-menu.php") ?>
		</div>
		<div class="span10">
			<h3>Tutorial</h3>
			<p>
				<h4>Step 1</h4>
				When you start a new application and use Web 2.0 Touch as a starting point. Generally, the first step is to delete all files inside
				/pages/* directory and modify index.php. Below is the minimum example of index.php file
<textarea class="html">
<!DOCTYPE html>
<html>
<head>
    <title>Web 2.0 Touch</title>
    <meta name="viewport" 
    	content="initial-scale=1.0; maximum-scale=1.0; user-scalable=no; width=device-width;" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    
    <link rel="apple-touch-startup-image" href="images/iphone_startup.png" />
    <link rel="apple-touch-icon" href="images/iphone_icon.png" />
    <link id="coreCSS" type="text/css" rel="stylesheet" media="screen" href="css/core.css">
    <link id="mainCSS" type="text/css" rel="stylesheet" media="screen" href="css/ipad-dark.css">
    
    <script type="text/javascript" src="includes/jquery.js"></script>
    <script type="text/javascript" src="includes/jsTouch.js"></script>
    <script type="text/javascript" src="includes/iscroll.js"></script>
    <script type="text/javascript">
        var myTouch;
        $(document).ready(function () { 
            myTouch  = jsTouch.init('myTouch', { width: 320, page: 'pages/home.php' } );
            jsTouch.resize();
        });
        // prevent default scroll 
        document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
    </script>
</head>
<body style="background-image: url(images/iphone_startup.png);">
    <div id="myTouch" class="jsTouchPanel" 
    	style="position: absolute; left: 0px; top: 0px; border-left: 0px !important;">
    </div> 
</body>
</html>
</textarea>
				Important things here are 
				<ul>
					<li> include css/core.css </li>
					<li> include of of the following for different themes (1) css/apple.css (2) css/ipad-light.css (3) css/ipad-dark.css </li>
					<li> make sure you include jquery.js, jsTouch.js and iscroll.js (latest code might not require iscroll due to native support) libraries </li>
					<li> initialize jsTouch with the following - myTouch  = jsTouch.init('myTouch', { width: 320, page: 'pages/home.php' } ); 
						this will make width of the box to be 320px and will load first page pages/home.php into the main control. Make sure there
						is a div with id myTouch inside body element. </li>
				</ul>
				
				<h4>Step 2</h4>
				Create custom pages. In the example above, it assumes you already have pages/home.php page. This page will be loaded on 
				initialization. This page is dynamicly loaded through $.post() and inserted into the view. This page can be any HTML markup. However,
				to take advantange of CSS themeing it can be as follows:
<textarea class="html">
<div class="toolbar">
    <h1>Web 2.0 Touch</h1>
</div>
<div class="content">
  <div>
    <div style="padding: 5px 15px">
        Welcome to Web 2.0 Touch - a Concise Mini JavaScript frame work for touch devices 
        (iPhone, iPad, Android).
    </div>
    <ul class="rounded">
        <li>
            <a onclick="jsTouch.loadPage('pages/page1.php', { transition: 'slide-left' });">
            	Page 1 <span class="arrow"></span>
            </a>
        </li>
        <li>
            <a onclick="jsTouch.loadPage('pages/page2.php', { transition: 'slide-left' });">
            	Page 2 <span class="arrow"></span>
            </a>
        </li>
    </ul>
  </div>
</div>
</textarea>
				Important things here are
				<ul>
					<li> There are two main div, top one has class=toolbar and bottom one class=content (you can also have third one class=footer). 
						This is important because proper styles will be applied only if you have these divs. </li>
					<li> Inside class=content div there is another empty div - don't remove it, it needed for iScroll.</li>
					<li> Pay attention how new page is loaded with jsTouch.loadPage('pages/page1.php', { transition: 'slide-left' }); The page must exists. Also, you can use a number of 
					transition styles: slide-left, slide-right, slide-up, slide-down, flip-left, flip-right, flip-up, flip-down, pop-in, pop-out</li>
				</ul>
				<h4>Step 3</h4>
				To learn how to use other UI controls, you can open files inside /pages folder and use them as examples. The files are small 
				and self explanatory. All pages are dynamicly loaded into the view. Each time a page is transitioned, previous page is deleted to make it 
				easier for the mobile processor to operate. Mobile processors are slow, as you might have noticed already.
				
				<br><br>
				Thank you for using Web 2.0 Touch. I hope it helps you. If you are interesed in participating, fork me on github.
			</div>
		</p>
		</div>
	</div>
</div>
