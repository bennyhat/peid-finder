// Not all possibilites are covered, as it's difficult to mock the objdump calls
var assert = require("assert");
var path = require("path");

var sSubjectPath = path.resolve(path.join(__dirname, "..", "index.js"));

var sPEIDBinaryFile1 = "e8e91a00";
var sPEIDBinaryFile2 = "81ecd402";
var sBinaryFile1Name = "file1.exe";
var sBinaryFile2Name = "file2.exe";

var oMockSoftware1 = {executable: sBinaryFile1Name, peid: sPEIDBinaryFile1};
var oMockSoftware2 = {executable: sBinaryFile2Name, peid: sPEIDBinaryFile2};

var sMockBinaryRootPath = path.resolve(path.join(__dirname, "mock"));
var sMockBinary1Path = path.resolve(path.join(sMockBinaryRootPath, sBinaryFile1Name));
var sMockBinaryNonePath = path.resolve(path.join(sMockBinaryRootPath, "whonko"));
var sMockBinaryGlobPath = path.join(sMockBinaryRootPath, "**/*.exe");
var sMockBinaryGlobNonePath = path.join(sMockBinaryRootPath, "**/whonko.exe");

var lSubject = require(sSubjectPath);

function contains(aArray, oSoftware) {
    for (var kKey in aArray) {
        if (!aArray[kKey].executable === oSoftware.executable) { continue;}
        if (!aArray[kKey].peid === oSoftware.peid) { continue;}
        return true;
    }
    return false;
}

describe("peid-finder", function () {
    describe("#find(full/path/to/binary)", function (done) {
        it("responds with an array with a software object that has the correct executable name and peid", function (done) {
            lSubject.find(sMockBinary1Path, 16, function (eError, sResponse) {
                if (eError) return done(eError);
                assert.equal(1, sResponse.length); // correct response length, given the input
                assert.equal(true, contains(sResponse, oMockSoftware1));
                done();
            });
        });
        it("gives error when given a non-existent file", function (done) {
            lSubject.find(sMockBinaryNonePath, 8, function (eError) {
                assert.notEqual(null, eError);
                done();
            });
        });
        it("responds with an array with the a valid PEID for a test file", function (done) {
            lSubject.find(sMockBinary1Path, 32, function (eError, sResponse) {
                if (eError) return done(eError);
                var rexNonHex = new RegExp("[^0-9a-f]+", "i");
                assert.equal(false, rexNonHex.test(sResponse[0].peid));
                done();
            });
        });
    });
    describe("#find(glob for binaries)", function (done) {
        it("responds with an array with software objects that have the correct executable names and peids", function (done) {
            lSubject.find(sMockBinaryGlobPath, 8, function (eError, sResponse) {
                if (eError) return done(eError);
                assert.equal(true, contains(sResponse, oMockSoftware1));
                assert.equal(true, contains(sResponse, oMockSoftware2));
                done();
            });
        });
        it("gives error when given a glob that returns no files", function (done) {
            lSubject.find(sMockBinaryGlobNonePath, 8, function (eError) {
                assert.notEqual(null, eError);
                done();
            });
        });
        it("responds with an array with a valid PEID for each test file", function (done) {
            lSubject.find(sMockBinaryGlobPath, 32, function (eError, sResponse) {
                if (eError) return done(eError);
                var rexNonHex = new RegExp("[^0-9a-f]+", "i");
                for (var kKey in sResponse) {
                    assert.equal(false, rexNonHex.test(sResponse[kKey].peid));
                }
                done();
            });
        });
    });
    describe("#find(invalid arguments)", function (done) {
        it("throws an error when passed a null path", function (done) {
            lSubject.find(null, 16, function (eError) {
                assert.notEqual(null, eError);
                done();
            });
        });
        it("throws an error when passed a null character count", function (done) {
            lSubject.find(null, 16, function (eError) {
                assert.notEqual(null, eError);
                done();
            });
        });
        it("throws an error when specified to return more characters than it can", function (done) {
            lSubject.find(null, 33, function (eError) {
                assert.notEqual(null, eError);
                done();
            });
        });
    });
});