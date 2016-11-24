<?
    global $page, $section, $site_root;
    $check_section = $section;

    $tmp = explode(".", $section);
    if ($tmp[0] == 'w2layout')  $check_section = 'layout';
    if ($tmp[0] == 'w2grid')    $check_section = 'grid';
    if ($tmp[0] == 'w2toolbar') $check_section = 'toolbar';
    if ($tmp[0] == 'w2sidebar') $check_section = 'sidebar';
    if ($tmp[0] == 'w2tabs')    $check_section = 'tabs';
    if ($tmp[0] == 'w2form')    $check_section = 'form';
    if ($tmp[0] == 'w2popup')   $check_section = 'popup';
    if ($tmp[0] == 'w2utils')   $check_section = 'utils';

    $ver_url = "/web/$page/~VERSION~";
    if ($_REQUEST['s2'] != '') $ver_url .= "/".$_REQUEST['s2'];
    if ($_REQUEST['s3'] != '') $ver_url .= "/".$_REQUEST['s3'];
?>

<div class="container" style="margin-top: 10px;">
    <div class="row">
        <div class="span12 navbar">
            <div class="navbar-inner">
                <ul class="nav">
                  <li <?=($check_section == 'layout' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/1.3/layout">Layout</a> </li>
                  <li <?=($check_section == 'grid' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/1.3/grid">Grid</a></li>
                  <li <?=($check_section == 'toolbar' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/1.3/toolbar">Toolbar</a></li>
                  <li <?=($check_section == 'sidebar' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/1.3/sidebar">Sidebar</a></li>
                  <li <?=($check_section == 'tabs' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/1.3/tabs">Tabs</a></li>
                  <li <?=($check_section == 'form' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/1.3/form">Form</a></li>
                  <li <?=($check_section == 'popup' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/1.3/popup">Popup</a></li>
                  <li <?=($check_section == 'utils' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/1.3/utils">Utilities</a></li>
                </ul>
                <ul class="nav pull-right">
                  <li id="version">
                    <div style="position: relative; padding: 0px;">
                    <select onchange="document.location = String('<?php echo $ver_url?>').replace('~VERSION~', this.value)"
                            style="position: absolute; margin-left: -62px; margin-top: 5px; padding: 0px; color: #888;
                                background-color: transparent; border: 0px; appearance: none; -moz-appearance: none;
                                -webkit-appearance: none; text-indent: 0.01px; text-overflow: ''; ">
                        <option value="1.3" selected>ver 1.3</option>
                        <option value="1.4">ver 1.4</option>
                        <option value="1.5">ver 1.5</option>
                    </select>
                    </div>
                  </li>
                </ul>
            </div>
        </div>
    </div>
</div>