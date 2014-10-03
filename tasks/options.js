(function () {

    'use strict';

    String.prototype.endsWidth = function (substring) {
        var str = this;
        if (str.lastIndexOf(substring) >= 0) {
            return str.lastIndexOf(substring) === (str.length - substring.length);
        }
        return false;
    };

    module.exports = {
        _validate: function (grunt) {
            return function (options, quiet) {
                var valid = true;
                if (!options.maintainer) {
                    if (!quiet) {
                        grunt.log.subhead('no maintainer details provided!!');
                        grunt.log.errorlns('please add the \'maintainer\' option specifying the name and email in your debian_package configuration in your Gruntfile.js or add \'DEBFULLNAME\' and \'DEBEMAIL\' environment variable (i.e. export DEBFULLNAME="James D Bloom" && export DEBEMAIL="jamesdbloom@email.com")');
                    }
                    valid = false;
                }
                if (options.maintainer && !options.maintainer.name) {
                    if (!quiet) {
                        grunt.log.subhead('no maintainer name provided!!');
                        grunt.log.errorlns('please add the \'maintainer.name\' option in your debian_package configuration in your Gruntfile.js or add a \'DEBFULLNAME\' environment variable (i.e. export DEBFULLNAME="James D Bloom")');
                    }
                    valid = false;
                }
                if (options.maintainer && !options.maintainer.email) {
                    if (!quiet) {
                        grunt.log.subhead('no maintainer email provided!!');
                        grunt.log.errorlns('please add the \'maintainer.email\' option in your debian_package configuration in your Gruntfile.js or add a \'DEBEMAIL\' environment variable (i.e. export DEBEMAIL="jamesdbloom@email.com")');
                    }
                    valid = false;
                }
                if (!options.short_description) {
                    if (!quiet) {
                        grunt.log.subhead('no short description provided!!');
                        grunt.log.errorlns('please add the \'short_description\' option in your debian_package configuration in your Gruntfile.js or add a \'description\' field to package.json');
                    }
                    valid = false;
                }
                if (!options.long_description) {
                    if (!quiet) {
                        grunt.log.subhead('no long description provided!!');
                        grunt.log.errorlns('please add the \'long_description\' option in your debian_package configuration in your Gruntfile.js or add a multi line \'description\' field to package.json (note: the first line is used as the short description and the remaining lines are used as the long description)');
                    }
                } else {
                    // add extra space at start to ensure format is correct and allow simple unit test comparisons
                    options.long_description = ' ' + options.long_description;
                }
                if (options.working_directory && !options.working_directory.endsWidth("/")) {
                    options.working_directory = options.working_directory + "/";
                }
                if (valid) {
                    options.package_name = options.package_name || (options.prefix || '') + (options.name || 'debian_package') + (options.postfix || '');
                    options.package_location = options.working_directory + options.package_name;
                }
                return valid;
            };
        }
    };

})();