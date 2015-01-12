var w2ui  = w2ui  || {};
var w2obj = w2obj || {}; // expose object to be able to overwrite default functions

/************************************************
*  Library: Web 2.0 UI for jQuery
*  - Following objects are defines
*        - w2ui             - object that will contain all widgets
*        - w2obj            - object with widget prototypes
*        - w2utils          - basic utilities
*        - $().w2render     - common render
*        - $().w2destroy    - common destroy
*        - $().w2marker     - marker plugin
*        - $().w2tag        - tag plugin
*        - $().w2overlay    - overlay plugin
*        - $().w2menu       - menu plugin
*        - w2utils.event    - generic event object
*        - w2utils.keyboard - object for keyboard navigation
*  - Dependencies: jQuery
*
* == NICE TO HAVE ==
*   - overlay should be displayed where more space (on top or on bottom)
*   - write and article how to replace certain framework functions
*   - add maxHeight for the w2menu
*   - isTime should support seconds
*   - add time zone
*   - TEST On IOS
*   - $().w2marker() -- only unmarks first instance
*   - subitems for w2menus()
*   - add w2utils.lang wrap for all captions in all buttons.
*   - add isDateTime()
*   - remove momentjs
*
* == 1.5 changes
*   - date has problems in FF new Date('yyyy-mm-dd') breaks
*   - bug: w2utils.formatDate('2011-31-01', 'yyyy-dd-mm'); - wrong foratter
*   - format date and time is buggy
*   - added decimalSymbol
*   - renamed size() -> formatSize()
*   - added cssPrefix()
*   - added w2utils.settings.weekStarts
*   - onComplete should pass widget as context (this)
*   - hidden and disabled in menus
*   - added menu.item.hint for overlay menues
*   - added w2tag options.id, options.left, options.top
*
************************************************/

var w2utils = (function () {
    var tmp = {}; // for some temp variables
    var obj = {
        version  : '1.5.x',
        settings : {
            "locale"            : "en-us",
            "date_format"       : "m/d/yyyy",
            "date_display"      : "Mon d, yyyy",
            "time_format"       : "hh:mi pm",
            "currencyPrefix"    : "$",
            "currencySuffix"    : "",
            "currencyPrecision" : 2,
            "groupSymbol"       : ",",
            "decimalSymbol"     : ".",
            "shortmonths"       : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            "fullmonths"        : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            "shortdays"         : ["M", "T", "W", "T", "F", "S", "S"],
            "fulldays"          : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            "weekStarts"        : "M",      // can be "M" for Monday or "S" for Sunday
            "dataType"          : 'HTTP',   // can be HTTP, RESTFULL, JSON (case sensative)
            "phrases"           : {},       // empty object for english phrases
            "dateStartYear"     : 1950,     // start year for date-picker
            "dateEndYear"       : 2020      // end year for date picker
        },
        isInt           : isInt,
        isFloat         : isFloat,
        isMoney         : isMoney,
        isHex           : isHex,
        isAlphaNumeric  : isAlphaNumeric,
        isEmail         : isEmail,
        isDate          : isDate,
        isTime          : isTime,
        isDateTime      : isDateTime,
        age             : age,
        date            : date,
        formatSize      : formatSize,
        formatNumber    : formatNumber,
        formatDate      : formatDate,
        formatTime      : formatTime,
        formatDateTime  : formatDateTime,
        stripTags       : stripTags,
        encodeTags      : encodeTags,
        escapeId        : escapeId,
        base64encode    : base64encode,
        base64decode    : base64decode,
        transition      : transition,
        lock            : lock,
        unlock          : unlock,
        lang            : lang,
        locale          : locale,
        getSize         : getSize,
        scrollBarSize   : scrollBarSize,
        checkName       : checkName,
        checkUniqueId   : checkUniqueId,
        parseRoute      : parseRoute,
        cssPrefix       : cssPrefix,
        // some internal variables
        isIOS : ((navigator.userAgent.toLowerCase().indexOf('iphone') != -1 ||
                 navigator.userAgent.toLowerCase().indexOf('ipod') != -1 ||
                 navigator.userAgent.toLowerCase().indexOf('ipad') != -1)
                 ? true : false),
        isIE : ((navigator.userAgent.toLowerCase().indexOf('msie') != -1 ||
                 navigator.userAgent.toLowerCase().indexOf('trident') != -1 )
                 ? true : false),
        use_momentjs : ((typeof moment === 'function') && (typeof moment.version === 'string'))
    };
    return obj;

    function isInt (val) {
        var re = /^[-+]?[0-9]+$/;
        return re.test(val);
    }

    function isFloat (val) {
        if (typeof val == 'string') val = val.replace(w2utils.settings.decimalSymbol, '.');
        return (typeof val === 'number' || (typeof val === 'string' && val !== '')) && !isNaN(Number(val));
    }

    function isMoney (val) {
        var se = w2utils.settings;
        var re = new RegExp('^'+ (se.currencyPrefix ? '\\' + se.currencyPrefix + '?' : '') +'[-+]?[0-9]*[\\'+ se.decimalSymbol +']?[0-9]+'+ (se.currencySuffix ? '\\' + se.currencySuffix + '?' : '') +'$', 'i');
        if (typeof val === 'string') {
            val = val.replace(new RegExp(se.groupSymbol, 'g'), '');
        }
        if (typeof val === 'object' || val === '') return false;
        return re.test(val);
    }

    function isHex (val) {
        var re = /^[a-fA-F0-9]+$/;
        return re.test(val);
    }

    function isAlphaNumeric (val) {
        var re = /^[a-zA-Z0-9_-]+$/;
        return re.test(val);
    }

    function isEmail (val) {
        var email = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return email.test(val);
    }

    function isDate (val, format, retDate) {
        if (!val) return false;

        var dt   = 'Invalid Date';
        var month, day, year;

        if (format == null) format = w2utils.settings.date_format;

        if (typeof val.getUTCFullYear === 'function' && typeof val.getUTCMonth === 'function' && typeof val.getUTCDate === 'function') {
            year = val.getUTCFullYear();
            month = val.getUTCMonth();
            day = val.getUTCDate();
        } else if (typeof val.getFullYear === 'function' && typeof val.getMonth === 'function' && typeof val.getDate === 'function') {
            year = val.getFullYear();
            month = val.getMonth();
            day = val.getDate();
        } else {
            val = String(val);
            // convert month formats
            if (new RegExp('mon', 'ig').test(format)) {
                format = format.replace(/month/ig, 'm').replace(/mon/ig, 'm').replace(/dd/ig, 'd').replace(/[, ]/ig, '/').replace(/\/\//g, '/').toLowerCase();
                val    = val.replace(/[, ]/ig, '/').replace(/\/\//g, '/').toLowerCase();
                for (var m = 0, len = w2utils.settings.fullmonths.length; m < len; m++) {
                    var t = w2utils.settings.fullmonths[m];
                    val = val.replace(new RegExp(t, 'ig'), (parseInt(m) + 1)).replace(new RegExp(t.substr(0, 3), 'ig'), (parseInt(m) + 1));
                }
            }
            // format date
            var tmp  = val.replace(/-/g, '/').replace(/\./g, '/').toLowerCase().split('/');
            var tmp2 = format.replace(/-/g, '/').replace(/\./g, '/').toLowerCase();
            if (tmp2 === 'mm/dd/yyyy') { month = tmp[0]; day = tmp[1]; year = tmp[2]; }
            if (tmp2 === 'm/d/yyyy')   { month = tmp[0]; day = tmp[1]; year = tmp[2]; }
            if (tmp2 === 'dd/mm/yyyy') { month = tmp[1]; day = tmp[0]; year = tmp[2]; }
            if (tmp2 === 'd/m/yyyy')   { month = tmp[1]; day = tmp[0]; year = tmp[2]; }
            if (tmp2 === 'yyyy/dd/mm') { month = tmp[2]; day = tmp[1]; year = tmp[0]; }
            if (tmp2 === 'yyyy/d/m')   { month = tmp[2]; day = tmp[1]; year = tmp[0]; }
            if (tmp2 === 'yyyy/mm/dd') { month = tmp[1]; day = tmp[2]; year = tmp[0]; }
            if (tmp2 === 'yyyy/m/d')   { month = tmp[1]; day = tmp[2]; year = tmp[0]; }
            if (tmp2 === 'mm/dd/yy')   { month = tmp[0]; day = tmp[1]; year = tmp[2]; }
            if (tmp2 === 'm/d/yy')     { month = tmp[0]; day = tmp[1]; year = parseInt(tmp[2]) + 1900; }
            if (tmp2 === 'dd/mm/yy')   { month = tmp[1]; day = tmp[0]; year = parseInt(tmp[2]) + 1900; }
            if (tmp2 === 'd/m/yy')     { month = tmp[1]; day = tmp[0]; year = parseInt(tmp[2]) + 1900; }
            if (tmp2 === 'yy/dd/mm')   { month = tmp[2]; day = tmp[1]; year = parseInt(tmp[0]) + 1900; }
            if (tmp2 === 'yy/d/m')     { month = tmp[2]; day = tmp[1]; year = parseInt(tmp[0]) + 1900; }
            if (tmp2 === 'yy/mm/dd')   { month = tmp[1]; day = tmp[2]; year = parseInt(tmp[0]) + 1900; }
            if (tmp2 === 'yy/m/d')     { month = tmp[1]; day = tmp[2]; year = parseInt(tmp[0]) + 1900; }
        }
        if (!isInt(year)) return false;
        if (!isInt(month)) return false;
        if (!isInt(day)) return false;
        year = +year;
        month = +month;
        day = +day;
        dt = new Date(year, month - 1, day);
        // do checks
        if (month == null) return false;
        if (String(dt) == 'Invalid Date') return false;
        if ((dt.getMonth() + 1 !== month) || (dt.getDate() !== day) || (dt.getFullYear() !== year)) return false;
        if (retDate === true) return dt; else return true;
    }

    function isTime (val, retTime) {
        // Both formats 10:20pm and 22:20
        if (val == null) return false;
        var max, pm;
        // -- process american format
        val = String(val);
        val = val.toUpperCase();
        pm = val.indexOf('PM') >= 0;
        var ampm = (pm || val.indexOf('AM') >= 0);
        if (ampm) max = 12; else max = 24;
        val = val.replace('AM', '').replace('PM', '');
        val = $.trim(val);
        // ---
        var tmp = val.split(':');
        var h = parseInt(tmp[0] || 0), m = parseInt(tmp[1] || 0);
        // accept edge case: 3PM is a good timestamp, but 3 (without AM or PM) is NOT:
        if ((!ampm || tmp.length !== 1) && tmp.length !== 2) { return false; }
        if (tmp[0] === '' || h < 0 || h > max || !this.isInt(tmp[0]) || tmp[0].length > 2) { return false; }
        if (tmp.length === 2 && (tmp[1] === '' || m < 0 || m > 59 || !this.isInt(tmp[1]) || tmp[1].length !== 2)) { return false; }
        // check the edge cases: 12:01AM is ok, as is 12:01PM, but 24:01 is NOT ok while 24:00 is (midnight; equivalent to 00:00).
        // meanwhile, there is 00:00 which is ok, but 0AM nor 0PM are okay, while 0:01AM and 0:00AM are.
        if (!ampm && max === h && m !== 0) { return false; }
        if (ampm && tmp.length === 1 && h === 0) { return false; }

        if (retTime === true) {
            if (pm) h += 12;
            return {
                hours: h,
                minutes: m
            };
        }
        return true;
    }

    function isDateTime (val, format, retDate) {
        if(w2utils.use_momentjs) {
            var dt = moment(val, format);
            var valid = dt.isValid();
            if (valid && (retDate === true)){
                return dt.clone().toDate();
            }
            return valid;
        }
        // TODO: perform time check, too
        format = format.split('|')[0];
        val    = val.split(' ')[0];
        //console.log("isDateTime() - " + val + " / " + format);
        return isDate(val, format, retDate);
    }

    function age (dateStr) {
        if (dateStr === '' || dateStr == null || (typeof dateStr == 'object' && !dateStr.getMonth)) return '';
        var d1 = new Date(dateStr);
        if (w2utils.isInt(dateStr)) d1 = new Date(Number(dateStr)); // for unix timestamps
        if (String(d1) == 'Invalid Date') return '';

        var d2  = new Date();
        var sec = (d2.getTime() - d1.getTime()) / 1000;
        var amount = '';
        var type   = '';
        if (sec < 0) {
            amount = '<span style="color: #aaa">0 sec</span>';
            type   = '';
        } else if (sec < 60) {
            amount = Math.floor(sec);
            type   = 'sec';
            if (sec < 0) { amount = 0; type = 'sec'; }
        } else if (sec < 60*60) {
            amount = Math.floor(sec/60);
            type   = 'min';
        } else if (sec < 24*60*60) {
            amount = Math.floor(sec/60/60);
            type   = 'hour';
        } else if (sec < 30*24*60*60) {
            amount = Math.floor(sec/24/60/60);
            type   = 'day';
        } else if (sec < 365*24*60*60) {
            amount = Math.floor(sec/30/24/60/60*10)/10;
            type   = 'month';
        } else if (sec < 365*4*24*60*60) {
            amount = Math.floor(sec/365/24/60/60*10)/10;
            type   = 'year';
        } else if (sec >= 365*4*24*60*60) {
            // factor in leap year shift (only older then 4 years)
            amount = Math.floor(sec/365.25/24/60/60*10)/10;
            type   = 'year';
        }
        return amount + ' ' + type + (amount > 1 ? 's' : '');
    }

    function date (dateStr) {
        if (dateStr === '' || dateStr == null || (typeof dateStr == 'object' && !dateStr.getMonth)) return '';
        var d1 = new Date(dateStr);
        if (w2utils.isInt(dateStr)) d1 = new Date(Number(dateStr)); // for unix timestamps
        if (String(d1) == 'Invalid Date') return '';

        var months = w2utils.settings.shortmonths;
        var d2   = new Date(); // today
        var d3   = new Date();
        d3.setTime(d3.getTime() - 86400000); // yesterday

        var dd1  = months[d1.getMonth()] + ' ' + d1.getDate() + ', ' + d1.getFullYear();
        var dd2  = months[d2.getMonth()] + ' ' + d2.getDate() + ', ' + d2.getFullYear();
        var dd3  = months[d3.getMonth()] + ' ' + d3.getDate() + ', ' + d3.getFullYear();

        var time = (d1.getHours() - (d1.getHours() > 12 ? 12 :0)) + ':' + (d1.getMinutes() < 10 ? '0' : '') + d1.getMinutes() + ' ' + (d1.getHours() >= 12 ? 'pm' : 'am');
        var time2= (d1.getHours() - (d1.getHours() > 12 ? 12 :0)) + ':' + (d1.getMinutes() < 10 ? '0' : '') + d1.getMinutes() + ':' + (d1.getSeconds() < 10 ? '0' : '') + d1.getSeconds() + ' ' + (d1.getHours() >= 12 ? 'pm' : 'am');
        var dsp = dd1;
        if (dd1 === dd2) dsp = time;
        if (dd1 === dd3) dsp = w2utils.lang('Yesterday');

        return '<span title="'+ dd1 +' ' + time2 +'">'+ dsp +'</span>';
    }

    function formatSize (sizeStr) {
        if (!w2utils.isFloat(sizeStr) || sizeStr === '') return '';
        sizeStr = parseFloat(sizeStr);
        if (sizeStr === 0) return 0;
        var sizes = ['Bt', 'KB', 'MB', 'GB', 'TB'];
        var i = parseInt( Math.floor( Math.log(sizeStr) / Math.log(1024) ) );
        return (Math.floor(sizeStr / Math.pow(1024, i) * 10) / 10).toFixed(i === 0 ? 0 : 1) + ' ' + sizes[i];
    }

    function formatNumber (val, groupSymbol, decimalSymbol) {
        var ret = '';
        if (groupSymbol == null) groupSymbol = w2utils.settings.groupSymbol || ',';
        if (decimalSymbol == null) decimalSymbol = w2utils.settings.decimalSymbol || '.';
        // check if this is a number
        if (w2utils.isFloat(val) || w2utils.isInt(val) || w2utils.isMoney(val)) {
            tmp = String(val).split('.');
            ret = String(tmp[0]).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + groupSymbol);
            if (tmp[1] != null) ret += decimalSymbol + tmp[1];
        }
        return ret;
    }

    function formatDate (dateStr, format) { // IMPORTANT dateStr HAS TO BE valid JavaScript Date String
        if (!format) format = this.settings.date_format;
        if (dateStr === '' || dateStr == null || (typeof dateStr == 'object' && !dateStr.getMonth)) return '';

        var dt = new Date(dateStr);
        if (w2utils.isInt(dateStr)) dt = new Date(Number(dateStr)); // for unix timestamps
        if (String(dt) == 'Invalid Date') return '';

        var year  = dt.getFullYear();
        var month = dt.getMonth();
        var date  = dt.getDate();
        return format.toLowerCase()
            .replace('month', w2utils.settings.fullmonths[month])
            .replace('mon', w2utils.settings.shortmonths[month])
            .replace(/yyyy/g, year)
            .replace(/yyy/g, year)
            .replace(/yy/g, year > 2000 ? 100 + parseInt(String(year).substr(2)) : String(year).substr(2))
            .replace(/(^|[^a-z$])y/g, '$1' + year)            // only y's that are not preceeded by a letter
            .replace(/mm/g, (month + 1 < 10 ? '0' : '') + (month + 1))
            .replace(/dd/g, (date < 10 ? '0' : '') + date)
            .replace(/th/g, (date == 1 ? 'st' : 'th'))
            .replace(/th/g, (date == 2 ? 'nd' : 'th'))
            .replace(/th/g, (date == 3 ? 'rd' : 'th'))
            .replace(/(^|[^a-z$])m/g, '$1' + (month + 1))     // only y's that are not preceeded by a letter
            .replace(/(^|[^a-z$])d/g, '$1' + date);           // only y's that are not preceeded by a letter
    }

    function formatTime (dateStr, format) { // IMPORTANT dateStr HAS TO BE valid JavaScript Date String
        var months = w2utils.settings.shortmonths;
        var fullMonths = w2utils.settings.fullmonths;
        if (!format) format = this.settings.time_format;
        if (dateStr === '' || dateStr == null || (typeof dateStr == 'object' && !dateStr.getMonth)) return '';

        var dt = new Date(dateStr);
        if (w2utils.isInt(dateStr)) dt  = new Date(Number(dateStr)); // for unix timestamps
        if (w2utils.isTime(dateStr)) {
            var tmp = w2utils.isTime(dateStr, true);
            dt = new Date();
            dt.setHours(tmp.hours);
            dt.setMinutes(tmp.minutes);
        }
        if (String(dt) == 'Invalid Date') return '';

        var type = 'am';
        var hour = dt.getHours();
        var h24  = dt.getHours();
        var min  = dt.getMinutes();
        var sec  = dt.getSeconds();
        if (min < 10) min = '0' + min;
        if (sec < 10) sec = '0' + sec;
        if (format.indexOf('am') !== -1 || format.indexOf('pm') !== -1) {
            if (hour >= 12) type = 'pm';
            if (hour > 12)  hour = hour - 12;
        }
        return format.toLowerCase()
            .replace('am', type)
            .replace('pm', type)
            .replace('hhh', (hour < 10 ? '0' + hour : hour))
            .replace('hh24', (h24 < 10 ? '0' + h24 : h24))
            .replace('h24', h24)
            .replace('hh', hour)
            .replace('mm', min)
            .replace('mi', min)
            .replace('ss', sec)
            .replace(/(^|[^a-z$])h/g, '$1' + hour)    // only y's that are not preceeded by a letter
            .replace(/(^|[^a-z$])m/g, '$1' + min)     // only y's that are not preceeded by a letter
            .replace(/(^|[^a-z$])s/g, '$1' + sec);    // only y's that are not preceeded by a letter
    }

    function formatDateTime(dateStr, format) {
        var fmt;
        if (dateStr === '' || dateStr == null || (typeof dateStr == 'object' && !dateStr.getMonth)) return '';
        if (typeof format !== 'string') {
            fmt = [this.settings.date_format, this.settings.time_format];
        } else {
            fmt = format.split('|');
        }
        return this.formatDate(dateStr, fmt[0]) + ' ' + this.formatTime(dateStr, fmt[1]);
    }

    function stripTags (html) {
        if (html === null) return html;
        switch (typeof html) {
            case 'number':
                break;
            case 'string':
                html = $.trim(String(html).replace(/(<([^>]+)>)/ig, ""));
                break;
            case 'object':
                for (var a in html) html[a] = this.stripTags(html[a]);
                break;
        }
        return html;
    }

    function encodeTags (html) {
        if (html === null) return html;
        switch (typeof html) {
            case 'number':
                break;
            case 'string':
                html = String(html).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
                break;
            case 'object':
                for (var a in html) html[a] = this.encodeTags(html[a]);
                break;
        }
        return html;
    }

    function escapeId (id) {
        if (id === '' || id == null) return '';
        return String(id).replace(/([;&,\.\+\*\~'`:"\!\^#$%@\[\]\(\)=<>\|\/? {}\\])/g, '\\$1');
    }

    function base64encode (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        input = utf8_encode(input);

        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
        }

        function utf8_encode (string) {
            string = String(string).replace(/\r\n/g,"\n");
            var utftext = "";

            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }
            return utftext;
        }

        return output;
    }

    function base64decode (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {
            enc1 = keyStr.indexOf(input.charAt(i++));
            enc2 = keyStr.indexOf(input.charAt(i++));
            enc3 = keyStr.indexOf(input.charAt(i++));
            enc4 = keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 !== 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 !== 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = utf8_decode(output);

        function utf8_decode (utftext) {
            var string = "";
            var i = 0;
            var c = 0, c2, c3;

            while ( i < utftext.length ) {
                c = utftext.charCodeAt(i);
                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                }
                else if((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i+1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                }
                else {
                    c2 = utftext.charCodeAt(i+1);
                    c3 = utftext.charCodeAt(i+2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }
            }

            return string;
        }

        return output;
    }

    function transition (div_old, div_new, type, callBack) {
        var width  = $(div_old).width();
        var height = $(div_old).height();
        var time   = 0.5;

        if (!div_old || !div_new) {
            console.log('ERROR: Cannot do transition when one of the divs is null');
            return;
        }

        div_old.parentNode.style.cssText += cross('perspective', '700px') +'; overflow: hidden;';
        div_old.style.cssText += '; position: absolute; z-index: 1019; '+ cross('backface-visibility', 'hidden');
        div_new.style.cssText += '; position: absolute; z-index: 1020; '+ cross('backface-visibility', 'hidden');

        switch (type) {
            case 'slide-left':
                // init divs
                div_old.style.cssText += 'overflow: hidden; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)');
                div_new.style.cssText += 'overflow: hidden; '+ cross('transform', 'translate3d('+ width + 'px, 0, 0)', 'translate('+ width +'px, 0)');
                $(div_new).show();
                // -- need a timing function because otherwise not working
                window.setTimeout(function() {
                    div_new.style.cssText += cross('transition', time+'s') +';'+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)');
                    div_old.style.cssText += cross('transition', time+'s') +';'+ cross('transform', 'translate3d(-'+ width +'px, 0, 0)', 'translate(-'+ width +'px, 0)');
                }, 1);
                break;

            case 'slide-right':
                // init divs
                div_old.style.cssText += 'overflow: hidden; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)');
                div_new.style.cssText += 'overflow: hidden; '+ cross('transform', 'translate3d(-'+ width +'px, 0, 0)', 'translate(-'+ width +'px, 0)');
                $(div_new).show();
                // -- need a timing function because otherwise not working
                window.setTimeout(function() {
                    div_new.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'translate3d(0px, 0, 0)', 'translate(0px, 0)');
                    div_old.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'translate3d('+ width +'px, 0, 0)', 'translate('+ width +'px, 0)');
                }, 1);
                break;

            case 'slide-down':
                // init divs
                div_old.style.cssText += 'overflow: hidden; z-index: 1; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)');
                div_new.style.cssText += 'overflow: hidden; z-index: 0; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)');
                $(div_new).show();
                // -- need a timing function because otherwise not working
                window.setTimeout(function() {
                    div_new.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)');
                    div_old.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'translate3d(0, '+ height +'px, 0)', 'translate(0, '+ height +'px)');
                }, 1);
                break;

            case 'slide-up':
                // init divs
                div_old.style.cssText += 'overflow: hidden; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)');
                div_new.style.cssText += 'overflow: hidden; '+ cross('transform', 'translate3d(0, '+ height +'px, 0)', 'translate(0, '+ height +'px)');
                $(div_new).show();
                // -- need a timing function because otherwise not working
                window.setTimeout(function() {
                    div_new.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)');
                    div_old.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)');
                }, 1);
                break;

            case 'flip-left':
                // init divs
                div_old.style.cssText += 'overflow: hidden; '+ cross('transform', 'rotateY(0deg)');
                div_new.style.cssText += 'overflow: hidden; '+ cross('transform', 'rotateY(-180deg)');
                $(div_new).show();
                // -- need a timing function because otherwise not working
                window.setTimeout(function() {
                    div_new.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'rotateY(0deg)');
                    div_old.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'rotateY(180deg)');
                }, 1);
                break;

            case 'flip-right':
                // init divs
                div_old.style.cssText += 'overflow: hidden; '+ cross('transform', 'rotateY(0deg)');
                div_new.style.cssText += 'overflow: hidden; '+ cross('transform', 'rotateY(180deg)');
                $(div_new).show();
                // -- need a timing function because otherwise not working
                window.setTimeout(function() {
                    div_new.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'rotateY(0deg)');
                    div_old.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'rotateY(-180deg)');
                }, 1);
                break;

            case 'flip-down':
                // init divs
                div_old.style.cssText += 'overflow: hidden; '+ cross('transform', 'rotateX(0deg)');
                div_new.style.cssText += 'overflow: hidden; '+ cross('transform', 'rotateX(180deg)');
                $(div_new).show();
                // -- need a timing function because otherwise not working
                window.setTimeout(function() {
                    div_new.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'rotateX(0deg)');
                    div_old.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'rotateX(-180deg)');
                }, 1);
                break;

            case 'flip-up':
                // init divs
                div_old.style.cssText += 'overflow: hidden; '+ cross('transform', 'rotateX(0deg)');
                div_new.style.cssText += 'overflow: hidden; '+ cross('transform', 'rotateX(-180deg)');
                $(div_new).show();
                // -- need a timing function because otherwise not working
                window.setTimeout(function() {
                    div_new.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'rotateX(0deg)');
                    div_old.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'rotateX(180deg)');
                }, 1);
                break;

            case 'pop-in':
                // init divs
                div_old.style.cssText += 'overflow: hidden; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)');
                div_new.style.cssText += 'overflow: hidden; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)') + '; '+ cross('transform', 'scale(.8)') + '; opacity: 0;';
                $(div_new).show();
                // -- need a timing function because otherwise not working
                window.setTimeout(function() {
                    div_new.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'scale(1)') +'; opacity: 1;';
                    div_old.style.cssText += cross('transition', time+'s') +';';
                }, 1);
                break;

            case 'pop-out':
                // init divs
                div_old.style.cssText += 'overflow: hidden; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)') +'; '+ cross('transform', 'scale(1)') +'; opacity: 1;';
                div_new.style.cssText += 'overflow: hidden; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)') +'; opacity: 0;';
                $(div_new).show();
                // -- need a timing function because otherwise not working
                window.setTimeout(function() {
                    div_new.style.cssText += cross('transition', time+'s') +'; opacity: 1;';
                    div_old.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'scale(1.7)') +'; opacity: 0;';
                }, 1);
                break;

            default:
                // init divs
                div_old.style.cssText += 'overflow: hidden; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)');
                div_new.style.cssText += 'overflow: hidden; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)') +'; opacity: 0;';
                $(div_new).show();
                // -- need a timing function because otherwise not working
                window.setTimeout(function() {
                    div_new.style.cssText += cross('transition', time +'s') +'; opacity: 1;';
                    div_old.style.cssText += cross('transition', time +'s');
                }, 1);
                break;
        }

        setTimeout(function () {
            if (type === 'slide-down') {
                $(div_old).css('z-index', '1019');
                $(div_new).css('z-index', '1020');
            }
            if (div_new) {
                $(div_new).css({ 'opacity': '1' }).css(w2utils.cssPrefix({
                    'transition': '',
                    'transform' : '',
                    'backface-visibility': ''
                }));
            }
            if (div_old) {
                $(div_old).css({ 'opacity': '1' }).css(w2utils.cssPrefix({
                    'transition': '',
                    'transform' : '',
                    'backface-visibility': ''
                }));
                if (div_old.parentNode) $(div_old.parentNode).css(w2utils.cssPrefix('perspective', ''));
            }
            if (typeof callBack === 'function') callBack();
        }, time * 1000);

        function cross(property, value, none_webkit_value) {
            var isWebkit=!!window.webkitURL; // jQuery no longer supports $.browser - RR
            if (!isWebkit && typeof none_webkit_value !== 'undefined') value = none_webkit_value;
            return ';'+ property +': '+ value +'; -webkit-'+ property +': '+ value +'; -moz-'+ property +': '+ value +'; '+
                '-ms-'+ property +': '+ value +'; -o-'+ property +': '+ value +';';
        }
    }

    function lock (box, msg, spinner) {
        var options = {};
        if (typeof msg === 'object') {
            options = msg;
        } else {
            options.msg     = msg;
            options.spinner = spinner;
        }
        if (!options.msg && options.msg !== 0) options.msg = '';
        w2utils.unlock(box);
        $(box).prepend(
            '<div class="w2ui-lock"></div>'+
            '<div class="w2ui-lock-msg"></div>'
        );
        var $lock = $(box).find('.w2ui-lock');
        var mess = $(box).find('.w2ui-lock-msg');
        if (!options.msg) mess.css({ 'background-color': 'transparent', 'border': '0px' });
        if (options.spinner === true) options.msg = '<div class="w2ui-spinner" '+ (!options.msg ? 'style="width: 35px; height: 35px"' : '') +'></div>' + options.msg;
        if (options.opacity != null) $lock.css('opacity', options.opacity);
        if (typeof $lock.fadeIn == 'function') {
            $lock.fadeIn(200);
            mess.html(options.msg).fadeIn(200);
        } else {
            $lock.show();
            mess.html(options.msg).show(0);
        }
        // hide all tags (do not hide overlays as the form can be in overlay)
        $().w2tag();
    }

    function unlock (box, speed) {
        if (isInt(speed)) {
            $(box).find('.w2ui-lock').fadeOut(speed);
            setTimeout(function () {
                $(box).find('.w2ui-lock').remove();
                $(box).find('.w2ui-lock-msg').remove();
            }, speed);
        } else {
            $(box).find('.w2ui-lock').remove();
            $(box).find('.w2ui-lock-msg').remove();
        }
    }

    function getSize (el, type) {
        var $el = $(el);
        var bwidth = {
            left    : parseInt($el.css('border-left-width')) || 0,
            right   : parseInt($el.css('border-right-width')) || 0,
            top     : parseInt($el.css('border-top-width')) || 0,
            bottom  : parseInt($el.css('border-bottom-width')) || 0
        };
        var mwidth = {
            left    : parseInt($el.css('margin-left')) || 0,
            right   : parseInt($el.css('margin-right')) || 0,
            top     : parseInt($el.css('margin-top')) || 0,
            bottom  : parseInt($el.css('margin-bottom')) || 0
        };
        var pwidth = {
            left    : parseInt($el.css('padding-left')) || 0,
            right   : parseInt($el.css('padding-right')) || 0,
            top     : parseInt($el.css('padding-top')) || 0,
            bottom  : parseInt($el.css('padding-bottom')) || 0
        };
        switch (type) {
            case 'top'      : return bwidth.top + mwidth.top + pwidth.top;
            case 'bottom'   : return bwidth.bottom + mwidth.bottom + pwidth.bottom;
            case 'left'     : return bwidth.left + mwidth.left + pwidth.left;
            case 'right'    : return bwidth.right + mwidth.right + pwidth.right;
            case 'width'    : return bwidth.left + bwidth.right + mwidth.left + mwidth.right + pwidth.left + pwidth.right + parseInt($el.width());
            case 'height'   : return bwidth.top + bwidth.bottom + mwidth.top + mwidth.bottom + pwidth.top + pwidth.bottom + parseInt($el.height());
            case '+width'   : return bwidth.left + bwidth.right + mwidth.left + mwidth.right + pwidth.left + pwidth.right;
            case '+height'  : return bwidth.top + bwidth.bottom + mwidth.top + mwidth.bottom + pwidth.top + pwidth.bottom;
        }
        return 0;
    }

    function lang (phrase) {
        var translation = this.settings.phrases[phrase];
        if (translation == null) return phrase; else return translation;
    }

    function locale (locale) {
        if (!locale) locale = 'en-us';
        if (locale.length === 5) locale = 'locale/'+ locale +'.json';

        // clear phrases from language before
        w2utils.settings.phrases = {};

        // load from the file
        $.ajax({
            url      : locale,
            type     : "GET",
            dataType : "JSON",
            async    : false,
            cache    : false,
            success  : function (data, status, xhr) {
                w2utils.settings = $.extend(true, w2utils.settings, data);
                // apply translation to some prototype functions
                var p = w2obj.grid.prototype;
                for (var b in p.buttons) { // buttons is an object
                    p.buttons[b].caption = w2utils.lang(p.buttons[b].caption);
                    p.buttons[b].hint    = w2utils.lang(p.buttons[b].hint);
                }
                p.msgDelete  = w2utils.lang(p.msgDelete);
                p.msgNotJSON = w2utils.lang(p.msgNotJSON);
                p.msgRefresh = w2utils.lang(p.msgRefresh);
            },
            error    : function (xhr, status, msg) {
                console.log('ERROR: Cannot load locale '+ locale);
            }
        });
    }

    function scrollBarSize () {
        if (tmp.scrollBarSize) return tmp.scrollBarSize;
        var html =
            '<div id="_scrollbar_width" style="position: absolute; top: -300px; width: 100px; height: 100px; overflow-y: scroll;">'+
            '    <div style="height: 120px">1</div>'+
            '</div>';
        $('body').append(html);
        tmp.scrollBarSize = 100 - $('#_scrollbar_width > div').width();
        $('#_scrollbar_width').remove();
        if (String(navigator.userAgent).indexOf('MSIE') >= 0) tmp.scrollBarSize  = tmp.scrollBarSize / 2; // need this for IE9+
        return tmp.scrollBarSize;
    }


    function checkName (params, component) { // was w2checkNameParam
        if (!params || typeof params.name === 'undefined') {
            console.log('ERROR: The parameter "name" is required but not supplied in $().'+ component +'().');
            return false;
        }
        if (typeof w2ui[params.name] !== 'undefined') {
            console.log('ERROR: The parameter "name" is not unique. There are other objects already created with the same name (obj: '+ params.name +').');
            return false;
        }
        if (!w2utils.isAlphaNumeric(params.name)) {
            console.log('ERROR: The parameter "name" has to be alpha-numeric (a-z, 0-9, dash and underscore). ');
            return false;
        }
        return true;
    }

    function checkUniqueId (id, items, itemsDecription, objName) { // was w2checkUniqueId
        if (!$.isArray(items)) items = [items];
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === id) {
                console.log('ERROR: The parameter "id='+ id +'" is not unique within the current '+ itemsDecription +'. (obj: '+ objName +')');
                return false;
            }
        }
        return true;
    }

    function parseRoute(route) {
        var keys = [];
        var path = route
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
        return {
            path  : new RegExp('^' + path + '$', 'i'),
            keys  : keys
        };
    }

    function cssPrefix(field, value, returnString) {
        var css    = {};
        var newCSS = {};
        var ret    = '';
        if (!$.isPlainObject(field)) {
            css[field] = value;
        } else {
            css = field;
            if (value === true) returnString = true;
        }
        for (var c in css) {
            newCSS[c] = css[c];
            newCSS['-webkit-'+c] = css[c];
            newCSS['-moz-'+c]    = css[c].replace('-webkit-', '-moz-');
            newCSS['-ms-'+c]     = css[c].replace('-webkit-', '-ms-');
            newCSS['-o-'+c]      = css[c].replace('-webkit-', '-o-');
        }
        if (returnString === true) {
            for (var c in newCSS) {
                ret += c + ': ' + newCSS[c] + '; ';
            }
        } else {
            ret = newCSS;
        }
        return ret;
    }

})();

/***********************************************************
*  Generic Event Object
*  --- This object is reused across all other
*  --- widgets in w2ui.
*
*********************************************************/

w2utils.event = {

    on: function (eventData, handler) {
        if (!$.isPlainObject(eventData)) eventData = { type: eventData };
        eventData = $.extend({ type: null, execute: 'before', target: null, onComplete: null }, eventData);

        if (!eventData.type) { console.log('ERROR: You must specify event type when calling .on() method of '+ this.name); return; }
        if (!handler) { console.log('ERROR: You must specify event handler function when calling .on() method of '+ this.name); return; }
        if (!$.isArray(this.handlers)) this.handlers = [];
        this.handlers.push({ event: eventData, handler: handler });
    },

    off: function (eventData, handler) {
        if (!$.isPlainObject(eventData)) eventData = { type: eventData };
        eventData = $.extend({}, { type: null, execute: 'before', target: null, onComplete: null }, eventData);

        if (!eventData.type) { console.log('ERROR: You must specify event type when calling .off() method of '+ this.name); return; }
        if (!handler) { handler = null; }
        // remove handlers
        var newHandlers = [];
        for (var h = 0, len = this.handlers.length; h < len; h++) {
            var t = this.handlers[h];
            if ((t.event.type === eventData.type || eventData.type === '*') &&
                (t.event.target === eventData.target || eventData.target === null) &&
                (t.handler === handler || handler === null))
            {
                // match
            } else {
                newHandlers.push(t);
            }
        }
        this.handlers = newHandlers;
    },

    trigger: function (eventData) {
        var eventData = $.extend({ type: null, phase: 'before', target: null }, eventData, {
            isStopped: false, isCancelled: false,
            preventDefault  : function () { this.isCancelled = true; },
            stopPropagation : function () { this.isStopped   = true; }
        });
        if (eventData.phase === 'before') eventData.onComplete = null;
        var args, fun, tmp;
        if (eventData.target == null) eventData.target = null;
        if (!$.isArray(this.handlers)) this.handlers = [];
        // process events in REVERSE order
        for (var h = this.handlers.length-1; h >= 0; h--) {
            var item = this.handlers[h];
            if ((item.event.type === eventData.type || item.event.type === '*') &&
                (item.event.target === eventData.target || item.event.target === null) &&
                (item.event.execute === eventData.phase || item.event.execute === '*' || item.event.phase === '*'))
            {
                eventData = $.extend({}, item.event, eventData);
                // check handler arguments
                args = [];
                tmp  = new RegExp(/\((.*?)\)/).exec(item.handler);
                if (tmp) args = tmp[1].split(/\s*,\s*/);
                if (args.length === 2) {
                    item.handler.call(this, eventData.target, eventData); // old way for back compatibility
                } else {
                    item.handler.call(this, eventData); // new way
                }
                if (eventData.isStopped === true || eventData.stop === true) return eventData; // back compatibility eventData.stop === true
            }
        }
        // main object events
        var funName = 'on' + eventData.type.substr(0,1).toUpperCase() + eventData.type.substr(1);
        if (eventData.phase === 'before' && typeof this[funName] === 'function') {
            fun = this[funName];
            // check handler arguments
            args = [];
            tmp  = new RegExp(/\((.*?)\)/).exec(fun);
            if (tmp) args = tmp[1].split(/\s*,\s*/);
            if (args.length === 2) {
                fun.call(this, eventData.target, eventData); // old way for back compatibility
            } else {
                fun.call(this, eventData); // new way
            }
            if (eventData.isStopped === true || eventData.stop === true) return eventData; // back compatibility eventData.stop === true
        }
        // item object events
        if (eventData.object != null && eventData.phase === 'before' &&
            typeof eventData.object[funName] === 'function')
        {
            fun = eventData.object[funName];
            // check handler arguments
            args = [];
            tmp  = new RegExp(/\((.*?)\)/).exec(fun);
            if (tmp) args = tmp[1].split(/\s*,\s*/);
            if (args.length === 2) {
                fun.call(this, eventData.target, eventData); // old way for back compatibility
            } else {
                fun.call(this, eventData); // new way
            }
            if (eventData.isStopped === true || eventData.stop === true) return eventData;
        }
        // execute onComplete
        if (eventData.phase === 'after' && typeof eventData.onComplete === 'function') eventData.onComplete.call(this, eventData);

        return eventData;
    }
};

/***********************************************************
*  Common Keyboard Handler. Supported in
*  - grid
*  - sidebar
*  - popup
*
*********************************************************/

w2utils.keyboard = (function (obj) {
    // private scope
    var w2ui_name = null;

    obj.active    = active;
    obj.clear     = clear;

    init();
    return obj;

    function init() {
        $(document).on('keydown', keydown);
        $(document).on('mousedown', mousedown);
    }

    function keydown (event) {
        var tag = event.target.tagName;
        if ($.inArray(tag, ['INPUT', 'SELECT', 'TEXTAREA']) !== -1) return;
        if ($(event.target).prop('contenteditable') === 'true') return;
        if (!w2ui_name) return;
        // pass to appropriate widget
        if (w2ui[w2ui_name] && typeof w2ui[w2ui_name].keydown === 'function') {
            w2ui[w2ui_name].keydown.call(w2ui[w2ui_name], event);
        }
    }

    function mousedown (event) {
        var tag = event.target.tagName;
        var els = $(event.target).parents('.w2ui-grid, .w2ui-sidebar, .w2ui-popup, .w2ui-keyboard');
        if (els.length > 0) {
            var name = els.attr('name');
            var obj = w2ui[name];
            if (name != w2ui_name) {
                if (clear(event) === false) return; // event cancelled
                if (active(name, event) === false) return; // event cancelled
            }
            if (obj && obj.keyboard) w2ui_name = name;
        } else {
            clear(event);
        }
    }

    function active (new_w2ui_name, event) {
        if (new_w2ui_name == null) return w2ui_name;
        var obj = w2ui[new_w2ui_name];
        if (obj && obj.focus) {
            if (obj.focus.call(obj, event) === false) return false;
        }
        w2ui_name = new_w2ui_name;
        return true;
    }

    function clear (event) {
        if (w2ui_name != null && w2ui[w2ui_name] && w2ui[w2ui_name].blur) {
            if (w2ui[w2ui_name].blur.call(w2ui[w2ui_name], event) === false) return false;
        }
        w2ui_name = null;
        return true;
    }

})({});

/***********************************************************
*  Commonly used plugins
*  --- used primarily in grid and form
*
*********************************************************/

(function () {

    $.fn.w2render = function (name) {
        if ($(this).length > 0) {
            if (typeof name === 'string' && w2ui[name]) w2ui[name].render($(this)[0]);
            if (typeof name === 'object') name.render($(this)[0]);
        }
    };

    $.fn.w2destroy = function (name) {
        if (!name && this.length > 0) name = this.attr('name');
        if (typeof name === 'string' && w2ui[name]) w2ui[name].destroy();
        if (typeof name === 'object') name.destroy();
    };

    $.fn.w2marker = function () {
        var str = Array.prototype.slice.call(arguments, 0);
        if (str.length == 0 || !str[0]) { // remove marker
            return $(this).each(clearMarkedText);
        } else { // add marker
            return $(this).each(function (index, el) {
                clearMarkedText(index, el);
                for (var s = 0; s < str.length; s++) {
                    var tmp = str[s];
                    if (typeof tmp !== 'string') tmp = String(tmp);
                    // escape regex special chars
                    tmp = tmp.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&").replace(/&/g, '&amp;').replace(/</g, '&gt;').replace(/>/g, '&lt;');
                    var regex = new RegExp(tmp + '(?!([^<]+)?>)', "gi"); // only outside tags
                    el.innerHTML = el.innerHTML.replace(regex, replaceValue);
                }
                function replaceValue(matched) { // mark new
                    return '<span class="w2ui-marker">' + matched + '</span>';
                }
            });
        }

        function clearMarkedText(index, el) {
            while (el.innerHTML.indexOf('<span class="w2ui-marker">') != -1) {
                el.innerHTML = el.innerHTML.replace(/\<span class=\"w2ui\-marker\"\>(.*)\<\/span\>/ig, '$1'); // unmark
            }
        }
    };

    // -- w2tag - appears on the right side from element, there can be multiple on screen at a time

    $.fn.w2tag = function (text, options) {
        if (!$.isPlainObject(options)) options = {};
        if (!$.isPlainObject(options.css)) options.css = {};
        if (typeof options['class'] === 'undefined') options['class'] = '';
        // remove all tags
        if ($(this).length === 0) {
            $('.w2ui-tag').each(function (index, elem) {
                var opt = $(elem).data('options');
                if (opt == null) opt = {};
                $($(elem).data('taged-el')).removeClass( opt['class'] );
                clearInterval($(elem).data('timer'));
                $(elem).remove();
            });
            return;
        }
        return $(this).each(function (index, el) {
            // show or hide tag
            var tagOrigID = (options.id ? options.id : el.id);
            var tagID = w2utils.escapeId(tagOrigID);
            if (text === '' || text == null) {
                $('#w2ui-tag-'+tagID).css('opacity', 0);
                // remmove element
                clearInterval($('#w2ui-tag-'+tagID).data('timer'));
                $('#w2ui-tag-'+tagID).remove();
            } else {
                // remove elements
                clearInterval($('#w2ui-tag-'+tagID).data('timer'));
                $('#w2ui-tag-'+tagID).remove();
                // insert
                $('body').append(
                    '<div id="w2ui-tag-'+ tagOrigID +'" class="w2ui-tag '+ ($(el).parents('.w2ui-popup').length > 0 ? 'w2ui-tag-popup' : '') +
                    '" style=""></div>');

                var timer = setInterval(function () {
                    // monitor if destroyed
                    if ($(el).length === 0 || ($(el).offset().left === 0 && $(el).offset().top === 0)) {
                        clearInterval($('#w2ui-tag-'+tagID).data('timer'));
                        tmp_hide();
                        return;
                    }
                    // monitor if moved
                    if ($('#w2ui-tag-'+tagID).data('position') !== ($(el).offset().left + el.offsetWidth) + 'x' + $(el).offset().top) {
                        $('#w2ui-tag-'+tagID).css(w2utils.cssPrefix({ 'transition': '.2s' })).css({
                            left: ($(el).offset().left + el.offsetWidth + (options.left ? options.left : 0)) + 'px',
                            top : ($(el).offset().top + (options.top ? options.top : 0)) + 'px'
                        }).data('position', ($(el).offset().left + el.offsetWidth) + 'x' + $(el).offset().top);
                    }
                }, 100);
                setTimeout(function () {
                    if (!$(el).offset()) return;
                    $('#w2ui-tag-'+tagID).css({
                        opacity: '1',
                        left: ($(el).offset().left + el.offsetWidth + (options.left ? options.left : 0)) + 'px',
                        top : ($(el).offset().top + (options.top ? options.top : 0)) + 'px'
                    }).html('<div style="margin-top: -2px 0px 0px -2px; white-space: nowrap;"> <div class="w2ui-tag-body">'+ text +'</div> </div>')
                    .data('text', text)
                    .data('taged-el', el)
                    .data('options', options)
                    .data('position', ($(el).offset().left + el.offsetWidth) + 'x' + $(el).offset().top)
                    .data('timer', timer);
                    $(el).off('keypress', tmp_hide).on('keypress', tmp_hide).off('change', tmp_hide).on('change', tmp_hide)
                        .css(options.css).addClass(options['class']);
                    if (typeof options.onShow === 'function') options.onShow();
                }, 1);
                var originalCSS = '';
                if ($(el).length > 0) originalCSS = $(el)[0].style.cssText;
                // bind event to hide it
                function tmp_hide() {
                    $tag = $('#w2ui-tag-'+tagID);
                    if ($tag.length <= 0) return;
                    clearInterval($tag.data('timer'));
                    $tag.remove();
                    $(el).off('keypress', tmp_hide).removeClass(options['class']);
                    if ($(el).length > 0) $(el)[0].style.cssText = originalCSS;
                    if (typeof options.onHide === 'function') options.onHide();
                }
            }
        });
    };

    // w2overlay - appears under the element, there can be only one at a time

    $.fn.w2overlay = function (html, options) {
        var obj  = this;
        var name = '';
        var defaults = {
            name      : null,      // it not null, then allows multiple concurent overlays
            html      : '',        // html text to display
            align     : 'none',    // can be none, left, right, both
            left      : 0,         // offset left
            top       : 0,         // offset top
            tipLeft   : 30,        // tip offset left
            width     : 0,         // fixed width
            height    : 0,         // fixed height
            maxWidth  : null,      // max width if any
            maxHeight : null,      // max height if any
            style     : '',        // additional style for main div
            'class'   : '',        // additional class name for main div
            onShow    : null,      // event on show
            onHide    : null,      // event on hide
            openAbove : false,     // show abover control
            tmp       : {}
        };
        if (arguments.length == 1) {
            if (typeof html == 'object') {
                options = html;
            } else {
                options = { html: html };
            }
        }
        if (arguments.length == 2) options.html = html;
        if (!$.isPlainObject(options)) options = {};
        options = $.extend({}, defaults, options);
        if (options.name) name = '-' + options.name;
        // if empty then hide
        var tmp_hide;
        if (this.length === 0 || options.html === '' || options.html == null) {
            if ($('#w2ui-overlay'+ name).length > 0) {
                tmp_hide = $('#w2ui-overlay'+ name)[0].hide;
                if (typeof tmp_hide === 'function') tmp_hide();
            } else {
            $('#w2ui-overlay'+ name).remove();
            }
            return $(this);
        }
        if ($('#w2ui-overlay'+ name).length > 0) {
            tmp_hide = $('#w2ui-overlay'+ name)[0].hide;
            $(document).off('click', tmp_hide);
            if (typeof tmp_hide === 'function') tmp_hide();
        }
        $('body').append(
            '<div id="w2ui-overlay'+ name +'" style="display: none"'+
            '        class="w2ui-reset w2ui-overlay '+ ($(this).parents('.w2ui-popup, .w2ui-overlay-popup').length > 0 ? 'w2ui-overlay-popup' : '') +'">'+
            '    <style></style>'+
            '    <div style="'+ options.style +'" class="'+ options['class'] +'"></div>'+
            '</div>'
        );
        // init
        var div1 = $('#w2ui-overlay'+ name);
        var div2 = div1.find(' > div');
        div2.html(options.html);
        // pick bg color of first div
        var bc  = div2.css('background-color');
        if (bc != null && bc !== 'rgba(0, 0, 0, 0)' && bc !== 'transparent') div1.css('background-color', bc);

        div1.data('element', obj.length > 0 ? obj[0] : null)
            .data('options', options)
            .data('position', $(obj).offset().left + 'x' + $(obj).offset().top)
            .fadeIn('fast')
            .on('click', function (event) {
                // if there is label for input, it will produce 2 click events
                if (event.target.tagName == 'LABEL') event.stopPropagation();
            })
            .on('mousedown', function (event) {
                $('#w2ui-overlay'+ name).data('keepOpen', true);
                if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(event.target.tagName) == -1) event.preventDefault();
            });
        div1[0].hide   = hide;
        div1[0].resize = resize;

        // need time to display
        resize();
        setTimeout(function () {
            resize();
            $(document).off('click', hide).on('click', hide);
            if (typeof options.onShow === 'function') options.onShow();
        }, 10);

        monitor();
        return $(this);

        // monitor position
        function monitor() {
            var tmp = $('#w2ui-overlay'+ name);
            if (tmp.data('element') !== obj[0]) return; // it if it different overlay
            if (tmp.length === 0) return;
            var pos = $(obj).offset().left + 'x' + $(obj).offset().top;
            if (tmp.data('position') !== pos) {
                hide();
            } else {
                setTimeout(monitor, 250);
            }
        }

        // click anywhere else hides the drop down
        function hide () {
            var div1 = $('#w2ui-overlay'+ name);
            if (div1.data('keepOpen') === true) {
                div1.removeData('keepOpen');
                return;
            }
            var result;
            if (typeof options.onHide === 'function') result = options.onHide();
            if (result === false) return;
            div1.remove();
            $(document).off('click', hide);
            clearInterval(div1.data('timer'));
        }

        function resize () {
            var div1 = $('#w2ui-overlay'+ name);
            var div2 = div1.find(' > div');
            // if goes over the screen, limit height and width
            if (div1.length > 0) {
                div2.height('auto').width('auto');
                // width/height
                var overflowX = false;
                var overflowY = false;
                var h = div2.height();
                var w = div2.width();
                if (options.width && options.width < w) w = options.width;
                if (w < 30) w = 30;
                // if content of specific height
                if (options.tmp.contentHeight) {
                    h = parseInt(options.tmp.contentHeight);
                    div2.height(h);
                    setTimeout(function () {
                        if (h > div2.find('div.menu > table').height()) {
                            div2.find('div.menu').css('overflow-y', 'hidden');
                        }
                    }, 1);
                    setTimeout(function () { div2.find('div.menu').css('overflow-y', 'auto'); }, 10);
                }
                if (options.tmp.contentWidth) {
                    w = parseInt(options.tmp.contentWidth);
                    div2.width(w);
                    setTimeout(function () {
                        if (w > div2.find('div.menu > table').width()) {
                            div2.find('div.menu').css('overflow-x', 'hidden');
                        }
                    }, 1);
                    setTimeout(function () { div2.find('div.menu').css('overflow-x', 'auto'); }, 10);
                }
                // alignment
                switch (options.align) {
                    case 'both':
                        options.left = 17;
                        if (options.width === 0) options.width = w2utils.getSize($(obj), 'width');
                        break;
                    case 'left':
                        options.left = 17;
                        break;
                    case 'right':
                        options.tipLeft = w - 45;
                        options.left = w2utils.getSize($(obj), 'width') - w + 10;
                        break;
                }
                // adjust position
                var tmp = (w - 17) / 2;
                var boxLeft  = options.left;
                var boxWidth = options.width;
                var tipLeft  = options.tipLeft;
                if (w === 30 && !boxWidth) boxWidth = 30; else boxWidth = (options.width ? options.width : 'auto');
                if (tmp < 25) {
                    boxLeft = 25 - tmp;
                    tipLeft = Math.floor(tmp);
                }
                // Y coord
                div1.css({
                    top         : (obj.offset().top + w2utils.getSize(obj, 'height') + options.top + 7) + 'px',
                    left        : ((obj.offset().left > 25 ? obj.offset().left : 25) + boxLeft) + 'px',
                    'min-width' : boxWidth,
                    'min-height': (options.height ? options.height : 'auto')
                });
                // $(window).height() - has a problem in FF20
                var maxHeight = window.innerHeight + $(document).scrollTop() - div2.offset().top - 7;
                var maxWidth  = window.innerWidth + $(document).scrollLeft() - div2.offset().left - 7;
                if ((maxHeight > -50 && maxHeight < 210) || options.openAbove === true) {
                    // show on top
                    maxHeight = div2.offset().top - $(document).scrollTop() - 7;
                    if (options.maxHeight && maxHeight > options.maxHeight) maxHeight = options.maxHeight;
                    if (h > maxHeight) {
                        overflowY = true;
                        div2.height(maxHeight).width(w).css({ 'overflow-y': 'auto' });
                        h = maxHeight;
                    }
                    div1.css('top', ($(obj).offset().top - h - 24 + options.top) + 'px');
                    div1.find('>style').html(
                        '#w2ui-overlay'+ name +':before { display: none; margin-left: '+ parseInt(tipLeft) +'px; }'+
                        '#w2ui-overlay'+ name +':after { display: block; margin-left: '+ parseInt(tipLeft) +'px; }'
                    );
                } else {
                    // show under
                    if (options.maxHeight && maxHeight > options.maxHeight) maxHeight = options.maxHeight;
                    if (h > maxHeight) {
                        overflowY = true;
                        div2.height(maxHeight).width(w).css({ 'overflow-y': 'auto' });
                    }
                    div1.find('>style').html(
                        '#w2ui-overlay'+ name +':before { display: block; margin-left: '+ parseInt(tipLeft) +'px; }'+
                        '#w2ui-overlay'+ name +':after { display: none; margin-left: '+ parseInt(tipLeft) +'px; }'
                    );
                }
                // check width
                w = div2.width();
                maxWidth = window.innerWidth + $(document).scrollLeft() - div2.offset().left - 7;
                if (options.maxWidth && maxWidth > options.maxWidth) maxWidth = options.maxWidth;
                if (w > maxWidth && options.align !== 'both') {
                    options.align = 'right';
                    setTimeout(function () { resize(); }, 1);
                }
                // check scroll bar
                if (overflowY && overflowX) div2.width(w + w2utils.scrollBarSize() + 2);
            }
        }
    };

    $.fn.w2menu = function (menu, options) {
        /*
        ITEM STRUCTURE
            item : {
                id       : null,
                text     : '',
                style    : '',
                img      : '',
                icon     : '',
                count    : '',
                hidden   : false,
                disabled : false
                ...
            }
        */
        var defaults = {
            index      : null,        // current selected
            items      : [],
            render     : null,
            msgNoItems : 'No items',
            onSelect   : null,
            tmp        : {}
        };
        var obj  = this;
        var name = '';
        if (menu === 'refresh') {
            // if not show - call blur
            if ($('#w2ui-overlay'+ name).length > 0) {
                options = $.extend($.fn.w2menuOptions, options);
                var scrTop = $('#w2ui-overlay'+ name +' div.menu').scrollTop();
                $('#w2ui-overlay'+ name +' div.menu').html(getMenuHTML());
                $('#w2ui-overlay'+ name +' div.menu').scrollTop(scrTop);
                setTimeout(function () { mresize(); }, 1);
            } else {
                $(this).w2menu(options);
            }
        } else if (menu === 'refresh-index') {
            var $menu  = $('#w2ui-overlay'+ name +' div.menu');
            var cur    = $menu.find('tr[index='+ options.index +']');
            var scrTop = $menu.scrollTop();
            $menu.find('tr.w2ui-selected').removeClass('w2ui-selected'); // clear all
            cur.addClass('w2ui-selected'); // select current
            // scroll into view
            if (cur.length > 0) {
                var top    = cur[0].offsetTop - 5; // 5 is margin top
                var height = $menu.height();
                $menu.scrollTop(scrTop);
                if (top < scrTop || top + cur.height() > scrTop + height) {
                    $menu.animate({ 'scrollTop': top - (height - cur.height() * 2) / 2 }, 200, 'linear');
                }
            }
            return;
        } else {
            if (arguments.length === 1) options = menu; else options.items = menu;
            if (typeof options !== 'object') options = {};
            options = $.extend({}, defaults, options);
            $.fn.w2menuOptions = options;
            if (options.name) name = '-' + options.name;
            if (typeof options.select === 'function' && typeof options.onSelect !== 'function') options.onSelect = options.select;
            if (typeof options.onRender === 'function' && typeof options.render !== 'function') options.render = options.onRender;
            // since only one overlay can exist at a time
            $.fn.w2menuHandler = function (event, index) {
                if (typeof options.onSelect === 'function') {
                    // need time so that menu first hides
                    setTimeout(function () {
                        options.onSelect({
                            index : index,
                            item  : options.items[index],
                            originalEvent: event
                        });
                    }, 10);
                }
                // do not uncomment (or enum search type is not working in grid)
                // setTimeout(function () { $(document).click(); }, 50);
            };
            var html = '';
            if (options.search) {
                html +=
                    '<div style="position: absolute; top: 0px; height: 40px; left: 0px; right: 0px; border-bottom: 1px solid silver; background-color: #ECECEC; padding: 8px 5px;">'+
                    '    <div class="w2ui-icon icon-search" style="position: absolute; margin-top: 4px; margin-left: 6px; width: 11px; background-position: left !important;"></div>'+
                    '    <input id="menu-search" type="text" style="width: 100%; outline: none; padding-left: 20px;" onclick="event.stopPropagation();">'+
                    '</div>';
                options.style += ';background-color: #ECECEC';
                options.index = 0;
                for (var i = 0; i < options.items.length; i++) options.items[i].hidden = false;
            }
            html += '<div class="menu" style="position: absolute; top: '+ (options.search ? 40 : 0) + 'px; bottom: 0px; width: 100%; overflow: auto;">' +
                        getMenuHTML() +
                    '</div>';
            var ret = $(this).w2overlay(html, options);
            setTimeout(function () {
                $('#w2ui-overlay'+ name +' #menu-search')
                    .on('keyup', change)
                    .on('keydown', function (event) {
                        // cancel tab key
                        if (event.keyCode === 9) { event.stopPropagation(); event.preventDefault(); }
                    });
                if (options.search) {
                    if (['text', 'password'].indexOf($(obj)[0].type) != -1 || $(obj)[0].tagName == 'texarea') return;
                    $('#w2ui-overlay'+ name +' #menu-search').focus();
                }
            }, 200);
            mresize();
            return ret;
        }

        function mresize() {
            setTimeout(function () {
                // show selected
                $('#w2ui-overlay'+ name +' tr.w2ui-selected').removeClass('w2ui-selected');
                var cur    = $('#w2ui-overlay'+ name +' tr[index='+ options.index +']');
                var scrTop = $('#w2ui-overlay'+ name +' div.menu').scrollTop();
                cur.addClass('w2ui-selected');
                if (options.tmp) options.tmp.contentHeight = $('#w2ui-overlay'+ name +' table').height() + (options.search ? 50 : 10);
                if (options.tmp) options.tmp.contentWidth  = $('#w2ui-overlay'+ name +' table').width();
                if ($('#w2ui-overlay'+ name).length > 0) $('#w2ui-overlay'+ name)[0].resize();
                // scroll into view
                if (cur.length > 0) {
                    var top    = cur[0].offsetTop - 5; // 5 is margin top
                    var el     = $('#w2ui-overlay'+ name +' div.menu');
                    var height = el.height();
                    $('#w2ui-overlay'+ name +' div.menu').scrollTop(scrTop);
                    if (top < scrTop || top + cur.height() > scrTop + height) {
                        $('#w2ui-overlay'+ name +' div.menu').animate({ 'scrollTop': top - (height - cur.height() * 2) / 2 }, 200, 'linear');
                    }
                }
            }, 1);
        }

        function change(event) {
            var search  = this.value;
            var key     = event.keyCode;
            var cancel  = false;
            switch (key) {
                case 13: // enter
                    $('#w2ui-overlay'+ name).remove();
                    $.fn.w2menuHandler(event, options.index);
                    break;
                case 9:  // tab
                case 27: // escape
                    $('#w2ui-overlay'+ name).remove();
                    $.fn.w2menuHandler(event, -1);
                    break;
                case 38: // up
                    options.index = w2utils.isInt(options.index) ? parseInt(options.index) : 0;
                    options.index--;
                    while (options.index > 0 && options.items[options.index].hidden) options.index--;
                    if (options.index === 0 && options.items[options.index].hidden) {
                        while (options.items[options.index] && options.items[options.index].hidden) options.index++;
                    }
                    if (options.index < 0) options.index = 0;
                    cancel = true;
                    break;
                case 40: // down
                    options.index = w2utils.isInt(options.index) ? parseInt(options.index) : 0;
                    options.index++;
                    while (options.index < options.items.length-1 && options.items[options.index].hidden) options.index++;
                    if (options.index === options.items.length-1 && options.items[options.index].hidden) {
                        while (options.items[options.index] && options.items[options.index].hidden) options.index--;
                    }
                    if (options.index >= options.items.length) options.index = options.items.length - 1;
                    cancel = true;
                    break;
            }
            // filter
            if (!cancel) {
                var shown  = 0;
                for (var i = 0; i < options.items.length; i++) {
                    var item = options.items[i];
                    var prefix = '';
                    var suffix = '';
                    if (['is', 'begins with'].indexOf(options.match) !== -1) prefix = '^';
                    if (['is', 'ends with'].indexOf(options.match) !== -1) suffix = '$';
                    try {
                        var re = new RegExp(prefix + search + suffix, 'i');
                        if (re.test(item.text) || item.text === '...') item.hidden = false; else item.hidden = true;
                    } catch (e) {}
                    // do not show selected items
                    if (obj.type === 'enum' && $.inArray(item.id, ids) !== -1) item.hidden = true;
                    if (item.hidden !== true) shown++;
                }
                options.index = 0;
                while (options.index < options.items.length-1 && options.items[options.index].hidden) options.index++;
                if (shown <= 0) options.index = -1;
            }
            $(obj).w2menu('refresh', options);
            mresize();
        }

        function getMenuHTML () {
            if (options.spinner) {
                return  '<table class="w2ui-drop-menu"><tr><td style="padding: 5px 10px 10px 10px; text-align: center">'+
                        '    <div class="w2ui-spinner" style="width: 18px; height: 18px; position: relative; top: 5px;"></div> '+
                        '    <div style="display: inline-block; padding: 3px; color: #999;">'+ w2utils.lang('Loading...') +'</div>'+
                        '</td></tr></table>';
            }
            var count        = 0;
            var menu_html    = '<table cellspacing="0" cellpadding="0" class="w2ui-drop-menu">';
            var img = null, icon = null;
            for (var f = 0; f < options.items.length; f++) {
                var mitem = options.items[f];
                if (typeof mitem === 'string') {
                    mitem = { id: mitem, text: mitem };
                } else {
                    if (mitem.text != null && mitem.id == null) mitem.id = mitem.text;
                    if (mitem.text == null && mitem.id != null) mitem.text = mitem.id;
                    if (mitem.caption != null) mitem.text = mitem.caption;
                    img  = mitem.img;
                    icon = mitem.icon;
                    if (img  == null) img  = null;
                    if (icon == null) icon = null;
                }
                if (mitem.hidden !== true) {
                    var imgd = '';
                    var txt = mitem.text;
                    if (typeof options.render === 'function') txt = options.render(mitem, options);
                    if (img)  imgd = '<td class="menu-icon"><div class="w2ui-tb-image w2ui-icon '+ img +'"></div></td>';
                    if (icon) imgd = '<td class="menu-icon" align="center"><span class="w2ui-icon '+ icon +'"></span></td>';
                    // render only if non-empty
                    if (typeof txt !== 'undefined' && txt !== '' && !(/^-+$/.test(txt))) {
                        var bg = (count % 2 === 0 ? 'w2ui-item-even' : 'w2ui-item-odd');
                        if (options.altRows !== true) bg = '';
                        var colspan = 1;
                        if (imgd == '') colspan++;
                        if (mitem.count == null) colspan++;
                        menu_html +=
                            '<tr index="'+ f + '" style="'+ (mitem.style ? mitem.style : '') +'" '+ (mitem.hint ? 'title="'+ mitem.hint +'"' : '') +
                            '        class="'+ bg +' '+ (options.index === f ? 'w2ui-selected' : '') + ' ' + (mitem.disabled === true ? 'w2ui-disabled' : '') +'"'+
                            '        onmousedown="$(this).parent().find(\'tr\').removeClass(\'w2ui-selected\'); $(this).addClass(\'w2ui-selected\');"'+
                            '        onclick="event.stopPropagation(); '+
                            '               if ('+ (mitem.disabled === true ? 'true' : 'false') + ') return;'+
                            '               $(\'#w2ui-overlay'+ name +'\').remove(); '+
                            '               $.fn.w2menuHandler(event, \''+ f +'\');">'+
                                imgd +
                            '   <td class="menu-text" colspan="'+ colspan +'">'+ txt +'</td>'+
                            '   <td class="menu-count">'+ (mitem.count != null ? '<span>' + mitem.count + '</span>' : '') + '</td>' +
                            '</tr>';
                        count++;
                    } else {
                        // horizontal line
                        menu_html += '<tr><td colspan="2" style="padding: 6px; pointer-events: none"><div style="border-top: 1px solid silver;"></div></td></tr>';
                    }
                }
                options.items[f] = mitem;
            }
            if (count === 0) {
                menu_html += '<tr><td style="padding: 13px; color: #999; text-align: center">'+ options.msgNoItems +'</div></td></tr>';
            }
            menu_html += "</table>";
            return menu_html;
        }
    };
})();
