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
                '<%= nodeunit.unit %>',
                '<%= nodeunit.integration %>'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        // before generating any new files, remove any previously-created files
        clean: {
            pre_test: ['tmp', 'test/unit/tmp', 'test/integration/tmp'],
            post_test: ['tmp', 'test/unit/tmp', 'test/integration/tmp']
        },

        // configuration to be run (and then tested)
        debian_package: {
            default_options: {
                options: {
                    quiet: true,
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
                    quiet: true,
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
                        src: 'test/integration/test_preinst.sh',
                        contents: '#!/bin/bash\n' +
                            'echo "test preinst script from contents"'
                    },
                    postinst: {
                        src: 'test/integration/test_postinst.sh'
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
                    working_directory: 'test/integration/tmp/',
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
                            'test/integration/custom_options/packaging/debian/changelog',
                            'test/integration/custom_options/packaging/debian/control'
                        ],
                        dest: '/var/www/'
                    }
                ]
            }
        },

        /*
         ======== A Handy Little Nodeunit Reference ========
         https://github.com/caolan/nodeunit

         Test methods:
         test.expect(numAssertions)
         test.done()

         Test assertions:
         test.fail(actual, expected, message, operator, stackStartFunction value)
         test.ok(value, [message])
         test.equal(actual, expected, [message])
         test.notEqual(actual, expected, [message])
         test.deepEqual(actual, expected, [message])
         test.notDeepEqual(actual, expected, [message])
         test.strictEqual(actual, expected, [message])
         test.notStrictEqual(actual, expected, [message])
         test.throws(block, [error], [message])
         test.doesNotThrow(block, [error], [message])
         test.ifError(value)
         */

        // Unit tests.
        nodeunit: {
            unit: [
                'test/unit/*_test.js'
            ],
            integration: [
                'test/integration/*_test.js'
            ],
            options: {
                reporter: 'nested'
            }
        }
    });

    // load this plugin's task
    grunt.loadTasks('tasks');

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    grunt.registerTask('test', ['clean:pre_test', 'debian_package', 'nodeunit', 'clean:post_test']);

    grunt.registerTask('default', ['jshint', 'test']);
    grunt.registerTask('travis', ['jshint', 'test']);
};
