var child = require('child_process');
var path = require("path");
var os = require("os");
var globule = require("globule");
var async = require("async");

// quick fix-up for operating system detection
if (os.platform() !== "win32") { throw new Error("peid-finder currently only works for windows");}
var sObjectDumpPath = path.resolve(path.join(__dirname, "bin", "objdump-" + os.arch() + ".exe"));

// export of the main find function
module.exports = {
    find: function find(sBinaryPath, iLength, fCallback) {
        // basic validation
        if (typeof sBinaryPath !== "string") { return fCallback(new Error("please pass in string for the binary path(s)"));}
        if (typeof iLength !== "number") { return fCallback(new Error("please pass in number for the PEID character count"));}
        if (iLength > 32) { return fCallback(new Error("cannot return more than 30 PEID characters"));}

        // kick it off async
        process.nextTick(function () {
            // break out the paths into an array of paths
            var asBinaryPaths = [];
            if (sBinaryPath.indexOf("*") < 0) {
                asBinaryPaths = [sBinaryPath];
            }
            else {
                asBinaryPaths = globule.find(sBinaryPath);
            }
            if (asBinaryPaths.length < 1) { return fCallback(new Error("No such files found"));}

            // tracking for the characters that were found
            var aEntryMapping = [];

            // this gets a bit janky, due to the callback structure for waterfall
            async.forEach(asBinaryPaths, function (sBinaryPath) {
                return async.waterfall([
                        function (fCallback) {
                            getEntryPoint(sBinaryPath, fCallback);
                        },
                        function (iStartAddress, fCallback) {
                            getEntryPointCharacters(sBinaryPath, iStartAddress, iLength, fCallback);
                        }
                    ],
                    function (eError, sEntryCharacters) {
                        if (eError) { return fCallback(eError); }
                        var oSoftware = {};
                        oSoftware.executable = path.basename(sBinaryPath);
                        oSoftware.peid = sEntryCharacters;
                        aEntryMapping.push(oSoftware);

                        // TODO - find a less silly way of doing this
                        if (aEntryMapping.length === asBinaryPaths.length) { fCallback(null, aEntryMapping); }
                    });
            });

        });
    }
};

function getEntryPoint(sBinaryPath, fCallback) {
    // regex hell for finding the address in the output of objdump
    var rexPointer = new RegExp("start address ([\\w]+)[\\s]", "gi");

    var asArguments = [
        "-f",
        sBinaryPath
    ];
    child.execFile(sObjectDumpPath, asArguments, function (eError, sStandardOut, sStandardError) {
        if (eError) {return fCallback(new Error(eError + ": " + sStandardError)); }

        var aMatches = rexPointer.exec(sStandardOut);
        if (!aMatches) { return fCallback(new Error("unable to find the entry point in the binary")); }
        var iEntryPointAddress = parseInt(aMatches[1]);

        fCallback(null, iEntryPointAddress);
    });
}

function getEntryPointCharacters(sBinaryPath, iStartAddress, iLength, fCallback) {
    // regex hell for finding the address in the output of objdump
    var iStopAddress = iStartAddress + (iLength / 2); // 2 characters per hex
    var sStartAddress = iStartAddress.toString(16).slice(-6);
    // the output is in the form  <last 6 of address> <group of characters we want><possible spaces><group of characters we want><possibly more groups and spaces><junk>
    // ex.  4191c6 e8e9 1a00                            ....
    var rexCharacters = new RegExp(sStartAddress + "[\\s]((?:[\\w]+[\\s]?)+)", "i"); // grab the multiple digits in the middle

    var asArguments = [
        "-s",
            "--start-address=" + iStartAddress,
            "--stop-address=" + iStopAddress,
        "--show-raw-insn",
            "--insn-width=" + iLength,
        sBinaryPath
    ];

    child.execFile(sObjectDumpPath, asArguments, function (eError, sStandardOut, sStandardError) {
        if (eError) {return fCallback(new Error(eError + ": " + sStandardError)); }

        var aMatches = rexCharacters.exec(sStandardOut);
        if (!aMatches) { return fCallback(new Error("unable to find the entry characters in the binary")); }
        var sEntryCharacters = aMatches[1].replace(new RegExp("[^0-9a-z]+", "gi"), "").trim();

        fCallback(null, sEntryCharacters);
    });
}
