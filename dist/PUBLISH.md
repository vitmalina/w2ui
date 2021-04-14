# Publish to NPM

This forlder is used to publish package to npm. Here are the steps how to do it.

1. Test you package locally. Run in this directory
```
npm pack
``

2. Install package into target project
```
cd ../..
mkdir test
npm install ../w2ui/dist/w2ui-1.5.0.tgz
```

Make sure all files are correct

3. Publish to NPM
Please note you cannot republish save version again if you make mistake and unpublish it. CHECK TWICE!!
```
npm publish
```