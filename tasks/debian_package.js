/*
 * grunt-debian-package
 * https://github.com/jamesdbloom/grunt-debian-package
 *
 * Copyright (c) 2014 James Bloom
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {


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
            now = dateFormat(new Date(), "ddd, dS mmmm yyyy, h:MM:ss +0000"),
            changelog = 'packaging/debian/changelog',
            control = 'packaging/debian/control';

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

        grunt.log.writeln("Running debuild...");
        var debuild = spawn('debuild', ['-i', '-us', '-uc', '-b']);
        debuild.stdout.on('data', function (data) {
            grunt.verbose.writeln(data);
        });
        debuild.stderr.on('data', function (data) {
            grunt.log.warn(data);
        });
    });

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
