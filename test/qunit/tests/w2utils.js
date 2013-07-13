// **********************************
// -- Unit Tests: w2utils

test( "w2utils.format()", function () {
	var values = {
		'1,000' 		: '1000',
		'1,000.01' 		: '1000.01',
		'1,000.0,001' 	: '1000.0001'
	}
	equal( w2utils.format(), '',  			"- no argument -" );
	equal( w2utils.format(''), '', 			"- blank -" );
	equal( w2utils.format(null), '', 		"- null -" );
	equal( w2utils.format(undefined), '',	"- undefined -" );
	equal( w2utils.format({}), '', 			"- object -" );
	equal( w2utils.format([]), '', 			"- array -" );

	for (var v in values) {
		equal( w2utils.format(values[v]), v, 'Test: ' + values[v] + ' = ' + v);
	}
});

test( "w2utils.size()", function() {
	var values = {
		'' 			: 0,
		'1 Bt' 		: 1,
		'512 Bt'	: 512,
		'1023 Bt'	: 1023,
		'1.0 KB'	: 1024,
		'1.4 KB'	: 1500,
		'1023.9 KB'	: 1024*1024-1,
		'1.0 MB'	: 1024*1024+1,
		'2.1 MB'	: 1024*1024*2.1,
		'2.5 GB'	: 1024*1024*1024*2.5,
		'2.9 TB'	: 1024*1024*1024*1024*2.99
	}
	equal( w2utils.size(), '',  		"- no argument -" );
	equal( w2utils.size(''), '', 		"- blank -" );
	equal( w2utils.size(null), '', 		"- null -" );
	equal( w2utils.size(undefined), '',	"- undefined -" );
	equal( w2utils.size({}), '', 		"- object -" );
	equal( w2utils.size([]), '', 		"- array -" );

	for (var v in values) {
		equal( w2utils.size(values[v]), v, 'Test: ' + values[v] + ' = ' + v);
	}
});

test( "w2utils.isInt()", function() {
	var values = {
		1 			: true,
		0 			: true,
		'1'			: true,
		'-1' 		: true,
		'1.' 		: false,
		'1.0' 		: false,
		'1.0.0' 	: false,
		'1-0' 		: false,
		'--1' 		: false,
		'1--' 		: false
	}
	ok( w2utils.isInt() === false,  		"- no argument -" );
	ok( w2utils.isInt('') === false, 		"- blank -" );
	ok( w2utils.isInt(null) === false, 		"- null -" );
	ok( w2utils.isInt(undefined) === false,	"- undefined -" );
	ok( w2utils.isInt({}) === false, 		"- object -" );
	ok( w2utils.isInt([]) === false, 		"- array -" );
	for (var v in values) {
		ok( w2utils.isInt(v) === values[v], 'Test: ' + v);
	}
});

test( "w2utils.isFloat()", function() {
	var values = {
		1 			: true,
		0 			: true,
		'1'			: true,
		'-1' 		: true,
		'1.' 		: false,
		'1.0' 		: true,
		'1.0.0' 	: false,
		'1-0' 		: false,
		'--1' 		: false,
		'1--' 		: false
	}
	ok( w2utils.isFloat() === false,  		"- no argument -" );
	ok( w2utils.isFloat('') === false, 		"- blank -" );
	ok( w2utils.isFloat(null) === false, 		"- null -" );
	ok( w2utils.isFloat(undefined) === false,	"- undefined -" );
	ok( w2utils.isFloat({}) === false, 		"- object -" );
	ok( w2utils.isFloat([]) === false, 		"- array -" );
	for (var v in values) {
		ok( w2utils.isFloat(v) === values[v], 'Test: ' + v);
	}
});

test( "w2utils.isDate()", function() {
	ok( w2utils.isDate('1/31/2013', 'mm/dd/yyyy') === true, "'1/31/2013', 'mm/dd/yyyy'" );
	ok( w2utils.isDate('1.31.2013', 'mm.dd.yyyy') === true, "'1.31.2013', 'mm.dd.yyyy'" );
	ok( w2utils.isDate('1-31-2013', 'mm-dd-yyyy') === true, "'1-31-2013', 'mm-dd-yyyy'" );
	ok( w2utils.isDate('31/1/2013', 'dd/mm/yyyy') === true, "'31/1/2013', 'dd/mm/yyyy'" );
	ok( w2utils.isDate('31.1.2013', 'dd.mm.yyyy') === true, "'31.1.2013', 'dd.mm.yyyy'" );
	ok( w2utils.isDate('31-1-2013', 'dd-mm-yyyy') === true, "'31-1-2013', 'dd-mm-yyyy'" );
	ok( w2utils.isDate('2013/31/1', 'yyyy/dd/mm') === true, "'2013/31/1', 'yyyy/dd/mm'" );
	ok( w2utils.isDate('2013.31.1', 'yyyy.dd.mm') === true, "'2013.31.1', 'yyyy.dd.mm'" );
	ok( w2utils.isDate('2013-31-1', 'yyyy-dd-mm') === true, "'2013-31-1', 'yyyy-dd-mm'" );
	ok( w2utils.isDate('2013/1/31', 'yyyy/mm/dd') === true, "'2013/1/31', 'yyyy/mm/dd'" );
	ok( w2utils.isDate('2013.1.31', 'yyyy.mm.dd') === true, "'2013.1.31', 'yyyy.mm.dd'" );
	ok( w2utils.isDate('2013-1-31', 'yyyy-mm-dd') === true, "'2013-1/-1', 'yyyy-mm-dd'" );
	ok( w2utils.isDate('2/29/2008', 'mm/dd/yyyy') === true, "'2/29/2008', 'mm/dd/yyyy' - Leap Year" );
	ok( w2utils.isDate('2/29/2009', 'mm/dd/yyyy') === false,"'2/29/2009', 'mm/dd/yyyy' - Not Leap Year" );
	ok( w2utils.isDate('24/29/2009', 'mm/dd/yyyy')=== false,"'24/29/2009', Wrong date" );
	ok( w2utils.isDate('dk4', '') === false,"'dk3', Wrong date" );
});

test( "w2utils.base64encode(), w2utils.base64decode()", function() {
	ok( 
		w2utils.base64decode(w2utils.base64encode('Some text')) === 'Some text', 
		"Simple text" 
	);
	ok( 
		w2utils.base64decode(w2utils.base64encode('~!@#$%^&*()_+|}{":?><`;,./\\')) === '~!@#$%^&*()_+|}{":?><`;,./\\', 
		"Text with special characters" 
	);
});