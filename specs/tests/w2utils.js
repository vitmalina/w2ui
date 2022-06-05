// **********************************
// -- Unit Tests: w2utils

QUnit.module('w2utils', () => {
    QUnit.test("date()", (assert) => {
        var dt  = new Date();
        var dt2 = (new Date()).getTime() -  86400000 * 5;
        assert.equal(w2utils.date(), '',          "- no argument -" );
        assert.equal(w2utils.date(''), '',        "- blank -" );
        assert.equal(w2utils.date(null), '',      "- null -" );
        assert.equal(w2utils.date(undefined), '', "- undefined -" );
        assert.equal(w2utils.date({}), '',        "- object -" );
        assert.equal(w2utils.date([]), '',        "- array -" );
        assert.equal(w2utils.stripTags(w2utils.date(new Date())), w2utils.formatTime(dt), "Today" );
        assert.equal(w2utils.stripTags(w2utils.date((new Date()).getTime() -  86400000 )), w2utils.stripTags('Yesterday'), "Yesterday" );
    });

    QUnit.test("age()", (assert) => {
        var dt  = new Date();
        assert.equal(w2utils.age(), '',          "- no argument -" );
        assert.equal(w2utils.age(''), '',        "- blank -" );
        assert.equal(w2utils.age(null), '',      "- null -" );
        assert.equal(w2utils.age(undefined), '', "- undefined -" );
        assert.equal(w2utils.age({}), '',        "- object -" );
        assert.equal(w2utils.age([]), '',        "- array -" );
        assert.equal(w2utils.stripTags(w2utils.age(new Date())), '0 sec', "Now" );
        assert.equal(w2utils.stripTags(w2utils.age((new Date()).getTime() -  4000 )), '4 secs', "4 secs" );
        assert.equal(w2utils.stripTags(w2utils.age((new Date()).getTime() +  4000 )), '0 sec', "future" );
        assert.equal(w2utils.stripTags(w2utils.age((new Date()).getTime() -  1000 * 60 * 5 )), '5 mins', "5 mins" );
        assert.equal(w2utils.stripTags(w2utils.age((new Date()).getTime() -  1000 * 60 * 45 )), '45 mins', "45 mins" );
        assert.equal(w2utils.stripTags(w2utils.age((new Date()).getTime() -  1000 * 60 * 60 * 2 )), '2 hours', "2 hours" );
        assert.equal(w2utils.stripTags(w2utils.age((new Date()).getTime() -  86400000)), '1 day', "Yesterday" );
        assert.equal(w2utils.stripTags(w2utils.age((new Date()).getTime() -  86400000 * 1.5)), '1 day', "Yesterday" );
        assert.equal(w2utils.stripTags(w2utils.age((new Date()).getTime() -  86400000 * 5)), '5 days', "5 days" );
        assert.equal(w2utils.stripTags(w2utils.age((new Date()).getTime() -  86400000 * 30)), '1 month', "1 month" );
        assert.equal(w2utils.stripTags(w2utils.age((new Date()).getTime() -  86400000 * 33)), '1.1 months', "over a month" );
        assert.equal(w2utils.stripTags(w2utils.age((new Date()).getTime() -  86400000 * 50)), '1.6 months', "over a month" );
        assert.equal(w2utils.stripTags(w2utils.age((new Date()).getTime() -  86400000 * 145)), '4.8 months', "over 4 months" );
        assert.equal(w2utils.stripTags(w2utils.age((new Date()).getTime() -  86400000 * 365)), '1 year', "one year" );
        assert.equal(w2utils.stripTags(w2utils.age((new Date()).getTime() -  86400000 * 420)), '1.1 years', "over one year" );
        assert.equal(w2utils.stripTags(w2utils.age((new Date()).getTime() -  86400000 * 365 * 20)), '19.9 years', "arround 20 years" );
    });

    QUnit.test("formatNumber()", (assert) => {
        var values = {
            '1,000'       : '1000',
            '1,000.01'    : '1000.01',
            '1,000.0001'  : '1000.0001'
        };
        assert.equal(w2utils.formatNumber(), '',          "- no argument -" );
        assert.equal(w2utils.formatNumber(''), '',        "- blank -" );
        assert.equal(w2utils.formatNumber(null), '',      "- null -" );
        assert.equal(w2utils.formatNumber(undefined), '', "- undefined -" );
        assert.equal(w2utils.formatNumber({}), '',        "- object -" );
        assert.equal(w2utils.formatNumber([]), '',        "- array -" );

        for (var v in values) {
            assert.equal(w2utils.formatNumber(values[v]), v, 'Test: ' + values[v] + ' = ' + v);
        }
    });

    QUnit.test("formatDate()", (assert) => {
        var values = {
            '2014-01-05 => mm/dd/yyyy'     : '01/05/2014',
            '2014-01-05 => m/d/yyyy'       : '1/5/2014',
            '2014-01-31 => m/d/yyyy'       : '1/31/2014',
            '2014-05-31 => d.m.yyyy'       : '31.5.2014',
            '2014-05-31 => d.m/yyyy'       : '31.5/2014',
            '2014-05-31 => dd mm yyyy'     : '31 05 2014',
            '2014-05-31 => yyyy-m-d'       : '2014-5-31',
            '2014-05-31 => dd Mon, yyyy'   : '31 May, 2014',
            '2014-06-04 => dd Month, yyyy' : '04 June, 2014',
            '2014-06-04 => d Month, yyyy'  : '4 June, 2014',
            '2014-06-04 => Month dth, yyyy': 'June 4th, 2014',
            '2014-06-01 => Mon dth, yyyy'  : 'Jun 1st, 2014',
            '2014-06-02 => Mon dth, yyyy'  : 'Jun 2nd, 2014',
            '2014-06-03 => Mon dth, yyyy'  : 'Jun 3rd, 2014',
            '2014-01-05 => m/d/y'          : '1/5/2014',
            '2014-01-05 => m/d/yy'         : '1/5/14',
            '2014-01-05 => m/d/yyy'        : '1/5/2014',
            '2014-01-05 => m/d/yyyy'       : '1/5/2014'
        };
        assert.equal(w2utils.formatDate(), '',          "- no argument -" );
        assert.equal(w2utils.formatDate(''), '',        "- blank -" );
        assert.equal(w2utils.formatDate(null), '',      "- null -" );
        assert.equal(w2utils.formatDate(undefined), '', "- undefined -" );
        assert.equal(w2utils.formatDate({}), '',        "- object -" );
        assert.equal(w2utils.formatDate([]), '',        "- array -" );

        for (var v in values) {
            var tmp = v.split(' => ');
            var tm1 = tmp[0].split('-');
            var fm  = w2utils.formatDate(new Date(parseInt(tm1[0]), parseInt(tm1[1])-1, parseInt(tm1[2])), tmp[1]);
            assert.equal(fm, values[v], 'Format: ' + tmp[0] + ' => ' + tmp[1] + ' =>  ' + fm);
        }

        // special case
        var d = new Date();
        d.setFullYear(1);
        d.setMonth(4)
        d.setDate(1)
        var values = {
            '0001/05/01 => yyyy/mm/dd'  : '0001/05/01',
            '0001/05/01 => yyy/mm/dd'   : '0001/05/01',
            '0001/05/01 => yy/mm/dd'    : '01/05/01',
            '0001/05/01 => mm/dd/yyyy'  : '05/01/0001',
            '0001/05/01 => mm-dd-yyyy'  : '05-01-0001',
            '0001/05/01 => m-d-yyyy'    : '5-1-0001',
            '0001/05/01 => mm-dd/yyyy'  : '05-01/0001',
            '0001-01-05 => m/d/y'        : '5/1/1',
            '0001-01-05 => m/d/yy'       : '5/1/01',
            '0001-01-05 => m/d/yyy'      : '5/1/0001',
            '0001-01-05 => m/d/yyyy'     : '5/1/0001'
    }
        for (var v in values) {
            var tmp = v.split(' => ');
            var fm  = w2utils.formatDate(d, tmp[1]);
            assert.equal(fm, values[v], 'Format: ' + tmp[0] + ' => ' + tmp[1] + ' =>  ' + fm);
        }
        // var fm = w2utils.formatDate(d, "yyyy/mm/dd");
        // assert.equal(fm, '0001/05/01', 'Format: 0001/05/01 => yyyy/mm/dd => ' + fm);
    });

    QUnit.test("formatTime()", (assert) => {
        var values = {
            '21:40:00 => hh:mi pm'     : '9:40 pm',
            '21:40:00 => hh:mi am'     : '9:40 pm',
            '9:40:00 => hh:mi am'      : '9:40 am',
            '21:40:05 => hh:mi:ss am'  : '9:40:05 pm',
            '21:40:00 => h24:mi'       : '21:40',
            '21:40:35 => h24:mi:ss'    : '21:40:35',
            '8:40:35 => hh24:mi:ss'    : '08:40:35',
            '18:40:35 => hh24:mi:ss'   : '18:40:35',
            '8:40:35 => hhh:mm:ss'     : '08:40:35',
            '0:05:00 => hh:mi am'      : '12:05 am',
            '1:05:00 => hh:mi am'      : '1:05 am'
        };
        assert.equal(w2utils.formatTime(), '',          "- no argument -" );
        assert.equal(w2utils.formatTime(''), '',        "- blank -" );
        assert.equal(w2utils.formatTime(null), '',      "- null -" );
        assert.equal(w2utils.formatTime(undefined), '', "- undefined -" );
        assert.equal(w2utils.formatTime({}), '',        "- object -" );
        assert.equal(w2utils.formatTime([]), '',        "- array -" );

        for (var v in values) {
            var tmp = v.split(' => ');
            var tm2 = tmp[0].split(':');
            var dt  = new Date(2014, 0, 1); // Jan 1, 2014
            dt.setHours(parseInt(tm2[0]));
            dt.setMinutes(parseInt(tm2[1]));
            dt.setSeconds(parseInt(tm2[2]));
            var fm  = w2utils.formatTime(dt, tmp[1]);
            assert.equal(fm, values[v], 'Format: ' + tmp[0] + ' => ' + tmp[1] + ' =>  ' + fm);
        }
    });

    QUnit.test("formatDateTime()", (assert) => {
        var values = {
            '2014-01-05 21:40:05 => mm/dd/yyyy|hh:mi pm'     : '01/05/2014 9:40 pm',
            '2014-01-05 21:40:05 => mm/dd/yyyy|hh:mi:ss pm'  : '01/05/2014 9:40:05 pm',
            '2014-01-05 21:40:05 => mm/dd/yyyy|h24:mi:ss'    : '01/05/2014 21:40:05',
        };
        assert.equal(w2utils.formatDateTime(), '',          "- no argument -" );
        assert.equal(w2utils.formatDateTime(''), '',        "- blank -" );
        assert.equal(w2utils.formatDateTime(null), '',      "- null -" );
        assert.equal( w2utils.formatDateTime(undefined), '', "- undefined -" );
        assert.equal( w2utils.formatDateTime({}), '',        "- object -" );
        assert.equal( w2utils.formatDateTime([]), '',        "- array -" );
        assert.equal( w2utils.formatDateTime('Sat Nov 22 2014 22:29:17'), '11/22/2014 10:29 pm', "default format" );

        for (var v in values) {
            var tmp = v.split(' => ');
            var tm1 = tmp[0].split(' ')[0].split('-');
            var tm2 = tmp[0].split(' ')[1].split(':');
            var dt  = new Date(parseInt(tm1[0]), parseInt(tm1[1])-1, parseInt(tm1[2]));
            dt.setHours(parseInt(tm2[0]));
            dt.setMinutes(parseInt(tm2[1]));
            dt.setSeconds(parseInt(tm2[2]));
            var fm  = w2utils.formatDateTime(dt, tmp[1]);
            assert.equal( fm, values[v], 'Format: ' + tmp[0] + ' => ' + tmp[1] + ' =>  ' + fm);
        }
    });

    QUnit.test("formatSize()", (assert) => {
        var values = {
            ''          : 0,
            '1 Bt'      : 1,
            '512 Bt'    : 512,
            '1023 Bt'   : 1023,
            '1.0 KB'    : 1024,
            '1.4 KB'    : 1500,
            '1023.9 KB' : 1024*1024-1,
            '1.0 MB'    : 1024*1024+1,
            '2.1 MB'    : 1024*1024*2.1,
            '2.5 GB'    : 1024*1024*1024*2.5,
            '2.9 TB'    : 1024*1024*1024*1024*2.99
        };
        assert.equal( w2utils.formatSize(), '',          "- no argument -" );
        assert.equal( w2utils.formatSize(''), '',        "- blank -" );
        assert.equal( w2utils.formatSize(null), '',      "- null -" );
        assert.equal( w2utils.formatSize(undefined), '', "- undefined -" );
        assert.equal( w2utils.formatSize({}), '',        "- object -" );
        assert.equal( w2utils.formatSize([]), '',        "- array -" );

        for (var v in values) {
            assert.equal( w2utils.formatSize(values[v]), v, 'Test: ' + values[v] + ' = ' + v);
        }
    });

    QUnit.test("isInt()", (assert) => {
        var values = {
            1       : true,
            0       : true,
            '2'     : true,
            '-1'    : true,
            '+1'    : true,
            '1.'    : false,
            '1.0'   : false,
            '1.0.0' : false,
            '1-0'   : false,
            '--1'   : false,
            '1--'   : false,
            '1,000' : false     // should have no commas
        };
        assert.ok(w2utils.isInt() === false,          "- no argument -" );
        assert.ok(w2utils.isInt('') === false,        "- blank -" );
        assert.ok(w2utils.isInt(null) === false,      "- null -" );
        assert.ok(w2utils.isInt(undefined) === false, "- undefined -" );
        assert.ok(w2utils.isInt({}) === false,        "- object -" );
        assert.ok(w2utils.isInt([]) === false,        "- array -" );

        for (var v in values) {
            assert.ok(w2utils.isInt(v) === values[v], 'Test: ' + v);
        }
    });

    QUnit.test("isFloat()", (assert) => {
        var values = {
            1           : true,
            0           : true,
            1.0e3       : true,
            'x'         : false,
            '-1x'       : false,
            'x-1'       : false,
            '2'         : true,
            '-1'        : true,
            '+1'        : true,
            '1.'        : true,
            '1.0'       : true,
            '1.0.0'     : false,
            '1-0'       : false,
            '--1'       : false,
            '1--'       : false,
            '1,000'     : true,
            '3.0E+2'    : true,
            '3.0E-2'    : true
        };
        assert.ok(w2utils.isFloat() === false,            "- no argument -" );
        assert.ok(w2utils.isFloat('') === false,          "- blank -" );
        assert.ok(w2utils.isFloat(null) === false,        "- null -" );
        assert.ok(w2utils.isFloat(undefined) === false,   "- undefined -" );
        assert.ok(w2utils.isFloat({}) === false,          "- object -" );
        assert.ok(w2utils.isFloat([]) === false,          "- array -" );
        assert.ok(w2utils.isFloat(1/0) === true,          "- +Infinity is a float -" );
        assert.ok(w2utils.isFloat(-1/0) === true,         "- -Infinity is a float -" );
        assert.ok(w2utils.isFloat(0/0) === false,         "- NaN is NOT a float -" );

        for (var v in values) {
            assert.ok(w2utils.isFloat(v) === values[v], 'Test: ' + v);
        }
    });

    QUnit.test("isMoney() - Default Format", (assert) => {
        var values = {
            1           : true,
            0           : true,
            '2'         : true,
            '-1'        : true,
            '+1'        : true,
            '1.'        : true,
            '1.0'       : true,
            '1.0.0'     : false,
            '1-0'       : false,
            '--1'       : false,
            '1--'       : false,
            '1,000'     : true,
            '$4.00'     : true,
            '$4,000'    : true,
            '$-4,000'   : true,
            '$+4,000'   : true,
            '-$4,000'   : true,
            '+$4,000'   : true,
            '1 000'     : false,
            '4.0€'      : false,
            '4 000€'    : false,
            '-4 000€'   : false,
            '+4 000€'   : false
        };
        assert.ok(w2utils.isMoney() === false,            "- no argument -" );
        assert.ok(w2utils.isMoney('') === false,          "- blank -" );
        assert.ok(w2utils.isMoney(null) === false,        "- null -" );
        assert.ok(w2utils.isMoney(undefined) === false,   "- undefined -" );
        assert.ok(w2utils.isMoney({}) === false,          "- object -" );
        assert.ok(w2utils.isMoney([]) === false,          "- array -" );
        for (var v in values) {
            assert.ok(w2utils.isMoney(v) === values[v], 'Test: ' + v);
        }
    });

    QUnit.test("isMoney() - EU Format", (assert) => {
        // $\€\£\¥
        $.extend(w2utils.settings, { currencyPrefix: "", currencySuffix: "€", groupSymbol : " " });
        var values = {
            1           : true,
            0           : true,
            '2'         : true,
            '-1'        : true,
            '+1'        : true,
            '1.'        : true,
            '1.0'       : true,
            '1.0.0'     : false,
            '1-0'       : false,
            '--1'       : false,
            '1--'       : false,
            '$4.00'     : false,
            '$4,000'    : false,
            '$-4,000'   : false,
            '$+4,000'   : false,
            '1 000'     : true,
            '4.00€'     : true,
            '4 000€'    : true,
            '-4 000€'   : true,
            '+4 000€'   : true
        };
        assert.ok(w2utils.isMoney() === false,            "- no argument -" );
        assert.ok(w2utils.isMoney('') === false,          "- blank -" );
        assert.ok(w2utils.isMoney(null) === false,        "- null -" );
        assert.ok(w2utils.isMoney(undefined) === false,   "- undefined -" );
        assert.ok(w2utils.isMoney({}) === false,          "- object -" );
        assert.ok(w2utils.isMoney([]) === false,          "- array -" );
        for (var v in values) {
            assert.ok(w2utils.isMoney(v) === values[v], 'Test: ' + v);
        }
        $.extend(w2utils.settings, { currencyPrefix: "$", currencySuffix: "", groupSymbol : "," });
    });

    QUnit.test("isDate()", (assert) => {
        assert.ok(w2utils.isDate('1/31/2013', 'mm/dd/yyyy') === true, "'1/31/2013', 'mm/dd/yyyy'" );
        assert.ok(w2utils.isDate('1.31.2013', 'mm.dd.yyyy') === true, "'1.31.2013', 'mm.dd.yyyy'" );
        assert.ok(w2utils.isDate('1-31-2013', 'mm-dd-yyyy') === true, "'1-31-2013', 'mm-dd-yyyy'" );
        assert.ok(w2utils.isDate('31/1/2013', 'dd/mm/yyyy') === true, "'31/1/2013', 'dd/mm/yyyy'" );
        assert.ok(w2utils.isDate('31.1.2013', 'dd.mm.yyyy') === true, "'31.1.2013', 'dd.mm.yyyy'" );
        assert.ok(w2utils.isDate('31-1-2013', 'dd-mm-yyyy') === true, "'31-1-2013', 'dd-mm-yyyy'" );
        assert.ok(w2utils.isDate('2013/31/1', 'yyyy/dd/mm') === true, "'2013/31/1', 'yyyy/dd/mm'" );
        assert.ok(w2utils.isDate('2013.31.1', 'yyyy.dd.mm') === true, "'2013.31.1', 'yyyy.dd.mm'" );
        assert.ok(w2utils.isDate('2013-31-1', 'yyyy-dd-mm') === true, "'2013-31-1', 'yyyy-dd-mm'" );
        assert.ok(w2utils.isDate('2013/1/31', 'yyyy/mm/dd') === true, "'2013/1/31', 'yyyy/mm/dd'" );
        assert.ok(w2utils.isDate('2013.1.31', 'yyyy.mm.dd') === true, "'2013.1.31', 'yyyy.mm.dd'" );
        assert.ok(w2utils.isDate('2013-1-31', 'yyyy-mm-dd') === true, "'2013-1-1', 'yyyy-mm-dd'" );
        assert.ok(w2utils.isDate('13-1-31', 'yy-mm-dd') === true, "'13-1-31', 'yy-mm-dd'" );
        assert.ok(w2utils.isDate('31-1-13', 'dd-mm-yy') === true, "'31-1-13', 'dd-mm-yy'" );
        assert.ok(w2utils.isDate('2/29/2008', 'mm/dd/yyyy') === true, "'2/29/2008', 'mm/dd/yyyy' - Leap Year" );
        assert.ok(w2utils.isDate('2/29/2009', 'mm/dd/yyyy') === false, "'2/29/2009', 'mm/dd/yyyy' - Not Leap Year" );
        assert.ok(w2utils.isDate('24/29/2009', 'mm/dd/yyyy') === false, "'24/29/2009', Wrong date" );
        assert.ok(w2utils.isDate('dk3', '') === false, "'dk3', Wrong date" );
        assert.ok(w2utils.isDate('31 Jan, 2013', 'dd Mon, yyyy') === true, "'1 Jun, 2013', 'dd Mon, yyyy'");
        assert.ok(w2utils.isDate('30 Feb, 2013', 'dd Mon, yyyy') === false, "'30 Feb, 2013', 'dd Mon, yyyy'");
        assert.ok(w2utils.isDate('1 January, 2013', 'dd Month, yyyy') === true, "'1 January, 2013', 'dd Month, yyyy'");
        assert.ok(w2utils.isDate('January 5, 2013', 'Month dd, yyyy') === true, "'January 5, 2013', 'Month dd, yyyy'");
           assert.ok(w2utils.isDate('04/03/2019', 'dd/mm/yyyy', true).toString().startsWith("Mon Mar 04 2019") === true, "Mon Mar 04 2019");

        assert.ok(w2utils.isDate(new Date()) === true, "current date");

        assert.ok(w2utils.isDate() === false,             "- no argument -" );
        assert.ok(w2utils.isDate('') === false,           "- blank -" );
        assert.ok(w2utils.isDate(null) === false,         "- null -" );
        assert.ok(w2utils.isDate(undefined) === false,    "- undefined -" );
        assert.ok(w2utils.isDate({}) === false,           "- object -" );
        assert.ok(w2utils.isDate([]) === false,           "- array -" );
        assert.ok(w2utils.isDate(1300) === true,         "- integer -" );
        assert.ok(w2utils.isDate(500.5) === false,        "- number -" );
    });

    QUnit.test("isTime()", (assert) => {
        var values = {
            1               : false,
            0               : false,
            '2'             : false,
            '-1'            : false,
            '+1'            : false,
            '1.'            : false,
            '1.0'           : false,
            '1:0'           : false,
            ':01'           : false,
            ' :01'          : false,
            '1:00'          : true,
            '01:00'         : true,
            '001:000'       : false,
            '001:00'        : false,
            '01:000'        : false,
            '1 : 0'         : false,
            '1PM'           : true,
            '1AM'           : true,
            '0AM'           : false,
            '12AM'          : true,
            '0PM'           : false,
            '12PM'          : true,
            '0:00AM'        : true,
            '4:00'          : true,
            '4:000'         : false,
            '-4:00'         : false,
            '1:00AM'        : true,
            '13:00AM'       : false,
            '12:00AM'       : true,
            '12:01AM'       : true,
            '00:00AM'       : true,
            '13:00PM'       : false,
            '12:00PM'       : true,
            '12:01PM'       : true,
            '00:00PM'       : true,
            '13:00 PM'      : false,
            '12:00 PM'      : true,
            '00:00 PM'      : true,
            ' 6:30 '        : true,
            ' 6 : 30 '      : false,
            ' 6 : 3 0 '     : false,
            '13:00'         : true,
            '23:00'         : true,
            '24:00'         : true,
            '24:01'         : false,
            '25:00'         : false,
            '12:00'         : true,
            '12:01'         : true,
            '12:59'         : true,
            '11:60'         : false,
            '11:-1'         : false,
            '11:0'          : false,
            '11:0AM'        : false,
            '11:0 AM'       : false,
            '00:00'         : true,
            '12:02:43'      : true,
            '12:02:43PM'    : true,
            '11:00:33:43'   : false,
            '03:45:11 AM'   : true,
            '24:00:11'      : false,
            '14:26:43 PM'   : false
        };
        assert.ok(w2utils.isTime() === false,             "- no argument -" );
        assert.ok(w2utils.isTime('') === false,           "- blank -" );
        assert.ok(w2utils.isTime(null) === false,         "- null -" );
        assert.ok(w2utils.isTime(undefined) === false,    "- undefined -" );
        assert.ok(w2utils.isTime({}) === false,           "- object -" );
        assert.ok(w2utils.isTime([]) === false,           "- array -" );
        for (var v in values) {
            assert.ok(w2utils.isTime(v) === values[v], 'Test: ' + v);
        }
    });

    QUnit.test("base64encode(), w2utils.base64decode()", (assert) => {
        assert.ok(            w2utils.base64decode(w2utils.base64encode('Some text')) === 'Some text',
            "Simple text"
        );
        assert.ok(            w2utils.base64decode(w2utils.base64encode('~!@#$%^&*()_+|}{":?><`;,./\\')) === '~!@#$%^&*()_+|}{":?><`;,./\\',
            "Text with special characters"
        );
    });

    QUnit.test("sha256", async (assert) => {
        let done = assert.async()
        let hash1 = await w2utils.sha256('some')
        let hash2 = await w2utils.sha256('other')
        assert.equal(hash1, 'a6b46dd0d1ae5e86cbc8f37e75ceeb6760230c1ca4ffbcb0c97b96dd7d9c464b', "sha256('some')")
        assert.equal(hash2, 'd9298a10d1b0735837dc4bd85dac641b0f3cef27a47e5d53a54f2f3f5b2fcffa', "sha256('other')")
        done()
    });

    QUnit.test("stripTags()", (assert) => {
        assert.equal(w2utils.stripTags(), undefined, "- no argument -" );
        assert.equal(w2utils.stripTags(''), '',      "- blank -" );
        assert.equal(w2utils.stripTags(null), null,  "- null -" );
        assert.equal(w2utils.stripTags(undefined), undefined, "- undefined -" );
        assert.equal(w2utils.stripTags('<b>1</b>,2{1}</i>'), '1,2{1}', "String" );
        assert.deepEqual(w2utils.stripTags(['<b>1</b>,2{1}</i>', '<b>', '1']), ['1,2{1}', '', '1'], "Array" );
        assert.deepEqual(w2utils.stripTags({ a: '<b>1</b>,2{1}</i>', b: '<b>', c: '1' }), { a: '1,2{1}', b: '', c: '1' }, "Object" );
    })

    QUnit.test("encodeTags()", (assert) => {
        assert.equal(w2utils.encodeTags(), undefined, "- no argument -" );
        assert.equal(w2utils.encodeTags(''), '',      "- blank -" );
        assert.equal(w2utils.encodeTags(null), null,  "- null -" );
        assert.equal(w2utils.encodeTags(undefined), undefined, "- undefined -" );
        assert.equal(w2utils.encodeTags('<b>1</b>,2{1}</i>'), '&lt;b&gt;1&lt;/b&gt;,2{1}&lt;/i&gt;', "String" );
        assert.deepEqual(w2utils.encodeTags(
            ['<b>1</b>,2{1}</i>', '<b>', '1']),
            ['&lt;b&gt;1&lt;/b&gt;,2{1}&lt;/i&gt;', '&lt;b&gt;', '1'], "Array" );
        assert.deepEqual(w2utils.encodeTags(
            { a: '<b>1</b>,2{1}</i>', b: '<b>', c: '1' }),
            { a: '&lt;b&gt;1&lt;/b&gt;,2{1}&lt;/i&gt;', b: '&lt;b&gt;', c: '1' }, "Object" );
    })

    QUnit.test("escapeId(), w2utils.unescapeId(), ", (assert) => {
        assert.equal(w2utils.escapeId(), '', "- no argument -" );
        assert.equal(w2utils.escapeId(''), '', "- blank -" );
        assert.equal(w2utils.escapeId(null), '', "- null -" );
        assert.equal(w2utils.escapeId(undefined), '', "- undefined -" );
        assert.equal(w2utils.escapeId('some id'), 'some\\ id', "with a space" );
        assert.equal(w2utils.escapeId('"double"'), '\\"double\\"', 'double quites');
        assert.equal(w2utils.escapeId("`~!@#$%^&*()_+-=[]\\{}|;':,./<>?"),
            "\\`\\~\\!\\@\\#\\$\\%\\^\\&\\*\\(\\)_\\+-\\=\\[\\]\\\\\\{\\}\\|\\;\\'\\:\\,\\.\\/\\<\\>\\?",
            "special characters" );
        assert.equal(w2utils.escapeId('Ψ'), 'Ψ', 'unicode char');
        assert.equal(w2utils.escapeId('&#100;'), '\\&\\#100\\;', 'unicode code');

        assert.equal(w2utils.unescapeId('some\\ id'), 'some id', "with a space" );
        assert.equal(w2utils.unescapeId("\\`\\~\\!\\@\\#\\$\\%\\^\\&\\*\\(\\)_\\+-\\=\\[\\]\\\\\\{\\}\\|\\;\\'\\:\\,\\.\\/\\<\\>\\?"),
            "`~!@#$%^&*()_+-=[]\\{}|;':,./<>?",
            "special characters" );
        assert.equal(w2utils.unescapeId('Ψ'), 'Ψ', 'unicode char');
        assert.equal(w2utils.unescapeId('\\&\\#100\\;'), '&#100;', 'unicode code');
    })

    QUnit.test("decodeTags()", (assert) => {
        assert.equal(w2utils.decodeTags(), undefined, "- no argument -" );
        assert.equal(w2utils.decodeTags(''), '',      "- blank -" );
        assert.equal(w2utils.decodeTags(null), null,  "- null -" );
        assert.equal(w2utils.decodeTags(undefined), undefined, "- undefined -" );
        assert.equal(w2utils.decodeTags('&lt;b&gt;1&lt;/b&gt;,2{1}&lt;/i&gt;'), '<b>1</b>,2{1}</i>', "String" );
        assert.deepEqual(w2utils.decodeTags(['&lt;b&gt;1&lt;/b&gt;,2{1}&lt;/i&gt;', '&lt;b&gt;', '1']),
            ['<b>1</b>,2{1}</i>', '<b>', '1'], "Array" );
        assert.deepEqual(w2utils.decodeTags({ a: '&lt;b&gt;1&lt;/b&gt;,2{1}&lt;/i&gt;', b: '&lt;b&gt;', c: '1' }),
            { a: '<b>1</b>,2{1}</i>', b: '<b>', c: '1' }, "Object" );
    })

    QUnit.test("clone()", (assert) => {
        var values = [
            {
                source: {},
                expect: {}
            },
            {
                source: [],
                expect: []
            },
            {
                source: { a: 1 },
                expect: { a: 1 }
            },
            {
                source: [1, 2, 3],
                expect: [1, 2, 3]
            },
            {
                source: [{ a: 1, b: [1,2,3] }, null, 3],
                expect: [{ a: 1, b: [1,2,3] }, null, 3]
            },
            {
                source: { a: 1, b: [{ a: 1, b: 5 }, 2, undefined, null] },
                expect: { a: 1, b: [{ a: 1, b: 5 }, 2, undefined, null] },
            },
        ];
        assert.equal(w2utils.clone(), undefined, "- no argument -" );
        assert.equal(w2utils.clone(''), '',      "- blank -" );
        assert.equal(w2utils.clone(null), null,  "- null -" );
        assert.equal(w2utils.clone(undefined), undefined, "- undefined -" );
        //
        let el1 = document.createElement('div')
        let el2 = document.createElement('input')
        let evt = new Event('custom')
        let fun1 = () => {}
        let fun2 = function () {}
        assert.deepEqual(w2utils.clone({ a: 1, el1, el2 }), { a: 1, el1, el2 }, "Dont clone HTML elements" );
        assert.deepEqual(w2utils.clone({ a: 1, evt }), { a: 1, evt }, "Dont clone HTML events" );
        assert.deepEqual(w2utils.clone({ a: 1, fun1, fun2 }), { a: 1, fun1, fun2 }, "Dont clone functions" );
        assert.deepEqual(w2utils.clone({ a: 1, el2 }, { elements: false }), { a: 1 }, "Dont include events if asked" );
        assert.deepEqual(w2utils.clone({ a: 1, evt }, { events: false }), { a: 1 }, "Dont include events if asked" );
        assert.deepEqual(w2utils.clone({ a: 1, fun1, fun2 }, { functions: false }), { a: 1 }, "Dont include functions if asked" );
        assert.deepEqual(w2utils.clone({ a: 1, b: 2 }, { exclude: ['b'] }), { a: 1 }, "Exclude props" );

        values.forEach(val => {
            let res = w2utils.clone(val.source)
            assert.deepEqual(res, val.expect, 'Test: ' + val.source);
            assert.notEqual(res, val.expect, 'Not same reference')
        })
    });

    QUnit.test("extend()", (assert) => {
        let el1 = document.createElement('div')
        let el2 = document.createElement('input')
        let evt = new Event('custom')
        let fun1 = () => {}
        let fun2 = function () {}

        var values = [
            {
                target: {},
                source: [{}, {}],
                expect: {}
            },
            {
                target: [],
                source: [[4,4], [1, 2, 5]],
                expect: [1, 2, 5]
            },
            {
                target: [1, 2, 3],
                source: [[1, 1], [4, 5]],
                expect: [4, 5]
            },
            {
                target: [],
                source: [[1, 2, {a: 3}]],
                expect: [1, 2, {a: 3}]
            },
            {
                target: [],
                source: [[1, 2, 3], [4, 5, 1]],
                expect: [4, 5, 1]
            },
            {
                target: [],
                source: [[{a: 1, b: 2}], { c: 3}, [{a: 1, b: 2}, { c: 3}]],
                expect: false
            },
            {
                target: [],
                source: [[{a: 1, b: 2}, { c: 3}], [{a: 1, b: 2}, { c: 3}]],
                expect: [{a: 1, b: 2}, { c: 3}]
            },
            {
                target: {},
                source: [{ a: 1 }],
                expect: { a: 1 }
            },
            {
                target: { a: 5 },
                source: [{ a: 1 }],
                expect: { a: 1 }
            },
            {
                target: { b: 5 },
                source: [{ a: 1 }],
                expect: { a: 1, b: 5 }
            },
            {
                target: { b: 5 },
                source: [{ a: 1 }, { c: 6, d: 6}],
                expect: { a: 1, b: 5, c: 6, d: 6 }
            },
            {
                target: { b: 5 },
                source: [{ a: 1 }, { c: { d: 6 }}],
                expect: { a: 1, b: 5, c: { d: 6 }}
            },
            {
                target: { a: 1, e: new Event('e'), b: 5 },
                source: [{ a: 1, e: new Event('e'), }, { c: { d: 6 }}],
                expect: { a: 1, e: new Event('e'), b: 5, c: { d: 6 }}
            },
            {
                target: { a: 1 },
                source: [{ el1, el2, fun1, fun2, evt }, { b: 2 }],
                expect: { a: 1, el1, el2, fun1, fun2, evt, b: 2 }
            }
        ];
        let error = function () {
            throw new Error("Object is not extendable, only {} or [] can be extended.")
        }
        assert.throws(() => { w2utils.extend('', {}) }, "- blank -" );
        assert.throws(() => { w2utils.extend(null, {}) }, "- null -" );
        assert.throws(() => { w2utils.extend(undefined, {}) }, "- undefined -" );
        assert.throws(() => { w2utils.extend(1, {}) }, "- number -" );
        assert.throws(() => { w2utils.extend(true, {}) }, "- bool -" );
        assert.throws(() => { w2utils.extend('s', {}) }, "- string -" );
        assert.throws(() => { w2utils.extend(()=>{}, {}) }, "- function -" );

        values.forEach(val => {
            if (val.expect === false) {
                assert.throws(() => { w2utils.extend(target, ...val.source) }, 'Test: ' + JSON.stringify(...val.source) );
            } else {
                let target = w2utils.clone(val.target)
                w2utils.extend(target, ...val.source)
                assert.deepEqual(target, val.expect, 'Test: ' + JSON.stringify(...val.source));
            }
        })
    });
});