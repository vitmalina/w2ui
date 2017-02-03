<?
session_start();
require("libs/phpTheme.php");
$page = $_REQUEST['page'];

// ======================================================================
// - If the file does not exist, it is rerouted to index.php by .htaccess
//   it also sets up $_GET parameters when it reroutes with page_name, s1,
//   s2, s3, s4 and other query string params. See examples below.
// - If file does exist then it reroutes to that file.
//
// INCOMMING parameters in $_GET[*] and	$_POST[*] OR $_REQUEST[*]
//
// URL Convertion Examples:
//      /page_name/param1 -> index.php?page=page_name&s1=param1
//      /page_name/param1/param2/param3/param4?p1=more&p5=data -> index.php?page=page_name&s1=param1&s2=param2&s3=param3&s4=param4&p1=more&p5=data

if ($page == "") $page = "home";
$page = strToLower($page);

$theme = new phpTheme();
$theme->assign("site-root", $site_root);
$theme->assign("site-name", "JavaScript UI - w2ui");

$feedback = "
<h3>User Comments</h3>
<div id=\"disqus_thread\"></div>
<script type=\"text/javascript\">
	var disqus_shortname = 'w2ui';
    var disqus_config = function () {
        var loc = String(document.location).replace(/\/web\/docs\/[0-9].[0-9]\//gi, \"/web/docs/\"); // comments for documents
        this.page.url = loc;
        // this.page.identifier = PAGE_IDENTIFIER;
    };
	(function() {
		var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
		dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
		(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
	})();
</script>
<noscript>Please enable JavaScript to view the <a href=\"http://disqus.com/?ref_noscript\">comments powered by Disqus.</a></noscript>
<a href=\"http://disqus.com\" class=\"dsq-brlink\">comments powered by <span class=\"logo-disqus\">Disqus</span></a>
";

switch ($page) {

	case "home":
		$theme->assign("page-name", 	"Home");
		$theme->assign("page-header", 	$theme->includeFile("pages/site-header.php"));
		$theme->assign("page-main", 	$theme->includeFile("pages/home-top.php"));
		$theme->append("page-main", 	$theme->includeFile("pages/home-middle.php"));
		$theme->assign("page-footer", 	$theme->includeFile("pages/site-footer.php"));
		$theme->display("index-main.html");
		break;

	case "get-started":
		$theme->assign("page-name", 	"Get Started");
		$theme->assign("page-header", 	$theme->includeFile("pages/site-header.php"));
		$theme->assign("page-main", 	$theme->includeFile("pages/get-started.php"));
		$theme->assign("page-footer", 	$theme->includeFile("pages/site-footer.php"));
		$theme->display("index-main.html");
		break;

	case "docs":
        $version = $_REQUEST["s1"];
        $section = $_REQUEST["s2"];
        $part    = $_REQUEST["s3"];
        if (floatval($version) == 0) { // not a version
            if ($_SESSION['version']) $version = $_SESSION['version'];
            if ($version == '' || floatval($version) == 0) $version = '1.5';
            $url = "/web/docs/$version/".$_REQUEST["s1"];
            if ($section != '') $url .= "/".$_REQUEST["s2"];
            if ($part != '') $url .= "/".$_REQUEST["s2"];
            header("Location: $url");
            die();
        }
        $_SESSION['version'] = $version;
        $verPath = "";
		if ($version != '1.2') $verPath = '/pages';
		if ($section == "") $section = "layout";
		if ($part == "") $part = "overview";

		// check if this is doc detail page
		if (strpos($section, ".") > 0) {
			$theme->assign("page-name", $section);
			$theme->assign("page-header", 	$theme->includeFile("pages/site-header.php"));
			$theme->assign("page-main", 	$theme->includeFile("pages/docs/$version/docs-top.php"));
            if ($version == '1.5') {
                $theme->append('site-head',
                    '<link rel="stylesheet" type="text/css" href="/src/w2ui-1.5.rc1.min.css" />'.
                    '<script type="text/javascript" src="/src/w2ui-1.5.rc1.min.js"></script>'
                );
			} else if ($version == '1.4') {
				$theme->append('site-head',
					'<link rel="stylesheet" type="text/css" href="/src/w2ui-1.4.min.css" />'.
					'<script type="text/javascript" src="/src/w2ui-1.4.min.js"></script>'
				);
			} else {
				$theme->append('site-head',
					'<link rel="stylesheet" type="text/css" href="/src/w2ui-1.3.min.css" />'.
					'<script type="text/javascript" src="/src/w2ui-1.3.min.js"></script>'
				);
			}
			$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/details.php"));
			$theme->assign("page-footer", 	$theme->includeFile("pages/site-footer.php"));
			$theme->display("index-main.html");
			break;
		}

		$theme->assign("page-name", 	"Documentation");
		$theme->assign("page-header", 	$theme->includeFile("pages/site-header.php"));
		$theme->assign("page-main", 	$theme->includeFile("pages/docs/$version/docs-top.php"));
        if ($version == '1.4') {
            $theme->append('site-head',
                '<link rel="stylesheet" type="text/css" href="/src/w2ui-1.4.min.css" />'.
                '<script type="text/javascript" src="/src/w2ui-1.4.min.js"></script>'
            );
		} else if ($version == '1.5') {
			$theme->append('site-head',
				'<link rel="stylesheet" type="text/css" href="/src/w2ui-1.5.rc1.min.css" />'.
				'<script type="text/javascript" src="/src/w2ui-1.5.rc1.min.js"></script>'
			);
		} else {
			$theme->append('site-head',
				'<link rel="stylesheet" type="text/css" href="/src/w2ui-1.3.min.css" />'.
				'<script type="text/javascript" src="/src/w2ui-1.3.min.js"></script>'
			);
		}

		switch ($section) {
			case 'layout':
				switch($part) {
					case 'overview':
						$theme->assign("page-name", 	"Layout: Overview");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/layout.php"));
						break;
					case 'properties':
						$theme->assign("page-name", 	"Layout: Properties");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/layout-props.php"));
						break;
					case 'methods':
						$theme->assign("page-name", 	"Layout: Methods");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/layout-methods.php"));
						break;
					case 'events':
						$theme->assign("page-name", 	"Layout: Events");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/layout-events.php"));
						break;
				}
				break;
			case 'grid':
				switch($part) {
					case 'overview':
						$theme->assign("page-name", 	"Grid: Overview");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/grid.php"));
						break;
					case 'properties':
						$theme->assign("page-name", 	"Grid: Properties");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/grid-props.php"));
						break;
					case 'events':
						$theme->assign("page-name", 	"Grid: Events");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/grid-events.php"));
						break;
					case 'methods':
						$theme->assign("page-name", 	"Grid: Methods");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/grid-methods.php"));
						break;
				}
				break;
			case 'toolbar':
				switch($part) {
					case 'overview':
						$theme->assign("page-name", 	"Toolbar: Overview");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/toolbar.php"));
						break;
					case 'properties':
						$theme->assign("page-name", 	"Toolbar: Properties");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/toolbar-props.php"));
						break;
					case 'methods':
						$theme->assign("page-name", 	"Toolbar: Methods");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/toolbar-methods.php"));
						break;
					case 'events':
						$theme->assign("page-name", 	"Toolbar: Events");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/toolbar-events.php"));
						break;
				}
				break;
			case 'sidebar':
				switch($part) {
					case 'overview':
						$theme->assign("page-name", 	"Sidebar: Overview");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/sidebar.php"));
						break;
					case 'properties':
						$theme->assign("page-name", 	"Sidebar: Properties");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/sidebar-props.php"));
						break;
					case 'methods':
						$theme->assign("page-name", 	"Sidebar: Methods");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/sidebar-methods.php"));
						break;
					case 'events':
						$theme->assign("page-name", 	"Sidebar: Events");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/sidebar-events.php"));
						break;
				}
				break;
			case 'tabs':
				switch($part) {
					case 'overview':
						$theme->assign("page-name", 	"Tabs: Overview");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/tabs.php"));
						break;
					case 'properties':
						$theme->assign("page-name", 	"Tabs: Properties");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/tabs-props.php"));
						break;
					case 'methods':
						$theme->assign("page-name", 	"Tabs: Methods");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/tabs-methods.php"));
						break;
					case 'events':
						$theme->assign("page-name", 	"Tabs: Events");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/tabs-events.php"));
						break;
				}
				break;
			case 'form':
				switch($part) {
					case 'overview':
						$theme->assign("page-name", 	"Form: Overview");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/forms.php"));
						break;
					case 'properties':
						$theme->assign("page-name", 	"Form: Properties");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/forms-props.php"));
						break;
					case 'methods':
						$theme->assign("page-name", 	"Form: Methods");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/forms-methods.php"));
						break;
					case 'events':
						$theme->assign("page-name", 	"Form: Events");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/forms-events.php"));
						break;
					case 'fields':
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/forms-fields.php"));
						break;
					case 'fields-numeric':
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/forms-fields-numeric.php"));
						break;
					case 'fields-date':
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/forms-fields-date.php"));
						break;
					case 'fields-list':
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/forms-fields-list.php"));
						break;
					case 'fields-enum':
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/forms-fields-enum.php"));
						break;
					case 'fields-upload':
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/forms-fields-upload.php"));
						break;
					case 'fields-custom':
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/forms-fields-custom.php"));
						break;
				}
				break;
			case 'popup':
				switch($part) {
					case 'overview':
						$theme->assign("page-name", 	"Popup: Overview");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/popup.php"));
						break;
					case 'events':
						$theme->assign("page-name", 	"Popup: Events");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/popup-events.php"));
						break;
					case 'props':
						$theme->assign("page-name", 	"Popup: Properties");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/popup-props.php"));
						break;
					case 'methods':
						$theme->assign("page-name", 	"Popup: Methods");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/popup-methods.php"));
						break;
					case 'dialogs':
						$theme->assign("page-name", 	"Popup: Dialogs");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/popup-dialogs.php"));
						break;
					case 'overlays':
						$theme->assign("page-name", 	"Popup: Overlays");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/popup-overlays.php"));
						break;
				}
				break;
			case 'utils':
				switch($part) {
					case 'overview':
						$theme->assign("page-name", 	"Utils: Overview");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/utils.php"));
						break;
					case 'props':
						$theme->assign("page-name", 	"Utils: Properties");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/utils-props.php"));
						break;
					case 'methods':
						$theme->assign("page-name", 	"Utils: Methods");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/utils-methods.php"));
						break;
					case 'events':
						$theme->assign("page-name", 	"Utils: Events");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/utils-events.php"));
						break;
					case 'keyboard':
						$theme->assign("page-name", 	"Utils: Keyboard");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/utils-keyboard.php"));
						break;
					case 'plugins':
						$theme->assign("page-name", 	"Utils: Plugins");
						$theme->append("page-main", $theme->includeFile("pages/docs/$version/$verPath/utils-plugins.php"));
						break;
				}
				break;
		}
		$theme->assign("page-footer", 	$theme->includeFile("pages/site-footer.php"));
		$theme->display("index-main.html");
		break;

	case "demo":
		$section = $_REQUEST["s1"];
		if ($section == "") $section = "layout";
		$theme->assign("page-name", 	"Demos");
		$theme->assign("page-header", 	$theme->includeFile("pages/site-header.php"));
		$theme->assign("page-main", 	$theme->includeFile("pages/demo/demo-top.php"));
		$theme->append('site-head',
			'<link rel="stylesheet" type="text/css" href="/src/w2ui-1.4.min.css" />'.
			'<script type="text/javascript" src="/src/w2ui-1.4.min.js"></script>'
		);
		switch ($section) {
			case 'grid':
				$theme->assign("page-name", 	"Demos: Grid");
				$theme->append("page-main", $theme->includeFile("pages/demo/demo-grid.php"));
				break;
			case 'layout':
				$theme->assign("page-name", 	"Demos: Layout");
				$theme->append("page-main", $theme->includeFile("pages/demo/demo-layout.php"));
				break;
			case 'toolbar':
				$theme->assign("page-name", 	"Demos: Toolbar");
				$theme->append("page-main", $theme->includeFile("pages/demo/demo-toolbar.php"));
				break;
			case 'sidebar':
				$theme->assign("page-name", 	"Demos: Sidebar");
				$theme->append("page-main", $theme->includeFile("pages/demo/demo-sidebar.php"));
				break;
			case 'tabs':
				$theme->assign("page-name", 	"Demos: Tabs");
				$theme->append("page-main", $theme->includeFile("pages/demo/demo-tabs.php"));
				break;
			case 'form':
				$theme->assign("page-name", 	"Demos: Form");
				$theme->append("page-main", $theme->includeFile("pages/demo/demo-forms.php"));
				break;
			case 'popup':
				$theme->assign("page-name", 	"Demos: Popup");
				$theme->append("page-main", $theme->includeFile("pages/demo/demo-popup.php"));
				break;
			case 'utils':
				$theme->assign("page-name", 	"Demos: Utils");
				$theme->append("page-main", $theme->includeFile("pages/demo/demo-utils.php"));
				break;
		}
		$theme->assign("page-footer", 	$theme->includeFile("pages/site-footer.php"));
		$theme->display("index-main.html");
		break;

	case "blog":
		$section = $_REQUEST["s1"];
		if ($section == "") $section = "layout";
		$theme->assign("page-name", 	"Blog");
		$theme->assign("page-header", 	$theme->includeFile("pages/site-header.php"));
		$theme->assign("page-main", 	$theme->includeFile("pages/blog/blog.php"));
		$theme->assign("page-footer", 	$theme->includeFile("pages/site-footer.php"));
		$theme->display("index-main.html");
		break;

	case "support":
		$section = $_REQUEST["s1"];
		$theme->assign("page-name", 	"Support");
		$theme->assign("page-header", 	$theme->includeFile("pages/site-header.php"));
		switch ($section) {
			case '':
			case 'development':
				$theme->assign("page-main", 	$theme->includeFile("pages/support-training.php"));
				break;
// 			case 'consulting':
// 				$theme->assign("page-main", 	$theme->includeFile("pages/support-consulting.php"));
// 				break;
			case 'training':
				$theme->assign("page-main", 	$theme->includeFile("pages/support-training.php"));
				break;
			case 'contribute':
				$theme->assign("page-main", 	$theme->includeFile("pages/support.php"));
				break;
		}
		$theme->assign("page-footer", 	$theme->includeFile("pages/site-footer.php"));
		$theme->display("index-main.html");
		break;

	case "mobile":
		$section = $_REQUEST["s1"];
		$theme->assign("page-name", 	"Mobile");
		$theme->assign("page-header", 	$theme->includeFile("pages/site-header.php"));
		switch ($section) {
			case '':
				$theme->assign("page-main", 	$theme->includeFile("pages/mobile/mobile.php"));
				break;
			case 'tutorial':
				$theme->append("page-main", $theme->includeFile("pages/mobile/tutorial.php"));
				break;
		}
		$theme->assign("page-footer", 	$theme->includeFile("pages/site-footer.php"));
		$theme->display("index-main.html");
		break;

	case "pgadmin":
		$theme->assign("page-name", 	"Postgres Admin");
		$theme->assign("page-header", 	$theme->includeFile("pages/site-header.php"));
		$theme->assign("page-main", 	$theme->includeFile("pages/pgadmin.php"));
		$theme->assign("page-footer", 	$theme->includeFile("pages/site-footer.php"));
		$theme->display("index-main.html");
		break;

	case "fm":
		$theme->assign("page-name", 	"File Manager");
		$theme->assign("page-header", 	$theme->includeFile("pages/site-header.php"));
		$theme->assign("page-main", 	$theme->includeFile("pages/fm.php"));
		$theme->assign("page-footer", 	$theme->includeFile("pages/site-footer.php"));
		$theme->display("index-main.html");
		break;

	case "404";
	default:
		$theme->assign("page-name", 	"404: Page Not Found");
		$theme->assign("page-header", 	$theme->includeFile("pages/site-header.php"));
		$theme->assign("page-main", 	$theme->includeFile("pages/404.php"));
		$theme->assign("page-footer", 	$theme->includeFile("pages/site-footer.php"));
		$theme->display("index-main.html");
		break;
}

?>