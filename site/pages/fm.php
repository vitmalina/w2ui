<?
    global $site_root, $theme;
    $theme->append('site-head', "<link type=\"text/css\" rel=\"stylesheet\" href=\"".$site_root."/css/slimbox2.css\"></script>");
    $theme->append('site-head', "<script src=\"".$site_root."/js/jquery.slimbox2.js\"></script>");
?>

<br>
<div class="container">
    <div class="row">
        <div class="span12">
        	<h2>Web 2.0 File Manager</h2>
        	<p>
			Web based <b>File Manager</b> with mutli file operations, multi file upload, archiving/unarchiving utilities, etc. This application 
			does not required a database and uses Ajax on the client side and PHP on the server side to work with files. In the root 
			directory you will find conf.php that has basic configuration what directories it is going to allow to work with. By 
			default, it will allow to work with one of the directories in your /temp folder.  Below is the list
			of basic features:
			<ul>
				<li>Full file management (rename, copy, delete, move, etc.)</li>
				<li>Operations over multiple selected files</li>
				<li>Multiple file Upload/Download</li>
				<li>Archive/unariched files for download</li>
				<li>Much more...</li>
			</ul>

			This is an <b>open source</b> project that you can participate in. To participate, fork it on 
			<a href="https://github.com/vitmalina/Web-2.0-File-Manager">https://github.com/vitmalina/Web-2.0-File-Manager</a>
			and push your changes for the review when you are completed.
			<br><br>
			<u>Note:</u> Current Web 2.0 File Manager needs a rewrite with updated w2ui library. As soon as it is available, it will be posted
			to this page.

			<h3>Screen Shots</h3>
			<a title="Nice looking interface" rel="lightbox-fm" href="ss/fm-01.png"><img style="margin: 3px; border: 1px solid gray" src="ss/fm-01.jpg"></a>
			<a title="Operations over multiple files" rel="lightbox-fm" href="ss/fm-02.png"><img style="margin: 3px; border: 1px solid gray" src="ss/fm-02.jpg"></a>
			
			<h3>Online Demo</h3>
			You can see the full demo of the application at the following address
			<ul style="margin-bottom: 25px">
				<li><a href="http://w2ui.com/demo/fm" onclick="_gaq.push(['_trackEvent', 'Demo', 'FileManager']);">http://w2ui.com/demo/fm</a>
				<li>User: demo
				<li>pass: demo
			</ul>

			<h3>Download</h3>
			<a href="downloads/fm-0.9.tar.gz" onclick="_gaq.push(['_trackEvent', 'Downloads', 'FileManager-0.9']);">fm-0.9.tar.gz</a> - 109Kb (ver. 0.9)
			<br><br>
        </div>
    </div>
</div>