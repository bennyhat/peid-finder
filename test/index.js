// Not all possibilites are covered, as it's difficult to mock the objdump calls

var lAssert = require("assert");
var lShould = require('should');
var lPath = require("path");
var sSubjectPath = lPath.resolve(lPath.join(__dirname, "..", "index.js"));
var sMockBinaryRootPath = lPath.resolve(lPath.join(__dirname, "mock"));
var sMockBinary1Path = lPath.resolve(lPath.join(sMockBinaryRootPath, "file1.exe"));
var sMockBinaryNonePath = lPath.resolve(lPath.join(sMockBinaryRootPath, "whonko"));
var sMockBinaryGlobPath = lPath.join(sMockBinaryRootPath, "**/*.exe");
var sMockBinaryGlobNonePath = lPath.join(sMockBinaryRootPath, "**/whonko.exe");

var sPEIDBinaryFile1 = "e8e91a00";
var sPEIDBinaryFile2 = "81ecd402";

var lSubject = require(sSubjectPath);

describe("peid-finder", function () {
    describe("#find(full/path/to/binary)", function (done) {
        it("responds with a PEID that is at least the specified number of characters long", function (done) {
            lSubject.find(sMockBinary1Path, 16, function (eError, sResponse) {
                if (eError) return done(eError);
                lShould(sResponse[0].length).be.greaterThan(15);
                done();
            });
        });
        it("gives error when given a non-existent file", function (done) {
            lSubject.find(sMockBinaryNonePath, 8, function (eError) {
                lAssert.notEqual(null, eError);
                done();
            });
        });
        it("responds with the correct PEID for a test file", function (done) {
            lSubject.find(sMockBinary1Path, 8, function (eError, sResponse) {
                if (eError) return done(eError);
                lShould(sResponse[0]).equal(sPEIDBinaryFile1);
                done();
            });
        });
        it("responds with the a valid PEID for a test file", function (done) {
            lSubject.find(sMockBinary1Path, 32, function (eError, sResponse) {
                if (eError) return done(eError);
                var rexNonHex = RegExp("[^0-9a-f]+", "i");
                lAssert.equal(false, rexNonHex.test(sResponse));
                done();
            });
        });
    });
    describe("#find(glob for binaries)", function (done) {
        it("responds with a PEID for each file found", function (done) {
            lSubject.find(sMockBinaryGlobPath, 8, function (eError, sResponse) {
                if (eError) return done(eError);
                lShould(sResponse.length).be.greaterThan(1);
                done();
            });
        });
        it("responds with a PEID that is at least 8 characters long for each file found", function (done) {
            lSubject.find(sMockBinaryGlobPath, 8, function (eError, sResponse) {
                if (eError) return done(eError);
                lShould(sResponse[0].length).be.greaterThan(7);
                lShould(sResponse[1].length).be.greaterThan(7);
                done();
            });
        });
        it("gives error when given a glob that returns no files", function (done) {
            lSubject.find(sMockBinaryGlobNonePath, 8, function (eError) {
                lAssert.notEqual(null, eError);
                done();
            });
        });
        it("responds with the correct PEID for each test file in the glob", function (done) {
            lSubject.find(sMockBinaryGlobPath, 8, function (eError, sResponse) {
                if (eError) return done(eError);
                lAssert(true, sResponse.indexOf(sPEIDBinaryFile1) > -1);
                lAssert(true, sResponse.indexOf(sPEIDBinaryFile2) > -1);
                done();
            });
        });
    });
    describe("#find(invalid arguments)", function (done) {
        it("throws an error when passed a null path", function (done) {
            lSubject.find(null, 16, function (eError) {
                lAssert.notEqual(null, eError);
                done();
            });
        });
        it("throws an error when passed a null character count", function (done) {
            lSubject.find(null, 16, function (eError) {
                lAssert.notEqual(null, eError);
                done();
            });
        });
        it("throws an error when specified to return more characters than it can", function (done) {
            lSubject.find(null, 33, function (eError) {
                lAssert.notEqual(null, eError);
                done();
            });
        });
    });
});