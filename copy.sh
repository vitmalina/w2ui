#!/bin/bash
grunt

# Copy to USolver
cd dist
cp w2ui.js ../../USolver/src/libs/w2ui/w2ui.js
cp w2ui.min.js ../../USolver/src/libs/w2ui/w2ui.min.js
cp w2ui.css ../../USolver/src/libs/w2ui/w2ui.css
cp w2ui.min.css ../../USolver/src/libs/w2ui/w2ui.min.css
cp kickstart.min.js ../../USolver/src/libs/kickstart/kickstart.min.js
cp kickstart.js ../../USolver/src/libs/kickstart/kickstart.js
cd ../../USolver

# Rebuild USolver libs
gulp libs
cd ../w2ui
