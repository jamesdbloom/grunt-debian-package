(function () {

    'use strict';

    String.prototype.replaceAll = function (find, replace) {
        var str = this;
        return str.replace(new RegExp(find, 'g'), replace);
    };

    var findAndReplace = function (grunt) {
        return function (files, find, replace) {
            grunt.verbose.writeln('Replacing: \'' + replace.replaceAll('\\n', '\\n').replaceAll('\\t', '\\t') + '\' for \'' + find.replaceAll('\\\\', '') + '\' in ' + files.join(' and '));
            require('replace')({
                regex: find,
                replacement: replace,
                paths: files,
                recursive: true,
                silent: true
            });
        };
    };

    module.exports = {
        _findAndReplace: findAndReplace,
        _transformAndReplace: function (grunt) {
            return function (files, find, list, transform) {
                if (list) {
                    var replace = '';

                    for (var i = 0; i < list.length; i++) {
                        replace += transform(list[i]);
                    }

                    findAndReplace(grunt)(files, find, replace);
                }
            };
        }
    };
})();
