(function () {

    'use strict';

    var sinon = require('sinon'),
        testCase = require('nodeunit').testCase;

    exports.options_test = {
        'endsWith string extension function': testCase({
            'should match correct trailing substring': function (test) {
                test.ok("abcdefabcabc".endsWidth("cabc"), '"abcdefabcabc" ends with "cabc"');
                test.ok("abcdefabcabc".endsWidth("abc"), '"abcdefabcabc" ends with "abc"');
                test.ok("abcdefabcabc".endsWidth("bc"), '"abcdefabcabc" ends with "bc"');
                test.ok("abcdefabcabc".endsWidth("c"), '"abcdefabcabc" ends with "c"');
                test.ok("abcdefabcabc".endsWidth("abcdefabcabc"), '"abcdefabcabc" ends with "abcdefabcabc"');
                test.ok("abcdefabcabc".endsWidth(""), '"abcdefabcabc" ends with ""');

                // end
                test.done();
            },
            'should not-match incorrect trailing substring': function (test) {
                test.ok(!"abcdefabcabc".endsWidth("ab"), '"abcdefabcabc" does not ends with "ab"');
                test.ok(!"abcdefabcabc".endsWidth("abcd"), '"abcdefabcabc" does not ends with "abcd"');
                test.ok(!"abcdefabcabc".endsWidth("def"), '"abcdefabcabc" does not ends with "def"');
                test.ok(!"abcdefabcabc".endsWidth("cb"), '"abcdefabcabc" does not ends with "cb"');

                // end
                test.done();
            }
        }),
        'option validation': testCase({
            setUp: function (callback) {
                this.mockGrunt = {
                    log: {
                        subhead: sinon.spy.create(),
                        errorlns: sinon.spy.create()
                    }
                };
                this._validateOptions = require('../../tasks/options.js')._validate(this.mockGrunt);
                callback();
            },
            'should display errors for empty options': function (test) {
                // given
                var options = {};

                // when
                var valid = this._validateOptions(options);

                // then
                test.deepEqual(this.mockGrunt.log.subhead.args, [
                    [ 'no maintainer details provided!!' ],
                    [ 'no short description provided!!' ],
                    [ 'no long description provided!!' ]
                ]);
                test.deepEqual(this.mockGrunt.log.errorlns.args, [
                    [ 'please add the \'maintainer\' option specifying the name and email in your debian_package configuration in your Gruntfile.js or add \'DEBFULLNAME\' and \'DEBEMAIL\' environment variable (i.e. export DEBFULLNAME="James D Bloom" && export DEBEMAIL="jamesdbloom@email.com")' ],
                    [ 'please add the \'short_description\' option in your debian_package configuration in your Gruntfile.js or add a \'description\' field to package.json' ],
                    [ 'please add the \'long_description\' option in your debian_package configuration in your Gruntfile.js or add a multi line \'description\' field to package.json (note: the first line is used as the short description and the remaining lines are used as the long description)' ]
                ]);
                test.deepEqual(options, {});
                test.ok(!valid, 'returns not valid');

                // end
                test.done();
            },
            'should display no errors for correct options': function (test) {
                // given
                var options = {
                    maintainer: {
                        name: 'James D Bloom',
                        email: 'jamesdbloom@email.com'
                    },
                    short_description: 'the short description',
                    long_description: 'the long description added to the debian package',
                    working_directory: 'dir'
                };

                // when
                var valid = this._validateOptions(options);

                // then
                test.deepEqual(this.mockGrunt.log.subhead.args, []);
                test.deepEqual(this.mockGrunt.log.errorlns.args, []);
                test.deepEqual(options, {
                    maintainer: {
                        name: 'James D Bloom',
                        email: 'jamesdbloom@email.com'
                    },
                    short_description: 'the short description',
                    long_description: ' the long description added to the debian package',
                    working_directory: 'dir/',
                    package_name: 'debian_package',
                    package_location: 'dir/debian_package'
                });
                test.ok(valid, 'returns valid');

                // end
                test.done();
            },
            'should display when maintainer details not provided': function (test) {
                // given
                var options = {
                    maintainer: {
                    },
                    short_description: 'the short description',
                    long_description: 'the long description added to the debian package'
                };

                // when
                var valid = this._validateOptions(options);

                // then
                test.deepEqual(this.mockGrunt.log.subhead.args, [
                    [ 'no maintainer name provided!!' ],
                    [ 'no maintainer email provided!!' ]
                ]);
                test.deepEqual(this.mockGrunt.log.errorlns.args, [
                    [ 'please add the \'maintainer.name\' option in your debian_package configuration in your Gruntfile.js or add a \'DEBFULLNAME\' environment variable (i.e. export DEBFULLNAME="James D Bloom")' ],
                    [ 'please add the \'maintainer.email\' option in your debian_package configuration in your Gruntfile.js or add a \'DEBEMAIL\' environment variable (i.e. export DEBEMAIL="jamesdbloom@email.com")' ]
                ]);
                test.deepEqual(options, {
                    maintainer: {
                    },
                    short_description: 'the short description',
                    long_description: ' the long description added to the debian package'
                });
                test.ok(!valid, 'returns not valid');

                // end
                test.done();
            }
        })
    };

})();
