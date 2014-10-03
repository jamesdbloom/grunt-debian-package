'use strict';

var grunt = require('grunt');

function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(string, find, replace) {
    return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

var compareDirectories = function (test, source, destination) {
    grunt.file.recurse(source, function callback(abspath, rootdir, subdir, filename) {
        if (abspath !== 'test/integration/default_options/packaging/debian/changelog' && abspath !== 'test/integration/custom_options/packaging/debian/changelog') {

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
        compareDirectories(test, 'test/integration/default_options', 'tmp');
    },
    custom_options: function (test) {
        compareDirectories(test, 'test/integration/custom_options', 'test/integration/tmp');
    }
};
