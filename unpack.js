// a very simple script that unpacks the objdump binaries after the package has been installed
var lChildProcess = require('child_process');
var lPath = require("path");
var lOperatingSystem = require("os");
var sUPXPath = lPath.resolve(lPath.join(__dirname, "bin", "upx.exe"));
var sObjectDumpPath = lPath.resolve(lPath.join(__dirname, "bin", "objdump-" + lOperatingSystem.arch() + ".exe"));

var sUnpackingArguments = [
    "-d",
    sObjectDumpPath
];

lChildProcess.execFile(sUPXPath, sUnpackingArguments, function (eError, sStandardOut, sStandardError) {
    if (eError) { throw new Error(eError.message + ": " + sStandardError);}
    console.log("done extracting the objdump binary into bin folder");
});

