## JS Files

Final JS file - w2ui.js, w2ui.min.js - is compiled from a number of files in /src directory. You should not change the files in /dist directory
directly, but do all changes in src directory and compile (concatenate and minify) them.

## LESS files

Final CSS files are compiled from LESS counterparts. Do not change files in /dist directory. In less/src folder you will find all source files for all widgets, as well as mixing and variables. If you want to create a new theme, you can clone

- css/less/w2ui.less 

and change colors, etc. All of the variables are conveniently included into this file. Once you are done, you can compile the final file with lessc compiler.