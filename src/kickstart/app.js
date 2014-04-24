var app = (function () {
    // private scope
    var timer_start;
    var timer_lap;

    // public scope
    var app    = {};
    app.user         = {};
    app.config         = {};
    app.modules     = {};
    app.header        = header;
    app.timer        = timer;
    app.lap            = lap;
    app.register    = register;
    app.load        = load;
    app.get         = get;
    app.include     = include;
    // in other files
    app.action        = null;        // function - main event loop
    app.start        = null;        // funciton - starting point
    app.session        = null;        // function - returns user session
    app.login        = null;        // function - performs login
    app.logout        = null;        // function    - performs logout
    app.forgot        = null;        // function - persforms forgot password

    init();
    return app;

    /***********************************
    /*  -- IMPLEMENTATION
    */

    function header(msg) {
        $(document).attr('title', $('<div/>').html(msg).text());
        $('#app-header').html(msg);
    }

    function timer() {
        timer_start = (new Date()).getTime();
        timer_lap   = (new Date()).getTime();
        console.log('Start Timer');
    }

    function lap(name) {
        if (typeof name != 'string') name = ''; else name = ' "' + name + '"';
        console.log('Total:', (new Date()).getTime() - timer_start, 'Lap'+ name + ':', (new Date()).getTime() - timer_lap);
        timer_lap = (new Date()).getTime();
    }

    // ===========================================
    // -- Register module

    function register(name, moduleFunction) {
        // check if modules id defined
        if (app.hasOwnProperty(name)) {
            console.log('ERROR: Namespace '+ name +' is already registered');
            return false;
        }
        // register module
        var mod = null;
        for (var m in app.modules) {
            if (app.modules[m].name == name) mod = app.modules[m];
        }
        // init module
        app[name] = moduleFunction(mod.files, mod);
        return;
    }

    // ===========================================
    // -- Load Modules

    function load(names) { // returns promise
        if (!$.isArray(names)) names = [names];
        var modCount = names.length;
        var failed     = false;
        var promise  = {
            ready: function (callBack) {     // a module loaded
                promise._ready = callBack;
                return promise;
            },
            fail: function (callBack) {     // a module loading failed
                promise._fail = callBack;
                return promise;
            },
            done: function (callBack) {        // all loaded
                promise._done = callBack;
                return promise;
            },
            always: function (callBack) {
                promise._always = callBack;
                return promise;
            }
        };
        setTimeout(function () {
            for (var n in names) {
                var name = names[n];
                // check if module is already loaded
                if (typeof app.modules[name] != 'undefined') {
                    modCount--;
                    isFinished();
                } else { // load config
                    $.ajax({ url : name + '/module.json', dataType: "json" })
                        .done(function (data, status, xhr) {
                            if (data.main.substr(0, 1) != '/') data.main = name + '/' + data.main;
                            for (var a in data.assets) {
                                if (data.assets[a].substr(0, 1) != '/') data.assets[a] = name + '/' + data.assets[a];
                            }
                            app.modules[name] = data;
                            // load dependencies
                            app.get(data.assets.concat([data.main]), function (files) {
                                var main = files[data.main];
                                delete files[data.main];
                                // register assets
                                app.modules[name].files = files;
                                app.modules[name].status = 'loaded';
                                // execute main file
                                try { 
                                    eval(main); 
                                } catch (e) { 
                                    failed = true;
                                    // find error line
                                    var err = e.stack.split('\n');
                                    var tmp = err[1].match(/<anonymous>:([\d]){1,10}:([\d]{1,10})/gi);
                                    if (tmp) tmp = tmp[0].split(':');
                                    if (tmp) {
                                        // display error
                                        console.error('ERROR: ' + err[0] + ' ==> ' + data.main + ', line: '+ tmp[1] + ', character: '+ tmp[2]);
                                        console.log(e.stack);
                                    } else {
                                        console.error('ERROR: ' + data.main);
                                        console.log(e.stack);
                                    }
                                    if (typeof app.config.fail == 'function') app.config.fail(app.modules[name]);
                                    if (typeof promise._fail == 'function') promise._fail(app.modules[name]);
                                }
                                // check ready
                                if (typeof app.config.ready == 'function') app.config.ready(app.modules[name]);
                                if (typeof promise._ready == 'function') promise._ready(app.modules[name]);
                                modCount--;
                                isFinished();
                            });
                        })
                        .fail(function (xhr, err, errData) {
                            app.modules[name] = {
                                status    : 'error',
                                msg        : 'Error while loading cofing'
                            }
                            failed = true;
                            if (typeof app.config.fail == 'function') app.config.fail(app.modules[name]);
                            if (typeof promise._fail == 'function') promise._fail(app.modules[name]);
                            modCount--;
                            isFinished();
                        });
                }
            }
        }, 1);
        // promise need to be returned immidiately
        return promise;

        function isFinished() {
            if (modCount == 0) {
                if (failed !== true) {
                    if (typeof app.config.done == 'function') app.config.done(app.modules[name]);
                    if (typeof promise._done == 'function') promise._done(app.modules[name]);
                }
                if (typeof app.config.always == 'function') app.config.always(app.modules[name]);
                if (typeof promise._always == 'function') promise._always();
            }
        }
    }

    // ===========================================
    // -- Loads a set of files and returns 
    // -- its contents to the callBack function

    function get(files, callBack) {
        var bufferObj = {};
        var bufferLen = files.length;
        
        for (var i in files) {
            // need a closure
            (function () {
                var index = i;
                var path  = files[i];
                $.ajax({
                    url        : path,
                    dataType: 'text',
                    success : function (data, success, responseObj) {
                        if (success != 'success') {
                            console.log('ERROR: error while getting a file '+ path +'.');
                            return;
                        }
                        bufferObj[path] = responseObj.responseText;
                        loadDone();

                    },
                    error : function (data, err, errData) {
                        if (err == 'error') {
                            console.log('ERROR: failed to load '+ files[i] +'.');
                        } else {
                            console.log('ERROR: file "'+ files[i] + '" is loaded, but with a parsing error(s) in line '+ errData.line +': '+ errData.message);
                            bufferObj[path] = responseObj.responseText;
                            loadDone();
                        }
                    }
                });
            })();
        }
        // internal counter
        function loadDone() {
            bufferLen--;
            if (bufferLen <= 0) callBack(bufferObj);
        }
    }

    // ===========================================
    // -- Includes all files as scripts in order to see error line

    function include(files) {
        if (typeof files == 'string') files = [files];
        for (var i in files) {
            $(document).append('<script type="text/javascript" src="'+ files[i] +'"></script>');
        }
    }

    // =================================================
    // -- INTERNAL METHODS

    function init() {
        if (document.location.href.indexOf('login.html') == -1) {
            setTimeout(function () {
                w2popup.open({ 
                    width    : 300,
                    height     : 60,
                    modal     : true, 
                    body    : '<div style="text-align: center; font-size: 16px; padding-top: 20px; padding-left: 35px;">'+
                              '        <div class="w2ui-spinner" style="width: 26px; height: 26px; position: absolute; margin-left: -35px; margin-top: -5px;"></div>'+
                              '        Loading...'+
                              '</div>'
                });
            }, 1);
        }
        // -- load utils
        app.get(['app/conf/session.js'], function (data) {
            try { for (var i in data) eval(data[i]); } catch (e) { }
            // if login page - do not init
            if (document.location.href.indexOf('login.html') > 0) return;
            // -- if no user info
            app.user = app.session();
            if ($.isEmptyObject(app.user)) {
                document.location = 'login.html';
                return;
            }
            // -- load dependencies
            var files = [
                'app/conf/action.js', 
                'app/conf/config.js', 
                'app/conf/start.js' 
            ];
            app.get(files, function (data) {
                try {
                    for (var i in data) eval(data[i]);
                } catch (e) {
                    app.include(files);
                }
                initApp();
                return;

                function initApp() {
                    // check if ready
                    if ($('#app-main').length == 0) {
                        setTimeout(initApp, 100);
                        return;
                    }
                    // init application UI
                    $('#app-toolbar').w2toolbar(app.config.app_toolbar);
                    $('#app-tabs').w2tabs(app.config.app_tabs);
                    $('#app-main').w2layout(app.config.app_layout);
                    var top = 0;
                    // app toolbar
                    if (app.config.show.toolbar) {
                        $('#app-toolbar').css('height', '30px').show();
                        top += 30;
                    } else {
                        $('#app-toolbar').hide();
                    }
                    // app tabs
                    if (app.config.show.tabs) {
                        $('#app-tabs').css({ 'top': top + 'px', 'height': '30px' }).show();
                        top += 30;
                    } else {
                        $('#app-tabs').hide();
                    }
                    $('#app-top').css('height', top + 'px').show();
                    // app header
                    if (app.config.show.header) {
                        $('#app-header').css({ 'top': top + 'px', 'height': '60px' }).show();
                        top += 60;
                    } else {
                        $('#app-header').hide();
                    }
                    $('#app-main').css('top', top + 'px');
                    setTimeout(function () {
                        $('#app-container').fadeIn(300);
                        if (typeof app.start == 'function') app.start(); // init app
                        setTimeout(function () { w2popup.close(); }, 300);
                    }, 300);
                }
            });
        });
    }

}) (app || {});