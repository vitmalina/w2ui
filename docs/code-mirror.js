// ------
// Init Code Mirror mixed HTML in one command

$(function () {
    $('head').append(
        '<!-- CODE MIRROR -->\n'+
        '<link rel="stylesheet" href="code-mirror.css">\n'+
        '<script src="../libs/codemirror/lib/codemirror.js"></script>\n'+
        '<script src="../libs/codemirror/mode/javascript/javascript.js"></script>\n'+
        '<script src="../libs/codemirror/mode/htmlmixed/htmlmixed.js"></script>\n'+
        '<script src="../libs/codemirror/mode/css/css.js"></script>\n'+
        '<script src="../libs/codemirror/mode/xml/xml.js"></script>\n'
    );
});