const gulp      = require('gulp')
const { exec }  = require("child_process")
const header    = require('gulp-header')
const iconfont  = require('gulp-iconfont')
const less      = require('gulp-less')
const cleanCSS  = require('gulp-clean-css')
const uglify    = require('gulp-uglify')
const concat    = require('gulp-concat')
const rename    = require("gulp-rename")
const comments  = {
    w2ui : '/* w2ui 2.0.x (nightly) (c) http://w2ui.com, vitmalina@gmail.com */\n',
    ks   : '/* kickstart 0.3.x (nightly) (c) http://w2ui.com/kickstart, vitmalina@gmail.com */\n'
}

let tasks = {

    clean: function (cb) {
        // -f flag to ignore errors
        let commands = [
            'rm -f dist/w2ui.js',
            'rm -f dist/w2ui.min.js',
            'rm -f dist/w2ui.css',
            'rm -f dist/w2ui-dark.css',
            'rm -f dist/w2ui.min.css',
            'rm -f dist/w2ui-dark.min.css',
            'rm -f dist/kickstart.js',
            'rm -f dist/kickstart.min.js'
        ]
        exec(commands.join('; '), (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            cb()
        })
    },

    less: function (cb) {
        return gulp
            .src(['src/less/*.less'])
            .on('error', function (err) {
                console.log(err.toString());
                this.emit('end');
            })
            .pipe(less())
            .pipe(header(comments.w2ui))
            .pipe(gulp.dest('dist/'))
            .pipe(cleanCSS())
            .pipe(rename({ suffix: '.min' }))
            .pipe(header(comments.w2ui))
            .pipe(gulp.dest('dist/'))
    },

    pack: function (cb) {
        return gulp
            .src([
                'src/w2utils.js', // order of files is important
                'src/w2grid.js',
                'src/w2layout.js',
                'src/w2popup.js',
                'src/w2tabs.js',
                'src/w2toolbar.js',
                'src/w2sidebar.js',
                'src/w2fields.js',
                'src/w2form.js',
                'src/moduleCompat.js' // must be last
            ])
            .pipe(concat('w2ui.js'))
            .pipe(header(comments.w2ui))
            .pipe(gulp.dest('dist/'))
    },

    build: function (cb) {
        gulp.src([
                'src/w2utils.js', // order of files is important
                'src/w2grid.js',
                'src/w2layout.js',
                'src/w2popup.js',
                'src/w2tabs.js',
                'src/w2toolbar.js',
                'src/w2sidebar.js',
                'src/w2fields.js',
                'src/w2form.js',
                'src/moduleCompat.js' // must be last
            ])
            .pipe(concat('w2ui.js'))
            .pipe(header(comments.w2ui))
            .pipe(gulp.dest('dist/'))
            .pipe(uglify({
                warnings: false,
                sourceMap: false
            }))
            .pipe(rename({ suffix: '.min' }))
            .pipe(header(comments.w2ui))
            .pipe(gulp.dest('dist/'))
            .on('end', () => {
                // commpile kickstart
                gulp.src([
                    'src/kickstart/ks-core.js',
                    'src/kickstart/ks-route.js'
                ])
                .pipe(concat('kickstart.js'))
                .pipe(header(comments.ks))
                .pipe(gulp.dest('dist/'))
                .pipe(uglify({
                    warnings: false,
                    sourceMap: false
                }))
                .pipe(rename({ suffix: '.min' }))
                .pipe(header(comments.ks))
                .pipe(gulp.dest('dist/'))
                .on('end', () => {
                    cb()
                })
            })
    },

    icons: function (cb) {
        var fs  = require('fs')
        var css = `@font-face {
    font-family: "w2ui-font";
    src: url("w2ui-font.woff");
    font-weight: normal;
    font-style: normal;
}
[class^="w2ui-icon-"]:before,
[class*=" w2ui-icon-"]:before {
    font-family: "w2ui-font";
    display: inline-block;
    vertical-align: middle;
    line-height: 1;
    font-weight: normal;
    font-style: normal;
    speak: none;
    text-decoration: inherit;
    text-transform: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
`
        var html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <link href="w2ui-font.css" rel="stylesheet">
    <title>w2ui-font</title>
    <style>
        body { font-family: verdana; font-size: 13px }
        .preview { padding: 8px; margin: 4px; width: 200px; box-shadow: 1px 1px 2px #ccc; float: left }
        .preview:hover { background-color: #f5f5f5 }
        .preview span.icon { font-size: 16px; padding: 8px }
    </style>
</head>
<body>
    <h1 style="font-family: arial; padding-left: 15px;">w2ui-font $count</h1>
`
        let json = []
        let prom = gulp.src(['src/less/icons/svg/*.svg'])
            .pipe(iconfont({
                startUnicode: 65,
                fontName: 'w2ui-font',
                formats: ['woff'],
                fontHeight: 1500,
                normalize: true,
                fixedWidth: true,
                centerHorizontally: true,
                timestamp: Math.round(Date.now()/1000)
            }))
            .on('error', function (err) {
                this.emit('end')
            })
            .on('glyphs', function(icons, options) {
                let n = 0
                icons = icons.sort((a, b) => (a.name > b.name) - (a.name < b.name)) // need reorder f series
                icons.forEach(function(icon, i) {
                    let unicode = icon.unicode
                    html += `    <div class="preview"><span class="icon w2ui-icon-${icons[i].name}"></span><span>w2ui-icon-${icons[i].name}</span></div>\n`
                    css  += `.w2ui-icon-${icons[i].name}:before { content: "${unicode.toString(16)}" }\n`
                    json.push(icons[i].name)
                })

                html += '    <div style="clear: both; height: 10px;"></div>\n</body>\n</html>'
                html = html.replace('$count', ' - ' + icons.length + ' icons')
                fs.writeFileSync('src/less/icons/w2ui-font.css', css)
                fs.writeFileSync('src/less/icons/preview.html', html)
                fs.writeFileSync('src/less/icons/icons.json', JSON.stringify(json))
            })
            .pipe(gulp.dest('src/less/icons/'))
            .on('end', function () {
                let font = fs.readFileSync('src/less/icons/w2ui-font.woff')
                let file = fs.readFileSync('src/less/icons/w2ui-font.css', 'utf-8')
                file = file.replace('src: url("w2ui-font.woff");',
                    `src: url("data:application/x-font-woff;charset=utf-8;base64,${font.toString('base64')}") format("woff");`)
                fs.writeFileSync('src/less/icons/w2ui-font.css', file)
                fs.writeFileSync('src/less/src/icons.less', file) // copy of the file
                cb()
            })
    },

    watch: function (cb) {
        gulp.watch(['src/**/*.js'], tasks.pack) // only packs dist/w2ui.js
        gulp.watch(['src/less/**/*.less'], tasks.less)
        gulp.watch(['src/less/icons/svg/*.svg'], tasks.icons)
    }
}

exports.default = gulp.series(tasks.clean, tasks.less, tasks.build)
exports.build   = tasks.build
exports.dev     = tasks.watch
exports.clean   = tasks.clean
exports.less    = gulp.series(tasks.clean, tasks.less)
exports.icons   = gulp.series(tasks.icons, tasks.less)
