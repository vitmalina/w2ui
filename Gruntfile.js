module.exports = function (grunt) {

    var w2ui    = '/* w2ui 1.5.x (nightly) (c) http://w2ui.com, vitmalina@gmail.com */\n';
    var fields  = '/* w2ui-fields.js 1.5.x (nightly), part of w2ui (c) http://w2ui.com, vitmalina@gmail.com */\n';
    var ks      = '/* kicstart 0.2.x (nightly) (c) http://w2ui.com/kickstart, vitmalina@gmail.com */\n';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            w2ui: [
                'dist/w2ui.js',
                'dist/w2ui.min.js',
                'dist/w2ui.css',
                'dist/w2ui.min.css',
                'dist/w2ui-dark.css',
                'dist/w2ui-dark.min.css'
            ],
            fields: [
                'dist/w2ui-fields.js',
                'dist/w2ui-fields.min.js',
                'dist/w2ui-fields.css',
                'dist/w2ui-fields.min.css'
            ],
            ks: [
                'dist/kickstart.js',
                'dist/kickstart.min.js'
            ]
        },

        less: {
            w2ui: {
                files: {
                    "dist/w2ui.css": "src/less/w2ui.less",
                    "dist/w2ui-dark.css": "src/less/w2ui-dark.less"
                }
            },
            "w2ui-min": {
                options: {
                    cleancss: true,
                    report: 'min'
                },
                files: {
                    "dist/w2ui.min.css": "dist/w2ui.css",
                    "dist/w2ui-dark.min.css": "dist/w2ui-dark.css"
                }
            },
            fields: {
                files: {
                    "dist/w2ui-fields.css": "src/less/w2ui-fields.less"
                }
            },
            "fields-min": {
                options: {
                    cleancss: true,
                    report: 'min'
                },
                files: {
                    "dist/w2ui-fields.min.css": "dist/w2ui-fields.css"
                }
            }
        },

        concat: {
            w2ui: {
                options: {
                    banner: w2ui,
		    sourceMap: true
                },
                src: [
                    'src/w2utils.js',
                    'src/w2grid.js',
                    'src/w2layout.js',
                    'src/w2popup.js',
                    'src/w2tabs.js',
                    'src/w2toolbar.js',
                    'src/w2sidebar.js',
                    'src/w2fields.js',
                    'src/w2form.js'
                ],
                dest: 'dist/w2ui.js'
            },
            fields: {
                options: {
                    banner: fields
                },
                src: [
                    'src/w2utils.js',
                    'src/w2fields.js'
                ],
                dest: 'dist/w2ui-fields.js'
            },
            ks: {
                options: {
                    banner: ks
                },
                src: ['src/kickstart/ks-core.js', 'src/kickstart/ks-route.js'],
                dest: 'dist/kickstart.js'
            },
            'banner-w2ui-1': {
                options: { banner: w2ui },
                src    : 'dist/w2ui.css',
                dest   : 'dist/w2ui.css'
            },
            'banner-w2ui-2': {
                options : { banner: w2ui },
                src     : 'dist/w2ui.min.css',
                dest    : 'dist/w2ui.min.css'
            },
            'banner-w2ui-3': {
                options : { banner: w2ui },
                src     : 'dist/w2ui-dark.css',
                dest    : 'dist/w2ui-dark.css'
            },
            'banner-w2ui-4': {
                options : { banner: w2ui },
                src     : 'dist/w2ui-dark.min.css',
                dest    : 'dist/w2ui-dark.min.css'
            },
            'banner-fields-1': {
                options : { banner: fields },
                src     : 'dist/w2ui-fields.css',
                dest    : 'dist/w2ui-fields.css'
            },
            'banner-fields-2': {
                options : { banner: fields },
                src     : 'dist/w2ui-fields.min.css',
                dest    : 'dist/w2ui-fields.min.css'
            }
        },

        uglify: {
            w2ui: {
                options: {
                    banner: w2ui
                },
                files: {
                    'dist/w2ui.min.js': 'dist/w2ui.js'
                }
            },
            fields: {
                options: {
                    banner: fields
                },
                files: {
                    'dist/w2ui-fields.min.js': 'dist/w2ui-fields.js'
                }
            },
            ks: {
                options: {
                    banner: ks
                },
                files: {
                    'dist/kickstart.min.js': 'dist/kickstart.js'
                }
            }
        },

        shell: {
            docs: {
                options: {
                    stdout: true
                },
                command: 'cd docs; node generate.js;'
            }
        },

        watch: {
            "w2ui" : {
                files: ['src/*.js'],
                tasks: ['concat:w2ui', 'uglify:w2ui']
            },
            "w2ui-less" : {
                files: ['src/less/*.less', 'src/less/src/*.less'],
                tasks: ['less:w2ui', 'less:w2ui-min', 'less:fields', 'less:fields-min',
                    'concat:banner-w2ui-1', 'concat:banner-w2ui-2', 'concat:banner-w2ui-3', 'concat:banner-w2ui-4',
                    'concat:banner-fields-1', 'concat:banner-fields-2']
            },
            "ks" : {
                files: ['src/kickstart/*.js'],
                tasks: ['concat:ks', 'uglify:ks']
            },
            "ks-less" : {
                files: ['src/kickstart/less/*.less', 'src/kickstart/less/src/*.less'],
                tasks: ['less:ks', 'less:ks-min', 'concat:banner-ks-1', 'concat:banner-ks-2']
            }
        },

        webfont: {
            icons: {
                src : 'src/less/icons/svg/*.svg',
                dest: 'src/less/icons/',
                options: {
                    engine  : 'node',
                    font    : 'icon-font',
                    syntax  : 'bootstrap',
                    types   : 'woff',
                    embed   : true
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-webfont');

    grunt.registerTask('default', ['clean', 'less', 'concat', 'uglify']);
    grunt.registerTask('docs', ['shell:docs']);
    grunt.registerTask('w2ui', ['clean:w2ui', 'less:w2ui', 'less:w2ui-min', 'concat:w2ui', 'uglify:w2ui',
        'concat:banner-w2ui-1', 'concat:banner-w2ui-2', 'concat:banner-w2ui-3', 'concat:banner-w2ui-4']);
    grunt.registerTask('fields', ['clean:fields', 'less:fields', 'less:fields-min', 'concat:fields', 'uglify:fields',
        'concat:banner-fields-1', 'concat:banner-fields-2']);
    grunt.registerTask('ks', ['clean:ks', 'less:ks', 'less:ks-min', 'concat:ks', 'uglify:ks',
        'concat:banner-ks-1', 'concat:banner-ks-2']);
};