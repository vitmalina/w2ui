// ------
// Init Code Mirror mixed HTML in one command

$(function () {
    $('head').append(
        '<!-- CODE MIRROR -->\n'+
        '<link rel="stylesheet" href="code-mirror.css">\n'+
        '<script src="../js/CodeMirror-3.15/lib/codemirror.js"></script>\n'+
        '<script src="../js/CodeMirror-3.15/mode/javascript/javascript.js"></script>\n'+
        '<script src="../js/CodeMirror-3.15/mode/htmlmixed/htmlmixed.js"></script>\n'+
        '<script src="../js/CodeMirror-3.15/mode/css/css.js"></script>\n'+
        '<script src="../js/CodeMirror-3.15/mode/xml/xml.js"></script>\n'
    );
});