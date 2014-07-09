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
            tests: ['tmp', 'custom_tmp']
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
                        src: 'tasks/debian_package.js',
                        dest: '/var/www/tasks/debian_package.js'
                    }
                ]
            },
            custom_options: {
                options: {
                    maintainer: {
                        name: "James D Bloom",
                        email: "jamesdbloom@email.com"
                    },
                    prefix: "prefix-",
                    name: "package_name",
                    postfix: "-postfix",
                    short_description: "the short description",
                    long_description: "the long description added to the debian package",
                    version: "2.0.0",
                    build_number: "1",
                    preinst: {
                        src: 'tests/test_preinst.sh',
                        contents: '#!/bin/bash\n' +
                            'echo "test preinst script from contents"'
                    },
                    postinst: {
                        src: 'tests/test_postinst.sh'
                    },
                    prerm: {
                        contents: '#!/bin/bash\n' +
                            'echo "test prerm script from contents"'
                    },
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
                        expand: true,
                        cwd: 'tasks',
                        src: [
                            '**/*.js'
                        ],
                        dest: '/var/www/tasks'
                    },
                    {
                        src: [
                            'tests/custom_options/packaging/debian/changelog',
                            'tests/custom_options/packaging/debian/control'
                        ],
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
    grunt.registerTask('travis', ['jshint', 'test']);
};
