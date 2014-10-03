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
                this.grunt = require('grunt');
                this._copy = require('../../tasks/fileOrDirectory.js')._copy(this.grunt);
                callback();
            },
            'should copy directory and its containing files': function (test) {
                // given
                var directory = "test/unit/tmp/directory_to_copy",
                    sub_directory = directory + "/subdirectory",
                    files = [
                            directory + "/file_one.txt",
                            directory + "/file_two.txt",
                            sub_directory + "/file_three.txt",
                            sub_directory + "/file_four.txt"
                    ],
                    i = 0,
                    target_directory = "test/unit/tmp/target_directory",
                    target_sub_directory = target_directory + "/subdirectory",
                    target_files = [
                            target_directory + "/file_one.txt",
                            target_directory + "/file_two.txt",
                            target_sub_directory + "/file_three.txt",
                            target_sub_directory + "/file_four.txt"
                    ];

                this.grunt.file.mkdir(directory);
                this.grunt.file.mkdir(sub_directory);
                for (; i < files.length; i++) {
                    this.grunt.file.copy("test/unit/test_file.txt", files[i]);
                }

                // when
                test.ok(this.grunt.file.exists(directory), "Exists before being deleted");
                test.ok(this.grunt.file.isDir(directory), "Checking is directory before being deleted");
                this._copy(directory, target_directory);

                // then
                test.ok(this.grunt.file.exists(target_directory), "Target directory created");
                test.ok(this.grunt.file.isDir(target_directory), "Target directory is a directory");
                test.ok(this.grunt.file.exists(target_sub_directory), "Target sub-directory created");
                test.ok(this.grunt.file.isDir(target_sub_directory), "Target sub-directory is a directory");
                for (i = 0; i < target_files.length; i++) {
                    test.ok(this.grunt.file.exists(target_files[i]), "Target file created");
                }

                // end
                test.done();
            }
        })
    };

})();
