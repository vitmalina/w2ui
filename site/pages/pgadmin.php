<?
    global $site_root, $theme;
    $theme->append('site-head', "<link type=\"text/css\" rel=\"stylesheet\" href=\"".$site_root."/css/slimbox2.css\"></script>");
    $theme->append('site-head', "<script src=\"".$site_root."/js/jquery.slimbox2.js\"></script>");
?>

<br>
<div class="container">
    <div class="row">
        <div class="span12">
        	<h2>Web 2.0 PgAdmin</h2>
			Web based <b>PostgresSQL</b> database management tool. This is a completely web based application that uses Ajax on the client side 
			and PHP on the server side. All configuration settings are defined in conf.php file that is in the
			main installation directory. Below is the list 
			of basic features:
			<ul>
				<li>Create/Delete/Manage databases</li>
				<li>Design and manage tables and related resources</li>
				<li>View current database load and monitor performance</li>
				<li>Insert/delete/update table data</li>
				<li>Export Meta Data and/or Data to an archive</li>
				<li>Execute SQL statements</li>
				<li>Much more...</li>
			</ul>
				
			This is an <b>open source</b> project that you can participate in. To participate, fork it on 
			<a href="https://github.com/vitmalina/Web-2.0-PgAdmin">https://github.com/vitmalina/Web-2.0-PgAdmin</a>
			and push your changes for the review when you are completed.
			<br><br>
			<u>Note:</u> Current Web 2.0 PgAdmin needs a rewrite with updated w2ui library. As soon as it is available, it will be posted
			to this page.
			
			<h2>Screen Shots</h2>
			<a title="List of databases" rel="lightbox-pgadmin" href="ss/pgadmin-01.png"><img style="margin: 3px; border: 1px solid gray" src="ss/pgadmin-01.jpg"></a>
			<a title="Table fields" rel="lightbox-pgadmin" href="ss/pgadmin-02.png"><img style="margin: 3px; border: 1px solid gray" src="ss/pgadmin-02.jpg"></a>
			<a title="Table SQL statement" rel="lightbox-pgadmin" href="ss/pgadmin-03.png"><img style="margin: 3px; border: 1px solid gray" src="ss/pgadmin-03.jpg"></a>
			<a title="Table Data" rel="lightbox-pgadmin" href="ss/pgadmin-04.png"><img style="margin: 3px; border: 1px solid gray" src="ss/pgadmin-04.jpg"></a>
			<a title="Sequence" rel="lightbox-pgadmin" href="ss/pgadmin-05.png"><img style="margin: 3px; border: 1px solid gray" src="ss/pgadmin-05.jpg"></a>
			<a title="View" rel="lightbox-pgadmin" href="ss/pgadmin-06.png"><img style="margin: 3px; border: 1px solid gray" src="ss/pgadmin-06.jpg"></a>
			<a title="Functions" rel="lightbox-pgadmin" href="ss/pgadmin-07.png"><img style="margin: 3px; border: 1px solid gray" src="ss/pgadmin-07.jpg"></a>
			<a title="Export features" rel="lightbox-pgadmin" href="ss/pgadmin-08.png"><img style="margin: 3px; border: 1px solid gray" src="ss/pgadmin-08.jpg"></a>
			<a title="Create Table" rel="lightbox-pgadmin" href="ss/pgadmin-09.png"><img style="margin: 3px; border: 1px solid gray" src="ss/pgadmin-09.jpg"></a>
			<a title="Database Variables" rel="lightbox-pgadmin" href="ss/pgadmin-10.png"><img style="margin: 3px; border: 1px solid gray" src="ss/pgadmin-10.jpg"></a>
			
			<h2>Online Demo</h2>
			You can see the full demo of the application at the following address
			<ul style="margin-bottom: 25px">
				<li><a href="http://w2ui.com/demo/pgadmin" onclick="_gaq.push(['_trackEvent', 'Demo', 'PgAdmin']);">http://w2ui.com/demo/pgadmin</a>
				<li>User: demo
				<li>pass: demo
			</ul>
			
			<h2>Download</h2>
			<a href="downloads/pgadmin-0.9.tar.gz" onclick="_gaq.push(['_trackEvent', 'Downloads', 'PgAdmin-0.9']);">pgadmin-0.9.tar.gz</a> - 131Kb (ver. 0.9)
			<br><br>
        </div>
    </div>
</div>