/*
 * grunt-debian-package
 * https://github.com/jamesdbloom/grunt-debian-package
 *
 * Copyright (c) 2014 James Bloom
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js',
                '<%= nodeunit.tests %>'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        // before generating any new files, remove any previously-created files
        clean: {
            tests: ['tmp']
        },

        // configuration to be run (and then tested)
        debian_package: {
            default_options: {
                options: {
                    maintainer: {
                        name: "James D Bloom",
                        email: "jamesdbloom@email.com"
                    },
                    simulate: true
                },
                files: [
                    {
                        expand: true,       // enable dynamic expansion
                        src: [              // actual pattern(s) to match
                            'tasks/**/*.js'
                        ],
                        dest: '/var/www/'   // destination path prefix
                    }
                ]
            },
            custom_options: {
                options: {
                    maintainer: {
                        name: "James D Bloom",
                        email: "jamesdbloom@email.com"
                    },
                    name: "package_name",
                    short_description: "the short description",
                    long_description: "the long description added to the debian package",
                    version: "2.0.0",
                    build_number: "1",
                    links: [
                        {
                            source: '/var/log/${name}',
                            target: '/var/log/tomcat7'
                        },
                        {
                            source: '/etc/init.d/${name}',
                            target: '/etc/init.d/tomcat7'
                        }
                    ],
                    directories: [
                        '/var/app/${name}'
                    ],
                    working_directory: 'custom_tmp/',
                    simulate: true
                },
                files: [
                    {
                        expand: true,       // enable dynamic expansion
                        cwd: 'tasks/',      // src matches are relative to this path
                        src: [              // actual pattern(s) to match
                            '**/*.js'
                        ],
                        dest: '/var/www/'   // destination path prefix
                    },
                    {                       // use template in file path
                        src: '<%= nodeunit.tests %>',
                        dest: '/var/www/'
                    }
                ]
            }
        },

        // Unit tests.
        nodeunit: {
            tests: ['tests/*_test.js']
        }
    });

    // load this plugin's task
    grunt.loadTasks('tasks');

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    grunt.registerTask('test', ['clean', 'debian_package', 'nodeunit']);

    grunt.registerTask('default', ['jshint', 'test']);
};
