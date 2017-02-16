/**
* This is a node.js file that goes thru all files in details folder and
* generates summary pages for all events, properties and methods
*/

var fs    = require('fs');
var files = fs.readdirSync('details');

var rPath = ''; // uncomment next line for website
// var rPath = '../';

// clear folder
console.log('==> Removing Current Files');

var tmp = fs.readdirSync('summary');
var cnt = 0;
for (var t in tmp) {
    fs.unlink('summary/' + tmp[t]);
    cnt++;
}
console.log('    DONE. Removed '+ cnt + ' files');

console.log('==> Generating New Summary Files');
process.stdout.write('    ');
// generate files
var text1 = (rPath == '' ? '<link rel="stylesheet" type="text/css" href="../summary.css"/> \n' : '' ) +
    '<div class="container">\n';
var text2 = '</div>';
var html  = {};
var cnt   = 0;
for (var f in files) {
    var data = fs.readFileSync('details/' + files[f], 'utf8');
    var tmp  = files[f].split('.');
    var wid  = tmp[0];
    var prop = tmp[1];
    var type;

    // description
    var pos1 = data.indexOf('\n');
    var desc = data.substr(0, pos1);

    // definition
    var pos1 = data.indexOf('<div class="definition">');
    var pos2 = data.indexOf('</div>', pos1);
    var deff = data.substr(pos1, pos2-pos1).replace(/(<([^>]+)>)/ig, "").replace(/^\s+|\s+$/g, '');

    // events
    if (prop.length > 2 && prop.substr(0, 2) == 'on') {
        type = 'events';
        if (!html.hasOwnProperty(wid + '-' + type)) {
            html[wid + '-' + type] = '';
        }
        html[wid + '-' + type] +=
            '<div class="obj-property">\n'+
            '    <a href="'+ rPath + wid +'.'+ prop +'">'+ prop +'</a> <span>- function (event)</span>\n'+
            '</div>\n'+
            '<div class="obj-property-desc">\n'+
            '    '    +  desc + '\n'+
            '</div>\n\n';
    } else if (deff.indexOf(prop + '(') != -1) { // methods
        type = 'methods';
        if (!html.hasOwnProperty(wid + '-' + type)) {
            html[wid + '-' + type] = '';
        }
        html[wid + '-' + type] +=
            '<div class="obj-property">\n'+
            '    <a href="'+ rPath + wid +'.'+ prop +'">'+ prop +'</a> <span>- '+ deff +'</span>\n'+
            '</div>\n'+
            '<div class="obj-property-desc">\n'+
            '    '    +  desc + '\n'+
            '</div>\n\n';
    } else {
        type = 'props';
        if (!html.hasOwnProperty(wid + '-' + type)) {
            html[wid + '-' + type] = '';
        }
        html[wid + '-' + type] +=
            '<div class="obj-property">\n'+
            '    <a href="'+ rPath + wid +'.'+ prop +'">'+ prop +'</a> <span>- '+ deff +'</span>\n'+
            '</div>\n'+
            '<div class="obj-property-desc">\n'+
            '    '    +  desc + '\n'+
            '</div>\n\n';
    }
    cnt++;
    if (cnt % 10 == 0) process.stdout.write('*');
}
console.log("\n    DONE. Processed: "+ cnt + ' files\n');

// save to disk
var index = '';
for (var h in html) {
    fs.writeFileSync('summary/' + h + '.php', text1 + html[h] + text2, 'utf-8');
    index += '<a href="' + h + '.html">'+ h + '</a><br>';
}

// fs.writeFileSync('summary/index.html', text1 + index + text2, 'utf8');
