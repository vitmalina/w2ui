<? global $site_root ?>

<div class="container">

  <div class="row">
    <div class="span12">
      <div class="hero-unit" style="padding: 50px 0px 30px 0px; background-color: #fff;">
        <div id="mlist" style="text-align: center">
          <span style="display: inline-block; margin: 3px;">Your Email:</span>
          <input type="text" id="email" maxlength="100" style="padding: 3px; margin-top: 2px; width: 250px">
          <a href="javascript:" onclick="saveList()" class="btn btn-success" style="margin-left: 10px; margin-top: -8px">Add to Mailing List</a>
        </div>
        <script>
          function saveList() {
            $.post('pages/list_save.php', {
              list  : '1',
              fname : $('#fname').val(),
              lname : $('#lname').val(),
              email : $('#email').val()
            }, function (data) {
              $('#mlist').html(data);
            });
          }
        </script>
      </div>
    </div>
  </div>

  <div class="row">

    <div class="span6">
      <h2>What People Are Saying</h2>
      
      <div class="alert alert-quote">
          I have been using it quite substantially for a number of different projects now and must say that I absolutely love the way it works. 
		  <br><br>
		  <span class="alert-quote-author">- Soteri Panagou</span>
	      <div style="clear:both"></div>
      </div>
      
      <div class="alert alert-quote">
	      I've been using your grid on a couple of small projects and I've got to say it's an awesome piece of work.  It's very easy to configure and offers a lot of features while staying really responsive.  As a programmer it inspires me to write better code. 
		  <br><br>
		  <span class="alert-quote-author">- Collanders</span>
	      <div style="clear:both"></div>
      </div>
      
      <div class="alert alert-quote">
	      I must say, I really like all of these controls. They have clean, elegant visuals and the attention to design detail really makes me a fan. In particular, the grid is just incredible. 	      
		  <br><br>
		  <span class="alert-quote-author">- Bob F</span>
	      <div style="clear:both"></div>
      </div>
      
      <div class="alert alert-quote">
	      I was searching for a slick and simple, but also user-friendly UI library. I tried Polymer, Angular, OpenUI5, jqwidget, … but they do not satisfy my needs. 
	      I don’t want to declare the whole UI in html (templates) but instead will create ALL UI elements programmatically (in an easy way). With w2ui this can be done 
	      really easy and the UI elements looks really nice.
		  <br><br>
		  <span class="alert-quote-author">- Gerald Leeb</span>
	      <div style="clear:both"></div>
      </div>
      
      
      <div class="alert alert-quote">
	      W2UI is an excellent library! In less than a couple of days I was able to reach the same degree of functionality in my project (an interface for my lab 
	      database), which took me a couple of months using a well known widget library. W2UI is clean, small, fast and efficient. Plus, it's good looking!
		  <br><br>
		  <span class="alert-quote-author">- Antonio Santos</span>
	      <div style="clear:both"></div>
      </div>
            
      <div class="alert alert-quote">
		  Very nice looking library. I'm impressed and very hopeful that this will continue to grow and become a major player. The Grid is awesome!
		  <br><br>
		  <span class="alert-quote-author">- John Whitten</span>
	      <div style="clear:both"></div>
      </div>

      <div class="alert alert-quote">
		  I'm loving w2ui, it packs a lot of punch for such a light library. After working with ExtJS for 5 years, I've finally found a 
		  suitable replacement. The grid is fantastic! Thanks for all your hard work.
		  <br><br>
		  <span class="alert-quote-author">- Neil Grover</span>
	      <div style="clear:both"></div>
      </div>
      
      <div class="alert alert-quote">
		  I am seriously blown away at the amazing quality of this library. Well done!
		  <br><br>
		  <span class="alert-quote-author">- Billy</span>
	      <div style="clear:both"></div>
      </div>
      
      <div class="alert alert-quote">
		  This is amazing! If any project I use this is profitable I'll make sure to pay you for it.
		  <br><br>
		  <span class="alert-quote-author">- Bruno Cassol </span>
	      <div style="clear:both"></div>
      </div>
      
      <div class="alert alert-quote">
	      This is incredible, thank you.
		  <br><br>
		  <span class="alert-quote-author">- Anthony Isaacson </span>
	      <div style="clear:both"></div>
      </div>
      
   
      <div class="alert alert-quote">
		  This library is absolutely amazing, i never seen in my life such a clean and understandable code!!! Congrats for your work!
		  <br><br>
		  <span class="alert-quote-author">- MrCatt</span>
	      <div style="clear:both"></div>
      </div>
      
      <div class="alert alert-quote">
		  First of all, thank you very much for your hard work on these components - they're all very, very good!
		  <br><br>
		  <span class="alert-quote-author">- Dave Thompson </span>
	      <div style="clear:both"></div>
      </div>      

    </div>

    <div class="span6">
    
      <h2>jQuery Based</h2>
      The w2ui library is a set jQuery plugins for front-end development of data driven web applications. It is not a adhoc port to jQuery, 
      but was initially developed with jQuery in mind. 
	  <div class="row spacer25"></div>
	  <div class="row spacer10"></div>

      <h2>Only 69kb</h2>
      Complete w2ui library is only 69kb (minified and gziped) and provides extremly fast load and execution. It is 9 times smaller then extjs 
      and 7 times smaller then kendo ui. It is just a bit over the size of jQuery.
	  <div class="row spacer25"></div>
	  <div class="row spacer10"></div>

      <h2>All In One</h2>
      Out of the box w2ui library is all-in-one solution. It contains all most common UI widgets: Layout, Grid, Sidebar, Tabs, Toolbar, Popup, Field 
      Controls and Forms. You do not need to put together a collection of mismatched plugins to accomplish your goals.
	  <div class="row spacer25"></div>
	  <div class="row spacer10"></div>

      <h2>Superior UX</h2>
      Pixel perfect design, modern look and feel and complete JavaScript transarency are the key factors of w2ui library. Check out our <a href="demo">demo</a> page to 
      see it in action.
	  <div class="row spacer25"></div>
	  <div class="row spacer10"></div>

      <h2>Modern Browsers</h2>
      The library heavily uses HTML5 and CSS3 and yet supports all major modern browsers. Latest Chrome, FireFox 7+, Safari 5+ and IE 9+ are among 
      supported browsers.
	  <div class="row spacer25"></div>
	  <div class="row spacer10"></div>

      <img src="<?=$site_root?>/img/browsers.jpg"/>
      
      <p>
        The project is in active development. If you would like to receive email notifications about new releases, updates,
        and other relevant information, add your email to our mailing list. You should not receive more then one email per month or two. 
      </p>
    </div>

  </div>

  <div class="row spacer25"></div>
  <div class="row spacer10"></div>

  <div class="row spacer"></div>

</div>
