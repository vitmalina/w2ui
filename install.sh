#!/bin/sh
#
# Install npm dependencies and force ttf2woff2 to version 3.0.0 for node12-compatibility.
#

test -d node_modules && rm -rf node_modules
test -f npm-shrinkwrap.json && rm -f npm-shrinkwrap.json

cat <<EOF > npm-shrinkwrap.json
{
  "name": "w2ui",
  "lockfileVersion": 1,
  "dependencies": {
    "grunt-webfont": {
      "dev": true,
      "version": "1.7.2",
      "dependencies": {
        "ttf2woff2": {
          "version": "3.0.0",
          "from": "~2.0.3"
        }
      }
    }
  }
}
EOF

npm install
