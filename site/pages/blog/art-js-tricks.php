Five JavaScirpt tricks you may not know

1. Test if element is part of the array

if (['item1', 'item2'].indexOf(testee) == -1) {
	console.log('not there');
}

2. Set object only if does not eixts

a = a || {};

3. each function received arguments array

4. multi line strings - \

var a = 'some string \
and second line\
and third line';

5. test for variables typeof var == 'undefined'

6. Remove element array by value

var a = ['apple', 'orange', 'kiwi'];
a.splice(a.indexOf('orange'), a.indexOf('orange') != -1 ? 1 : 0);

7. Checking for page unload

window.onbeforeunload = function() { 
    return "You work will be lost."; 
};

8. Rounding Numbers to ‘N’ Decimals

var num = 2.443242342;
alert(num.toFixed(2)); // 2.44

9. Self executing functions

10. Delete object properties

11. For some things you do not need images. Arrow down in CSS.