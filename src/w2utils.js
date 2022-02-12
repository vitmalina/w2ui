/**
 * Part of w2ui 2.0 library
 *  - Dependencies: mQuery, w2utils, w2base, w2locale
 *
 * == TODO ==
 *  - overlay should be displayed where more space (on top or on bottom)
 *  - add maxHeight for the w2menu
 *  - add w2utils.lang wrap for all captions in all buttons.
 *  - message.options - should have actions
 *  - cssPrefix should be deprecated
 *
 * == 2.0 changes
 *  - CSP - fixed inline events
 *  - transition returns a promise
 *  - nearly removed jQuery (toolip has reference)
 *  - refactores w2utils.message()
 *  - added w2utils.confirm()
 */

import { w2base } from './w2base.js'
import { w2locale } from './w2locale.js'
import { query } from './query.js'

// variable that holds all w2ui objects
let w2ui = {}

class Utils {
    constructor () {
        this.version = '2.0.x'
        this.tmp = {}
        this.settings = this.extend({}, {
            'dataType'       : 'HTTPJSON', // can be HTTP, HTTPJSON, RESTFULL, RESTFULLJSON, JSON (case sensitive)
            'dateStartYear'  : 1950,  // start year for date-picker
            'dateEndYear'    : 2030,  // end year for date picker
            'macButtonOrder' : false, // if true, Yes on the right side
            'warnNoPhrase'   : false,  // call console.warn if lang() encounters a missing phrase
        }, w2locale, { phrases: null }), // if there are no phrases, then it is original language
        this.i18nCompare = Intl.Collator().compare
        this.hasLocalStorage = testLocalStorage()

        // some internal variables
        this.isMac = /Mac/i.test(navigator.platform)
        this.isMobile = /(iphone|ipod|ipad|mobile|android)/i.test(navigator.userAgent)
        this.isIOS = /(iphone|ipod|ipad)/i.test(navigator.platform)
        this.isAndroid = /(android)/i.test(navigator.userAgent)
        this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

        // Formatters: Primarily used in grid
        this.formatters = {
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
        return

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
    }

    isBin(val) {
        let re = /^[0-1]+$/
        return re.test(val)
    }

    isInt(val) {
        let re = /^[-+]?[0-9]+$/
        return re.test(val)
    }

    isFloat(val) {
        if (typeof val === 'string') {
            val = val.replace(this.settings.groupSymbol, '')
                     .replace(this.settings.decimalSymbol, '.')
        }
        return (typeof val === 'number' || (typeof val === 'string' && val !== '')) && !isNaN(Number(val))
    }

    isMoney(val) {
        if (typeof val === 'object' || val === '') return false
        if (this.isFloat(val)) return true
        let se = this.settings
        let re = new RegExp('^'+ (se.currencyPrefix ? '\\' + se.currencyPrefix + '?' : '') +
                            '[-+]?'+ (se.currencyPrefix ? '\\' + se.currencyPrefix + '?' : '') +
                            '[0-9]*[\\'+ se.decimalSymbol +']?[0-9]+'+ (se.currencySuffix ? '\\' + se.currencySuffix + '?' : '') +'$', 'i')
        if (typeof val === 'string') {
            val = val.replace(new RegExp(se.groupSymbol, 'g'), '')
        }
        return re.test(val)
    }

    isHex(val) {
        let re = /^(0x)?[0-9a-fA-F]+$/
        return re.test(val)
    }

    isAlphaNumeric(val) {
        let re = /^[a-zA-Z0-9_-]+$/
        return re.test(val)
    }

    isEmail(val) {
        let email = /^[a-zA-Z0-9._%\-+]+@[а-яА-Яa-zA-Z0-9.-]+\.[а-яА-Яa-zA-Z]+$/
        return email.test(val)
    }

    isIpAddress(val) {
        let re = new RegExp('^' +
                            '((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}' +
                            '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)' +
                            '$')
        return re.test(val)
    }

    isDate(val, format, retDate) {
        if (!val) return false

        let dt = 'Invalid Date'
        let month, day, year

        if (format == null) format = this.settings.dateFormat

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
                for (let m = 0, len = this.settings.fullmonths.length; m < len; m++) {
                    let t = this.settings.fullmonths[m]
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
        if (!this.isInt(year)) return false
        if (!this.isInt(month)) return false
        if (!this.isInt(day)) return false
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

    isTime(val, retTime) {
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

    isDateTime(val, format, retDate) {
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
            if (format == null) format = this.settings.datetimeFormat
            let formats = format.split('|')
            let values  = [val.substr(0, tmp), val.substr(tmp).trim()]
            formats[0]  = formats[0].trim()
            if (formats[1]) formats[1] = formats[1].trim()
            // check
            let tmp1 = this.isDate(values[0], formats[0], true)
            let tmp2 = this.isTime(values[1], true)
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

    age(dateStr) {
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

    interval(value) {
        let ret = ''
        if (value < 100) {
            ret = '< 0.01 sec'
        } else if (value < 1000) {
            ret = (Math.floor(value / 10) / 100) + ' sec'
        } else if (value < 10000) {
            ret = (Math.floor(value / 100) / 10) + ' sec'
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

    date(dateStr) {
        if (dateStr === '' || dateStr == null || (typeof dateStr === 'object' && !dateStr.getMonth)) return ''
        let d1 = new Date(dateStr)
        if (this.isInt(dateStr)) d1 = new Date(Number(dateStr)) // for unix timestamps
        if (String(d1) === 'Invalid Date') return ''

        let months = this.settings.shortmonths
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
        if (dd1 === dd3) dsp = this.lang('Yesterday')

        return '<span title="'+ dd1 +' ' + time2 +'">'+ dsp +'</span>'
    }

    formatSize(sizeStr) {
        if (!this.isFloat(sizeStr) || sizeStr === '') return ''
        sizeStr = parseFloat(sizeStr)
        if (sizeStr === 0) return 0
        let sizes = ['Bt', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB']
        let i     = parseInt( Math.floor( Math.log(sizeStr) / Math.log(1024) ) )
        return (Math.floor(sizeStr / Math.pow(1024, i) * 10) / 10).toFixed(i === 0 ? 0 : 1) + ' ' + (sizes[i] || '??')
    }

    formatNumber(val, fraction, useGrouping) {
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
        return parseFloat(val).toLocaleString(this.settings.locale, options)
    }

    formatDate(dateStr, format) { // IMPORTANT dateStr HAS TO BE valid JavaScript Date String
        if (!format) format = this.settings.dateFormat
        if (dateStr === '' || dateStr == null || (typeof dateStr === 'object' && !dateStr.getMonth)) return ''

        let dt = new Date(dateStr)
        if (this.isInt(dateStr)) dt = new Date(Number(dateStr)) // for unix timestamps
        if (String(dt) === 'Invalid Date') return ''

        let year  = dt.getFullYear()
        let month = dt.getMonth()
        let date  = dt.getDate()
        return format.toLowerCase()
            .replace('month', this.settings.fullmonths[month])
            .replace('mon', this.settings.shortmonths[month])
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

    formatTime(dateStr, format) { // IMPORTANT dateStr HAS TO BE valid JavaScript Date String
        if (!format) format = this.settings.timeFormat
        if (dateStr === '' || dateStr == null || (typeof dateStr === 'object' && !dateStr.getMonth)) return ''

        let dt = new Date(dateStr)
        if (this.isInt(dateStr)) dt = new Date(Number(dateStr)) // for unix timestamps
        if (this.isTime(dateStr)) {
            let tmp = this.isTime(dateStr, true)
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

    formatDateTime(dateStr, format) {
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

    stripTags(html) {
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
                    html = this.extend([], html)
                    html.forEach((key, ind) => {
                        html[ind] = this.stripTags(key)
                    })
                } else {
                    html = this.extend({}, html)
                    Object.keys(html).forEach(key => {
                        html[key] = this.stripTags(html[key])
                    })
                }
                break
        }
        return html
    }

    encodeTags(html) {
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
                    html = this.extend([], html)
                    html.forEach((key, ind) => {
                        html[ind] = this.encodeTags(key)
                    })
                } else {
                    html = this.extend({}, html)
                    Object.keys(html).forEach(key => {
                        html[key] = this.encodeTags(html[key])
                    })
                }
                break
        }
        return html
    }

    decodeTags(html) {
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
                    html = this.extend([], html)
                    html.forEach((key, ind) => {
                        html[ind] = this.decodeTags(key)
                    })
                } else {
                    html = this.extend({}, html)
                    Object.keys(html).forEach(key => {
                        html[key] = this.decodeTags(html[key])
                    })
                }
                break
        }
        return html
    }

    escapeId(id) {
        // This logic is borrowed from jQuery
        if (id === '' || id == null) return ''
        let re = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g
        return (id + '').replace(re, (ch, asCodePoint) => {
            if (asCodePoint) {
                if (ch === "\0") return "\uFFFD"
                return ch.slice( 0, -1 ) + "\\" + ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " "
            }
            return "\\" + ch
        })
    }

    unescapeId(id) {
        // This logic is borrowed from jQuery
        if (id === '' || id == null) return ''
        let re = /\\[\da-fA-F]{1,6}[\x20\t\r\n\f]?|\\([^\r\n\f])/g
        return id.replace(re, (escape, nonHex) => {
            var high = "0x" + escape.slice( 1 ) - 0x10000
            return nonHex ? nonHex : high < 0
                    ? String.fromCharCode(high + 0x10000 )
                    : String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00)
        })
    }

    base64encode(input) {
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
                else if ((c > 127) && (c < 2048)) {
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

    base64decode(input) {
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

        function utf8_decode(utftext) {
            let string = ''
            let i      = 0
            let c      = 0, c2, c3

            while ( i < utftext.length ) {
                c = utftext.charCodeAt(i)
                if (c < 128) {
                    string += String.fromCharCode(c)
                    i++
                }
                else if ((c > 191) && (c < 224)) {
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

    async sha256(str) {
        const utf8 = new TextEncoder().encode(str)
        return crypto.subtle.digest('SHA-256', utf8).then((hashBuffer) => {
            const hashArray = Array.from(new Uint8Array(hashBuffer))
            return hashArray.map((bytes) => bytes.toString(16).padStart(2, '0')).join('')
        })
    }

    transition(div_old, div_new, type, callBack) {
        return new Promise((resolve, reject) => {
            let styles = div_old.computedStyleMap()
            let width  = styles.get('width').value
            let height = styles.get('height').value
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
                    query(div_new).show()
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
                    query(div_new).show()
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
                    query(div_new).show()
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
                    query(div_new).show()
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
                    query(div_new).show()
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
                    query(div_new).show()
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
                    query(div_new).show()
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
                    query(div_new).show()
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
                    query(div_new).show()
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
                    query(div_new).show()
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
                    query(div_new).show()
                    // -- need a timing function because otherwise not working
                    setTimeout(() => {
                        div_new.style.cssText += 'transition: '+ time +'s; opacity: 1;'
                        div_old.style.cssText += 'transition: '+ time +'s'
                    }, 1)
                    break
            }

            setTimeout(() => {
                if (type === 'slide-down') {
                    query(div_old).css('z-index', '1019')
                    query(div_new).css('z-index', '1020')
                }
                if (div_new) {
                    query(div_new)
                        .css({ 'opacity': '1' })
                        .css({ 'transition': '', 'transform' : '' })
                }
                if (div_old) {
                    query(div_old)
                        .css({ 'opacity': '1' })
                        .css({ 'transition': '', 'transform' : '' })
                }
                if (typeof callBack === 'function') callBack()
                resolve()
            }, time * 1000)
        })
    }

    lock(box, options = {}) {
        if (box == null) return
        if (typeof options == 'string') {
            options = { msg: options }
        }
        if (arguments[2]) {
            options.spinner = arguments[2]
        }
        options = this.extend({
            // opacity: 0.3, // default comes from css
            spinner: false
        }, options)
        // for backward compatibility
        if (box && !(box instanceof HTMLElement) && box[0] instanceof HTMLElement) {
            box = Array.isArray(box) ? box : box.get()
        }
        if (!options.msg && options.msg !== 0) options.msg = ''
        this.unlock(box)
        query(box).prepend(
            '<div class="w2ui-lock"></div>'+
            '<div class="w2ui-lock-msg"></div>'
        )
        let $lock = query(box).find('.w2ui-lock')
        let $mess = query(box).find('.w2ui-lock-msg')
        if (!options.msg) {
            $mess.css({
                'background-color': 'transparent',
                'background-image': 'none',
                'border': '0px',
                'box-shadow': 'none'
            })
        }
        if (options.spinner === true) {
            options.msg = `<div class="w2ui-spinner" ${(!options.msg ? 'style="width: 35px; height: 35px"' : '')}></div>`
                + options.msg
        }
        if (options.msg) {
            $mess.html(options.msg).css('display', 'block')
        } else {
            $mess.remove()
        }
        if (options.opacity != null) {
            $lock.css('opacity', options.opacity)
        }
        $lock.css({ display: 'block' })
        if (options.bgColor) {
            $lock.css({ 'background-color': options.bgColor })
        }
        let opacity = $lock.css('opacity') || 0.3
        $lock
            .on('mousedown', function() {
                if (typeof options.onClick == 'function') {
                    options.onClick()
                } else {
                    $lock.css({
                        'transition': '.2s',
                        'opacity': opacity * 1.5
                    })
                }
            })
            .on('mouseup', function() {
                if (typeof options.onClick !== 'function') {
                    $lock.css({
                        'transition': '.2s',
                        'opacity': opacity
                    })
                }
            })
            .on('mousewheel', function(event) {
                if (event) {
                    event.stopPropagation()
                    event.preventDefault()
                }
            })
    }

    unlock(box, speed) {
        if (box == null) return
        // for backward compatibility
        if (box && !(box instanceof HTMLElement) && box[0] instanceof HTMLElement) {
            box = Array.isArray(box) ? box : box.get()
        }
        if (this.isInt(speed)) {
            query(box).find('.w2ui-lock').css({
                transition: (speed/1000) + 's',
                opacity: 0,
            })
            query(box).find('.w2ui-lock-msg').remove()
            setTimeout(() => {
                query(box).find('.w2ui-lock').remove()
            }, speed)
        } else if (typeof box == 'object') {
            query(box).find('.w2ui-lock').remove()
            query(box).find('.w2ui-lock-msg').remove()
        }
    }

    /**
     * Opens a context message, similar in parameters as w2popup.open()
     *
     * Sample Calls
     * w2utils.message({ box: '#div' }, 'message').ok(() => {})
     * w2utils.message({ box: '#div' }, { text: 'message', width: 300 }).ok(() => {})
     * w2utils.message({ box: '#div' }, { text: 'message', actions: ['Save'] }).Save(() => {})
     *
     * Used in w2grid, w2form, w2layout (should be in w2popup too)
     * should be called with .call(...) method
     *
     * @param where = {
     *      box,     // where to open
     *      after,   // title if any, adds title heights
     *      param    // additional parameters, used in layouts for panel
     * }
     * @param options {
     *      width,      // (int), width in px, if negative, then it is maxWidth - width
     *      height,     // (int), height in px, if negative, then it is maxHeight - height
     *      text,       // centered text
     *      body,       // body of the message
     *      buttons,    // buttons of the message
     *      html,       // if body & buttons are not defined, then html is the entire message
     *      focus,      // int or id with a selector, default is 0
     *      hideOn,     // ['esc', 'click'], default is ['esc']
     *      actions,    // array of actions (only if buttons is not defined)
     *      onOpen,     // event when opened
     *      onClose,    // event when closed
     *      onAction,   // event on action
     * }
     */
    message(where, options) {
        let closeTimer, openTimer, edata
        if (typeof options == 'string') {
            options = {
                width : (options.length < 300 ? 350 : 550),
                height: (options.length < 300 ? 170: 250),
                text  : options,
            }
        }
        if (typeof options != 'object') {
            removeLast()
            return
        }
        if (options.text != null) options.body = `<div class="w2ui-centered w2ui-msg-text">${options.text}</div>`
        if (options.width == null) options.width = 350
        if (options.height == null) options.height = 170
        if (options.hideOn == null) options.hideOn = ['esc']
        // mix in events
        if (options.on == null) {
            let opts = options
            options = new w2base()
            w2utils.extend(options, opts) // needs to be w2utils
        }
        options.on('open', (event) => {
            w2utils.bindEvents(query(options.box).find('.w2ui-eaction'), options)
            query(event.box).find('button, input, textarea')
                .off('.message')
                .on('keydown.message', function(evt) {
                    if (evt.keyCode == 27 && options.hideOn.includes('esc')) {
                        if (options.cancelAction) {
                            options.action(options.cancelAction)
                        } else {
                            options.close()
                        }
                    }
                })
            options.setFocus(options.focus)
        })
        let prom = {
            self: options,
            action(callBack) {
                options
                    .off('action.prom')
                    .on('action.prom', callBack)
                return prom
            },
            close(callBack) {
                options
                    .off('close.prom')
                    .on('close.prom', callBack)
                return prom
            },
            then(callBack) {
                options
                    .off('open:after.prom')
                    .on('open:after.prom', callBack)
                return prom
            }
        }
        if (options.actions == null && options.buttons == null && options.html == null) {
            options.actions = { Ok(event) { event.self.close() }}
        }
        options.off('.buttons')
        if (options.actions != null) {
            options.buttons = ''
            Object.keys(options.actions).forEach((action) => {
                let handler = options.actions[action]
                let btnAction = action
                if (typeof handler == 'function') {
                    options.buttons += `<button class="w2ui-btn w2ui-eaction" data-click='["action","${action}","event"]'>${action}</button>`
                }
                if (typeof handler == 'object') {
                    options.buttons += `<button class="w2ui-btn w2ui-eaction ${handler.class || ''}" data-click='["action","${action}","event"]'
                        style="${handler.style}" ${handler.attrs}>${handler.text || action}</button>`
                    btnAction = Array.isArray(options.actions) ? handler.text : action
                }
                if (typeof handler == 'string') {
                    options.buttons += `<button class="w2ui-btn w2ui-eaction" data-click='["action","${handler}","event"]'>${handler}</button>`
                    btnAction = handler
                }
                if (typeof btnAction == 'string') {
                    btnAction = btnAction[0].toLowerCase() + btnAction.substr(1).replace(/\s+/g, '')
                }
                prom[btnAction] = function (callBack) {
                    options.on('action.buttons', (event) => {
                        let target = event.action[0].toLowerCase() + event.action.substr(1).replace(/\s+/g, '')
                        if (target == btnAction) callBack(event)
                    })
                    return prom
                }
            })
        }
        // trim if any
        Array('html', 'body', 'buttons').forEach(param => {
             options[param] = String(options[param] ?? '').trim()
        })
        if (options.body !== '' || options.buttons !== '') {
            options.html = `
                <div class="w2ui-message-body">${options.body || ''}</div>
                <div class="w2ui-message-buttons">${options.buttons || ''}</div>
            `;
        }
        options.owner = this // since it is called with .call(...)
        let styles  = query(where.box)[0].computedStyleMap()
        let pWidth  = styles.get('width').value
        let pHeight = styles.get('height').value
        styles  = query(where.box).find(where.after)[0].computedStyleMap()
        let titleHeight = parseInt(styles.get('display').value != 'none' ? styles.get('height').value : 0)
        if (options.width > pWidth) options.width = pWidth - 10
        if (options.height > pHeight - titleHeight) options.height = pHeight - 10 - titleHeight
        options.originalWidth  = options.width
        options.originalHeight = options.height
        if (parseInt(options.width) < 0) options.width = pWidth + options.width
        if (parseInt(options.width) < 10) options.width = 10
        if (parseInt(options.height) < 0) options.height = pHeight + options.height - titleHeight
        if (parseInt(options.height) < 10) options.height = 10
        // negative value means margin
        if (options.originalHeight < 0) options.height = pHeight + options.originalHeight - titleHeight
        if (options.originalWidth < 0) options.width = pWidth + options.originalWidth * 2 // x 2 because there is left and right margin
        let head = query(where.box).find(where.after) // needed for z-index manipulations
        head.data('old-z-index', head.css('z-index'))
        // remove message
        if (options.html === '' && options.body === '' && options.buttons === '') {
            removeLast()
        } else {
            options.msgIndex = query(where.box).find('.w2ui-message').length
            if (options.msgIndex === 0 && typeof this.lock == 'function') {
                if (where.param) this.lock(where.param); else this.lock() // should be this
            }
            // send back previous messages
            query(where.box).find('.w2ui-message').css('z-index', 1390)
            head.css('z-index', 1501)
            // add message
            query(where.box).find(where.after)
                .after(`
                    <div id="w2ui-message-${options.owner.name}-${options.msgIndex}" class="w2ui-message" data-mousedown="stop"
                        style="z-index: 1500; left: ${((pWidth - options.width) / 2)}px; top: ${titleHeight}px;
                            width: ${options.width}px; height: ${options.height}px; transform: translateY(-${options.height}px)"
                        ${options.hideOn.includes('click')
                            ? where.param
                                ? `data-click='["message", "${where.param}"]`
                                : 'data-click="message"'
                            : ''}>
                        <span name="hidden-first" tabindex="0" style="position: absolute; top: -100px"></span>
                        ${options.html}
                        <span name="hidden-last" tabindex="0" style="position: absolute; top: -100px"></span>
                    </div>`)
            options.box = query(where.box).find(`#w2ui-message-${options.owner.name}-${options.msgIndex}`)[0]
            w2utils.bindEvents(options.box, this)
            query(options.box)
                .addClass('animating')
                .data('options', options)
                .data('prev_focus', document.activeElement) // TODO:
            // timeout is needs so that callBacks are setup
            setTimeout(() => {
                // before event
                edata = options.trigger({ phase: 'before', type: 'open', target: this.name, box: options.box, self: options })
                if (edata.isCancelled === true) {
                    head.css('z-index', head.data('old-z-index'))
                    query(where.box).find(`#w2ui-message-${options.owner.name}-${options.msgIndex}`).remove()
                    return
                }
                // slide down
                query(options.box).css({
                    transition: '0.3s',
                    transform: 'translateY(0px)'
                })
            }, 0)
            // timeout is needed so that animation can finish
            openTimer = setTimeout(() => {
                // has to be on top of lock
                query(where.box)
                    .find(`#w2ui-message-${options.owner.name}-${options.msgIndex}`)
                    .removeClass('animating')
                    .css({ 'transition': '0s' })
                // event after
                options.trigger(Object.assign(edata, { phase: 'after' }))
            }, 300)
        }
        // action handler
        options.action = (action, event) => {
            let click = options.actions[action]
            if (click instanceof Object && click.onClick) click = click.onClick
            // event before
            let edata = options.trigger({ phase: 'before', type: 'action', target: this.name, action, self: options,
                originalEvent: event, value: options.input ? options.input.value : null })
            if (edata.isCancelled === true) return
            // default actions
            if (typeof click === 'function') click(edata)
            // event after
            options.trigger(Object.assign(edata, { phase: 'after' }))
        }
        options.close = () => {
            edata = options.trigger({ phase: 'before', type: 'close', target: 'self', box: options.box, self: options })
            if (edata.isCancelled === true) return
            clearTimeout(openTimer)
            if (query(options.box).hasClass('animating')) {
                clearTimeout(closeTimer)
                closeComplete(options);
                return
            }
            // default behavior
            query(options.box)
                .addClass('w2ui-closing animating')
                .css({
                    'transition': '0.15s',
                    'transform': 'translateY(-' + options.height + 'px)'
                })
            if (options.msgIndex !== 0) {
                // previous message
                query(where.box).find(`#w2ui-message-${options.owner.name}-${options.msgIndex-1}`).css('z-index', 1499)
            }
            closeTimer = setTimeout(() => { closeComplete(options) }, 150)
        }
        options.setFocus = (focus) => {
            // in message or popup
            let cnt = query(where.box).find('.w2ui-message').length - 1
            let box = query(where.box).find(`#w2ui-message-${options.owner.name}-${cnt}`)
            let sel = 'input, button, select, textarea, [contentEditable], .w2ui-input'
            if (focus != null) {
                let el = isNaN(focus)
                    ? box.find(sel).filter(focus).get(0)
                    : box.find(sel).get(focus)
                el?.focus()
            } else {
                box.find('[name=hidden-first]').get(0)?.focus()
            }

            // clear focus if there are other messages
            query(where.box)
                .find('.w2ui-message')
                .find(sel + ',[name=hidden-first],[name=hidden-last]')
                .off('.keep-focus')

            // keep focus/blur inside popup
            query(box)
                .find(sel + ',[name=hidden-first],[name=hidden-last]')
                .on('blur.keep-focus', function (event) {
                    setTimeout(() => {
                        let focus = document.activeElement
                        let inside = query(box).find(sel).filter(focus).length > 0
                        let name = query(focus).attr('name')
                        if (!inside && focus && focus !== document.body) {
                            query(box).find(sel).get(0)?.focus()
                        }
                        if (name == 'hidden-last') {
                            query(box).find(sel).get(0)?.focus()
                        }
                        if (name == 'hidden-first') {
                            query(box).find(sel).get(-1)?.focus()
                        }
                    }, 1)
                })
        }

        return prom

        function removeLast() {
            let msgs = query(where.box).find('.w2ui-message')
            if (msgs.length == 0) return // no messages already
            options = msgs.eq(0).data('options') || {}
            if (typeof options?.close == 'function') {
                options.close()
            }
        }

        function closeComplete(options) {
            let focus = query(options.box).data('prev_focus')
            if ($(where.box).find('.w2ui-message').length <= 1) {
                if (options.owner.unlock) {
                    if (where.param) {
                        options.owner.unlock(where.param, 150)
                     } else {
                        options.owner.unlock(150) // owner of themessage
                     }
                }
            } else {
                query(where.box).find(`#w2ui-message-${options.owner.name}-${options.msgIndex-1}`).css('z-index', 1500)
            }
            query(options.box).remove()
            if (focus) {
                let msg = query(focus).closest('.w2ui-message')
                if (msg.length > 0) {
                    let opt = msg.data('options')
                    opt.setFocus(focus)
                } else {
                    focus.focus()
                }
            } else {
                if (options.owner && typeof options.owner.focus == 'function') owner.focus()
            }
            head.css('z-index', head.data('old-z-index'))
            // event after
            if (options.trigger) {
                options.trigger(Object.assign(edata, { phase: 'after' }))
            }
        }
    }

    confirm(where, options) {
        if (typeof options == 'string') {
            options = { text: options }
        }
        w2utils.normButtons(options, { yes: 'Yes', no: 'No' })
        return w2utils.message.call(this, where, options)
    }

    /**
     * Normalizes yes, no buttons for confirmation dialog
     *
     * @param {*} options
     * @returns  options
     */
    normButtons(options, btn) {
        options.actions = options.actions ?? {}
        let btns = Object.keys(btn)
        btns.forEach(name => {
            let action = options['btn_' + name]
            if (action) {
                btn[name] = {
                    text: w2utils.lang(action.text ?? ''),
                    class: action.class ?? '',
                    style: action.style ?? '',
                    attrs: action.attrs ?? ''
                }
                delete options['btn_' + name]
            }
            Array('text', 'class', 'style', 'attrs').forEach(suffix => {
                if (options[name + '_' + suffix]) {
                    if (typeof btn[name] == 'string') {
                        btn[name] = { text: btn[name] }
                    }
                    btn[name][suffix] = options[name + '_' + suffix]
                    delete options[name + '_' + suffix]
                }
            })
        })
        if (btns.includes('yes') && btns.includes('no')) {
            if (w2utils.settings.macButtonOrder) {
                w2utils.extend(options.actions, { no: btn.no, yes: btn.yes })
            } else {
                w2utils.extend(options.actions, { yes: btn.yes, no: btn.no })
            }
        }
        if (btns.includes('ok') && btns.includes('cancel')) {
            if (w2utils.settings.macButtonOrder) {
                w2utils.extend(options.actions, { cancel: btn.cancel, ok: btn.ok })
            } else {
                w2utils.extend(options.actions, { ok: btn.ok, cancel: btn.cancel })
            }
        }
        return options
    }

    getSize(el, type) {
        el = query(el) // for backward compatibility
        let ret = 0
        if (el.length > 0) {
            el = el[0]
            let styles = getComputedStyle(el)
            switch (type) {
                case 'width' :
                    ret = parseFloat(styles.width)
                    break
                case 'height' :
                    ret = parseFloat(styles.height)
                    break
            }
        }
        return ret
    }

    getStrWidth(str, styles) {
        query('body').append(`
            <div id="_tmp_width" style="position: absolute; top: -9000px; ${styles || ''}">
                ${this.encodeTags(str)}
            </div>`)
        let width = query('#_tmp_width')[0].clientWidth
        query('#_tmp_width').remove()
        return width
    }

    execTemplate(str, replace_obj) {
        if (typeof str !== 'string' || !replace_obj || typeof replace_obj !== 'object') {
            return str
        }
        return str.replace(/\${([^}]+)?}/g, function($1, $2) { return replace_obj[$2]||$2 })
    }

    lang(phrase, params) {
        if (!phrase || this.settings.phrases == null // if no phrases at all
                || typeof phrase !== 'string' || '<=>='.includes(phrase)) {
            return this.execTemplate(phrase, params)
        }
        let translation = this.settings.phrases[phrase]
        if (translation == null) {
            translation = phrase
            if (this.settings.warnNoPhrase) {
                if (!this.settings.missing) {
                    this.settings.missing = {}
                }
                this.settings.missing[phrase] = '---' // collect phrases for translation, warn once
                this.settings.phrases[phrase] = '---'
                console.log(`Missing translation for "%c${phrase}%c", see %c w2utils.settings.phrases %c with value "---"`,
                    'color: orange', '',
                    'color: #999', '')
            }
        } else if (translation === '---' && !this.settings.warnNoPhrase) {
            translation = phrase
        }
        if (translation === '---') {
            translation = `<span ${this.tooltip(phrase)}>---</span>`
        }
        return this.execTemplate(translation, params)
    }

    locale(locale, keepPhrases, noMerge) {
        return new Promise((resolve, reject) => {
            // if locale is an array we call this function recursively and merge the results
            if (Array.isArray(locale)) {
                this.settings.phrases = {}
                let proms = []
                let files = {}
                locale.forEach((file, ind) => {
                    if (file.length === 5) {
                        file = 'locale/'+ file.toLowerCase() +'.json'
                        locale[ind] = file
                    }
                    proms.push(this.locale(file, true, false))
                })
                Promise.allSettled(proms)
                    .then(res => {
                        // order of files is important to merge
                        res.forEach(r => { files[r.value.file] = r.value.data })
                        locale.forEach(file => {
                            this.settings = this.extend({}, this.settings, files[file])
                        })
                        resolve()
                    })
                return
            }
            if (!locale) locale = 'en-us'

            // if locale is an object, then merge it with w2utils.settings
            if (locale instanceof Object) {
                this.settings = this.extend({}, this.settings, w2locale, locale)
                return
            }

            if (locale.length === 5) {
                locale = 'locale/'+ locale.toLowerCase() +'.json'
            }

            // load from the file
            fetch(locale, { method: 'GET' })
                .then(res => res.json())
                .then(data => {
                    if (noMerge !== true) {
                        if (keepPhrases) {
                            // keep phrases, useful for recursive calls
                            this.settings = this.extend({}, this.settings, data)
                        } else {
                            // clear phrases from language before merging
                            this.settings = this.extend({}, this.settings, w2locale, { phrases: {} }, data)
                        }
                    }
                    resolve({ file: locale, data })
                })
                .catch((err) => {
                    console.log('ERROR: Cannot load locale '+ locale)
                    reject(err)
                })
        })
    }

    scrollBarSize() {
        if (this.tmp.scrollBarSize) return this.tmp.scrollBarSize
        let html = `
            <div id="_scrollbar_width" style="position: absolute; top: -300px; width: 100px; height: 100px; overflow-y: scroll;">
                <div style="height: 120px">1</div>
            </div>
        `
        query('body').append(html)
        this.tmp.scrollBarSize = 100 - query('#_scrollbar_width > div')[0].clientWidth
        query('#_scrollbar_width').remove()
        return this.tmp.scrollBarSize
    }

    checkName(name) {
        if (name == null) {
            console.log('ERROR: Property "name" is required but not supplied.')
            return false
        }
        if (w2ui[name] != null) {
            console.log(`ERROR: Object named "${name}" is already registered as w2ui.${name}.`)
            return false
        }
        if (!this.isAlphaNumeric(name)) {
            console.log('ERROR: Property "name" has to be alpha-numeric (a-z, 0-9, dash and underscore).')
            return false
        }
        return true
    }

    checkUniqueId(id, items, desc, obj) { // was w2checkUniqueId
        if (!Array.isArray(items)) items = [items]
        for (let i = 0; i < items.length; i++) {
            if (items[i].id === id) {
                console.log(`ERROR: The item "id=${id}" is not unique within the ${desc} "${obj}".`, items)
                return false
            }
        }
        return true
    }

    parseRoute(route) {
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

    cssPrefix(field, value, returnString) {
        let css    = {}
        let newCSS = {}
        let ret    = ''
        if (!(field instanceof Object)) {
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

    getCursorPosition(input) {
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

    setCursorPosition(input, pos, posEnd) {
        let range   = document.createRange()
        let el, sel = window.getSelection()
        if (input == null) return
        for (let i = 0; i < input.childNodes.length; i++) {
            let tmp = query(input.childNodes[i]).text()
            if (input.childNodes[i].tagName) {
                tmp = query(input.childNodes[i]).html()
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

    parseColor(str) {
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
    hsv2rgb(h, s, v, a) {
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
    rgb2hsv(r, g, b, a) {
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

    tooltip(html, options) {
        let actions,
            showOn = 'mouseenter',
            hideOn = 'mouseleave',
            isOverlay = false
        if (typeof html == 'object') {
            options = html
        }
        options = options || {}
        if (typeof html == 'string') {
            options.html = html
        }
        if (options.showOn) {
            showOn = options.showOn
            delete options.showOn
        }
        if (options.hideOn) {
            hideOn = options.hideOn
            delete options.hideOn
        }
        if (options.overlay === true) {
            isOverlay = true
            delete options.overlay
        }
        // base64 is needed to avoid '"<> and other special chars conflicts
        actions = ` on${showOn}="jQuery(this).${isOverlay ? 'w2overlay' : 'w2tag'}(`
                + `JSON.parse(w2utils.base64decode('${this.base64encode(JSON.stringify(options))}')))" `
                + `on${hideOn}="jQuery(this).${isOverlay ? 'w2overlay' : 'w2tag'}(`
                + `${isOverlay && options.name != null
                    ? `JSON.parse(w2utils.base64decode('${this.base64encode(JSON.stringify({ name: options.name }))}'))`
                    : ''}`
                + ')"'
        return actions
    }

    // deep copy of an object or an array
    clone(obj) {
        let ret
        if (Array.isArray(obj)) {
            ret = Array.from(obj)
            ret.forEach((value, ind) => {
                ret[ind] = this.clone(value)
            })
        } else if (obj instanceof HTMLElement) {
            // do not clone HTML Elements
            ret = obj
        } else if (obj != null && typeof obj == 'object') {
            ret = {}
            Object.assign(ret, obj)
            Object.keys(ret).forEach(key => {
                ret[key] = this.clone(ret[key])
            })
        } else {
            // primitive variable or function, both remain the same
            ret = obj
        }
        return ret
    }

    // deep extend an object or an array, if an array, it does concat, cloning objects in the process
    // target, source1, source2, ...
    extend(target, source) {
        if (Array.isArray(target)) {
            if (Array.isArray(source)) {
                source.forEach(s => { target.push(this.clone(s)) })
            } else {
                throw new Error('Arrays can be extended with arrays only')
            }
        } else if (target && typeof target == 'object' && source != null) {
            if (typeof source != 'object') {
                throw new Error("Object can be extended with other objects only.")
            }
            Object.keys(source).forEach(key => {
                target[key] = this.clone(source[key])
            })
        } else if (source != null) {
            throw new Error("Object is not extendable, only {} or [] can be extended.")
        }
        // other arguments
        if (arguments.length > 2) {
            for (let i = 2; i < arguments.length; i++) {
                this.extend(target, arguments[i])
            }
        }
        return target
    }

    /*
     * @author     Lauri Rooden (https://github.com/litejs/natural-compare-lite)
     * @license    MIT License
     */
    naturalCompare(a, b) {
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

    normMenu(menu, el) {
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
            return this.normMenu.call(this, menu.call(this, el))
        } else if (typeof menu === 'object') {
            return Object.keys(menu).map(key => { return { id: key, text: menu[key] } })
        }
    }

    bindEvents(selector, subject) {
        // format is
        // <div ... data-<event>='["<method>","param1","param2",...]'> -- should be valid JSON (no undefined)
        // <div ... data-<event>="<method>|param1|param2">
        // -- can have "event", "this", "stop", "stopPrevent", "alert" - as predefined objects
        if (selector.length == 0) return
        // for backward compatibility
        if (selector && !(selector instanceof HTMLElement) && selector[0] instanceof HTMLElement) {
            selector = Array.isArray(selector) ? selector : selector.get()
        }
        query(selector).each((el) => {
            let actions = query(el).data()
            Object.keys(actions).forEach(name => {
                let events = ['click', 'dblclick', 'mouseenter', 'mouseleave', 'mouseover', 'mouseout', 'mousedown', 'mousemove', 'mouseup',
                    'contextmenu', 'focus', 'blur', 'input', 'change', 'keydown', 'keyup', 'keypress']
                if (events.indexOf(String(name).toLowerCase()) == -1) {
                    return
                }
                let params = actions[name]
                if (typeof params == 'string') {
                    params = params.split('|').map(key => {
                        if (key === 'true') key = true
                        if (key === 'false') key = false
                        if (key === 'undefined') key = undefined
                        if (key === 'null') key = null
                        if (parseFloat(key) == key) key = parseFloat(key)
                        return key
                    })
                }
                let method = params[0]
                params = params.slice(1) // should be new array
                query(el)
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
                                if (subject[method] == null) {
                                    throw new Error(`Cannot dispatch event as the method "${method}" does not exist.`)
                                }
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
}
var w2utils = new Utils() // needs to be functional/module scope variable
export { w2ui, w2utils }