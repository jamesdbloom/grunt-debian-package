/*
 * grunt-debian-package
 * https://github.com/jamesdbloom/grunt-debian-package
 *
 * Copyright (c) 2014 James Bloom
 * Licensed under the MIT license.
 */

var fileSystem = require('./fileOrDirectory.js');
var replace = require('./replace.js');

module.exports = function (grunt) {

    'use strict';

    var _validateOptions = require('./options.js')._validate(grunt),
        _copy = fileSystem._copy(grunt),
        _cleanUp = fileSystem._cleanUp(grunt),
        _findAndReplace = replace._findAndReplace(grunt),
        _transformAndReplace = replace._transformAndReplace(grunt),
        preparePackageContents = function (makefile, files, follow_soft_links, quiet) {
            _transformAndReplace([makefile], '\\$\\{file_list\\}', files, function (file) {
                return file.src.filter(function (filepath) {
                    if (!grunt.file.exists(filepath)) {
                        grunt.log.warn('File \'' + filepath + '\' not found');
                        return false;
                    } else {
                        return !grunt.file.isDir(filepath);
                    }
                }).map(function (filepath) {
                    if (!quiet) {
                        grunt.log.writeln('Adding \'' + filepath + '\' to \'' + file.dest + '\'');
                    }
                    var soft_links_argument = "-P ";
                    return '\tmkdir -p "$(DESTDIR)' + file.dest.substr(0, file.dest.lastIndexOf('/')) + '" && cp -a ' + (follow_soft_links ? "" : "-P ") + '"' + process.cwd() + '/' + filepath + '" "$(DESTDIR)' + file.dest + '"\n';
                }).join('');
            });
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
                    } || pkg.author && pkg.author.name && pkg.author.email && pkg.author,
                    name: pkg.name,
                    prefix: "",
                    postfix: "",
                    short_description: (pkg.description && pkg.description.split(/\r\n|\r|\n/g)[0]) || '',
                    long_description: (pkg.description && pkg.description.split(/\r\n|\r|\n/g).splice(1).join(' ')) || '',
                    version: pkg.version,
                    build_number: process.env.BUILD_NUMBER || process.env.DRONE_BUILD_NUMBER || process.env.TRAVIS_BUILD_NUMBER || '1',
                    working_directory: 'tmp/',
                    packaging_directory_name: 'packaging',
                    target_architecture: "all",
                    category: "misc"
                }),
                spawn = require('child_process').spawn,
                dateFormat = require('dateformat'),
                now = dateFormat(new Date(), 'ddd, d mmm yyyy h:MM:ss +0000'),
                temp_directory = options.working_directory + options.packaging_directory_name,
                controlDirectory = temp_directory + '/debian',
                changelog = controlDirectory + '/changelog',
                control = controlDirectory + '/control',
                links = controlDirectory + '/links',
                dirs = controlDirectory + '/dirs',
                makefile = temp_directory + '/Makefile',
                dependencies = '';

            if (!_validateOptions(options, options.quiet)) {
                return done(false);
            }

            _cleanUp(options, true);
            _copy(__dirname + '/../' + options.packaging_directory_name, temp_directory);
            
            if (options.custom_template) {
            	_copy(options.custom_template, temp_directory);
            }

            // set environment variables if they are not already set
            process.env.DEBFULLNAME = options.maintainer.name;
            process.env.DEBEMAIL = options.maintainer.email;

            if (options.dependencies) {
                dependencies = ', ' + options.dependencies;
            }

            // generate packaging control files
            _transformAndReplace([links], '\\$\\{softlinks\\}', options.links || [], function (softlink) {
                return softlink.target + '       ' + softlink.source + '\n';
            });
            _transformAndReplace([dirs], '\\$\\{directories\\}', options.directories || [], function (directory) {
                return directory + '\n';
            });
            _findAndReplace([changelog, control], '\\$\\{maintainer.name\\}', options.maintainer.name);
            _findAndReplace([changelog, control], '\\$\\{maintainer.email\\}', options.maintainer.email);
            _findAndReplace([changelog], '\\$\\{date\\}', now);
            _findAndReplace([changelog, control, links, dirs], '\\$\\{name\\}', options.package_name);
            _findAndReplace([control], '\\$\\{short_description\\}', options.short_description);
            _findAndReplace([control], '\\$\\{long_description\\}', options.long_description);
            _findAndReplace([changelog, control, links, dirs], '\\$\\{version\\}', options.version);
            _findAndReplace([changelog, control, links, dirs], '\\$\\{build_number\\}', options.build_number);
            _findAndReplace([control], '\\$\\{dependencies\\}', dependencies);
            _findAndReplace([control], '\\$\\{target_architecture\\}', options.target_architecture);
            _findAndReplace([control], '\\$\\{category\\}', options.category);
            preparePackageContents(makefile, this.files, options.follow_soft_links, options.quiet);

            // copy package lifecycle scripts
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

            // run packaging binaries (i.e. build process)
            grunt.verbose.writeln('Running \'debuild --no-tgz-check -sa -us -uc --lintian-opts --suppress-tags tar-errors-from-data,tar-errors-from-control,dir-or-file-in-var-www\'');
            if (!options.simulate) {
                if (grunt.file.exists('/usr/bin/debuild')) {
                    var debuild = spawn('debuild', ['--no-tgz-check', '-sa', '-us', '-uc', '--lintian-opts', '--suppress-tags', 'tar-errors-from-data,tar-errors-from-control,dir-or-file-in-var-www'], {
                        cwd: temp_directory,
                        stdio: [ 'ignore', (grunt.option('verbose') ? process.stdout : 'ignore'), process.stderr ]
                    });
                    debuild.on('exit', function (code) {
                        if (code !== 0) {
                            var logFile = grunt.file.read(grunt.file.expand(options.package_location + '*.build'));
                            grunt.log.subhead('\nerror running debuild!!');
                            if (logFile.search("Unmet\\sbuild\\sdependencies\\:\\sdebhelper") !== -1) {
                                grunt.log.warn('debhelper dependency not found try running \'sudo apt-get install debhelper\'');
                            }
                            done(false);
                        } else {
                            _cleanUp(options);
                            grunt.log.ok('Created package: ' + grunt.file.expand(options.package_location + '*.deb'));
                            if (options.repository) {
                                grunt.verbose.writeln('Running \'dput ' + options.repository + ' ' + grunt.file.expand(options.package_location + '*.changes') + '\'');
                                require('fs').chmodSync("" + grunt.file.expand(options.package_location + '*.changes'), "744");
                                var dputArguments = [options.repository, grunt.file.expand(options.package_location + '*.changes')];
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
                                        grunt.log.ok('Uploaded package: ' + grunt.file.expand(options.package_location + '*.deb'));
                                    }
                                    done(true);
                                });
                            } else {
                                done(true);
                            }
                        }
                    });
                } else {
                    _cleanUp(options);
                    grunt.log.subhead('\n\'debuild\' executable not found!!');
                    grunt.log.warn('to install debuild try running \'sudo apt-get install devscripts\'');
                    return done(false);
                }
            } else {
                return done(true);
            }
        }
    );
};
