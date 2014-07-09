/*
 * grunt-debian-package
 * https://github.com/jamesdbloom/grunt-debian-package
 *
 * Copyright (c) 2014 James Bloom
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    String.prototype.replaceAll = function (find, replace) {
        var str = this;
        return str.replace(new RegExp(find, 'g'), replace);
    };

    var packagingFilesDirectory = 'packaging',
        hasValidOptions = function (options) {
            var valid = true;
            if (!options.maintainer) {
                grunt.log.subhead('no maintainer details provided!!');
                grunt.log.errorlns('please add the \'maintainer\' option specifying the name and email in your debian_package configuration in your Gruntfile.js or add \'DEBFULLNAME\' and \'DEBEMAIL\' environment variable (i.e. export DEBFULLNAME="James D Bloom" && export DEBEMAIL="jamesdbloom@email.com")');
                valid = false;
            }
            if (options.maintainer && !options.maintainer.name) {
                grunt.log.subhead('no maintainer name provided!!');
                grunt.log.errorlns('please add the \'maintainer.name\' option in your debian_package configuration in your Gruntfile.js or add a \'DEBFULLNAME\' environment variable (i.e. export DEBFULLNAME="James D Bloom")');
                valid = false;
            }
            if (options.maintainer && !options.maintainer.email) {
                grunt.log.subhead('no maintainer email provided!!');
                grunt.log.errorlns('please add the \'maintainer.email\' option in your debian_package configuration in your Gruntfile.js or add a \'DEBEMAIL\' environment variable (i.e. export DEBEMAIL="jamesdbloom@email.com")');
                valid = false;
            }
            if (!options.short_description) {
                grunt.log.subhead('no short description provided!!');
                grunt.log.errorlns('please add the \'short_description\' option in your debian_package configuration in your Gruntfile.js or add a \'description\' field to package.json');
                valid = false;
            }
            if (!options.long_description) {
                grunt.log.subhead('no long description provided!!');
                grunt.log.errorlns('please add the \'long_description\' option in your debian_package configuration in your Gruntfile.js or add a multi line \'description\' field to package.json (note: the first line is used as the short description and the remaining lines are used as the long description)');
            }
            return valid;
        },
        deleteFileOrDirectory = function (path) {
            if (grunt.file.expand(path).length > 0) {
                grunt.verbose.writeln('Deleting: \'' + grunt.file.expand(path) + '\'');
                // grunt.file.delete(grunt.file.expand(path), {force: true});
            }
        },
        copyFileOrDirectory = function (source, destination) {
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
        },
        findAndReplace = function (files, find, replace) {
            grunt.verbose.writeln('Replacing: \'' + replace.replaceAll('\\n', '\\n').replaceAll('\\t', '\\t') + '\' for \'' + find.replaceAll('\\\\', '') + '\' in ' + files.join(' and '));
            require('replace')({
                regex: find,
                replacement: replace,
                paths: files,
                recursive: true,
                silent: true
            });
        },
        transformAndReplace = function (files, find, list, transform) {
            if (list) {
                var replace = '';

                for (var i = 0; i < list.length; i++) {
                    replace += transform(list[i]);
                }

                findAndReplace(files, find, replace);
            }
        },
        preparePackageContents = function (makefile, files) {
            transformAndReplace([makefile], '\\$\\{file_list\\}', files, function (file) {
                return file.src.filter(function (filepath) {
                    if (!grunt.file.exists(filepath)) {
                        grunt.log.warn('File \'' + filepath + '\' not found');
                        return false;
                    } else {
                        return true;
                    }
                }).map(function (filepath) {
                    grunt.log.writeln('Adding \'' + filepath + '\' to \'' + file.dest + '\'');
                    return '\tmkdir -p $(DESTDIR)' + file.dest.substr(0, file.dest.lastIndexOf('/')) + ' && cp -a ' + process.cwd() + '/' + filepath + ' $(DESTDIR)' + file.dest + '\n';
                }).join('');
            });
        },
        cleanUp = function (options, force) {
            if (force) {
                deleteFileOrDirectory(options.working_directory);
                deleteFileOrDirectory(options.working_directory + packagingFilesDirectory);
                deleteFileOrDirectory(packageLocation(options) + '*.tar.gz');
                deleteFileOrDirectory(packageLocation(options) + '*.build');
                deleteFileOrDirectory(packageLocation(options) + '*.changes');
                deleteFileOrDirectory(packageLocation(options) + '*.deb');
            } else if (!grunt.option('verbose')) {
                deleteFileOrDirectory(options.working_directory + packagingFilesDirectory);
                deleteFileOrDirectory(packageLocation(options) + '*.tar.gz');
                deleteFileOrDirectory(packageLocation(options) + '*.build');
            }
        },
        packageName = function (options) {
            return options.prefix + options.name + options.postfix;
        },
        packageLocation = function (options) {
            return options.working_directory + '/' + packageName(options);
        };

    grunt.registerMultiTask('debian_package', 'Create debian package from grunt build', function () {
            // tell Grunt this task is asynchronous.
            var done = this.async();

            // Merge task-specific and/or target-specific options with these defaults.
            var pkg = grunt.file.readJSON('package.json'),
                options = this.options({
                    maintainer: process.env.DEBFULLNAME && process.env.DEBEMAIL && {
                        name: process.env.DEBFULLNAME,
                        email: process.env.DEBEMAIL
                    },
                    name: pkg.name,
                    prefix: "",
                    postfix: "",
                    short_description: (pkg.description && pkg.description.split(/\r\n|\r|\n/g)[0]) || '',
                    long_description: (pkg.description && pkg.description.split(/\r\n|\r|\n/g).splice(1).join(' ')) || '',
                    version: pkg.version,
                    build_number: process.env.BUILD_NUMBER || process.env.DRONE_BUILD_NUMBER || process.env.TRAVIS_BUILD_NUMBER || '1',
                    working_directory: 'tmp/'
                }),
                spawn = require('child_process').spawn,
                dateFormat = require('dateformat'),
                now = dateFormat(new Date(), 'ddd, d mmm yyyy h:MM:ss +0000'),
                temp_directory = options.working_directory + packagingFilesDirectory,
                controlDirectory = temp_directory + '/debian',
                changelog = controlDirectory + '/changelog',
                control = controlDirectory + '/control',
                links = controlDirectory + '/links',
                dirs = controlDirectory + '/dirs',
                makefile = temp_directory + '/Makefile';

            if (!hasValidOptions(options)) {
                return done(false);
            }

            cleanUp(options, true);
            copyFileOrDirectory(__dirname + '/../' + packagingFilesDirectory, temp_directory);

            // set environment variables if they are not already set
            process.env.DEBFULLNAME = options.maintainer.name;
            process.env.DEBEMAIL = options.maintainer.email;

            transformAndReplace([links], '\\$\\{softlinks\\}', options.links || [], function (softlink) {
                return softlink.target + '       ' + softlink.source + '\n';
            });
            transformAndReplace([dirs], '\\$\\{directories\\}', options.directories || [], function (directory) {
                return directory + '\n';
            });

            if (options.long_description) {
                // add extra space at start to ensure format is correct and allow simple unit test comparisons
                options.long_description = ' ' + options.long_description;
            }

            findAndReplace([changelog, control], '\\$\\{maintainer.name\\}', options.maintainer.name);
            findAndReplace([changelog, control], '\\$\\{maintainer.email\\}', options.maintainer.email);
            findAndReplace([changelog], '\\$\\{date\\}', now);
            findAndReplace([changelog, control, links, dirs], '\\$\\{name\\}', packageName(options));
            findAndReplace([control], '\\$\\{short_description\\}', options.short_description);
            findAndReplace([control], '\\$\\{long_description\\}', options.long_description);
            findAndReplace([changelog, control, links, dirs], '\\$\\{version\\}', options.version);
            findAndReplace([changelog, control, links, dirs], '\\$\\{build_number\\}', options.build_number);

            preparePackageContents(makefile, this.files);

            var scripts = ['preinst', 'postinst', 'prerm', 'postrm'];
            for (var i = 0; i < scripts.length; i++) {
                if (options[scripts[i]]) {
                    var destination = controlDirectory + '/' + scripts[i];
                    grunt.verbose.writeln(JSON.stringify(options[scripts[i]]));
                    if (options[scripts[i]].src) {
                        grunt.file.copy(options[scripts[i]].src, destination);
                    } else if (options[scripts[i]].contents) {
                        grunt.file.write(destination, options[scripts[i]].contents);
                    }
                }
            }

            grunt.verbose.writeln('Running \'debuild --no-tgz-check -sa -us -uc --lintian-opts --suppress-tags tar-errors-from-data,tar-errors-from-control,dir-or-file-in-var-www\'');
            if (grunt.file.exists('/usr/bin/debuild')) {
                if (!options.simulate) {
                    var debuild = spawn('debuild', ['--no-tgz-check', '-sa', '-us', '-uc', '--lintian-opts', '--suppress-tags', 'tar-errors-from-data,tar-errors-from-control,dir-or-file-in-var-www'], {
                        cwd: temp_directory,
                        stdio: [ 'ignore', (grunt.option('verbose') ? process.stdout : 'ignore'), process.stderr ]
                    });
                    debuild.on('exit', function (code) {
                        if (code !== 0) {
                            var logFile = grunt.file.read(grunt.file.expand(packageLocation(options) + '*.build'));
                            grunt.log.subhead('\nerror running debuild!!');
                            if (logFile.search("Unmet\\sbuild\\sdependencies\\:\\sdebhelper")) {
                                grunt.log.warn('debhelper dependency not found try running \'sudo apt-get install debhelper\'');
                            }
                            done(false);
                        } else {
                            cleanUp(options);
                            grunt.log.ok('Created package: ' + grunt.file.expand(packageLocation(options) + '*.deb'));
                            if (options.respository) {
                                grunt.verbose.writeln('Running \'dput ' + options.respository + ' ' + grunt.file.expand(packageLocation(options) + '*.changes') + '\'');
                                require('fs').chmodSync("" + grunt.file.expand(packageLocation(options) + '*.changes'), "744");
                                var dputArguments = [options.respository, grunt.file.expand(packageLocation(options) + '*.changes')];
                                if (grunt.option('verbose')) {
                                    dputArguments.unshift('-d');
                                }
                                var dput = spawn('dput', dputArguments, {
                                    stdio: [ 'ignore', (grunt.option('verbose') ? process.stdout : 'ignore'), process.stderr ]
                                });
                                dput.on('exit', function (code) {
                                    if (code !== 0) {
                                        grunt.log.subhead('\nerror uploading package using dput!!');
                                    } else {
                                        grunt.log.ok('Uploaded package: ' + grunt.file.expand(packageLocation(options) + '*.deb'));
                                    }
                                    done(true);
                                });
                            } else {
                                done(true);
                            }
                        }
                    });
                }
            } else {
                cleanUp(options);
                grunt.log.subhead('\n\'debuild\' executable not found!!');
                grunt.log.warn('to install debuild try running \'sudo apt-get install devscripts\'');
                return done(options.simulate);
            }
        }
    );
};
