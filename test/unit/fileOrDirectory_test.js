(function () {

    'use strict';

    var sinon = require('sinon'),
        testCase = require('nodeunit').testCase;

    exports.fileOfDirectory_test = {
        'delete': testCase({
            setUp: function (callback) {
                this.grunt = require('grunt');
                this._delete = require('../../tasks/fileOrDirectory.js')._delete(this.grunt);
                callback();
            },
            'should delete existing file': function (test) {
                // given
                var path = "test/unit/tmp/test_file_to_delete.txt";

                this.grunt.file.copy("test/unit/test_file.txt", path);

                // when
                test.ok(this.grunt.file.exists(path), "File exists before being deleted");
                this._delete(path);

                // then
                test.ok(!this.grunt.file.exists(path), "File does not exist after being deleted");

                // end
                test.done();
            },
            'should delete existing empty directory': function (test) {
                // given
                var path = "test/unit/tmp/directory_to_delete";

                this.grunt.file.mkdir(path);

                // when
                test.ok(this.grunt.file.exists(path), "Exists before being deleted");
                test.ok(this.grunt.file.isDir(path), "Checking is directory before being deleted");
                this._delete(path);

                // then
                test.ok(!this.grunt.file.exists(path), "Directory does not exist after being deleted");

                // end
                test.done();
            },
            'should delete existing directory containing files': function (test) {
                // given
                var path = "test/unit/tmp/directory_with_files_to_delete";

                this.grunt.file.mkdir(path);
                this.grunt.file.copy("test/unit/test_file.txt", path + "/file_one.txt");
                this.grunt.file.copy("test/unit/test_file.txt", path + "/file_two.txt");

                // when
                test.ok(this.grunt.file.exists(path), "Exists before being deleted");
                test.ok(this.grunt.file.isDir(path), "Checking is directory before being deleted");
                this._delete(path);

                // then
                test.ok(!this.grunt.file.exists(path), "File does not exist after being deleted");

                // end
                test.done();
            }
        }),
        'copy': testCase({
            setUp: function (callback) {
                this.mockGrunt = {
                    verbose: {
                        writeln: sinon.spy.create()
                    }
                };
                this._copy = require('../../tasks/fileOrDirectory.js')._copy(this.mockGrunt);
                callback();
            }
        })
    };

})();
