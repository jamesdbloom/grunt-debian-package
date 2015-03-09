# grunt-debian-package 

> Create debian package from grunt build

Grunt plugin to create a Debian package, allowing JavaScript applications to be easily integration into a Debian or Ubuntu based continuous delivery pipeline.

[![Build Status](https://secure.travis-ci.org/jamesdbloom/grunt-debian-package.png?branch=master)](http://travis-ci.org/jamesdbloom/grunt-debian-package)  [![Dependency Status](https://david-dm.org/jamesdbloom/grunt-debian-package.png)](https://david-dm.org/jamesdbloom/grunt-debian-package) [![devDependency Status](https://david-dm.org/jamesdbloom/grunt-debian-package/dev-status.png)](https://david-dm.org/jamesdbloom/grunt-debian-package#info=devDependencies) [![Code Climate](https://codeclimate.com/github/jamesdbloom/grunt-debian-package.png)](https://codeclimate.com/github/jamesdbloom/grunt-debian-package)
[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/jamesdbloom/grunt-debian-package/trend.png)](https://bitdeli.com/free "Bitdeli Badge") [![Stories in Backlog](https://badge.waffle.io/jamesdbloom/grunt-debian-package.png?label=backlog&title=Backlog)](https://waffle.io/jamesdbloom/grunt-debian-package)



[![NPM](https://nodei.co/npm/grunt-debian-package.png?downloads=true&stars=true)](https://nodei.co/npm/grunt-debian-package/) [![wercker status](https://app.wercker.com/status/1bd98ba2b740e62bf5f15cb335de7495/m "wercker status")](https://app.wercker.com/project/bykey/1bd98ba2b740e62bf5f15cb335de7495)

## Getting Started
This plugin requires Grunt `~0.4`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-debian-package --save-dev
```

You will also need to install two debian tools used to create and lint the debian package, as follows:

```shell
sudo apt-get install devscripts
sudo apt-get install debhelper
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-debian-package');
```

To print out verbose messages during packaging use --verbose, for example:

```shell
grunt debian_package --verbose
```

To debug any issues with the **debian_package** task configuration:

**1.** use the node-inspector:

```shell
sudo npm install -g node-inspector
node --debug-brk $(which grunt) debian_package --verbose
```

**2.** in another shell process:

```shell
node-inspector
```

**3.** open the url displayed in a browser

## The "debian_package" task

### Overview
In your project's Gruntfile, add a section named `debian_package` to the data object passed into `grunt.initConfig()`.

Typically the options section would not need to be provided as these values are read from the **package.json** file for the project.  In this example, however, custom options are used to override the default values.  For more details on the default values see below.

```js
grunt.initConfig({
  debian_package: {
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
        target_architecture: "amd64",
        category: "devel",
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
        dependencies: "couchdb, redis-server"
    },
    files: [
        {
            expand: true,       // enable dynamic expansion
            cwd: 'build/',      // src matches are relative to this path
            src: [              // actual pattern(s) to match
                '**/*.js',
                '**/*.html',
                '**/*.css'
            ],
            dest: '/var/www/'   // destination path prefix
        },
        {                       // use template in file path
            src:  'config/<%= grunt.package.name %>.json',
            dest: '/var/www/<%= grunt.package.name %>.json'
        }
    ]
  }
});
```

This will result in a package being created called **prefix-package_name-postfix-2.0.0-1.deb**.  The configuration above will result in the package containing all **\*.js**, **\*.css** and **\*.html** files in the **build** directory.  These files will be installed into **/var/wwww/** when the package is installed.  In addition the package will contain **/var/wwww/package_name.json** as a copy of the **config/package_name.json** file in the project.  The config above will also add two soft-links and an empty directory into the package.  Both the links and directories sections can use the following placeholders `${name}`, `${version}` and `${build_name}` to refer to the package name, version and build number respectively.

Using the `dpkg -c package_name-2.0.0-1.deb` command it is possible to see the package contents:

```shell
dpkg -c prefix-package_name-postfix-2.0.0-1.deb
drwxr-xr-x jenkins/jenkins         0 2014-04-27 15:08 ./
drwxr-xr-x jenkins/jenkins         0 2014-04-27 15:08 ./usr/share/
drwxr-xr-x jenkins/jenkins         0 2014-04-27 15:08 ./usr/share/doc/
drwxr-xr-x jenkins/jenkins         0 2014-04-27 15:08 ./usr/share/doc/prefix-package_name-postfix/
-rw-r--r-- jenkins/jenkins       163 2014-04-27 15:08 ./usr/share/doc/prefix-package_name-postfix/changelog.Debian.gz
-rw-r--r-- jenkins/jenkins         0 2014-04-27 15:08 ./usr/share/doc/prefix-package_name-postfix/copyright
drwxr-xr-x jenkins/jenkins         0 2014-04-27 15:08 ./var/
drwxr-xr-x jenkins/jenkins         0 2014-04-27 15:08 ./var/app/
drwxr-xr-x jenkins/jenkins         0 2014-04-27 15:08 ./var/app/package_name/
drwxr-xr-x jenkins/jenkins         0 2014-04-27 15:08 ./var/www/
-rwxr-xr-x jenkins/jenkins     12369 2014-04-24 05:57 ./var/www/index.html
drwxr-xr-x jenkins/jenkins         0 2014-04-27 15:08 ./var/www/js/
-rw-r--r-- jenkins/jenkins      1600 2014-04-24 05:57 ./var/www/js/example.min.js
-rw-r--r-- jenkins/jenkins      3210 2014-04-24 05:57 ./var/www/js/example.min.map
drwxr-xr-x jenkins/jenkins         0 2014-04-27 15:08 ./var/www/css/
-rw-r--r-- jenkins/jenkins      1529 2014-04-24 05:57 ./var/www/css/example.css
drwxr-xr-x jenkins/jenkins         0 2014-04-27 15:08 ./etc/
drwxr-xr-x jenkins/jenkins         0 2014-04-27 15:08 ./etc/init.d/
lrwxr-xr-x jenkins/jenkins         0 2014-04-27 15:08 ./etc/init.d/tomcat7 -> package_name
drwxr-xr-x jenkins/jenkins         0 2014-04-27 15:08 ./var/log/
lrwxr-xr-x jenkins/jenkins         0 2014-04-27 15:08 ./var/log/tomcat7 -> package_name
```

Using the `dpkg -I prefix-package_name-postfix-2.0.0-1.deb` command it is possible to see the package information: 

```shell
dpkg -I prefix-package_name-postfix-2.0.0-1.deb
 new debian package, version 2.0.
 size 7300 bytes: control archive= 605 bytes.
     226 bytes,     9 lines      control              
     507 bytes,     7 lines      md5sums              
 Package: prefix-package_name-postfix
 Version: 2.0.0-1
 Architecture: i386
 Maintainer: James D Bloom <jamesdbloom@email.com>
 Installed-Size: 35
 Section: misc
 Priority: optional
 Description: the short description
  the long description added to the debian package
```

To install the package use: `sudo dpkg -i prefix-package_name-postfix-2.0.0-1.deb`

```shell
sudo dpkg -i prefix-package_name-postfix-2.0.0-1.deb 
Selecting previously unselected package prefix-package_name-postfix.
(Reading database ... 39938 files and directories currently installed.)
Unpacking prefix-package_name-postfix (from package_name_2.0.0-1_i386.deb) ...
Setting up prefix-package_name-postfix (2.0.0-1) ...
Processing triggers for ureadahead ...
```

Once installed the `dpkg -l` command will list the package:

```shell
dpkg -l | grep prefix-package_name-postfix
 prefix-package_name-postfix                     2.0.0-1                    the short description
```

And `dpkg -L prefix-package_name-postfix` will list the installed files:

```shell
dpkg -L prefix-package_name-postfix
/.
/usr/share/
/usr/share/doc/
/usr/share/doc/prefix-package_name-postfix/
/usr/share/doc/prefix-package_name-postfix/changelog.Debian.gz
/usr/share/doc/prefix-package_name-postfix/copyright
/var/
/var/app/
/var/app/package_name/
/var/www/
/var/www/index.html
/var/www/js/
/var/www/js/example.min.js
/var/www/js/example.min.map
/var/www/css/
/var/www/css/example.css
/etc/
/etc/init.d/
/etc/init.d/tomcat7 -> package_name
/var/log/
/var/log/tomcat7 -> package_name
```

### Options

#### options.maintainer.name
Type: `String`
Default value: `process.env.DEBFULLNAME` or **package.json** `author.name`

This value specifies the maintainer's name for the debian package.  The default value is taken from the standard debian environment variable `DEBFULLNAME`.

#### options.maintainer.email
Type: `String`
Default value: `process.env.DEBEMAIL` or **package.json** `author.email`

This value specifies the maintainer's email for the debian package.  The default value is taken from the standard debian environment variable `DEBEMAIL`.

#### options.prefix
Type: `String`
Default value: ''

This value specifies a prefix for the debian package name.  This is useful is the package name is taken from the package.json but requires a prefix (i.e. for company name).

#### options.name
Type: `String`
Default value: **package.json** `name`

This value specifies the name of the debian package.  The default value is taken from the package.json name value.

#### options.postfix
Type: `String`
Default value: ''

This value specifies a postfix for the debian package name.  This is useful is the package name is taken from the package.json but requires a postfix (i.e. for git branch).

#### options.short_description
Type: `String`
Default value: **package.json** `description` first line only

This value specifies the short description for the debian package, for example, this is displayed when listing all packages using the `dpkg -l` command.  The default value is taken from the first line of the package.json description value.

#### options.long_description
Type: `String`
Default value: **package.json** `description` all except first line

This value specifies the multiple line long description for the debian package, for example, this is displayed when quering package status using the `dpkg -s <package.name>` command.  The default value is taken from all text **after the end of the first line** of the package.json description value.

#### options.version
Type: `String`
Default value: **package.json** `version`

The first part of the version number.  This version number is intended to respresent the logical version of the code in the package.  The default value is taken from the package.json version value.

#### options.build_number
Type: `String`
Default value: `process.env.BUILD_NUMBER || process.env.DRONE_BUILD_NUMBER || process.env.TRAVIS_BUILD_NUMBER`

The second part of the version number.  This version number is intended to respresent a specific build of the package, for example this package might represetn the Jenkins or drone.io or TravisCI build number.  The default value is taken from an environment variable called `BUILD_NUMBER` or `DRONE_BUILD_NUMBER` or `TRAVIS_BUILD_NUMBER` which is compatible with Jenkins, drone.io and TravisCI respectively.

#### options.target_architecture
Type: `String` (possible values are `amd64`, `i386`, `all`, `any`)
Default value: `all`

The targeted architecture

#### options.category
Type: `String`
Default value: `misc`

The software category. Used to fill the "section" field of the control file

#### options.preinst.src
Type: `String`
Default value: `undefined`

This value specifies the path of the preinst script, the contents of this file will be copied into the preinst script.  If both `src` and `contents` are specified `src` will take precedence. The preinst script is executed before the package is unpacked from its Debian archive (".deb") file. Many 'preinst' scripts stop services for packages which are being upgraded until their installation or upgrade is completed (following the successful execution of the 'postinst' script).

#### options.preinst.contents
Type: `String`
Default value: `undefined`

This value specifies the contents of the preinst script, the value will be copied into the preinst script.  If both `src` and `contents` are specified `src` will take precedence. The preinst script is executed before the package is unpacked from its Debian archive (".deb") file. Many 'preinst' scripts stop services for packages which are being upgraded until their installation or upgrade is completed (following the successful execution of the 'postinst' script).

#### options.postinst.src
Type: `String`
Default value: `undefined`

This value specifies the path of the postinst script, the contents of this file will be copied into the postinst script.  If both `src` and `contents` are specified `src` will take precedence. The postinst script typically completes any required configuration of the package foo once foo has been unpacked from its Debian archive (".deb") file. Often, 'postinst' scripts ask the user for input, and/or warn the user that if he accepts default values, he should remember to go back and re-configure that package as the situation warrants. Many 'postinst' scripts then execute any commands necessary to start or restart a service once a new package has been installed or upgraded.

#### options.postinst.contents
Type: `String`
Default value: `undefined`

This value specifies the contents of the postinst script, the value will be copied into the postinst script.  If both `src` and `contents` are specified `src` will take precedence. The postinst script typically completes any required configuration of the package foo once foo has been unpacked from its Debian archive (".deb") file. Often, 'postinst' scripts ask the user for input, and/or warn the user that if he accepts default values, he should remember to go back and re-configure that package as the situation warrants. Many 'postinst' scripts then execute any commands necessary to start or restart a service once a new package has been installed or upgraded.

#### options.prerm.src
Type: `String`
Default value: `undefined`

This value specifies the path of the prerm script, the contents of this file will be copied into the prerm script.  If both `src` and `contents` are specified `src` will take precedence. The prerm script typically stops any daemons which are associated with a package. It is executed before the removal of files associated with the package.

#### options.prerm.contents
Type: `String`
Default value: `undefined`

This value specifies the contents of the prerm script, the value will be copied into the prerm script.  If both `src` and `contents` are specified `src` will take precedence. The prerm script typically stops any daemons which are associated with a package. It is executed before the removal of files associated with the package.

#### options.postrm.src
Type: `String`
Default value: `undefined`

This value specifies the path of the postrm script, the contents of this file will be copied into the postrm script.  If both `src` and `contents` are specified `src` will take precedence. The postrm script typically modifies links or other files associated with foo, and/or removes files created by the package.

#### options.postrm.contents
Type: `String`
Default value: `undefined`

This value specifies the contents of the postrm script, the value will be copied into the postrm script.  If both `src` and `contents` are specified `src` will take precedence. The postrm script typically modifies links or other files associated with foo, and/or removes files created by the package.

#### options.links
Type: `String`
Default value: `undefined`

This value specifies a list of soft-links that should be added into the package.  Each soft-link is specified using a `source` and a `target` value.  Both the links and directories sections can use the following placeholders `${name}`, `${version}` and `${build_name}` to refer to the package name, version and build number respectively, see example above.

#### options.directories
Type: `String`
Default value: `undefined`

This value specifies a list of directories that should be added into the package.  Both the links and directories sections can use the following placeholders `${name}`, `${version}` and `${build_name}` to refer to the package name, version and build number respectively, see example above.

#### options.follow_soft_links
Type: `Boolean`
Default value: `undefined`

This value specifies whether soft-links should be followed when copying files into the package.  By default as this value is undefined soft-links will not be followed.

#### options.custom_template
Type: `String`
Default value: `undefined`

This value specifies a custom template directory. It can be used to override the files of the default template (especially useful for overridding copyright or changelog).
The content of the directory should have the following structure
```
- MakeFile
- debian
  - changelog
  - compat
  - control
  - copyright
  - dirs
  - links
  - rules
  - source
    - format
```
Any missing file will be replaced by the default ones (See [packaging](https://github.com/jamesdbloom/grunt-debian-package/tree/master/packaging) directory)
The files from the custom_template directory are processed the same way than the default ones, so use of variables is possible

### Files

The files configuration specifies the files to add into the package.

This task supports all the file mapping format Grunt supports. Please read [Globbing patterns](http://gruntjs.com/configuring-tasks#globbing-patterns) and [Building the files object dynamically](http://gruntjs.com/configuring-tasks#building-the-files-object-dynamically) for additional details.

### Usage Examples

#### Default Options

The following example configuration shows the default values for the options.  A files section is added which will add all files in the `dist` directory into the `/var/www/` directory in the package.

```js
grunt.initConfig({
  debian_package: {
    files: {
        src: [
            'dist/**',
            '!dist'
        ]
        dest: '/var/www/'
    }
  },
});
```

Not providing any options will result in the following default values:

```js
var properties = require(process.cwd() + '/package.json');

options: {
  maintainer: process.env.DEBFULLNAME && process.env.DEBEMAIL && {
      name: process.env.DEBFULLNAME,
      email: process.env.DEBEMAIL
  },
  name: properties.name,
  short_description: properties.description && properties.description.split(/\r\n|\r|\n/g)[0],
  long_description: properties.description && properties.description.split(/\r\n|\r|\n/g).splice(1).join(' '),
  version: properties.version,
  build_number: process.env.BUILD_NUMBER || process.env.DRONE_BUILD_NUMBER || process.env.TRAVIS_BUILD_NUMBER
  target_architecture: "all",
  category: "misc"
}
```

**maintainer** is taken from the standard debian environment variables `DEBFULLNAME` and `DEBEMAIL`.  **name**, **short_description**, **long_description** and **version** are all read from the *package.json*.  **short_description** is taken as the first line of the `description` value and **long_description** is taken as the rest of the `description` value.  **build_number** is taken from the the environment variables `BUILD_NUMBER` or `DRONE_BUILD_NUMBER` or `TRAVIS_BUILD_NUMBER` which are the build number environment variables for Jenkins, drone.io and TravisCI respectively.

## Future Plans
1. Add options to support custom copyright file
2. Add options to support generation of changelist from git log

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
 * 2014-27-04   v0.1.0   Released debian_package task
 * 2014-28-04   v0.1.1   Fixed issue with some dependencies
 * 2014-28-04   v0.1.2   Add back missing dirs and links files
 * 2014-29-04   v0.1.3   Removed requirement for long descriptions
 * 2014-03-05   v0.1.4   Added test framework and fixed bugs
 * 2014-15-05   v0.1.5   Added support for dput
 * 2014-16-05   v0.1.6   Fixed errors with package upload
 * 2014-23-06   v0.1.7   Added support for postfix
 * 2014-24-06   v0.1.8   Minor tweaks and better test coverage
 * 2014-09-07   v0.1.9   Added initial support for post/pre scripts
 * 2014-09-07   v0.1.10  Multiple minor bug fixes and improvements
 * 2014-09-07   v0.1.11  Several minor bug fixes and improvements

---

Task submitted by [James D Bloom](http://blog.jamesdbloom.com)
