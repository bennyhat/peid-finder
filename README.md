peid-finder
===========

Will find extract a portable executable entrypoint string (up to 32 characters) from an executable for the purpose of identifying it.

```
NOTE: an issue with arch misidentification has been fixed for 32 bit node on 64 bit windows. 
also 32 bit detection has been fixed in general
```

This can be used as a NodeJS module
```javascript
var peidFinder = require("peid-finder");
var peidFinder.find("**/*.exe",8,function (error, peids) {
});
```

Or from command line after install:
```sh
$ peid-finder **/*.exe 8
```

Both options will return an array of objects that have an executable name and peid, like below:

```javascript
[
 {
   "executable":"file.exe",
   "peid":"12345678",
 }
]
```
