/************************************************************************
*   Part of w2ui 2.0 library
*   - Dependencies: jQuery
*        - w2ui             - object that will contain all widgets
*        - w2utils          - basic utilities
*        - w2utils.event    - generic event object
*
* == TODO ==
*   - overlay should be displayed where more space (on top or on bottom)
*   - add maxHeight for the w2menu
*   - add w2utils.lang wrap for all captions in all buttons.
*   - message.options - should have actions
*
* == 2.0 changes
*   - normMenu
*   - w2utils.message - returns a promise
*   - bindEvents - common method to avoid inline events
*   - unescapeId
*   - settings.warn_missing_translation
*
************************************************/
import { w2event } from './w2event.js'
import { w2locale } from './w2locale.js'

let w2ui    = {}
let w2utils = (($) => {
    let tmp = {} // for some temp variables
    return {
        version  : '2.0.x',
        settings : $.extend(true, {}, w2locale, {
            'dataType'                  : 'HTTPJSON', // can be HTTP, HTTPJSON, RESTFULL, RESTFULLJSON, JSON (case sensitive)
            'dateStartYear'             : 1950,  // start year for date-picker
            'dateEndYear'               : 2030,  // end year for date picker
            'macButtonOrder'            : false, // if true, Yes on the right side
            'warn_missing_translation'  : true,  // call console.warn if lang() encounters a missing translation
        }),
        isBin,
        isInt,
        isFloat,
        isMoney,
        isHex,
        isAlphaNumeric,
        isEmail,
        isIpAddress,
        isDate,
        isTime,
        isDateTime,
        age,
        interval,
        date,
        formatSize,
        formatNumber,
        formatDate,
        formatTime,
        formatDateTime,
        stripTags,
        encodeTags,
        decodeTags,
        escapeId,
        unescapeId,
        normMenu,
        bindEvents,
        base64encode,
        base64decode,
        md5,
        transition,
        lock,
        unlock,
        message,
        naturalCompare,
        template_replacer,
        lang,
        locale,
        getSize,
        getStrWidth,
        scrollBarSize,
        checkName,
        checkUniqueId,
        parseRoute,
        cssPrefix,
        parseColor,
        hsv2rgb,
        rgb2hsv,
        tooltip,
        getCursorPosition,
        setCursorPosition,
        testLocalStorage,
        hasLocalStorage: testLocalStorage(),
        // some internal variables
        isIOS : ((navigator.userAgent.toLowerCase().indexOf('iphone') !== -1 ||
                 navigator.userAgent.toLowerCase().indexOf('ipod') !== -1 ||
                 navigator.userAgent.toLowerCase().indexOf('ipad') !== -1 ||
                 navigator.userAgent.toLowerCase().indexOf('mobile') !== -1 ||
                 navigator.userAgent.toLowerCase().indexOf('android') !== -1)
                 ? true : false),
        isIE : ((navigator.userAgent.toLowerCase().indexOf('msie') !== -1 ||
                 navigator.userAgent.toLowerCase().indexOf('trident') !== -1 )
                 ? true : false),
        isSafari : (/^((?!chrome|android).)*safari/i).test(navigator.userAgent),
    }

    function isBin (val) {
        let re = /^[0-1]+$/
        return re.test(val)
    }

    function isInt (val) {
        let re = /^[-+]?[0-9]+$/
        return re.test(val)
    }

    function isFloat (val) {
        if (typeof val === 'string') val = val.replace(/\s+/g, '').replace(w2utils.settings.groupSymbol, '').replace(w2utils.settings.decimalSymbol, '.')
        return (typeof val === 'number' || (typeof val === 'string' && val !== '')) && !isNaN(Number(val))
    }

    function isMoney (val) {
        if (typeof val === 'object' || val === '') return false
        if(isFloat(val)) return true
        let se = w2utils.settings
        let re = new RegExp('^'+ (se.currencyPrefix ? '\\' + se.currencyPrefix + '?' : '') +
                            '[-+]?'+ (se.currencyPrefix ? '\\' + se.currencyPrefix + '?' : '') +
                            '[0-9]*[\\'+ se.decimalSymbol +']?[0-9]+'+ (se.currencySuffix ? '\\' + se.currencySuffix + '?' : '') +'$', 'i')
        if (typeof val === 'string') {
            val = val.replace(new RegExp(se.groupSymbol, 'g'), '')
        }
        return re.test(val)
    }

    function isHex (val) {
        let re = /^(0x)?[0-9a-fA-F]+$/
        return re.test(val)
    }

    function isAlphaNumeric (val) {
        let re = /^[a-zA-Z0-9_-]+$/
        return re.test(val)
    }

    function isEmail (val) {
        let email = /^[a-zA-Z0-9._%\-+]+@[а-яА-Яa-zA-Z0-9.-]+\.[а-яА-Яa-zA-Z]+$/
        return email.test(val)
    }

    function isIpAddress (val) {
        let re = new RegExp('^' +
                            '((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}' +
                            '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)' +
                            '$')
        return re.test(val)
    }

    function isDate (val, format, retDate) {
        if (!val) return false

        let dt = 'Invalid Date'
        let month, day, year

        if (format == null) format = w2utils.settings.dateFormat

        if (typeof val.getFullYear === 'function') { // date object
            year  = val.getFullYear()
            month = val.getMonth() + 1
            day   = val.getDate()
        } else if (parseInt(val) == val && parseInt(val) > 0) {
            val   = new Date(parseInt(val))
            year  = val.getFullYear()
            month = val.getMonth() + 1
            day   = val.getDate()
        } else {
            val = String(val)
            // convert month formats
            if (new RegExp('mon', 'ig').test(format)) {
                format = format.replace(/month/ig, 'm').replace(/mon/ig, 'm').replace(/dd/ig, 'd').replace(/[, ]/ig, '/').replace(/\/\//g, '/').toLowerCase()
                val    = val.replace(/[, ]/ig, '/').replace(/\/\//g, '/').toLowerCase()
                for (let m = 0, len = w2utils.settings.fullmonths.length; m < len; m++) {
                    let t = w2utils.settings.fullmonths[m]
                    val   = val.replace(new RegExp(t, 'ig'), (parseInt(m) + 1)).replace(new RegExp(t.substr(0, 3), 'ig'), (parseInt(m) + 1))
                }
            }
            // format date
            let tmp  = val.replace(/-/g, '/').replace(/\./g, '/').toLowerCase().split('/')
            let tmp2 = format.replace(/-/g, '/').replace(/\./g, '/').toLowerCase()
            if (tmp2 === 'mm/dd/yyyy') { month = tmp[0]; day = tmp[1]; year = tmp[2] }
            if (tmp2 === 'm/d/yyyy') { month = tmp[0]; day = tmp[1]; year = tmp[2] }
            if (tmp2 === 'dd/mm/yyyy') { month = tmp[1]; day = tmp[0]; year = tmp[2] }
            if (tmp2 === 'd/m/yyyy') { month = tmp[1]; day = tmp[0]; year = tmp[2] }
            if (tmp2 === 'yyyy/dd/mm') { month = tmp[2]; day = tmp[1]; year = tmp[0] }
            if (tmp2 === 'yyyy/d/m') { month = tmp[2]; day = tmp[1]; year = tmp[0] }
            if (tmp2 === 'yyyy/mm/dd') { month = tmp[1]; day = tmp[2]; year = tmp[0] }
            if (tmp2 === 'yyyy/m/d') { month = tmp[1]; day = tmp[2]; year = tmp[0] }
            if (tmp2 === 'mm/dd/yy') { month = tmp[0]; day = tmp[1]; year = tmp[2] }
            if (tmp2 === 'm/d/yy') { month = tmp[0]; day = tmp[1]; year = parseInt(tmp[2]) + 1900 }
            if (tmp2 === 'dd/mm/yy') { month = tmp[1]; day = tmp[0]; year = parseInt(tmp[2]) + 1900 }
            if (tmp2 === 'd/m/yy') { month = tmp[1]; day = tmp[0]; year = parseInt(tmp[2]) + 1900 }
            if (tmp2 === 'yy/dd/mm') { month = tmp[2]; day = tmp[1]; year = parseInt(tmp[0]) + 1900 }
            if (tmp2 === 'yy/d/m') { month = tmp[2]; day = tmp[1]; year = parseInt(tmp[0]) + 1900 }
            if (tmp2 === 'yy/mm/dd') { month = tmp[1]; day = tmp[2]; year = parseInt(tmp[0]) + 1900 }
            if (tmp2 === 'yy/m/d') { month = tmp[1]; day = tmp[2]; year = parseInt(tmp[0]) + 1900 }
        }
        if (!isInt(year)) return false
        if (!isInt(month)) return false
        if (!isInt(day)) return false
        year  = +year
        month = +month
        day   = +day
        dt    = new Date(year, month - 1, day)
        dt.setFullYear(year)
        // do checks
        if (month == null) return false
        if (String(dt) === 'Invalid Date') return false
        if ((dt.getMonth() + 1 !== month) || (dt.getDate() !== day) || (dt.getFullYear() !== year)) return false
        if (retDate === true) return dt; else return true
    }

    function isTime (val, retTime) {
        // Both formats 10:20pm and 22:20
        if (val == null) return false
        let max, am, pm
        // -- process american format
        val      = String(val)
        val      = val.toUpperCase()
        am       = val.indexOf('AM') >= 0
        pm       = val.indexOf('PM') >= 0
        let ampm = (pm || am)
        if (ampm) max = 12; else max = 24
        val = val.replace('AM', '').replace('PM', '').trim()
        // ---
        let tmp = val.split(':')
        let h   = parseInt(tmp[0] || 0), m = parseInt(tmp[1] || 0), s = parseInt(tmp[2] || 0)
        // accept edge case: 3PM is a good timestamp, but 3 (without AM or PM) is NOT:
        if ((!ampm || tmp.length !== 1) && tmp.length !== 2 && tmp.length !== 3) { return false }
        if (tmp[0] === '' || h < 0 || h > max || !this.isInt(tmp[0]) || tmp[0].length > 2) { return false }
        if (tmp.length > 1 && (tmp[1] === '' || m < 0 || m > 59 || !this.isInt(tmp[1]) || tmp[1].length !== 2)) { return false }
        if (tmp.length > 2 && (tmp[2] === '' || s < 0 || s > 59 || !this.isInt(tmp[2]) || tmp[2].length !== 2)) { return false }
        // check the edge cases: 12:01AM is ok, as is 12:01PM, but 24:01 is NOT ok while 24:00 is (midnight; equivalent to 00:00).
        // meanwhile, there is 00:00 which is ok, but 0AM nor 0PM are okay, while 0:01AM and 0:00AM are.
        if (!ampm && max === h && (m !== 0 || s !== 0)) { return false }
        if (ampm && tmp.length === 1 && h === 0) { return false }

        if (retTime === true) {
            if (pm && h !== 12) h += 12 // 12:00pm - is noon
            if (am && h === 12) h += 12 // 12:00am - is midnight
            return {
                hours: h,
                minutes: m,
                seconds: s
            }
        }
        return true
    }

    function isDateTime (val, format, retDate) {
        if (typeof val.getFullYear === 'function') { // date object
            if (retDate !== true) return true
            return val
        }
        let intVal = parseInt(val)
        if (intVal === val) {
            if (intVal < 0) return false
            else if (retDate !== true) return true
            else return new Date(intVal)
        }
        let tmp = String(val).indexOf(' ')
        if (tmp < 0) {
            if (String(val).indexOf('T') < 0 || String(new Date(val)) == 'Invalid Date') return false
            else if (retDate !== true) return true
            else return new Date(val)
        } else {
            if (format == null) format = w2utils.settings.datetimeFormat
            let formats = format.split('|')
            let values  = [val.substr(0, tmp), val.substr(tmp).trim()]
            formats[0]  = formats[0].trim()
            if (formats[1]) formats[1] = formats[1].trim()
            // check
            let tmp1 = w2utils.isDate(values[0], formats[0], true)
            let tmp2 = w2utils.isTime(values[1], true)
            if (tmp1 !== false && tmp2 !== false) {
                if (retDate !== true) return true
                tmp1.setHours(tmp2.hours)
                tmp1.setMinutes(tmp2.minutes)
                tmp1.setSeconds(tmp2.seconds)
                return tmp1
            } else {
                return false
            }
        }
    }

    function age(dateStr) {
        let d1
        if (dateStr === '' || dateStr == null) return ''
        if (typeof dateStr.getFullYear === 'function') { // date object
            d1 = dateStr
        } else if (parseInt(dateStr) == dateStr && parseInt(dateStr) > 0) {
            d1 = new Date(parseInt(dateStr))
        } else {
            d1 = new Date(dateStr)
        }
        if (String(d1) === 'Invalid Date') return ''

        let d2     = new Date()
        let sec    = (d2.getTime() - d1.getTime()) / 1000
        let amount = ''
        let type   = ''
        if (sec < 0) {
            amount = 0
            type   = 'sec'
        } else if (sec < 60) {
            amount = Math.floor(sec)
            type   = 'sec'
            if (sec < 0) { amount = 0; type = 'sec' }
        } else if (sec < 60*60) {
            amount = Math.floor(sec/60)
            type   = 'min'
        } else if (sec < 24*60*60) {
            amount = Math.floor(sec/60/60)
            type   = 'hour'
        } else if (sec < 30*24*60*60) {
            amount = Math.floor(sec/24/60/60)
            type   = 'day'
        } else if (sec < 365*24*60*60) {
            amount = Math.floor(sec/30/24/60/60*10)/10
            type   = 'month'
        } else if (sec < 365*4*24*60*60) {
            amount = Math.floor(sec/365/24/60/60*10)/10
            type   = 'year'
        } else if (sec >= 365*4*24*60*60) {
            // factor in leap year shift (only older then 4 years)
            amount = Math.floor(sec/365.25/24/60/60*10)/10
            type   = 'year'
        }
        return amount + ' ' + type + (amount > 1 ? 's' : '')
    }

    function interval (value) {
        let ret = ''
        if (value < 1000) {
            ret = '< 1 sec'
        } else if (value < 60000) {
            ret = Math.floor(value / 1000) + ' secs'
        } else if (value < 3600000) {
            ret = Math.floor(value / 60000) + ' mins'
        } else if (value < 86400000) {
            ret = Math.floor(value / 3600000 * 10) / 10 + ' hours'
        } else if (value < 2628000000) {
            ret = Math.floor(value / 86400000 * 10) / 10 + ' days'
        } else if (value < 3.1536e+10) {
            ret = Math.floor(value / 2628000000 * 10) / 10 + ' months'
        } else {
            ret = Math.floor(value / 3.1536e+9) / 10 + ' years'
        }
        return ret
    }

    function date (dateStr) {
        if (dateStr === '' || dateStr == null || (typeof dateStr === 'object' && !dateStr.getMonth)) return ''
        let d1 = new Date(dateStr)
        if (w2utils.isInt(dateStr)) d1 = new Date(Number(dateStr)) // for unix timestamps
        if (String(d1) === 'Invalid Date') return ''

        let months = w2utils.settings.shortmonths
        let d2     = new Date() // today
        let d3     = new Date()
        d3.setTime(d3.getTime() - 86400000) // yesterday

        let dd1 = months[d1.getMonth()] + ' ' + d1.getDate() + ', ' + d1.getFullYear()
        let dd2 = months[d2.getMonth()] + ' ' + d2.getDate() + ', ' + d2.getFullYear()
        let dd3 = months[d3.getMonth()] + ' ' + d3.getDate() + ', ' + d3.getFullYear()

        let time  = (d1.getHours() - (d1.getHours() > 12 ? 12 :0)) + ':' + (d1.getMinutes() < 10 ? '0' : '') + d1.getMinutes() + ' ' + (d1.getHours() >= 12 ? 'pm' : 'am')
        let time2 = (d1.getHours() - (d1.getHours() > 12 ? 12 :0)) + ':' + (d1.getMinutes() < 10 ? '0' : '') + d1.getMinutes() + ':' + (d1.getSeconds() < 10 ? '0' : '') + d1.getSeconds() + ' ' + (d1.getHours() >= 12 ? 'pm' : 'am')
        let dsp   = dd1
        if (dd1 === dd2) dsp = time
        if (dd1 === dd3) dsp = w2utils.lang('Yesterday')

        return '<span title="'+ dd1 +' ' + time2 +'">'+ dsp +'</span>'
    }

    function formatSize (sizeStr) {
        if (!w2utils.isFloat(sizeStr) || sizeStr === '') return ''
        sizeStr = parseFloat(sizeStr)
        if (sizeStr === 0) return 0
        let sizes = ['Bt', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB']
        let i     = parseInt( Math.floor( Math.log(sizeStr) / Math.log(1024) ) )
        return (Math.floor(sizeStr / Math.pow(1024, i) * 10) / 10).toFixed(i === 0 ? 0 : 1) + ' ' + (sizes[i] || '??')
    }

    function formatNumber (val, fraction, useGrouping) {
        if (val == null || val === '' || typeof val === 'object') return ''
        let options = {
            minimumFractionDigits : fraction,
            maximumFractionDigits : fraction,
            useGrouping : useGrouping
        }
        if (fraction == null || fraction < 0) {
            options.minimumFractionDigits = 0
            options.maximumFractionDigits = 20
        }
        return parseFloat(val).toLocaleString(w2utils.settings.locale, options)
    }

    function formatDate (dateStr, format) { // IMPORTANT dateStr HAS TO BE valid JavaScript Date String
        if (!format) format = this.settings.dateFormat
        if (dateStr === '' || dateStr == null || (typeof dateStr === 'object' && !dateStr.getMonth)) return ''

        let dt = new Date(dateStr)
        if (w2utils.isInt(dateStr)) dt = new Date(Number(dateStr)) // for unix timestamps
        if (String(dt) === 'Invalid Date') return ''

        let year  = dt.getFullYear()
        let month = dt.getMonth()
        let date  = dt.getDate()
        return format.toLowerCase()
            .replace('month', w2utils.settings.fullmonths[month])
            .replace('mon', w2utils.settings.shortmonths[month])
            .replace(/yyyy/g, ('000' + year).slice(-4))
            .replace(/yyy/g, ('000' + year).slice(-4))
            .replace(/yy/g, ('0' + year).slice(-2))
            .replace(/(^|[^a-z$])y/g, '$1' + year) // only y's that are not preceded by a letter
            .replace(/mm/g, ('0' + (month + 1)).slice(-2))
            .replace(/dd/g, ('0' + date).slice(-2))
            .replace(/th/g, (date == 1 ? 'st' : 'th'))
            .replace(/th/g, (date == 2 ? 'nd' : 'th'))
            .replace(/th/g, (date == 3 ? 'rd' : 'th'))
            .replace(/(^|[^a-z$])m/g, '$1' + (month + 1)) // only y's that are not preceded by a letter
            .replace(/(^|[^a-z$])d/g, '$1' + date) // only y's that are not preceded by a letter
    }

    function formatTime (dateStr, format) { // IMPORTANT dateStr HAS TO BE valid JavaScript Date String
        if (!format) format = this.settings.timeFormat
        if (dateStr === '' || dateStr == null || (typeof dateStr === 'object' && !dateStr.getMonth)) return ''

        let dt = new Date(dateStr)
        if (w2utils.isInt(dateStr)) dt = new Date(Number(dateStr)) // for unix timestamps
        if (w2utils.isTime(dateStr)) {
            let tmp = w2utils.isTime(dateStr, true)
            dt      = new Date()
            dt.setHours(tmp.hours)
            dt.setMinutes(tmp.minutes)
        }
        if (String(dt) === 'Invalid Date') return ''

        let type = 'am'
        let hour = dt.getHours()
        let h24  = dt.getHours()
        let min  = dt.getMinutes()
        let sec  = dt.getSeconds()
        if (min < 10) min = '0' + min
        if (sec < 10) sec = '0' + sec
        if (format.indexOf('am') !== -1 || format.indexOf('pm') !== -1) {
            if (hour >= 12) type = 'pm'
            if (hour > 12) hour = hour - 12
            if (hour === 0) hour = 12
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
            .replace(/(^|[^a-z$])h/g, '$1' + hour) // only y's that are not preceded by a letter
            .replace(/(^|[^a-z$])m/g, '$1' + min) // only y's that are not preceded by a letter
            .replace(/(^|[^a-z$])s/g, '$1' + sec) // only y's that are not preceded by a letter
    }

    function formatDateTime(dateStr, format) {
        let fmt
        if (dateStr === '' || dateStr == null || (typeof dateStr === 'object' && !dateStr.getMonth)) return ''
        if (typeof format !== 'string') {
            fmt = [this.settings.dateFormat, this.settings.timeFormat]
        } else {
            fmt    = format.split('|')
            fmt[0] = fmt[0].trim()
            fmt[1] = (fmt.length > 1 ? fmt[1].trim() : this.settings.timeFormat)
        }
        // older formats support
        if (fmt[1] === 'h12') fmt[1] = 'h:m pm'
        if (fmt[1] === 'h24') fmt[1] = 'h24:m'
        return this.formatDate(dateStr, fmt[0]) + ' ' + this.formatTime(dateStr, fmt[1])
    }

    function stripTags (html) {
        if (html == null) return html
        switch (typeof html) {
            case 'number':
                break
            case 'string':
                html = String(html).replace(/<(?:[^>=]|='[^']*'|="[^"]*"|=[^'"][^\s>]*)*>/ig, '')
                break
            case 'object':
                // does not modify original object, but creates a copy
                if (Array.isArray(html)) {
                    html = $.extend(true, [], html)
                    for (let i = 0; i < html.length; i++) html[i] = this.stripTags(html[i])
                } else {
                    html = $.extend(true, {}, html)
                    for (let i in html) html[i] = this.stripTags(html[i])
                }
                break
        }
        return html
    }

    function encodeTags (html) {
        if (html == null) return html
        switch (typeof html) {
            case 'number':
                break
            case 'string':
                html = String(html).replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
                break
            case 'object':
                // does not modify original object, but creates a copy
                if (Array.isArray(html)) {
                    html = $.extend(true, [], html)
                    for (let i = 0; i < html.length; i++) html[i] = this.encodeTags(html[i])
                } else {
                    html = $.extend(true, {}, html)
                    for (let i in html) html[i] = this.encodeTags(html[i])
                }
                break
        }
        return html
    }

    function decodeTags (html) {
        if (html == null) return html
        switch (typeof html) {
            case 'number':
                break
            case 'string':
                html = String(html).replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
                break
            case 'object':
                // does not modify original object, but creates a copy
                if (Array.isArray(html)) {
                    html = $.extend(true, [], html)
                    for (let i = 0; i < html.length; i++) html[i] = this.decodeTags(html[i])
                } else {
                    html = $.extend(true, {}, html)
                    for (let i in html) html[i] = this.decodeTags(html[i])
                }
                break
        }
        return html
    }

    function escapeId (id) {
        if (id === '' || id == null) return ''
        return $.escapeSelector(id)
        // return String(id).replace(/([;&,\.\+\*\~'`:"\!\^#$%@\[\]\(\)=<>\|\/? {}\\])/g, '\\$1')
    }

    function unescapeId (id) {
        if (id === '' || id == null) return ''
        return $.find.selectors.preFilter.ATTR([null, id])[1]
    }

    function base64encode (input) {
        let output = ''
        let chr1, chr2, chr3, enc1, enc2, enc3, enc4
        let i      = 0
        let keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
        input      = utf8_encode(input)

        while (i < input.length) {
            chr1 = input.charCodeAt(i++)
            chr2 = input.charCodeAt(i++)
            chr3 = input.charCodeAt(i++)
            enc1 = chr1 >> 2
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
            enc4 = chr3 & 63
            if (isNaN(chr2)) {
                enc3 = enc4 = 64
            } else if (isNaN(chr3)) {
                enc4 = 64
            }
            output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4)
        }

        function utf8_encode (string) {
            string      = String(string).replace(/\r\n/g,'\n')
            let utftext = ''

            for (let n = 0; n < string.length; n++) {
                let c = string.charCodeAt(n)
                if (c < 128) {
                    utftext += String.fromCharCode(c)
                }
                else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192)
                    utftext += String.fromCharCode((c & 63) | 128)
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224)
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128)
                    utftext += String.fromCharCode((c & 63) | 128)
                }
            }
            return utftext
        }

        return output
    }

    function base64decode (input) {
        let output = ''
        let chr1, chr2, chr3
        let enc1, enc2, enc3, enc4
        let i      = 0
        let keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
        input      = input.replace(/[^A-Za-z0-9\+\/\=]/g, '')

        while (i < input.length) {
            enc1   = keyStr.indexOf(input.charAt(i++))
            enc2   = keyStr.indexOf(input.charAt(i++))
            enc3   = keyStr.indexOf(input.charAt(i++))
            enc4   = keyStr.indexOf(input.charAt(i++))
            chr1   = (enc1 << 2) | (enc2 >> 4)
            chr2   = ((enc2 & 15) << 4) | (enc3 >> 2)
            chr3   = ((enc3 & 3) << 6) | enc4
            output = output + String.fromCharCode(chr1)
            if (enc3 !== 64) {
                output = output + String.fromCharCode(chr2)
            }
            if (enc4 !== 64) {
                output = output + String.fromCharCode(chr3)
            }
        }
        output = utf8_decode(output)

        function utf8_decode (utftext) {
            let string = ''
            let i      = 0
            let c      = 0, c2, c3

            while ( i < utftext.length ) {
                c = utftext.charCodeAt(i)
                if (c < 128) {
                    string += String.fromCharCode(c)
                    i++
                }
                else if((c > 191) && (c < 224)) {
                    c2      = utftext.charCodeAt(i+1)
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63))
                    i      += 2
                }
                else {
                    c2      = utftext.charCodeAt(i+1)
                    c3      = utftext.charCodeAt(i+2)
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63))
                    i      += 3
                }
            }

            return string
        }

        return output
    }

    function md5(input) {
        /*
         * Based on http://pajhome.org.uk/crypt/md5
         */

        let hexcase = 0
        function __pj_crypt_hex_md5(s) {
            return __pj_crypt_rstr2hex(__pj_crypt_rstr_md5(__pj_crypt_str2rstr_utf8(s)))
        }

        /*
         * Calculate the MD5 of a raw string
         */
        function __pj_crypt_rstr_md5(s)
        {
            return __pj_crypt_binl2rstr(__pj_crypt_binl_md5(__pj_crypt_rstr2binl(s), s.length * 8))
        }

        /*
         * Convert a raw string to a hex string
         */
        function __pj_crypt_rstr2hex(input)
        {
            try {
                hexcase
            } catch (e) {
                hexcase = 0
            }
            let hex_tab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef'
            let output  = ''
            let x
            for (let i = 0; i < input.length; i++)
            {
                x       = input.charCodeAt(i)
                output += hex_tab.charAt((x >>> 4) & 0x0F)
                        + hex_tab.charAt(x & 0x0F)
            }
            return output
        }

        /*
         * Encode a string as utf-8.
         * For efficiency, this assumes the input is valid utf-16.
         */
        function __pj_crypt_str2rstr_utf8(input)
        {
            let output = ''
            let i      = -1
            let x, y

            while (++i < input.length)
            {
                /* Decode utf-16 surrogate pairs */
                x = input.charCodeAt(i)
                y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0
                if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF)
                {
                    x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF)
                    i++
                }

                /* Encode output as utf-8 */
                if (x <= 0x7F)
                    output += String.fromCharCode(x)
                else if (x <= 0x7FF)
                    output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F),
                        0x80 | (x & 0x3F))
                else if (x <= 0xFFFF)
                    output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                        0x80 | ((x >>> 6) & 0x3F),
                        0x80 | (x & 0x3F))
                else if (x <= 0x1FFFFF)
                    output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                        0x80 | ((x >>> 12) & 0x3F),
                        0x80 | ((x >>> 6) & 0x3F),
                        0x80 | (x & 0x3F))
            }
            return output
        }

        /*
         * Convert a raw string to an array of little-endian words
         * Characters >255 have their high-byte silently ignored.
         */
        function __pj_crypt_rstr2binl(input)
        {
            let output = Array(input.length >> 2)
            for (let i = 0; i < output.length; i++)
                output[i] = 0
            for (let i = 0; i < input.length * 8; i += 8)
                output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32)
            return output
        }

        /*
         * Convert an array of little-endian words to a string
         */
        function __pj_crypt_binl2rstr(input)
        {
            let output = ''
            for (let i = 0; i < input.length * 32; i += 8)
                output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF)
            return output
        }

        /*
         * Calculate the MD5 of an array of little-endian words, and a bit length.
         */
        function __pj_crypt_binl_md5(x, len)
        {
            /* append padding */
            x[len >> 5]                      |= 0x80 << ((len) % 32)
            x[(((len + 64) >>> 9) << 4) + 14] = len

            let a = 1732584193
            let b = -271733879
            let c = -1732584194
            let d = 271733878

            for (let i = 0; i < x.length; i += 16)
            {
                let olda = a
                let oldb = b
                let oldc = c
                let oldd = d

                a = __pj_crypt_md5_ff(a, b, c, d, x[i + 0], 7, -680876936)
                d = __pj_crypt_md5_ff(d, a, b, c, x[i + 1], 12, -389564586)
                c = __pj_crypt_md5_ff(c, d, a, b, x[i + 2], 17, 606105819)
                b = __pj_crypt_md5_ff(b, c, d, a, x[i + 3], 22, -1044525330)
                a = __pj_crypt_md5_ff(a, b, c, d, x[i + 4], 7, -176418897)
                d = __pj_crypt_md5_ff(d, a, b, c, x[i + 5], 12, 1200080426)
                c = __pj_crypt_md5_ff(c, d, a, b, x[i + 6], 17, -1473231341)
                b = __pj_crypt_md5_ff(b, c, d, a, x[i + 7], 22, -45705983)
                a = __pj_crypt_md5_ff(a, b, c, d, x[i + 8], 7, 1770035416)
                d = __pj_crypt_md5_ff(d, a, b, c, x[i + 9], 12, -1958414417)
                c = __pj_crypt_md5_ff(c, d, a, b, x[i + 10], 17, -42063)
                b = __pj_crypt_md5_ff(b, c, d, a, x[i + 11], 22, -1990404162)
                a = __pj_crypt_md5_ff(a, b, c, d, x[i + 12], 7, 1804603682)
                d = __pj_crypt_md5_ff(d, a, b, c, x[i + 13], 12, -40341101)
                c = __pj_crypt_md5_ff(c, d, a, b, x[i + 14], 17, -1502002290)
                b = __pj_crypt_md5_ff(b, c, d, a, x[i + 15], 22, 1236535329)

                a = __pj_crypt_md5_gg(a, b, c, d, x[i + 1], 5, -165796510)
                d = __pj_crypt_md5_gg(d, a, b, c, x[i + 6], 9, -1069501632)
                c = __pj_crypt_md5_gg(c, d, a, b, x[i + 11], 14, 643717713)
                b = __pj_crypt_md5_gg(b, c, d, a, x[i + 0], 20, -373897302)
                a = __pj_crypt_md5_gg(a, b, c, d, x[i + 5], 5, -701558691)
                d = __pj_crypt_md5_gg(d, a, b, c, x[i + 10], 9, 38016083)
                c = __pj_crypt_md5_gg(c, d, a, b, x[i + 15], 14, -660478335)
                b = __pj_crypt_md5_gg(b, c, d, a, x[i + 4], 20, -405537848)
                a = __pj_crypt_md5_gg(a, b, c, d, x[i + 9], 5, 568446438)
                d = __pj_crypt_md5_gg(d, a, b, c, x[i + 14], 9, -1019803690)
                c = __pj_crypt_md5_gg(c, d, a, b, x[i + 3], 14, -187363961)
                b = __pj_crypt_md5_gg(b, c, d, a, x[i + 8], 20, 1163531501)
                a = __pj_crypt_md5_gg(a, b, c, d, x[i + 13], 5, -1444681467)
                d = __pj_crypt_md5_gg(d, a, b, c, x[i + 2], 9, -51403784)
                c = __pj_crypt_md5_gg(c, d, a, b, x[i + 7], 14, 1735328473)
                b = __pj_crypt_md5_gg(b, c, d, a, x[i + 12], 20, -1926607734)

                a = __pj_crypt_md5_hh(a, b, c, d, x[i + 5], 4, -378558)
                d = __pj_crypt_md5_hh(d, a, b, c, x[i + 8], 11, -2022574463)
                c = __pj_crypt_md5_hh(c, d, a, b, x[i + 11], 16, 1839030562)
                b = __pj_crypt_md5_hh(b, c, d, a, x[i + 14], 23, -35309556)
                a = __pj_crypt_md5_hh(a, b, c, d, x[i + 1], 4, -1530992060)
                d = __pj_crypt_md5_hh(d, a, b, c, x[i + 4], 11, 1272893353)
                c = __pj_crypt_md5_hh(c, d, a, b, x[i + 7], 16, -155497632)
                b = __pj_crypt_md5_hh(b, c, d, a, x[i + 10], 23, -1094730640)
                a = __pj_crypt_md5_hh(a, b, c, d, x[i + 13], 4, 681279174)
                d = __pj_crypt_md5_hh(d, a, b, c, x[i + 0], 11, -358537222)
                c = __pj_crypt_md5_hh(c, d, a, b, x[i + 3], 16, -722521979)
                b = __pj_crypt_md5_hh(b, c, d, a, x[i + 6], 23, 76029189)
                a = __pj_crypt_md5_hh(a, b, c, d, x[i + 9], 4, -640364487)
                d = __pj_crypt_md5_hh(d, a, b, c, x[i + 12], 11, -421815835)
                c = __pj_crypt_md5_hh(c, d, a, b, x[i + 15], 16, 530742520)
                b = __pj_crypt_md5_hh(b, c, d, a, x[i + 2], 23, -995338651)

                a = __pj_crypt_md5_ii(a, b, c, d, x[i + 0], 6, -198630844)
                d = __pj_crypt_md5_ii(d, a, b, c, x[i + 7], 10, 1126891415)
                c = __pj_crypt_md5_ii(c, d, a, b, x[i + 14], 15, -1416354905)
                b = __pj_crypt_md5_ii(b, c, d, a, x[i + 5], 21, -57434055)
                a = __pj_crypt_md5_ii(a, b, c, d, x[i + 12], 6, 1700485571)
                d = __pj_crypt_md5_ii(d, a, b, c, x[i + 3], 10, -1894986606)
                c = __pj_crypt_md5_ii(c, d, a, b, x[i + 10], 15, -1051523)
                b = __pj_crypt_md5_ii(b, c, d, a, x[i + 1], 21, -2054922799)
                a = __pj_crypt_md5_ii(a, b, c, d, x[i + 8], 6, 1873313359)
                d = __pj_crypt_md5_ii(d, a, b, c, x[i + 15], 10, -30611744)
                c = __pj_crypt_md5_ii(c, d, a, b, x[i + 6], 15, -1560198380)
                b = __pj_crypt_md5_ii(b, c, d, a, x[i + 13], 21, 1309151649)
                a = __pj_crypt_md5_ii(a, b, c, d, x[i + 4], 6, -145523070)
                d = __pj_crypt_md5_ii(d, a, b, c, x[i + 11], 10, -1120210379)
                c = __pj_crypt_md5_ii(c, d, a, b, x[i + 2], 15, 718787259)
                b = __pj_crypt_md5_ii(b, c, d, a, x[i + 9], 21, -343485551)

                a = __pj_crypt_safe_add(a, olda)
                b = __pj_crypt_safe_add(b, oldb)
                c = __pj_crypt_safe_add(c, oldc)
                d = __pj_crypt_safe_add(d, oldd)
            }
            return Array(a, b, c, d)
        }

        /*
         * These functions implement the four basic operations the algorithm uses.
         */
        function __pj_crypt_md5_cmn(q, a, b, x, s, t)
        {
            return __pj_crypt_safe_add(__pj_crypt_bit_rol(__pj_crypt_safe_add(__pj_crypt_safe_add(a, q), __pj_crypt_safe_add(x, t)), s), b)
        }
        function __pj_crypt_md5_ff(a, b, c, d, x, s, t)
        {
            return __pj_crypt_md5_cmn((b & c) | ((~b) & d), a, b, x, s, t)
        }
        function __pj_crypt_md5_gg(a, b, c, d, x, s, t)
        {
            return __pj_crypt_md5_cmn((b & d) | (c & (~d)), a, b, x, s, t)
        }
        function __pj_crypt_md5_hh(a, b, c, d, x, s, t)
        {
            return __pj_crypt_md5_cmn(b ^ c ^ d, a, b, x, s, t)
        }
        function __pj_crypt_md5_ii(a, b, c, d, x, s, t)
        {
            return __pj_crypt_md5_cmn(c ^ (b | (~d)), a, b, x, s, t)
        }

        /*
         * Add integers, wrapping at 2^32. This uses 16-bit operations internally
         * to work around bugs in some JS interpreters.
         */
        function __pj_crypt_safe_add(x, y)
        {
            let lsw = (x & 0xFFFF) + (y & 0xFFFF)
            let msw = (x >> 16) + (y >> 16) + (lsw >> 16)
            return (msw << 16) | (lsw & 0xFFFF)
        }

        /*
         * Bitwise rotate a 32-bit number to the left.
         */
        function __pj_crypt_bit_rol(num, cnt)
        {
            return (num << cnt) | (num >>> (32 - cnt))
        }

        return __pj_crypt_hex_md5(input)

    }

    function transition (div_old, div_new, type, callBack) {
        let width  = $(div_old).width()
        let height = $(div_old).height()
        let time   = 0.5

        if (!div_old || !div_new) {
            console.log('ERROR: Cannot do transition when one of the divs is null')
            return
        }

        div_old.parentNode.style.cssText += 'perspective: 900px; overflow: hidden;'
        div_old.style.cssText            += '; position: absolute; z-index: 1019; backface-visibility: hidden'
        div_new.style.cssText            += '; position: absolute; z-index: 1020; backface-visibility: hidden'

        switch (type) {
            case 'slide-left':
                // init divs
                div_old.style.cssText += 'overflow: hidden; transform: translate3d(0, 0, 0)'
                div_new.style.cssText += 'overflow: hidden; transform: translate3d('+ width + 'px, 0, 0)'
                $(div_new).show()
                // -- need a timing function because otherwise not working
                setTimeout(() => {
                    div_new.style.cssText += 'transition: '+ time +'s; transform: translate3d(0, 0, 0)'
                    div_old.style.cssText += 'transition: '+ time +'s; transform: translate3d(-'+ width +'px, 0, 0)'
                }, 1)
                break

            case 'slide-right':
                // init divs
                div_old.style.cssText += 'overflow: hidden; transform: translate3d(0, 0, 0)'
                div_new.style.cssText += 'overflow: hidden; transform: translate3d(-'+ width +'px, 0, 0)'
                $(div_new).show()
                // -- need a timing function because otherwise not working
                setTimeout(() => {
                    div_new.style.cssText += 'transition: '+ time +'s; transform: translate3d(0px, 0, 0)'
                    div_old.style.cssText += 'transition: '+ time +'s; transform: translate3d('+ width +'px, 0, 0)'
                }, 1)
                break

            case 'slide-down':
                // init divs
                div_old.style.cssText += 'overflow: hidden; z-index: 1; transform: translate3d(0, 0, 0)'
                div_new.style.cssText += 'overflow: hidden; z-index: 0; transform: translate3d(0, 0, 0)'
                $(div_new).show()
                // -- need a timing function because otherwise not working
                setTimeout(() => {
                    div_new.style.cssText += 'transition: '+ time +'s; transform: translate3d(0, 0, 0)'
                    div_old.style.cssText += 'transition: '+ time +'s; transform: translate3d(0, '+ height +'px, 0)'
                }, 1)
                break

            case 'slide-up':
                // init divs
                div_old.style.cssText += 'overflow: hidden; transform: translate3d(0, 0, 0)'
                div_new.style.cssText += 'overflow: hidden; transform: translate3d(0, '+ height +'px, 0)'
                $(div_new).show()
                // -- need a timing function because otherwise not working
                setTimeout(() => {
                    div_new.style.cssText += 'transition: '+ time +'s; transform: translate3d(0, 0, 0)'
                    div_old.style.cssText += 'transition: '+ time +'s; transform: translate3d(0, 0, 0)'
                }, 1)
                break

            case 'flip-left':
                // init divs
                div_old.style.cssText += 'overflow: hidden; transform: rotateY(0deg)'
                div_new.style.cssText += 'overflow: hidden; transform: rotateY(-180deg)'
                $(div_new).show()
                // -- need a timing function because otherwise not working
                setTimeout(() => {
                    div_new.style.cssText += 'transition: '+ time +'s; transform: rotateY(0deg)'
                    div_old.style.cssText += 'transition: '+ time +'s; transform: rotateY(180deg)'
                }, 1)
                break

            case 'flip-right':
                // init divs
                div_old.style.cssText += 'overflow: hidden; transform: rotateY(0deg)'
                div_new.style.cssText += 'overflow: hidden; transform: rotateY(180deg)'
                $(div_new).show()
                // -- need a timing function because otherwise not working
                setTimeout(() => {
                    div_new.style.cssText += 'transition: '+ time +'s; transform: rotateY(0deg)'
                    div_old.style.cssText += 'transition: '+ time +'s; transform: rotateY(-180deg)'
                }, 1)
                break

            case 'flip-down':
                // init divs
                div_old.style.cssText += 'overflow: hidden; transform: rotateX(0deg)'
                div_new.style.cssText += 'overflow: hidden; transform: rotateX(180deg)'
                $(div_new).show()
                // -- need a timing function because otherwise not working
                setTimeout(() => {
                    div_new.style.cssText += 'transition: '+ time +'s; transform: rotateX(0deg)'
                    div_old.style.cssText += 'transition: '+ time +'s; transform: rotateX(-180deg)'
                }, 1)
                break

            case 'flip-up':
                // init divs
                div_old.style.cssText += 'overflow: hidden; transform: rotateX(0deg)'
                div_new.style.cssText += 'overflow: hidden; transform: rotateX(-180deg)'
                $(div_new).show()
                // -- need a timing function because otherwise not working
                setTimeout(() => {
                    div_new.style.cssText += 'transition: '+ time +'s; transform: rotateX(0deg)'
                    div_old.style.cssText += 'transition: '+ time +'s; transform: rotateX(180deg)'
                }, 1)
                break

            case 'pop-in':
                // init divs
                div_old.style.cssText += 'overflow: hidden; transform: translate3d(0, 0, 0)'
                div_new.style.cssText += 'overflow: hidden; transform: translate3d(0, 0, 0); transform: scale(.8); opacity: 0;'
                $(div_new).show()
                // -- need a timing function because otherwise not working
                setTimeout(() => {
                    div_new.style.cssText += 'transition: '+ time +'s; transform: scale(1); opacity: 1;'
                    div_old.style.cssText += 'transition: '+ time +'s;'
                }, 1)
                break

            case 'pop-out':
                // init divs
                div_old.style.cssText += 'overflow: hidden; transform: translate3d(0, 0, 0); transform: scale(1); opacity: 1;'
                div_new.style.cssText += 'overflow: hidden; transform: translate3d(0, 0, 0); opacity: 0;'
                $(div_new).show()
                // -- need a timing function because otherwise not working
                setTimeout(() => {
                    div_new.style.cssText += 'transition: '+ time +'s; opacity: 1;'
                    div_old.style.cssText += 'transition: '+ time +'s; transform: scale(1.7); opacity: 0;'
                }, 1)
                break

            default:
                // init divs
                div_old.style.cssText += 'overflow: hidden; transform: translate3d(0, 0, 0)'
                div_new.style.cssText += 'overflow: hidden; translate3d(0, 0, 0); opacity: 0;'
                $(div_new).show()
                // -- need a timing function because otherwise not working
                setTimeout(() => {
                    div_new.style.cssText += 'transition: '+ time +'s; opacity: 1;'
                    div_old.style.cssText += 'transition: '+ time +'s'
                }, 1)
                break
        }

        setTimeout(() => {
            if (type === 'slide-down') {
                $(div_old).css('z-index', '1019')
                $(div_new).css('z-index', '1020')
            }
            if (div_new) {
                $(div_new).css({ 'opacity': '1' }).css(w2utils.cssPrefix({
                    'transition': '',
                    'transform' : ''
                }))
            }
            if (div_old) {
                $(div_old).css({ 'opacity': '1' }).css(w2utils.cssPrefix({
                    'transition': '',
                    'transform' : ''
                }))
            }
            if (typeof callBack === 'function') callBack()
        }, time * 1000)
    }

    function lock (box, msg, spinner) {
        let options = {}
        if (typeof msg === 'object') {
            options = msg
        } else {
            options.msg     = msg
            options.spinner = spinner
        }
        if (!options.msg && options.msg !== 0) options.msg = ''
        w2utils.unlock(box)
        $(box).prepend(
            '<div class="w2ui-lock"></div>'+
            '<div class="w2ui-lock-msg"></div>'
        )
        let $lock = $(box).find('.w2ui-lock')
        let mess  = $(box).find('.w2ui-lock-msg')
        if (!options.msg) mess.css({ 'background-color': 'transparent', 'border': '0px' })
        if (options.spinner === true) options.msg = '<div class="w2ui-spinner" '+ (!options.msg ? 'style="width: 35px; height: 35px"' : '') +'></div>' + options.msg
        if (options.opacity != null) $lock.css('opacity', options.opacity)
        if (typeof $lock.fadeIn === 'function') {
            $lock.fadeIn(200)
            mess.html(options.msg).fadeIn(200)
        } else {
            $lock.show()
            mess.html(options.msg).show(0)
        }
    }

    function unlock (box, speed) {
        if (isInt(speed)) {
            $(box).find('.w2ui-lock').fadeOut(speed)
            setTimeout(() => {
                $(box).find('.w2ui-lock').remove()
                $(box).find('.w2ui-lock-msg').remove()
            }, speed)
        } else {
            $(box).find('.w2ui-lock').remove()
            $(box).find('.w2ui-lock-msg').remove()
        }
    }

    /**
    *  Used in w2popup, w2grid, w2form, w2layout
    *  should be called with .call(...) method
    */

    function message(where, options) {
        return new Promise((resolve, reject) => {
            let obj = this, closeTimer, edata
            // var where.path    = 'w2popup';
            // var where.title   = '.w2ui-popup-title';
            // var where.body    = '.w2ui-box';
            $().w2tag() // hide all tags
            if (!options) options = { width: 200, height: 100 }
            if (options.on == null) {
                // mix in events
                let opts = options
                options = new w2event()
                $.extend(options, opts)
            }
            if (options.width == null) options.width = 200
            if (options.height == null) options.height = 100
            let pWidth      = parseInt($(where.box).width())
            let pHeight     = parseInt($(where.box).height())
            let titleHeight = parseInt($(where.box).find(where.title).css('height') || 0)
            if (options.width > pWidth) options.width = pWidth - 10
            if (options.height > pHeight - titleHeight) options.height = pHeight - 10 - titleHeight
            options.originalWidth  = options.width
            options.originalHeight = options.height
            if (parseInt(options.width) < 0) options.width = pWidth + options.width
            if (parseInt(options.width) < 10) options.width = 10
            if (parseInt(options.height) < 0) options.height = pHeight + options.height - titleHeight
            if (parseInt(options.height) < 10) options.height = 10
            if (options.hideOnClick == null) options.hideOnClick = false
            let poptions = $(where.box).data('options') || {}
            if (options.width == null || options.width > poptions.width - 10) {
                options.width = poptions.width - 10
            }
            if (options.height == null || options.height > poptions.height - titleHeight - 5) {
                options.height = poptions.height - titleHeight - 5 // need margin from bottom only
            }
            // negative value means margin
            if (options.originalHeight < 0) options.height = pHeight + options.originalHeight - titleHeight
            if (options.originalWidth < 0) options.width = pWidth + options.originalWidth * 2 // x 2 because there is left and right margin
            let head = $(where.box).find(where.title)

            // if some messages are closing, instantly close them
            let $tmp = $(where.box).find('.w2ui-message.w2ui-closing')
            if ($(where.box).find('.w2ui-message.w2ui-closing').length > 0) {
                clearTimeout(closeTimer)
                closeCB($tmp, $tmp.data('options') || {})
            }
            let msgCount = $(where.box).find('.w2ui-message').length
            // remove message
            if ((options.html || '').trim() === '' && (options.body || '').trim() === '' && (options.buttons || '').trim() === '') {
                if (msgCount === 0) return // no messages at all
                let $msg = $(where.box).find('#w2ui-message'+ (msgCount-1))
                options  = $msg.data('options') || {}
                // before event
                if (options.trigger) {
                    edata = options.trigger({ phase: 'before', type: 'close', target: 'self', box: options.box[0] })
                    if (edata.isCancelled === true) return
                }
                // default behavior
                $msg.css(w2utils.cssPrefix({
                    'transition': '0.15s',
                    'transform': 'translateY(-' + options.height + 'px)'
                })).addClass('w2ui-closing')
                if (msgCount === 1) {
                    if (this.unlock) {
                        if (where.param) this.unlock(where.param, 150); else this.unlock(150)
                    }
                } else {
                    $(where.box).find('#w2ui-message'+ (msgCount-2)).css('z-index', 1500)
                }
                closeTimer = setTimeout(() => { closeCB($msg, options) }, 150)

            } else {

                if ((options.body || '').trim() !== '' || (options.buttons || '').trim() !== '') {
                    options.html = '<div class="w2ui-message-body">'+ (options.body || '') +'</div>'+
                        '<div class="w2ui-message-buttons">'+ (options.buttons || '') +'</div>'
                }
                // hide previous messages
                $(where.box).find('.w2ui-message').css('z-index', 1390)
                head.data('old-z-index', head.css('z-index'))
                head.css('z-index', 1501)
                // add message
                $(where.box).find(where.body)
                    .before('<div id="w2ui-message' + msgCount + '" data-mousedown="stop" '+
                            '   class="w2ui-message" style="display: none; z-index: 1500; ' +
                                (head.length === 0 ? 'top: 0px;' : 'top: ' + w2utils.getSize(head, 'height') + 'px;') +
                                (options.width != null ? 'width: ' + options.width + 'px; left: ' + ((pWidth - options.width) / 2) + 'px;' : 'left: 10px; right: 10px;') +
                                (options.height != null ? 'height: ' + options.height + 'px;' : 'bottom: 6px;') +
                                w2utils.cssPrefix('transition', '.3s', true) + '"' +
                                (options.hideOnClick === true
                                    ? where.param
                                        ? `data-click='["message", "${where.param}"]`
                                        : 'data-click="message"'
                                    : '') + '>' +
                            '</div>')
                bindEvents('#w2ui-message' + msgCount, this)
                $(where.box).find('#w2ui-message'+ msgCount)
                    .data('options', options)
                    .data('prev_focus', $(':focus'))
                let display = $(where.box).find('#w2ui-message'+ msgCount).css('display')
                $(where.box).find('#w2ui-message'+ msgCount).css(w2utils.cssPrefix({
                    'transform': (display === 'none' ? 'translateY(-' + options.height + 'px)' : 'translateY(0px)')
                }))
                if (display === 'none') {
                    $(where.box).find('#w2ui-message'+ msgCount).show().html(options.html)
                    options.box = $(where.box).find('#w2ui-message'+ msgCount)
                    // before event
                    if (options.trigger) {
                        edata = options.trigger({ phase: 'before', type: 'open', target: 'self', box: options.box[0] })
                        if (edata.isCancelled === true) {
                            head.css('z-index', head.data('old-z-index'))
                            $(where.box).find('#w2ui-message'+ msgCount).remove()
                            return
                        }
                    }
                    // timer needs to animation
                    setTimeout(() => {
                        $(where.box).find('#w2ui-message'+ msgCount).css(w2utils.cssPrefix({
                            'transform': (display === 'none' ? 'translateY(0px)' : 'translateY(-' + options.height + 'px)')
                        }))
                    }, 1)
                    // timer for lock
                    if (msgCount === 0 && this.lock) {
                        if (where.param) this.lock(where.param); else this.lock()
                    }
                    setTimeout(() => {
                        // has to be on top of lock
                        $(where.box).find('#w2ui-message'+ msgCount).css(w2utils.cssPrefix({ 'transition': '0s' }))
                        // event after
                        if (options.trigger) {
                            options.trigger($.extend(edata, { phase: 'after' }))
                            resolve()
                        }
                    }, 350)
                }
            }

            function closeCB($msg, options) {
                if (edata == null) {
                    // before event
                    if (options.trigger) {
                        edata = options.trigger({ phase: 'before', type: 'open', target: 'self' })
                        if (edata.isCancelled === true) {
                            head.css('z-index', head.data('old-z-index'))
                            $(where.box).find('#w2ui-message'+ msgCount).remove()
                            return
                        }
                    }
                }
                let $focus = $msg.data('prev_focus')
                $msg.remove()
                if ($focus && $focus.length > 0) {
                    $focus.focus()
                } else {
                    if (obj && typeof obj.focus == 'function') obj.focus()
                }
                head.css('z-index', head.data('old-z-index'))
                // event after
                if (options.trigger) {
                    options.trigger($.extend(edata, { phase: 'after' }))
                }
            }
        })
    }

    function getSize (el, type) {
        let $el    = $(el)
        let bwidth = {
            left    : parseInt($el.css('border-left-width')) || 0,
            right   : parseInt($el.css('border-right-width')) || 0,
            top     : parseInt($el.css('border-top-width')) || 0,
            bottom  : parseInt($el.css('border-bottom-width')) || 0
        }
        let mwidth = {
            left    : parseInt($el.css('margin-left')) || 0,
            right   : parseInt($el.css('margin-right')) || 0,
            top     : parseInt($el.css('margin-top')) || 0,
            bottom  : parseInt($el.css('margin-bottom')) || 0
        }
        let pwidth = {
            left    : parseInt($el.css('padding-left')) || 0,
            right   : parseInt($el.css('padding-right')) || 0,
            top     : parseInt($el.css('padding-top')) || 0,
            bottom  : parseInt($el.css('padding-bottom')) || 0
        }
        switch (type) {
            case 'top' : return bwidth.top + mwidth.top + pwidth.top
            case 'bottom' : return bwidth.bottom + mwidth.bottom + pwidth.bottom
            case 'left' : return bwidth.left + mwidth.left + pwidth.left
            case 'right' : return bwidth.right + mwidth.right + pwidth.right
            case 'width' : return bwidth.left + bwidth.right + mwidth.left + mwidth.right + pwidth.left + pwidth.right + parseInt($el.width())
            case 'height' : return bwidth.top + bwidth.bottom + mwidth.top + mwidth.bottom + pwidth.top + pwidth.bottom + parseInt($el.height())
            case '+width' : return bwidth.left + bwidth.right + mwidth.left + mwidth.right + pwidth.left + pwidth.right
            case '+height' : return bwidth.top + bwidth.bottom + mwidth.top + mwidth.bottom + pwidth.top + pwidth.bottom
        }
        return 0
    }

    function getStrWidth (str, styles) {
        let w, html = '<div id="_tmp_width" style="position: absolute; top: -900px;'+ (styles || '') +'">'+
                        encodeTags(str) +
                      '</div>'
        $('body').append(html)
        w = $('#_tmp_width').width()
        $('#_tmp_width').remove()
        return w
    }

    // w2utils.template_replacer("This is ${a} template ${string}, can't ${you} see?")
    //      -> "This is ${a} template ${string}, can't ${you} see?"
    // w2utils.template_replacer("This is ${a} template ${string}, can't ${you} see?", {})
    //      -> "This is a template string, can't you see?"
    // w2utils.str_replacer("This is ${a} template ${string}, can't ${you} see?", {a:"one fancy", string: "StRiNg"})
    //      -> "This is one fancy template StRiNg, can't you see?"
    function template_replacer (str, replace_obj) {
        if(typeof str !== 'string' || !replace_obj || typeof replace_obj !== 'object') {
            return str
        }
        return str.replace(/\${([^}]+)?}/g, function($1, $2) { return replace_obj[$2]||$2 })
    }

    function lang (phrase, replace_obj, no_warning) {
        if (!phrase || typeof phrase !== 'string' || '<=>='.includes(phrase)) return phrase
        if (replace_obj === true) {
            replace_obj = undefined
            no_warning = true
        }
        let translation = this.settings.phrases[phrase]
        if (translation == null) {
            translation = phrase
            if(this.settings.warn_missing_translation && !no_warning) {
                console.warn('Missing translation:', phrase)
                this.settings.phrases[phrase] = translation // so we only warn once
            }
        }
        return template_replacer(translation, replace_obj)
    }

    function locale (locale, callBack) {
        if (!locale) locale = 'en-us'

        // if the locale is an object, not a string, than we assume it's a
        if (typeof locale !== 'string' ) {
            w2utils.settings = $.extend(true, {}, w2utils.settings, w2locale, locale)
            return
        }

        if (locale.length === 5) locale = 'locale/'+ locale +'.json'

        // clear phrases from language before
        w2utils.settings.phrases = {}

        // load from the file
        $.ajax({
            url      : locale,
            type     : 'GET',
            dataType : 'JSON',
            success(data, status, xhr) {
                w2utils.settings = $.extend(true, {}, w2utils.settings, w2locale, data)
                if (typeof callBack === 'function') callBack()
            },
            error(xhr, status, msg) {
                console.log('ERROR: Cannot load locale '+ locale)
            }
        })
    }

    function scrollBarSize() {
        if (tmp.scrollBarSize) return tmp.scrollBarSize
        let html =
            '<div id="_scrollbar_width" style="position: absolute; top: -300px; width: 100px; height: 100px; overflow-y: scroll;">'+
            '    <div style="height: 120px">1</div>'+
            '</div>'
        $('body').append(html)
        tmp.scrollBarSize = 100 - $('#_scrollbar_width > div').width()
        $('#_scrollbar_width').remove()
        if (String(navigator.userAgent).indexOf('MSIE') >= 0) tmp.scrollBarSize = tmp.scrollBarSize / 2 // need this for IE9+
        return tmp.scrollBarSize
    }

    function checkName (name) {
        if (name == null) {
            console.log('ERROR: Property "name" is required but not supplied.')
            return false
        }
        if (w2ui[name] != null) {
            console.log(`ERROR: Object named "${name}" is already registered as w2ui.${name}.`)
            return false
        }
        if (!w2utils.isAlphaNumeric(name)) {
            console.log('ERROR: Property "name" has to be alpha-numeric (a-z, 0-9, dash and underscore).')
            return false
        }
        return true
    }

    function checkUniqueId (id, items, desc, obj) { // was w2checkUniqueId
        if (!Array.isArray(items)) items = [items]
        for (let i = 0; i < items.length; i++) {
            if (items[i].id === id) {
                console.log(`ERROR: The item "id=${id}" is not unique within the ${desc} "${obj}".`, items)
                return false
            }
        }
        return true
    }

    function parseRoute(route) {
        let keys = []
        let path = route
            .replace(/\/\(/g, '(?:/')
            .replace(/\+/g, '__plus__')
            .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, (_, slash, format, key, capture, optional) => {
                keys.push({ name: key, optional: !! optional })
                slash = slash || ''
                return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')' + (optional || '')
            })
            .replace(/([\/.])/g, '\\$1')
            .replace(/__plus__/g, '(.+)')
            .replace(/\*/g, '(.*)')
        return {
            path  : new RegExp('^' + path + '$', 'i'),
            keys  : keys
        }
    }

    function cssPrefix(field, value, returnString) {
        let css    = {}
        let newCSS = {}
        let ret    = ''
        if (!$.isPlainObject(field)) {
            css[field] = value
        } else {
            css = field
            if (value === true) returnString = true
        }
        for (let c in css) {
            newCSS[c]            = css[c]
            newCSS['-webkit-'+c] = css[c]
            newCSS['-moz-'+c]    = css[c].replace('-webkit-', '-moz-')
            newCSS['-ms-'+c]     = css[c].replace('-webkit-', '-ms-')
            newCSS['-o-'+c]      = css[c].replace('-webkit-', '-o-')
        }
        if (returnString === true) {
            for (let c in newCSS) {
                ret += c + ': ' + newCSS[c] + '; '
            }
        } else {
            ret = newCSS
        }
        return ret
    }

    function getCursorPosition(input) {
        if (input == null) return null
        let caretOffset = 0
        let doc         = input.ownerDocument || input.document
        let win         = doc.defaultView || doc.parentWindow
        let sel
        if (input.tagName && input.tagName.toUpperCase() === 'INPUT' && input.selectionStart) {
            // standards browser
            caretOffset = input.selectionStart
        } else {
            if (win.getSelection) {
                sel = win.getSelection()
                if (sel.rangeCount > 0) {
                    let range         = sel.getRangeAt(0)
                    let preCaretRange = range.cloneRange()
                    preCaretRange.selectNodeContents(input)
                    preCaretRange.setEnd(range.endContainer, range.endOffset)
                    caretOffset = preCaretRange.toString().length
                }
            } else if ( (sel = doc.selection) && sel.type !== 'Control') {
                let textRange         = sel.createRange()
                let preCaretTextRange = doc.body.createTextRange()
                preCaretTextRange.moveToElementText(input)
                preCaretTextRange.setEndPoint('EndToEnd', textRange)
                caretOffset = preCaretTextRange.text.length
            }
        }
        return caretOffset
    }

    function setCursorPosition(input, pos, posEnd) {
        let range   = document.createRange()
        let el, sel = window.getSelection()
        if (input == null) return
        for (let i = 0; i < input.childNodes.length; i++) {
            let tmp = $(input.childNodes[i]).text()
            if (input.childNodes[i].tagName) {
                tmp = $(input.childNodes[i]).html()
                tmp = tmp.replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"')
                    .replace(/&nbsp;/g, ' ')
            }
            if (pos <= tmp.length) {
                el = input.childNodes[i]
                if (el.childNodes && el.childNodes.length > 0) el = el.childNodes[0]
                if (el.childNodes && el.childNodes.length > 0) el = el.childNodes[0]
                break
            } else {
                pos -= tmp.length
            }
        }
        if (el == null) return
        if (pos > el.length) pos = el.length
        range.setStart(el, pos)
        if (posEnd) {
            range.setEnd(el, posEnd)
        } else {
            range.collapse(true)
        }
        sel.removeAllRanges()
        sel.addRange(range)
    }

    function testLocalStorage() {
        // test if localStorage is available, see issue #1282
        let str = 'w2ui_test'
        try {
            localStorage.setItem(str, str)
            localStorage.removeItem(str)
            return true
        } catch (e) {
            return false
        }
    }

    function parseColor(str) {
        if (typeof str !== 'string') return null; else str = str.trim().toUpperCase()
        if (str[0] === '#') str = str.substr(1)
        let color = {}
        if (str.length === 3) {
            color = {
                r: parseInt(str[0] + str[0], 16),
                g: parseInt(str[1] + str[1], 16),
                b: parseInt(str[2] + str[2], 16),
                a: 1
            }
        } else if (str.length === 6) {
            color = {
                r: parseInt(str.substr(0, 2), 16),
                g: parseInt(str.substr(2, 2), 16),
                b: parseInt(str.substr(4, 2), 16),
                a: 1
            }
        } else if (str.length === 8) {
            color = {
                r: parseInt(str.substr(0, 2), 16),
                g: parseInt(str.substr(2, 2), 16),
                b: parseInt(str.substr(4, 2), 16),
                a: Math.round(parseInt(str.substr(6, 2), 16) / 255 * 100) / 100 // alpha channel 0-1
            }
        } else if (str.length > 4 && str.substr(0, 4) === 'RGB(') {
            let tmp = str.replace('RGB', '').replace(/\(/g, '').replace(/\)/g, '').split(',')
            color   = {
                r: parseInt(tmp[0], 10),
                g: parseInt(tmp[1], 10),
                b: parseInt(tmp[2], 10),
                a: 1
            }
        } else if (str.length > 5 && str.substr(0, 5) === 'RGBA(') {
            let tmp = str.replace('RGBA', '').replace(/\(/g, '').replace(/\)/g, '').split(',')
            color   = {
                r: parseInt(tmp[0], 10),
                g: parseInt(tmp[1], 10),
                b: parseInt(tmp[2], 10),
                a: parseFloat(tmp[3])
            }
        } else {
            // word color
            return null
        }
        return color
    }

    // h=0..360, s=0..100, v=0..100
    function hsv2rgb(h, s, v, a) {
        let r, g, b, i, f, p, q, t
        if (arguments.length === 1) {
            s = h.s; v = h.v; a = h.a; h = h.h
        }
        h = h / 360
        s = s / 100
        v = v / 100
        i = Math.floor(h * 6)
        f = h * 6 - i
        p = v * (1 - s)
        q = v * (1 - f * s)
        t = v * (1 - (1 - f) * s)
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break
            case 1: r = q, g = v, b = p; break
            case 2: r = p, g = v, b = t; break
            case 3: r = p, g = q, b = v; break
            case 4: r = t, g = p, b = v; break
            case 5: r = v, g = p, b = q; break
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
            a: (a != null ? a : 1)
        }
    }

    // r=0..255, g=0..255, b=0..255
    function rgb2hsv(r, g, b, a) {
        if (arguments.length === 1) {
            g = r.g; b = r.b; a = r.a; r = r.r
        }
        let max = Math.max(r, g, b), min = Math.min(r, g, b),
            d = max - min,
            h,
            s = (max === 0 ? 0 : d / max),
            v = max / 255
        switch (max) {
            case min: h = 0; break
            case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break
            case g: h = (b - r) + d * 2; h /= 6 * d; break
            case b: h = (r - g) + d * 4; h /= 6 * d; break
        }
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            v: Math.round(v * 100),
            a: (a != null ? a : 1)
        }
    }

    function tooltip(msg, options) {
        let actions, showOn = 'mouseenter', hideOn = 'mouseleave'
        options             = options || {}
        if (options.showOn) {
            showOn = options.showOn
            delete options.showOn
        }
        if (options.hideOn) {
            hideOn = options.hideOn
            delete options.hideOn
        }
        // base64 is needed to avoid '"<> and other special chars conflicts
        actions = 'on'+ showOn +'="$(this).w2tag(w2utils.base64decode(\'' + w2utils.base64encode(msg) + '\'),'
                + 'JSON.parse(w2utils.base64decode(\'' + w2utils.base64encode(JSON.stringify(options)) + '\')))"'
                + 'on'+ hideOn +'="$(this).w2tag()"'

        return actions
    }

    /*
     * @author     Lauri Rooden (https://github.com/litejs/natural-compare-lite)
     * @license    MIT License
     */
    function naturalCompare(a, b) {
        let i, codeA
            , codeB = 1
            , posA = 0
            , posB = 0
            , alphabet = String.alphabet

        function getCode(str, pos, code) {
            if (code) {
                for (i = pos; code = getCode(str, i), code < 76 && code > 65;) ++i
                return +str.slice(pos - 1, i)
            }
            code = alphabet && alphabet.indexOf(str.charAt(pos))
            return code > -1 ? code + 76 : ((code = str.charCodeAt(pos) || 0), code < 45 || code > 127) ? code
                : code < 46 ? 65 // -
                : code < 48 ? code - 1
                : code < 58 ? code + 18 // 0-9
                : code < 65 ? code - 11
                : code < 91 ? code + 11 // A-Z
                : code < 97 ? code - 37
                : code < 123 ? code + 5 // a-z
                : code - 63
        }


        if ((a+='') != (b+='')) for (;codeB;) {
            codeA = getCode(a, posA++)
            codeB = getCode(b, posB++)

            if (codeA < 76 && codeB < 76 && codeA > 66 && codeB > 66) {
                codeA = getCode(a, posA, posA)
                codeB = getCode(b, posB, posA = i)
                posB  = i
            }

            if (codeA != codeB) return (codeA < codeB) ? -1 : 1
        }
        return 0
    }

    function normMenu(menu, el) {
        if (Array.isArray(menu)) {
            menu.forEach((it, m) => {
                if (typeof it === 'string' || typeof it === 'number') {
                    menu[m] = { id: it, text: it }
                } else if (it != null) {
                    if (it.caption != null && it.text == null) it.text = it.caption
                    if (it.text != null && it.id == null) it.id = it.text
                    if (it.text == null && it.id != null) it.text = it.id
                } else {
                    menu[m] = { id: null, text: 'null' }
                }
            })
            return menu
        } else if (typeof menu === 'function') {
            return w2utils.normMenu.call(this, menu.call(this, el))
        } else if (typeof menu === 'object') {
            return Object.keys(menu).map(key => { return { id: key, text: menu[key] } })
        }
    }

    function bindEvents(selector, subject) {
        // format is
        // <div ... data-<event>='["<method>","param1","param2",...]'> -- should be valid JSON
        // <div ... data-<event>="<method>|param1|param2">
        // -- can have "event", "this", "stop", "stopPrevent", "alert" - as predefined objects
        $(selector).each((ind, el) => {
            let actions = $(el).data()
            Object.keys(actions).forEach(name => {
                if (['click', 'dblclick', 'mouseenter', 'mouseleave', 'mouseover', 'mouseout', 'mousedown', 'mousemove', 'mouseup',
                    'focus', 'blur', 'input', 'change', 'keydown', 'keyup', 'keypress'].indexOf(String(name).toLowerCase()) == -1) {
                    return
                }
                let params = $(el).data(name)
                if (typeof params == 'string') {
                    params = params.split('|').map(key => {
                        if (key === 'true') key = true
                        if (key === 'false') key = false
                        return key
                    })
                }
                let method = params[0]
                params.shift()
                $(el)
                    .off(name + '.w2utils-bind')
                    .on(name + '.w2utils-bind', function(event) {
                        switch (method) {
                            case 'alert':
                                alert(params[0]) // for testing purposes
                                break
                            case 'stop':
                                event.stopPropagation()
                                break
                            case 'prevent':
                                event.preventDefault()
                                break
                            case 'stopPrevent':
                                event.stopPropagation()
                                event.preventDefault()
                                return false
                                break
                            default:
                                subject[method].apply(subject, params.map((key, ind) => {
                                    switch (String(key).toLowerCase()) {
                                        case 'event':
                                            return event
                                        case 'this':
                                            return this
                                        default:
                                            return key
                                    }
                                }))
                        }
                    })
            })
        })
    }

})(jQuery)

/***********************************************************
*  Formatters object
*  --- Primarily used in grid
*
*********************************************************/

w2utils.formatters = {

    'number'(value, params) {
        if (parseInt(params) > 20) params = 20
        if (parseInt(params) < 0) params = 0
        if (value == null || value === '') return ''
        return w2utils.formatNumber(parseFloat(value), params, true)
    },

    'float'(value, params) {
        return w2utils.formatters.number(value, params)
    },

    'int'(value, params) {
        return w2utils.formatters.number(value, 0)
    },

    'money'(value, params) {
        if (value == null || value === '') return ''
        let data = w2utils.formatNumber(Number(value), w2utils.settings.currencyPrecision)
        return (w2utils.settings.currencyPrefix || '') + data + (w2utils.settings.currencySuffix || '')
    },

    'currency'(value, params) {
        return w2utils.formatters.money(value, params)
    },

    'percent'(value, params) {
        if (value == null || value === '') return ''
        return w2utils.formatNumber(value, params || 1) + '%'
    },

    'size'(value, params) {
        if (value == null || value === '') return ''
        return w2utils.formatSize(parseInt(value))
    },

    'date'(value, params) {
        if (params === '') params = w2utils.settings.dateFormat
        if (value == null || value === 0 || value === '') return ''
        let dt = w2utils.isDateTime(value, params, true)
        if (dt === false) dt = w2utils.isDate(value, params, true)
        return '<span title="'+ dt +'">' + w2utils.formatDate(dt, params) + '</span>'
    },

    'datetime'(value, params) {
        if (params === '') params = w2utils.settings.datetimeFormat
        if (value == null || value === 0 || value === '') return ''
        let dt = w2utils.isDateTime(value, params, true)
        if (dt === false) dt = w2utils.isDate(value, params, true)
        return '<span title="'+ dt +'">' + w2utils.formatDateTime(dt, params) + '</span>'
    },

    'time'(value, params) {
        if (params === '') params = w2utils.settings.timeFormat
        if (params === 'h12') params = 'hh:mi pm'
        if (params === 'h24') params = 'h24:mi'
        if (value == null || value === 0 || value === '') return ''
        let dt = w2utils.isDateTime(value, params, true)
        if (dt === false) dt = w2utils.isDate(value, params, true)
        return '<span title="'+ dt +'">' + w2utils.formatTime(value, params) + '</span>'
    },

    'timestamp'(value, params) {
        if (params === '') params = w2utils.settings.datetimeFormat
        if (value == null || value === 0 || value === '') return ''
        let dt = w2utils.isDateTime(value, params, true)
        if (dt === false) dt = w2utils.isDate(value, params, true)
        return dt.toString ? dt.toString() : ''
    },

    'gmt'(value, params) {
        if (params === '') params = w2utils.settings.datetimeFormat
        if (value == null || value === 0 || value === '') return ''
        let dt = w2utils.isDateTime(value, params, true)
        if (dt === false) dt = w2utils.isDate(value, params, true)
        return dt.toUTCString ? dt.toUTCString() : ''
    },

    'age'(value, params) {
        if (value == null || value === 0 || value === '') return ''
        let dt = w2utils.isDateTime(value, null, true)
        if (dt === false) dt = w2utils.isDate(value, null, true)
        return '<span title="'+ dt +'">' + w2utils.age(value) + (params ? (' ' + params) : '') + '</span>'
    },

    'interval'(value, params) {
        if (value == null || value === 0 || value === '') return ''
        return w2utils.interval(value) + (params ? (' ' + params) : '')
    },

    'toggle'(value, params) {
        return (value ? 'Yes' : '')
    },

    'password'(value, params) {
        let ret = ''
        for (let i = 0; i < value.length; i++) {
            ret += '*'
        }
        return ret
    }
}

// register globals
if (self) {
    w2ui = self.w2ui || {}
    self.w2ui = w2ui
    self.w2utils = w2utils
}

export { w2ui, w2utils }