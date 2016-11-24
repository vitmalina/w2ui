<div class="container">
	<div class="row">
		<div class="span2">
			<div class="row" style="height: 20px">&nbsp;</div>
			<? require("mobile-menu.php") ?>
		</div>
		<div class="span10">
			<div style="float: right; width: 260px; margin-left: 30px; margin-top: 20px;">
				<iframe style="width: 202px; height: 304px; position: absolute; margin-top: 82px; margin-left: 18px;" 
					src="http://www.youtube.com/embed/1W5oxhXf8ck?rel=0&hd=1&autoplay=1&loop=1&controls=0" frameborder="0"></iframe>
				<!--iframe style="width: 280px; height: 418px; position: absolute; margin-top: 100px; margin-left: 20px;" 
					src="http://www.youtube.com/embed/1W5oxhXf8ck?rel=0&hd=1&autoplay=1&loop=1&controls=0" frameborder="0"></iframe-->
				<img src="img/iphone4.png"/>
			</div>

			<h3>Overview</h3>
			<p>
				Web 2.0 Touch is a concise JavaScript library for touch devices (iPhone, iPad, Android) or anything that runs on WebKit engine. Below is a short 
				list of features.
				<ul>
					<li>HTML5 and CSS3</li>
					<li>Dynamic page loads</li>
					<li>Hardware accelerated transitions</li>
					<li>Several CSS themes</li>
					<li>EdgeToEdge and Rounded lists</li>
					<li>Native looking tabs</li>
					<li>Native looking buttons</li>
					<li>Regular and Modal Overlays</li>
					<li>Much more...</li>
				</ul>
			</p>
			<p>
				This is an open source project that you can participate in. To participate, fork it on 
				<a href="https://github.com/vitmalina/Web-2.0-Touch">https://github.com/vitmalina/Web-2.0-Touch</a> and push 
				your changes for the review when you are completed. 
			</p>
			<div style="height: 10px"></div>

			<h3>Online Demo</h3>
			
			<a href="http://w2ui.com/demo/touch" onclick="_gaq.push(['_trackEvent', 'Demo', 'Web20Touch']);">http://w2ui.com/demo/touch</a> - only WebKit browsers
			<div style="height: 10px"></div>
			
			<h3>Mailing List</h3>
			<div class="hero-unit">
			<div id="mlist" style="text-align: center">
			  <span style="display: inline-block; margin: 3px;">Your Email:</span>
			  <input type="text" id="email" maxlength="100" style="padding: 3px; margin-top: 2px; width: 250px">
			  <a href="javascript:" onclick="saveList()" class="btn btn-success" style="margin-left: 10px; margin-top: -8px">Subscribe</a>
			</div>
			<script>
			  function saveList() {
			    $.post('pages/list_save.php', {
			      list  : '2',
			      fname : $('#fname').val(),
			      lname : $('#lname').val(),
			      email : $('#email').val()
    	        }, function (data) {
	              $('#mlist').html(data);
			    });
			  }
			</script>
			</div>
			<p>
				The project is in active development. If you would like to receive email notifications about new releases, updates,
				and other relevant information, add your email to our mailing list. You should not receive more then one email per month or two. 
			</p>

			<div style="height: 10px"></div>

			<h3>Download</h3>
			<a href="downloads/web20touch.zip" onclick="_gaq.push(['_trackEvent', 'Downloads', 'Web20Touch']);">web20touch.zip</a> 
				- Release 1.0 (stable), June 3, 2012<br>
			<div style="height: 5px;"></div>
			Change Log
			<ul>
				<li>Enhancement: Updated XML files for PhoneGap 1.9.0 support</li>
				<li>Bug fix: toolbar item positioning</li>
				<li>Bug fix: CSS segmented button problems</li>
				<li>Bug fix: transition jerky movements</li>
				<li>Enhancement: Added hidef icons for Retina screen iPhone submitions</li>
			</ul>
			<a href="downloads/web20touch-b4.zip" onclick="_gaq.push(['_trackEvent', 'Downloads', 'Web20Touch-b4']);">web20touch-b4.zip</a> 
				- beta 4, May 8, 2012<br>
			<div style="height: 5px;"></div>
			Change Log
			<ul>
				<li>Bug fix: When iScroll is enabled, clicking on the input control does not set focus to the control</li>
				<li>Enhancement: Forms page is added</li>
				<li>Enhancement: On/Off control is added</li>
			</ul>
			<a href="downloads/web20touch-b3.zip" onclick="_gaq.push(['_trackEvent', 'Downloads', 'Web20Touch-b3']);">web20touch-b3.zip</a> 
				- beta 3, November 14, 2011<br>
			<a href="downloads/web20touch-b2.zip" onclick="_gaq.push(['_trackEvent', 'Downloads', 'Web20Touch-b2']);">web20touch-b2.zip</a> 
				- beta 2, October 12, 2011<br>
			<a href="downloads/web20touch-b1.zip" onclick="_gaq.push(['_trackEvent', 'Downloads', 'Web20Toucb-b1']);">web20touch-b1.zip</a> 
				- beta 1, September 22, 2011<br>
		</div>
	</div>
</div>