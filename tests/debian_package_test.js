'use strict';

var grunt = require('grunt');

/*
 ======== A Handy Little Nodeunit Reference ========
 https://github.com/caolan/nodeunit

 Test methods:
 test.expect(numAssertions)
 test.done()
 Test assertions:
 test.ok(value, [message])
 test.equal(actual, expected, [message])
 test.notEqual(actual, expected, [message])
 test.deepEqual(actual, expected, [message])
 test.notDeepEqual(actual, expected, [message])
 test.strictEqual(actual, expected, [message])
 test.notStrictEqual(actual, expected, [message])
 test.throws(block, [error], [message])
 test.doesNotThrow(block, [error], [message])
 test.ifError(value)
 */

function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(string, find, replace) {
    return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

var compareDirectories = function (test, source, destination) {
    grunt.file.recurse(source, function callback(abspath, rootdir, subdir, filename) {
        if (abspath !== 'tests/default_options/packaging/debian/changelog' && abspath !== 'tests/custom_options/packaging/debian/changelog') {

            var expected = replaceAll(grunt.file.read(abspath), '${current_dir}', process.cwd());
            var message = '\n\n' +
                'Comparing: \'' + abspath + '\' to \'' + destination + '/' + (subdir ? subdir + '/' : '') + filename +
                '\'\n\n' +
                'Expected:\n\'' +
                '' + expected +
                '\'\n\n' +
                'But Found:\n\'' +
                '' + grunt.file.read(destination + '/' + (subdir ? subdir + '/' : '') + filename) + '\'';

            test.equal(expected, grunt.file.read(destination + '/' + (subdir ? subdir + '/' : '') + filename), message);
        }
    });
    test.done();
};

exports.debian_package = {
    setUp: function (done) {
        // setup here if necessary
        done();
    },
    default_options: function (test) {
        compareDirectories(test, 'tests/default_options', 'tmp');
    },
    custom_options: function (test) {
        compareDirectories(test, 'tests/custom_options', 'custom_tmp');
    }
};
