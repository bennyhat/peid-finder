peid-finder
===========

Will find extract a portable executable entrypoint string (up to 32 characters) from an executable for the purpose of identifying it.

This can be used as a NodeJS module
```javascript
var peid-finder = require("peid-finder");
var peid-finder.find("**/*.exe",8,function (error, peids) {
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
