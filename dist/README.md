# Publish to NPM

This forlder is used to publish package to npm. (IMPORTANT) You cannot republish a package with the same version. So, basically, you only have a single shut with NPM for a version. Even though you can unpublish a package within first 48 hours, you cannot re-use same version.

Here are the steps how to do it.

1. Test you package locally. Run in this directory
```
npm pack
```

2. Install package into target project
```
cd ../..
mkdir test
npm install ../w2ui/dist/w2ui-1.5.0.tgz
```

Make sure all files are correct

3. Publish to NPM
Please note you cannot re-publish same version. CHECK TWICE!!
```
npm publish
```