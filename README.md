# grunt-debian-package

> Create debian package from grunt build

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

## The "debian_package" task

### Overview
In your project's Gruntfile, add a section named `debian_package` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  debian_package: {
    options: {
        maintainer: {
            name: "James D Bloom",
            email: "jamesdbloom@email.com"
        },
        name: "package_name",
        short_description: "the short description",
        long_description: "the long description added to the debian package",
        version: "2.0.0",
        build_number: "001"
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
            'usr/lib/node_modules'
        ]
    },
    files: [
        {
            expand: true,       // Enable dynamic expansion.
            cwd: 'build/',      // Src matches are relative to this path.
            src: [              // Actual pattern(s) to match.
                '**/*.js',
                '**/*.html',
                '**/*.css'
            ],
            dest: '/var/www/'   // Destination path prefix.
        },
        {                       // Use template in file path
            src:  'config/<%= grunt.package.name %>.json',
            dest: '/var/www/<%= grunt.package.name %>.json'
        }
    ]
  }
});
```

This will result in a package being created called **package_name-2.0.0_001.deb**.

TODO ADD SECTION ON SHORT AND LONG DESCRIPTION AND DPKG COMMANDS

### Options

#### options.maintainer.name
Type: `String`
Default value: `process.env.DEBFULLNAME`

This value specifies the maintainer's name for the debian package.  The default value is taken from the standard debian environment variable `DEBFULLNAME`.

#### options.maintainer.email
Type: `String`
Default value: `process.env.DEBEMAIL`

This value specifies the maintainer's email for the debian package.  The default value is taken from the standard debian environment variable `DEBEMAIL`.

#### options.name
Type: `String`
Default value: **package.json** `name`

This value specifies the name of the debian package.  The default value is taken from the package.json name value.

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

#### options.links
Type: `String`
Default value: `undefined`

This value specifies a list of soft-links that should be added into the package.  Each soft-link is specified using a `source` and a `target` value.

#### options.directories
Type: `String`
Default value: `undefined`

This value specifies a list of directories that should be added into the package.

### Files

The files configuration specifies the files to add into the package.

This task supports all the file mapping format Grunt supports. Please read [Globbing patterns](http://gruntjs.com/configuring-tasks#globbing-patterns) and [Building the files object dynamically](http://gruntjs.com/configuring-tasks#building-the-files-object-dynamically) for additional details.

### Usage Examples

#### Default Options

The following example configuration shows the default values for the options.  A files section is added which will add all files in the `dist` directory into `/var/www/` in the package.

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
}
```

**maintainer** is taken from the standard debian environment variables `DEBFULLNAME` and `DEBEMAIL`.  **name**, **short_description**, **long_description** and **version** are all read from the *package.json*.  **short_description** is taken as the first line of the `description` value and **long_description** is taken as the rest of the `description` value.  **build_number** is taken from the the environment variables `BUILD_NUMBER` or `DRONE_BUILD_NUMBER` or `TRAVIS_BUILD_NUMBER` which are the build number environment variables for Jenkins, drone.io and TravisCI respectively.

#### Custom Options

In this example, custom options are used to override the default values.  A files section is added which will add all files in the `dist` directory into `/var/www/` in the package.  The package created will be called **package_name-2.0.0_001.deb**.

```js
grunt.initConfig({
  debian_package: {
    options: {
        maintainer: {
            name: "James D Bloom",
            email: "jamesdbloom@email.com"
        },
        name: "package_name",
        short_description: "the short description",
        long_description: "the long description added to the debian package",
        version: "2.0.0",
        build_number: "001"
    },
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

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## Future Plans
1. Custom copyright file
2. Custom changelist (optionally based on git)
