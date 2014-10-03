(function () {

    'use strict';

    var _delete = function (grunt) {
        return function (path) {
            if (grunt.file.expand(path).length > 0) {
                grunt.verbose.writeln('Deleting: \'' + grunt.file.expand(path) + '\'');
                grunt.file.delete(grunt.file.expand(path), {force: true});
            }
        };
    };

    module.exports = {
        _delete: _delete,
        _copy: function (grunt) {
            return function (source, destination) {
                grunt.file.mkdir(destination);
                grunt.file.expand(source).forEach(function (file) {
                    if (grunt.file.isDir(file)) {
                        grunt.file.recurse(file, function callback(abspath, rootdir, subdir, filename) {
                            grunt.verbose.writeln('Copying: \'' + abspath + '\' to \'' + destination + '/' + (subdir ? subdir + '/' : '') + filename + '\'');
                            grunt.file.copy(abspath, destination + '/' + (subdir ? subdir + '/' : '') + filename);
                        });
                    } else {
                        grunt.file.copy(file, destination);
                    }
                });
            };
        },
        _cleanUp: function (grunt) {
            return function (options, allFiles) {
                if (allFiles) {
                    _delete(grunt)(options.working_directory);
                    _delete(grunt)(options.working_directory + options.packaging_directory_name);
                    _delete(grunt)(options.package_location + '*.tar.gz');
                    _delete(grunt)(options.package_location + '*.build');
                    _delete(grunt)(options.package_location + '*.changes');
                    _delete(grunt)(options.package_location + '*.deb');
                } else if (!grunt.option('verbose')) {
                    _delete(grunt)(options.working_directory + options.packaging_directory_name);
                    _delete(grunt)(options.package_location + '*.tar.gz');
                    _delete(grunt)(options.package_location + '*.build');
                }
            };
        }
    };

})();
