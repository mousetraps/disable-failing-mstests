var strReplace = require('./replaceBetween');
var xml2js = require('xml2js');
var fs = require('fs');
var path = require('path');
var replace = require('replace');
var scanFolder = require('scan-folder');

var testResults = fs.readFileSync('test-results.trx').toString();
var failedTests = [];
xml2js.parseString(testResults, function cb(err, result) {
    var tests = result.TestRun.Results[0].UnitTestResult;
    for (var i = 0; i < tests.length; i++) {
        var test = tests[i].$;
        if (test.outcome === 'Failed') {
            failedTests.push(test.testName);
        }
    }

    var files = scanFolder(process.argv[2] || __dirname, 'cs', true);
    var testsIgnored = 0;

    for (var file of files) {
        var testFile = fs.readFileSync(file).toString();
        var touched = false;

        for (var i = 0; i < failedTests.length; i++) {
            var regexp = new RegExp("(.*)\\[TestMethod.*([\\r|\\n]*).*([\\r|\\n]*).*public void " + failedTests[i] + "\\(");
            var match = regexp.exec(testFile);

            if (match !== null) {
                var toReplace = match[0];
                var indent = match[1]
                var newline = match[2];

                var replaceWith = indent + '[Ignore]' + newline + toReplace;
                testFile = testFile.replace(toReplace, replaceWith);
                touched = true;
                testsIgnored++;
            }
        }

        if (touched) {
            console.log(testsIgnored + '/', failedTests.length, file);
            fs.writeFileSync(file, testFile)
        }
    }

});

console.log(process.argv[2])
console.log("The Hello World Code!".replaceBetween(4, 9, "Hi"));
