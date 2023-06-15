/* eslint-env node */
const gulp     = require('gulp')
const header   = require('gulp-header')
const iconfont = require('gulp-iconfont')
const less     = require('gulp-less')
const cleanCSS = require('gulp-clean-css')
const uglify   = require('gulp-uglify')
const concat   = require('gulp-concat')
const rename   = require('gulp-rename')
const replace  = require('gulp-replace')
const del      = require('del')
// const babel    = require('gulp-babel')
// const { exec } = require('child_process')
const comments = {
    w2ui : '/* w2ui 2.0.x (nightly) ('+ (new Date()).toLocaleString('en-us') +') (c) http://w2ui.com, vitmalina@gmail.com */\n'
}

const legacy_replace = `export {
    w2ui, w2utils, query, w2locale, w2event, w2base,
    w2popup, w2alert, w2confirm, w2prompt, Dialog,
    w2tooltip, w2menu, w2color, w2date, Tooltip,
    w2toolbar, w2sidebar, w2tabs, w2layout, w2grid, w2form, w2field
}`
const legacy_code = `
// Compatibility with CommonJS and AMD modules
!(function(global, w2ui) {
if (typeof define == 'function' && define.amd) {
    return define(() => w2ui)
}
if (typeof exports != 'undefined') {
    if (typeof module != 'undefined' && module.exports) {
        return exports = module.exports = w2ui
    }
    global = exports
}
if (global) {
    Object.keys(w2ui).forEach(key => {
        global[key] = w2ui[key]
    })
}
})(self, {
    w2ui, w2utils, query, w2locale, w2event, w2base,
    w2popup, w2alert, w2confirm, w2prompt, Dialog,
    w2tooltip, w2menu, w2color, w2date, Tooltip,
    w2toolbar, w2sidebar, w2tabs, w2layout, w2grid, w2form, w2field
});`

const exports_es6 = `export {
    w2ui, w2utils, query, w2locale, w2event, w2base,
    w2popup, w2alert, w2confirm, w2prompt, Dialog,
    w2tooltip, w2menu, w2color, w2date, Tooltip,
    w2toolbar, w2sidebar, w2tabs, w2layout, w2grid, w2form, w2field
}`

const files_es6 = [
    'src/w2base.js', // order of files is important
    'src/w2locale.js',
    'src/query.js',
    'src/w2utils.js',
    'src/w2popup.js',
    'src/w2tooltip.js',
    'src/w2toolbar.js',
    'src/w2sidebar.js',
    'src/w2tabs.js',
    'src/w2layout.js',
    'src/w2grid.js',
    'src/w2form.js',
    'src/w2field.js'
]
const files_legacy = Array.from(files_es6)
files_legacy.push('src/w2compat.js')

let tasks = {

    clean(cb) {
        let files = [
            'dist/w2ui.js',
            'dist/w2ui.min.js',
            'dist/w2ui.css',
            'dist/w2ui-dark.css',
            'dist/w2ui.min.css',
            'dist/w2ui-dark.min.css'
        ]
        return del(files)
    },

    less(cb) {
        return gulp
            .src(['src/less/*.less'])
            .on('error', function (err) {
                console.log(err.toString())
                this.emit('end')
            })
            .pipe(less())
            .pipe(header(comments.w2ui))
            .pipe(gulp.dest('dist/'))
            .pipe(cleanCSS())
            .pipe(rename({ suffix: '.min' }))
            .pipe(header(comments.w2ui))
            .pipe(gulp.dest('dist/'))
    },

    pack(cb) {
        let count = 0
        console.log('  - update dist/w2ui.js')
        console.log('  - update dist/w2ui_es6.js')
        gulp.src(files_legacy)
            .pipe(concat('w2ui.js'))
            .pipe(replace(/^(import.*'|export.*}|module\.exports.*})$\n/gm, ''))
            .pipe(replace('import.meta.url', 'undefined'))
            .pipe(replace('\n\n', '\n'))
            .pipe(replace(legacy_replace, legacy_code))
            .pipe(header(comments.w2ui))
            .pipe(gulp.dest('dist/'))
            .on('end', () => { check() })

        gulp.src(files_es6)
            .pipe(concat('w2ui.es6.js'))
            .pipe(replace(/^(import.*'|export.*}|module\.exports.*})$\n/gm, ''))
            .pipe(replace('\n\n', '\n'))
            .pipe(replace('export { w2field }', exports_es6))
            .pipe(header(comments.w2ui))
            .pipe(gulp.dest('dist/'))
            .on('end', () => { check() })

        function check() {
            count++
            if (count == 2) cb()
        }
    },

    build(cb) {
        return gulp
            .src(files_legacy)
            .pipe(concat('w2ui.js'))
            .pipe(replace(/^(import.*'|export.*}|module\.exports.*})$\n/gm, ''))
            .pipe(replace('import.meta.url', 'undefined'))
            .pipe(replace('\n\n', '\n'))
            .pipe(replace(legacy_replace, legacy_code))
            .pipe(header(comments.w2ui))
            .pipe(gulp.dest('dist/'))
            // min file
            .pipe(uglify({
                warnings: false,
                sourceMap: false
            }))
            .pipe(rename({ suffix: '.min' }))
            .pipe(header(comments.w2ui))
            .pipe(gulp.dest('dist/'))
            .on('end', () => {
                cb()
            })
    },

    build_es6(cb) {
        return gulp
            .src(files_es6)
            .pipe(concat('w2ui.es6.js'))
            .pipe(replace(/^(import.*'|export.*}|module\.exports.*})$\n/gm, ''))
            .pipe(replace('\n\n', '\n'))
            .pipe(replace('export { w2field }', exports_es6))
            .pipe(header(comments.w2ui))
            .pipe(gulp.dest('dist/'))
            // min file
            .pipe(uglify({
                warnings: false,
                sourceMap: false
            }))
            .pipe(rename({ suffix: '.min' }))
            .pipe(header(comments.w2ui))
            .pipe(gulp.dest('dist/'))
            .on('end', () => {
                cb()
            })
    },

    icons(cb) {
        let fs  = require('fs')
        let css = `@font-face {
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
        let html = `<!DOCTYPE html>
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
        gulp.src(['src/less/icons/svg/*.svg'])
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
                icons = icons.sort((a, b) => (a.name > b.name) - (a.name < b.name)) // need reorder f series
                icons.forEach(function(icon, i) {
                    let unicode = icon.unicode
                    html       += `    <div class="preview"><span class="icon w2ui-icon-${icons[i].name}"></span><span>w2ui-icon-${icons[i].name}</span></div>\n`
                    css        += `.w2ui-icon-${icons[i].name}:before { content: "${unicode.toString(16)}" }\n`
                    json.push(icons[i].name)
                })

                html += '    <div style="clear: both; height: 10px;"></div>\n</body>\n</html>'
                html  = html.replace('$count', ' - ' + icons.length + ' icons')
                fs.writeFileSync('src/less/icons/w2ui-font.css', css)
                fs.writeFileSync('src/less/icons/preview.html', html)
                fs.writeFileSync('src/less/icons/icons.json', JSON.stringify(json))
            })
            .pipe(gulp.dest('src/less/icons/'))
            .on('end', function () {
                let font = fs.readFileSync('src/less/icons/w2ui-font.woff')
                let file = fs.readFileSync('src/less/icons/w2ui-font.css', 'utf-8')
                file     = file.replace('src: url("w2ui-font.woff");',
                    `src: url("data:application/x-font-woff;charset=utf-8;base64,${font.toString('base64')}") format("woff");`)
                fs.writeFileSync('src/less/icons/w2ui-font.css', file)
                fs.writeFileSync('src/less/src/icons.less', file) // copy of the file
                cb()
            })
    },

    watch(cb) {
        gulp.watch(['src/**/*.js'], tasks.pack) // only packs dist/w2ui.js
        gulp.watch(['src/less/**/*.less'], tasks.less)
        gulp.watch(['src/less/icons/svg/*.svg'], tasks.icons)
    },

    locales(cb) {
        const fs = require('fs')
        const path = require('path')
        const isPrimitive = obj => obj === null || [ 'string', 'number', 'boolean' ].includes( typeof obj )
        const isArrayOfPrimitive = obj => Array.isArray( obj ) && obj.every( isPrimitive )
        const format = arr =>
            `^^^[ ${
                arr.map( val => JSON.stringify( val ) ).join( ', ' )
            } ]`
        const replacer = ( key, value ) => isArrayOfPrimitive( value ) ? format( value ) : value
        const expand = str => str.replace(
            /(?:"\^\^\^)(\[ .* \])(?:\")/g, ( match, a ) =>
                a.replace( /\\"/g, '"' )
        )
        const stringify = (obj, space=4) => expand( JSON.stringify( obj, replacer, space ) )

        return gulp.src(['src/w2locale.js'])
            .pipe(replace(/^export {/gm, 'module.exports = {'))
            .pipe(concat('w2locale.cjs'))
            .pipe(gulp.dest('src/'))
            .on('end', () => {
                process_locales()
                del('./src/w2locale.cjs')
                cb()
            })

        function process_obj(m, o) {
            Object.keys(o).forEach(k => {
                if (typeof m[k] === 'undefined') delete o[k]
            })
            for (const [k, v] of Object.entries(m)) {
                if (typeof o[k] === 'undefined') o[k] = v
                if (typeof v === 'object' && Object.keys(o[k]).length) o[k] = process_obj(v, o[k])
            }
            return Object.assign(m, o)
        }

        function process_locales() {
            const master = require('./src/w2locale.cjs').w2locale
            const dir_locales = './src/locale'
            fs.readdir(dir_locales, (err, files) => {
                files.forEach(file => {
                    let m = JSON.parse(JSON.stringify(master))
                    let filepath = path.join(dir_locales, file)
                    let o = JSON.parse( fs.readFileSync(filepath) )
                    fs.writeFileSync(filepath, stringify(process_obj(m, o)) + '\n')
                })
            })
        }
    },
}

exports.default = gulp.series(tasks.clean, tasks.less, tasks.build_es6, tasks.build)
exports.build   = gulp.series(tasks.build_es6, tasks.build)
exports.dev     = tasks.watch
exports.clean   = tasks.clean
exports.pack    = tasks.pack
exports.less    = gulp.series(tasks.less)
exports.icons   = gulp.series(tasks.icons, tasks.less)
exports.locales = tasks.locales