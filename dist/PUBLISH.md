# Publish to NPM

This folder is used to publish package to npm. (IMPORTANT) You cannot republish a package with the same version. So, basically, you only have a single shot with NPM for a version. Even though you can unpublish a package within first 48 hours, you cannot re-use same version.

Here are the steps how to do it.

1. Test you package locally. Run in this directory
```
npm pack
```

2. Install package into target project
```
cd ../..
sudo mkdir test
sudo chmod 0777 test
cd test
npm install ../w2ui/dist/w2ui-2.0.0.tgz
```

Make sure all files are correct

3. Publish to NPM
Please note you cannot re-publish same version. CHECK TWICE!!
```
npm publish
```
