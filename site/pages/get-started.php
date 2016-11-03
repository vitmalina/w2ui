<?
    global $site_root, $theme;
    $theme->append('site-head', "<script src=\"".$site_root."/pages/code-mirror.js\"></script>");
?>

<br>
<div class="container">
    <div class="row">
        <div class="span12">
        	<section>
	            <h1>Get Started</h1>
	            <p>
	                Working knowledge of JavaScript, HTM, and CSS is required. The w2ui library is primarily a JavaScript library, hence it is
	                important you know some JavaScirpt before starting to work with the library. You can use the library with any server
	                side language (NodeJS, php, Java, .NET, perl, etc.). It can render data returned from the server or generated in the
	                browser with JavaScript.
                </p>
	        </section>
			<div style="height: 20px"></div>

            <section id="download">
                <h2>Download</h2>
                <p>
                    You can dowload either a minified version of the library or get full source code from github.com. There 2 files that you will
                    need, w2ui.js (or w2ui-1.5.rc1.min.js) and w2ui.css (or w2ui-1.5.rc1.min.css). Those files need to be included in every page where you want to
                    use the library.
                </p>
                <div class="row">
                    <br>
                    <div class="span12">
                        <a href="downloads/w2ui-1.5.rc1.zip" class="btn btn-primary btn-large">Download W2UI 1.5.rc1</a> &nbsp;&nbsp;&nbsp;
                        <a href="https://github.com/vitmalina/w2ui" class="btn btn-info btn-large">Open GitHub Project</a>
                    </div>
                </div>
                <div class="spacer"></div>
            </section>
			<div style="height: 20px"></div>

            <section id="package">
                <h2>What is Included</h2>
                <p>
                    If you download the minified version of the library, the following JavaScript widgets are included
                    <ul>
                        <li>Layout
                        <li>Grid
                        <li>Toolbar
                        <li>Tree
                        <li>Tabs
                        <li>Popup
                        <li>Forms
                        <li>Fields
                        <li>Utilitis
                    </ul>
                </p>
            </section>
			<div style="height: 20px"></div>

            <section id="example">
                <h2>Working Example</h2>
                <p>
                    Below is a complete example of HTML page that uses grid widget:
                    <textarea class="html">
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;link rel="stylesheet" type="text/css" href="http://w2ui.com/src/w2ui-1.5.rc1.min.css" /&gt;
    &lt;script src="http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"&gt;&lt;/script&gt;
    &lt;script type="text/javascript" src="http://w2ui.com/src/w2ui-1.5.rc1.min.js"&gt;&lt;/script&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;div id="grid" style="width: 100%; height: 250px;"&gt;&lt;/div&gt;
&lt;/body&gt;
&lt;script&gt;
$(function () {
    $('#grid').w2grid({
        name: 'grid',
        header: 'List of Names',
        columns: [
            { field: 'fname', caption: 'First Name', size: '30%' },
            { field: 'lname', caption: 'Last Name', size: '30%' },
            { field: 'email', caption: 'Email', size: '40%' },
            { field: 'sdate', caption: 'Start Date', size: '120px' }
        ],
        records: [
            { recid: 1, fname: "Peter", lname: "Jeremia", email: 'peter@mail.com', sdate: '2/1/2010' },
            { recid: 2, fname: "Bruce", lname: "Wilkerson", email: 'bruce@mail.com', sdate: '6/1/2010' },
            { recid: 3, fname: "John", lname: "McAlister", email: 'john@mail.com', sdate: '1/16/2010' },
            { recid: 4, fname: "Ravi", lname: "Zacharies", email: 'ravi@mail.com', sdate: '3/13/2007' },
            { recid: 5, fname: "William", lname: "Dembski", email: 'will@mail.com', sdate: '9/30/2011' },
            { recid: 6, fname: "David", lname: "Peterson", email: 'david@mail.com', sdate: '4/5/2010' }
        ]
    });
});
&lt;/script&gt;
&lt;/html&gt;</textarea>
                </p>
            </section>
        </div>
    </div>

    <? global $feedback; print($feedback); ?>

</div>