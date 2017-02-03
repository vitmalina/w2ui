## W2UI 1.5 - MIT License

W2UI is modern, intuitive JavaScript UI library for building rich data-driven web application. The library has
a small footprint and only jQuery (1.9+) as a dependency. The library has the following widgets:

* w2layout
* w2grid
* w2toolbar
* w2sidebar
* w2tabs
* w2form
* w2fields
* w2popup
* w2utils

The complete library is only **69Kb** (minified & gzipped)


## Who Uses It

If you're using w2ui I'd love to hear about it, please email to vitmalina@gmail.com name of your project and a link to a public website or demo and I will add it to the list.

[List of projects that use w2ui](https://github.com/vitmalina/w2ui/wiki/Projects-that-use-w2ui)

## Quick Start

Current stable version is 1.4.
Current development version is 1.5.rc1.

You can:
- Download from here: [http://w2ui.com](http://w2ui.com)
- Install using bower

```
bower install w2ui
```

To start using the library you need to include into your page:

- w2ui-1.4.js (or w2ui-1.4.min.js)
- w2ui-1.4.css (or w2ui-1.4.min.css)

All the widgets and their css classes are defined inside of these two files. There is no image dependencies, some images
are embedded into CSS file.

There is no requirement for a server side language. Node, Java, PHP, ASP, Perl or .NET all will work, as long as you can
return JSON format from the server (or write a converter into JSON format on the client).

[Getting Started Guide](http://w2ui.com/web/get-started)


## Documentation & Demos

You can find documentation and demos here:

* [http://w2ui.com/web/docs](http://w2ui.com/web/docs) - documentation
* [http://w2ui.com/web/demos](http://w2ui.com/web/demos) - demos


## Bug Tracking

Have a bug or a feature request? Please open an issue here [https://github.com/vitmalina/w2ui/issues](https://github.com/vitmalina/w2ui/issues).
Please make sure that the same issue was not previously submitted by someone else.


## Building

I have switched to Grunt as a build tool. You will find Gruntfile.js in the root. You still can build with ANT if you are more comfortable with it.
Both processes will produces same w2ui.js and w2ui.css files. Grunt has a few more tasks, such as watch, to auto compiles less and js files as you
develop. Both tools will do the following:

- Compile LESS files
- Concatenate and minify CSS files
- Concatenate, uglify and minify JS files

To use ANT, you will need to install NodeJS and NPM, then run the following command to install dependencies

```
sudo npm install less -g
sudo npm install clean-css -g
sudo npm install uglify-js@1 -g
```

To use Grunt, you will still need to install NodeJS and NPM, then run npm install that will install all dependencies as
they are described in package.json file.

```
npm install
```

## File Structure

```
- dist           - compiled JS and CSS files
- src            - source JS files
  - kickstart    - copy of another project used with the demos (not part of w2ui itself)
  - less         - LESS files (source for css)
- demos          - all demos, same as on the website
- libs           - auxiliary libraries (jquery, codemirror, etc.) used in the demos (not part of w2ui itself)
- server         - example implementations for a server implementation communicating with w2ui instances
- test           - feature testing files
- qa             - some qunit test
```


## Contributing

Your contributions are welcome. However, few things you need to know before contribution:

1. Please check out latest code before changing anything. It is harder to merge if your changes will not merge clean.
2. If you are changing JS files - do all changes in /src folder
3. If you are changing CSS files - do all changes in LESS in /src/less/src
4. If you want to help with unit test - do all changes in /qa
5. If you want to change documentation - do all changes in /docs
6. If you want to add demos - do all changes in /demos

