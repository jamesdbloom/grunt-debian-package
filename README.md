# grunt-debian-package

> Create debian package from grunt build

## Getting Started
This plugin requires Grunt `~0.4`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-debian-package --save-dev
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
        name: "package name",
        short_description: "the short description",
        long_description: "the long description added to the debian package",
        version: "2.0.0",
        build_number: "001"
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

### Options

#### options.name
Type: `String`
Default value: `'grunt.package.name'`

This value specifies the name of the debian package.  The default value is taken from the package.json name value.

#### options.short_description
Type: `String`
Default value: `'grunt.package.description && grunt.package.description.split(/\r\n|\r|\n/g)[0]'`

This value specifies the short description for the debian package, for example, this is displayed when listing all packages using the `dpkg -l` command.  The default value is taken from the first line of the package.json description value.

#### options.long_description
Type: `String`
Default value: `'grunt.package.description && grunt.package.description.split(/\r\n|\r|\n/g).splice(1).join(' ')'`

This value specifies the multiple line long description for the debian package, for example, this is displayed when quering package status using the `dpkg -s <package.name>` command.  The default value is taken from all text **after the end of the first line** of the package.json description value.

#### options.version
Type: `String`
Default value: `'grunt.package.version'`

The first part of the version number.  This version number is intended to respresent the logical version of the code in the package.  The default value is taken from the package.json version value.

#### options.build_number
Type: `String`
Default value: `'process.env.BUILD_NUMBER || process.env.DRONE_BUILD_NUMBER || process.env.TRAVIS_BUILD_NUMBER'`

The second part of the version number.  This version number is intended to respresent a specific build of the package, for example this package might represetn the Jenkins or drone.io or TravisCI build number.  The default value is taken from an environment variable called `BUILD_NUMBER` or `DRONE_BUILD_NUMBER` or `TRAVIS_BUILD_NUMBER` which is compatible with Jenkins, drone.io and TravisCI respectively.

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
  options: {
      name: grunt.package.name,
      short_description: grunt.package.description && grunt.package.description.split(/\r\n|\r|\n/g)[0],
      long_description: grunt.package.description && grunt.package.description.split(/\r\n|\r|\n/g).splice(1).join(' '),
      version: grunt.package.version,
      build_number: process.env.BUILD_NUMBER
  }
```

#### Custom Options

In this example, custom options are used to override the default values.  A files section is added which will add all files in the `dist` directory into `/var/www/` in the package.

```js
grunt.initConfig({
  debian_package: {
    options: {
        name: "package name",
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
