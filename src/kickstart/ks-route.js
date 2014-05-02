/************************************************
*  Library: KickStart - Minimalistic Framework
*   - Dependencies: ks-core, jQuery
**/

kickStart.define({ name: 'route' });
kickStart.register('route', function () {
    var app = kickStart;
    // private scope
    var routes  = {};
    var routeRE = {};
    var options = { debug : false };

    addListener();
    return {
        add     : add,
        remove  : remove,
        go      : go,
        get     : get,
        process : process,
        list    : list
    }

    /*
    *    Public methods
    */

    function add (route, handler) {
        if (typeof route == 'object') {
            for (var r in route) {
                var tmp = String('/'+ r).replace(/\/{2,}/g, '/');
                routes[tmp] = route[r];
            }
            return app.route;
        }
        route = String('/'+route).replace(/\/{2,}/g, '/');
        routes[route] = handler;
        return app.route;
    }

    function remove (route) {
        route = String('/'+route).replace(/\/{2,}/g, '/');
        delete routes[route];
        delete routeRE[route];
        return app.route;
    }

    function go (route) {
        route = String('/'+route).replace(/\/{2,}/g, '/');
        setTimeout(function () { window.location.hash = route; }, 1);
        return app.route;        
    }

    function get () {
        return window.location.hash.substr(1).replace(/\/{2,}/g, '/');
    }

    function list () {
        prepare();
        var res = {};
        for (var r in routes) {
            var tmp  = routeRE[r].keys;
            var keys = [];
            for (var t in tmp) keys.push(tmp[t].name);
            res[r] = keys;
        }
        return res;
    }

    function process () {
        prepare();
        // match routes
        var hash = window.location.hash.substr(1).replace(/\/{2,}/g, '/');
        if (hash == '') hash = '/';
        var tmp  = hash.split('/');
        // check if modules is loaed
        if (tmp[1] && typeof app[tmp[1]] == 'undefined') {
            if (options.debug) console.log('ROUTE: load module ' + tmp[1]);
            app.require(tmp[1]).done(function () {
                if (app.modules[tmp[1]]) process();
            });
        } else {
            // process route
            for (var r in routeRE) {
                var params = {};
                var tmp = routeRE[r].path.exec(hash);
                if (tmp) { // match
                    var i = 1;
                    for (var p in routeRE[r].keys) {
                        params[routeRE[r].keys[p].name] = tmp[i];
                        i++;
                    }
                    if (options.debug) console.log('ROUTE:', r, params);
                    routes[r](r, params);
                }
            }
        }
        return app.route;
    }

    /*
    *    Private methods
    */

    function prepare () {
        // make sure all routes are parsed to RegEx
        for (var r in routes) {
            if (routeRE[r]) continue;
            var keys = [];
            var path = r
                .replace(/\/\(/g, '(?:/')
                .replace(/\+/g, '__plus__')
                .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional) {
                    keys.push({ name: key, optional: !! optional });
                    slash = slash || '';
                    return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')' + (optional || '');
                })
                .replace(/([\/.])/g, '\\$1')
                .replace(/__plus__/g, '(.+)')
                .replace(/\*/g, '(.*)');
            routeRE[r] = {
                path  : new RegExp('^' + path + '$', 'i'),
                keys  : keys
            }
        }        
    }

    function addListener () {
        if (window.addEventListener) {
            window.addEventListener('hashchange', process, false);
        } else {
            window.attachEvent('onhashchange', process);
        }
    }

    function removeListener () {
        if (window.removeEventListener) {
            window.removeEventListener('hashchange', process);
        } else {
            window.detachEvent('onhashchange', process);
        }
    }
});