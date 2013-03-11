// **********************************
// -- Unit Tests: w2utils

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
	ok( w2utils.isDate('1/31/2013', 'mm/dd/yyyy') === true, "US Format 1" );
	ok( w2utils.isDate('1.31.2013', 'mm.dd.yyyy') === true, "US Format 2" );
	ok( w2utils.isDate('1-31-2013', 'mm-dd-yyyy') === true, "US Format 3" );
	ok( w2utils.isDate('31/1/2013', 'dd/mm/yyyy') === true, "European Format 1" );
	ok( w2utils.isDate('31.1.2013', 'dd.mm.yyyy') === true, "European Format 2" );
	ok( w2utils.isDate('31-1-2013', 'dd-mm-yyyy') === true, "European Format 3" );
	ok( w2utils.isDate('2/29/2008', 'mm/dd/yyyy') === true, "Leap Year Feb 29" );
	ok( w2utils.isDate('2/29/2009', 'mm/dd/yyyy') === false,"None Leap Year Feb 29" );
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