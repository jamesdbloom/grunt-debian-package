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
        // merge task-specific and target-specific options with defaults
        var options = this.options({
                name: grunt.option('name'),
                short_description: grunt.option('short_description'),
                long_description: grunt.option('long_description'),
                version: grunt.option('version'),
                build_number: grunt.option('build_number')
            }),
            spawn = require('child_process').spawn,
            dateFormat = require('dateformat'),
            replace = require("replace"),
            now = dateFormat(new Date(), "ddd, d mmm yyyy h:MM:ss +0000"),
            changelog = 'packaging/debian/changelog',
            control = 'packaging/debian/control';

        deleteFolderRecursive('packaging');
        recursiveCopy(__dirname + '/../packaging', 'packaging');

        grunt.verbose.writeln('Replacing \'' + now + '\' for ${date} in ' + changelog);
        replace({
            regex: "\\$\\{date\\}",
            replacement: now,
            paths: [changelog],
            recursive: true,
            silent: true
        });

        grunt.verbose.writeln('Replacing \'' + options.name + '\' for ${name} in ' + changelog + ' and ' + control);
        replace({
            regex: "\\$\\{name\\}",
            replacement: options.name,
            paths: [changelog, control],
            recursive: true,
            silent: true
        });

        grunt.verbose.writeln('Replacing \'' + options.short_description + '\' for ${short_description} in ' + control);
        replace({
            regex: "\\$\\{short_description\\}",
            replacement: options.short_description,
            paths: [control],
            recursive: true,
            silent: true
        });

        grunt.verbose.writeln('Replacing \'' + options.long_description + '\' for ${long_description} in ' + control);
        replace({
            regex: "\\$\\{long_description\\}",
            replacement: options.long_description,
            paths: [control],
            recursive: true,
            silent: true
        });

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

            require('sleep').sleep(5);
        } else {
            grunt.log.warn('debuild not found!!');
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
