/*
 * grunt-debian-package
 * https://github.com/jamesdbloom/grunt-debian-package
 *
 * Copyright (c) 2014 James Bloom
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    var fs = require('fs'),
        path = require('path'),
        replace = require("replace"),
        packagingDir = 'packaging';

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
                    short_description: (pkg.description && pkg.description.split(/\r\n|\r|\n/g)[0]) || '',
                    long_description: (pkg.description && pkg.description.split(/\r\n|\r|\n/g).splice(1).join(' ')) || '',
                    version: pkg.version,
                    build_number: process.env.BUILD_NUMBER || process.env.DRONE_BUILD_NUMBER || process.env.TRAVIS_BUILD_NUMBER || '1'
                }),
                spawn = require('child_process').spawn,
                dateFormat = require('dateformat'),
                now = dateFormat(new Date(), "ddd, d mmm yyyy h:MM:ss +0000"),
                changelog = packagingDir + '/debian/changelog',
                control = packagingDir + '/debian/control',
                links = packagingDir + '/debian/links',
                dirs = packagingDir + '/debian/dirs';

            // set environment variables if they are not already set
            process.env.DEBFULLNAME = options.maintainer.name;
            process.env.DEBEMAIL = options.maintainer.email;

            deleteFolderRecursive(packagingDir);
            recursiveCopy(__dirname + '/../' + packagingDir, packagingDir);


            if (options.links) {
                var softlinks = "";
                for (var i = 0; i < options.links.length; i++) {
                    softlinks += options.links[i].source + '       ' + options.links[i].target + '\n';
                }
                fs.writeFileSync(links, softlinks);
            }
            if (options.directories) {
                var directories = "";
                for (var i = 0; i < options.directories.length; i++) {
                    directories += options.directories[i] + '\n';
                }
                fs.writeFileSync(dirs, directories);
            }

            replace({
                regex: "\\$\\{maintainer.name\\}",
                replacement: options.maintainer.name,
                paths: [changelog, control],
                recursive: true,
                silent: true
            });
            if (!options.maintainer.name) {
                grunt.log.subhead('no maintainer name provided!!');
                grunt.log.errorlns('please add the \'maintainer.name\' option in your debian_package configuration in your Gruntfile.js or add a \'DEBFULLNAME\' environment variable (i.e. export DEBFULLNAME="James D Bloom")');
            } else {
                grunt.verbose.writeln('Replaced \'' + options.maintainer.name + '\' for ${maintainer.name} in ' + changelog + ' and ' + control);
            }

            replace({
                regex: "\\$\\{maintainer.email\\}",
                replacement: options.maintainer.email,
                paths: [changelog, control],
                recursive: true,
                silent: true
            });
            if (!options.maintainer.email) {
                grunt.log.subhead('no maintainer email provided!!');
                grunt.log.errorlns('please add the \'maintainer.email\' option in your debian_package configuration in your Gruntfile.js or add a \'DEBEMAIL\' environment variable (i.e. export DEBEMAIL="jamesdbloom@email.com")');
            } else {
                grunt.verbose.writeln('Replaced \'' + options.maintainer.email + '\' for ${maintainer.email} in ' + changelog + ' and ' + control);
            }

            replace({
                regex: "\\$\\{date\\}",
                replacement: now,
                paths: [changelog],
                recursive: true,
                silent: true
            });
            grunt.verbose.writeln('Replaced \'' + now + '\' for ${date} in ' + changelog);

            replace({
                regex: "\\$\\{name\\}",
                replacement: options.name,
                paths: [changelog, control, links, dirs],
                recursive: true,
                silent: true
            });
            grunt.verbose.writeln('Replaced \'' + options.name + '\' for ${name} in ' + changelog + ' and ' + control + ' and ' + links + ' and ' + dirs);

            replace({
                regex: "\\$\\{short_description\\}",
                replacement: options.short_description,
                paths: [control],
                recursive: true,
                silent: true
            });
            if (!options.short_description) {
                grunt.log.subhead('no short description provided!!');
                grunt.log.errorlns('please add the \'short_description\' option in your debian_package configuration in your Gruntfile.js or add a \'description\' field to package.json');
            } else {
                grunt.verbose.writeln('Replaced \'' + options.short_description + '\' for ${short_description} in ' + control);
            }

            replace({
                regex: "\\$\\{long_description\\}",
                replacement: options.long_description,
                paths: [control],
                recursive: true,
                silent: true
            });
            if (!options.short_description) {
                grunt.log.subhead('no long description provided!!');
                grunt.log.errorlns('please add the \'long_description\' option in your debian_package configuration in your Gruntfile.js or add a multi line \'description\' field to package.json (note: the first line is used as the short description and the remaining lines are used as the long description)');
            } else {
                grunt.verbose.writeln('Replaced \'' + options.long_description + '\' for ${long_description} in ' + control);
            }

            replace({
                regex: "\\$\\{version\\}",
                replacement: options.version,
                paths: [changelog],
                recursive: true,
                silent: true
            });
            grunt.verbose.writeln('Replaced \'' + options.version + '\' for ${version} in ' + changelog);

            replace({
                regex: "\\$\\{build_number\\}",
                replacement: options.build_number,
                paths: [changelog],
                recursive: true,
                silent: true
            });
            grunt.verbose.writeln('Replaced \'' + options.build_number + '\' for ${build_number} in ' + changelog);

            preparePackageContents(this.files);

            grunt.log.writeln("About to run debuild...");
            if (fs.existsSync('/usr/bin/debuild')) {
                var debuild = spawn('debuild', ['--no-tgz-check', '-sa', '-us', '-uc', '--lintian-opts', '--suppress-tags', 'dir-or-file-in-var-www'], {
                    cwd: packagingDir,
                    stdio: [ 'ignore', process.stdout, process.stderr ]
                });
                debuild.on('exit', function (code) {
                    if (code !== 0) {
                        grunt.log.subhead('error running debuild!!');
                        done(false);
                    } else {
                        grunt.log.writeln("Successfully ran debuild...");
                        done(true);
                    }
                });

            } else {
                grunt.log.subhead('\'debuild\' executable not found!!');
                grunt.log.warn('to install debuild try running \'sudo apt-get install devscripts\'');
                return false;
            }
        }
    );

    var deleteFolderRecursive = function (path) {
        var files = [];
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach(function (file, index) {
                var curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };

    var recursiveCopy = function (src, dest) {
        var exists = fs.existsSync(src),
            stats = exists && fs.statSync(src),
            isDirectory = exists && stats.isDirectory();

        if (exists && isDirectory) {
            fs.mkdirSync(dest);
            fs.readdirSync(src).forEach(function (childItemName) {
                recursiveCopy(path.join(src, childItemName), path.join(dest, childItemName));
            });
        } else {
            require('child_process').spawn('cp', [src, dest]);
            // for an unkown reason fs.linkSync causes an EPERM error (only on vagrant) so resorting to using cp as a work around
            // fs.linkSync(src, dest);
        }
    };

    var preparePackageContents = function (files) {
        var makeFileList = "";

        // iterate over all specified file groups
        files.forEach(function (f) {
            // concat specified files
            var src = f.src.filter(function (filepath) {
                // warn on and remove invalid source files
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    grunt.log.writeln("Adding \'" + filepath + "\' to package");
                    makeFileList += '\tmkdir -p $(DESTDIR)' + f.dest.substr(0, f.dest.lastIndexOf('/')) + '\n';
                    makeFileList += '\tcp -a ' + process.cwd() + '/' + filepath + ' $(DESTDIR)' + f.dest + '\n';
                    return true;
                }
            });
        });

        replace({
            regex: "\\$\\{file_list\\}",
            replacement: makeFileList,
            paths: [packagingDir + '/Makefile'],
            recursive: true,
            silent: true
        });
    };

};
