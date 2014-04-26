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
        path = require('path');


    grunt.registerMultiTask('debian_package', 'Create debian package from grunt build', function () {
        debugger;
        // Merge task-specific and/or target-specific options with these defaults.
        var properties = require(process.cwd() + '/package.json'),
            options = this.options({
                maintainer: process.env.DEBFULLNAME && process.env.DEBEMAIL && {
                    name: process.env.DEBFULLNAME,
                    email: process.env.DEBEMAIL
                },
                name: properties.name,
                short_description: (properties.description && properties.description.split(/\r\n|\r|\n/g)[0]) || '',
                long_description: (properties.description && properties.description.split(/\r\n|\r|\n/g).splice(1).join(' ')) || '',
                version: properties.version,
                build_number: process.env.BUILD_NUMBER || process.env.DRONE_BUILD_NUMBER || process.env.TRAVIS_BUILD_NUMBER || '000'
            }),
            spawn = require('child_process').spawn,
            dateFormat = require('dateformat'),
            replace = require("replace"),
            now = dateFormat(new Date(), "ddd, d mmm yyyy h:MM:ss +0000"),
            changelog = 'packaging/debian/changelog',
            control = 'packaging/debian/control';

        // set environment variables if they are not already set
        process.env.DEBFULLNAME = options.maintainer.name;
        process.env.DEBEMAIL = options.maintainer.email;

        deleteFolderRecursive('packaging');
        recursiveCopy(__dirname + '/../packaging', 'packaging');

        replace({
            regex: "\\$\\{maintainer.name\\}",
            replacement: options.maintainer.name,
            paths: [changelog, control],
            recursive: true,
            silent: true
        });
        if(!options.maintainer.name) {
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
        if(!options.maintainer.email) {
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
            paths: [changelog, control],
            recursive: true,
            silent: true
        });
        grunt.verbose.writeln('Replaced \'' + options.name + '\' for ${name} in ' + changelog + ' and ' + control);

        replace({
            regex: "\\$\\{short_description\\}",
            replacement: options.short_description,
            paths: [control],
            recursive: true,
            silent: true
        });
        if(!options.short_description) {
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
        if(!options.short_description) {
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

        createTar(this.files, options.name + '_' + options.version + '-' + options.build_number + '.tar');

        if (fs.existsSync('/usr/bin/debuild')) {
            debugger;
            process.chdir('packaging');
            var debuild = spawn('debuild', ['-i', '-us', '-uc', '-b']);
            debuild.stdout.on('data', function (data) {
                grunt.verbose.writeln(data);
            });
            debuild.stderr.on('data', function (data) {
                grunt.log.warn(data);
            });
            debuild.on('close', function (code) {
                if (code !== 0) {
                    grunt.log.warn('debuild process exited with code ' + code);
                } else {
                    grunt.log.writeln("Successfully ran debuild...");
                }
            });
            process.chdir('..');

            require('sleep').sleep(3);

            var debuildErrorLog = fs.readFileSync(options.name + '_' + options.version + '-' + options.build_number + '_i386.build', 'utf8');
            if(debuildErrorLog) {
                grunt.log.subhead('error running debuild!!');
                grunt.log.errorlns(debuildErrorLog);
                return false
            }

        } else {
            grunt.log.subhead('\'debuild\' executable not found!!');
            grunt.log.warn('to install debuild try running \'sudo apt-get install devscripts\'');
            return false;
        }
    });

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

    var createTar = function (files, tarFileName) {
        var tarArguments = ['-zcvf', tarFileName];

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
                    tarArguments.push(filepath);
                    return true;
                }
            });
        });

        var tar = require('child_process').spawn('tar', tarArguments);

        tar.stdout.on('data', function (data) {
            grunt.verbose.writeln(data);
        });
        tar.stderr.on('data', function (data) {
            grunt.log.warn(data);
        });

        require('sleep').sleep(3);
    };

};
