<? $theme->assign("page-name", "Using ANT to Build and Deploy JavaScript Projects"); ?>

<h2>Using ANT to Build and Deploy JavaScript Projects</h2>
<div class="date">October 27, 2012</div>

<? require("blog-social.php"); ?>

Any serious project should have a clear, consistent and automated build process. Having to build
a project is not new for JAVA or C developers but for the long time it was pretty much neglected
by front-end developers who spent most of their development time writing JavaScript, CSS and HTML.
<br><br>

"What are the advantages for JavaScript developers does the automated build process offer"? - you may
ask. Well, I like the way you ask questions. Here is the short list of what you can do automatically:
<br><br>
<ul>
	<li>You can minify all of your JavaScript and CSS files
	<li>You can concatenate JavaScript libraries into one file for faster loads
	<li>You can compile your Coffee scripts
	<li>You can compile your LESS files
	<li>You can run Unit Tests
	<li>You can package your application, including only files you need for production
	<li>You can have different build processes for Development and Production
	<li>You can upload files with SCP of FTP
	<li>You can automatically deploy your project with a single click.
</ul>

<div class="spacer10"></div>

<h3>Why is a Build Process Important</h3>

An automated (or scripted) build process offers a number of advantages, such as:
<br><br>
<ul>
	<li>Resistance to Human Errors
	<li>Increased speed of deployment
	<li>Possibility of continues integration
	<li>Team scalability
	<li>Cost savings on deployment and support
</ul>

<div class="spacer10"></div>

<h3>Getting Started with ANT</h3>

I am a front-end developer, but our server side team is all about Java. So, it was natural for me to start
using Apache Ant for building and deployment. Apache Ant can do a lot of tasks automatically and there is a
pretty straight forward <a href="http://ant.apache.org/manual/">documentation</a> what it can do at apache site.
Here is the basic build.xml file to start with.
<div class="spacer15"></div>

<textarea class="html">
&lt;project name="proj-name" basedir="." default="build"&gt;
    &lt;property name="build.dir" value="BUILD"/&gt;

    &lt;target name="clean"&gt;
        &lt;delete dir="${build.dir}"/&gt;
    &lt;/target&gt;

    &lt;target name="build" depends="clean"&gt;
        &lt;mkdir dir="${build.dir}"/&gt;
    &lt;/target&gt;
&lt;/project&gt;
</textarea>

<div class="spacer15"></div>

<p>If you know the syntax of build.xml that Ant expects, you can skip this sections. For those of you who have not
worked with Ant before, let me explain. An Ant build file is usually called build.xml and is an XML file that has
its top node &lt;project&gt; that describes your project. In the project you can defined name, basedir and default
target.</p>

<p>Next, you define all your targets. A target is a subset of tasks that might depend on another subset or
be completely independent. In the example above I have two targets: clean and build. The build one (which is also
the default one) will create a BUILD directory, the second one - clean - will delete it. Besides that tasks do not
do anything else. The build target depends on clean, which means if you execute build target, it will first
execute the clean target, making sure that the BUILD directory is recreated each time you build.</p>

<p>To execute you target type "ant target-name" in the console. Or just "ant" if you want to execute the default target.</p>

<h3>Concatenate and Minify your Code</h3>

Now, lets get into the good parts. I want to build my project and get it ready for production and by this I mean I will
concatenate my JavaScript libraries into one file and minify it with JSMIN library. Also, I will minify my CSS files.
Here is the code:

<div class="spacer15"></div>

<textarea class="html">
&lt;project name="proj-name" basedir="." default="build"&gt;
    &lt;property name="build.dir" value="BUILD"/&gt;
    &lt;taskdef name="jsmin" classname="net.matthaynes.jsmin.JSMin_Task"/&gt;

    &lt;target name="clean"&gt;
        &lt;delete dir="${build.dir}"/&gt;
    &lt;/target&gt;

    &lt;target name="build" depends="clean"&gt;
        &lt;mkdir dir="${build.dir}"/&gt;

        &lt;concat destfile="./js/all.js"&gt;
            &lt;filelist dir="./js/" files="lib1.js lib2.js lib3.js"/&gt;
        &lt;/concat&gt;

        &lt;jsmin srcfile="./js/all.js" suffix="true" force="true"
        		copyright="(c) 2012. All Rights Reserved." /&gt;
        &lt;jsmin srcfile="./css/main.js" suffix="true" force="true"
        		copyright="(c) 2012. All Rights Reserved." /&gt;
    &lt;/target&gt;
&lt;/project&gt;
</textarea>

<div class="spacer15"></div>

<p>Let me walk through the changes. First of all, I concatenate all files with contact task, which is a standard task
with Ant in lines 12-14.</p>

<p>Then I minify all.js with JSMIN task, which is not part of Ant installation, and you will need to download
the .jar file and put it in Ant jar directory. I define the custom task in line 3 and do actual minification in
lines 16-19. Here is a quick link for you for <a href="http://code.google.com/p/jsmin-ant-task/downloads/list">JSMIN .tar file</a>,
which you will need to put into
<br><br>
/opt/local/share/java/apache-ant/lib
<br><br>
if you are on a Max OS X 10.7.5 (Lion) or the appropriate folder for you OS.
</p>

<div class="spacer15"></div>

<h3>Zipping Up, Uploading with SCP, Deploying</h3>

<p>Finally, your project is ready to be deployed into the development server. To do this, we are going to
tar only the necessary files, upload it with SCP and deploying on the remove server. </p>

<textarea class="html">
&lt;project name="proj-name" basedir="." default="build"&gt;
    &lt;property name="build.dir" value="BUILD"/&gt;
	&lt;property name="ftp-host"  value="server-address.com"/&gt;
	&lt;property name="ftp-user"  value="user"/&gt;
	&lt;property name="ftp-dir"   value="/full/path/to/folder"/&gt;

    &lt;taskdef name="jsmin" classname="net.matthaynes.jsmin.JSMin_Task"/&gt;

    &lt;target name="clean"&gt;
        &lt;delete dir="${build.dir}"/&gt;
    &lt;/target&gt;

    &lt;target name="build" depends="clean"&gt;
        &lt;mkdir dir="${build.dir}"/&gt;

        &lt;concat destfile="./js/all.js"&gt;
            &lt;filelist dir="./js/" files="lib1.js lib2.js lib3.js"/&gt;
        &lt;/concat&gt;

        &lt;jsmin srcfile="./js/all.js" suffix="true" force="true"
        		copyright="(c) 2012. All Rights Reserved." /&gt;
        &lt;jsmin srcfile="./css/main.js" suffix="true" force="true"
        		copyright="(c) 2012. All Rights Reserved." /&gt;

		&lt;!-- tar, then gzip only relevant files --&gt;

		&lt;tar destfile="${build.dir}/build.tar"&gt;
			&lt;tarfileset dir="."&gt;
				&lt;exclude name="BUILD/**"/&gt;
				&lt;exclude name="build.xml"/&gt;
			&lt;/tarfileset&gt;
		&lt;/tar&gt;
		&lt;gzip src="${build.dir}/build.tar" destfile="${build.dir}/build.tar.gz"/&gt;

		&lt;!-- upload to ftp ant unzip --&gt;

		&lt;input message="       ---&gt; Please enter ${ftp-user} password for ${ftp-host}:"
					addproperty="ftp-pass"&gt;
			&lt;handler type="secure"/&gt;
		&lt;/input&gt;

  		&lt;scp file="${build.dir}/build.tar.gz" trust="true"
  		    todir="${ftp-user}:${ftp-pass}@${ftp-host}:${ftp-dir}"/&gt;

		&lt;sshexec host="${ftp-host}" username="${ftp-user}" password="${ftp-pass}"
			command="cd ${ftp-dir}; tar -xzvf build.tar.gz > /dev/null;
			         rm -f ${ftp-dir}/build.tar.gz;"/&gt;
    &lt;/target&gt;
&lt;/project&gt;
</textarea>

<div class="spacer15"></div>

<p>In lines 27-32 I create a tar of my project excluding files that I do not need on my server, namely my BUILD folder
and the build.xml file. Then I zip it up with gzip in line 33 and in lines 37-47 I upload it to the destination
server, which is defined in lines 3-5 and securely ask user to enter the password. And finally, I remotely execute my
ssh command to unpack the archive into the right place.</p>
<p>That's pretty cool. My entire process is only 25 seconds, it does all for me automatically and there is no room
for human error. Besides, I can teach anyone how to do this without a problem.</p>
