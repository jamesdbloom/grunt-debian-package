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
      name: "package name"
      short_description: "the short description"
      long_description: "the long description added to the debian package"
      version: "2.0.0"
      build_number: "123"
    },
    files: {
      src: 'dist/**'
    },
  },
});
```

### Options

#### options.name
Type: `String`
Default value: `'debian_package'`

This value specifies the name of the debian package.

#### options.short_description
Type: `String`
Default value: `'short description'`

This value specifies the short description for the debian package, for example, this is displayed when listing all packages using the `dpkg -l` command. 

#### options.long_description
Type: `String`
Default value: `'the long package description'`

This value specifies the multiple line long description for the debian package, for example, this is displayed when quering package status using the `dpkg -s <package.name>` command. 

#### options.version
Type: `String`
Default value: `'0.0.1'`

The first part of the version number.  This version number is intended to respresent the logical version of the code in the package.

#### options.build_number
Type: `String`
Default value: `'000'`

The second part of the version number.  This version number is intended to respresent a specific build of the package, for example this package might represetn the Jenkins or drone.io or TravisCI build number.

#### files

The files to add into the package.  

This task supports all the file mapping format Grunt supports. Please read [Globbing patterns](http://gruntjs.com/configuring-tasks#globbing-patterns) and [Building the files object dynamically](http://gruntjs.com/configuring-tasks#building-the-files-object-dynamically) for additional details.

### Usage Examples

#### Default Options
In this example, the default options are used to do something with whatever. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result would be `Testing, 1 2 3.`

```js
grunt.initConfig({
  debian_package: {
    options: {},
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
});
```

#### Custom Options
In this example, custom options are used to do something else with whatever else. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result in this case would be `Testing: 1 2 3 !!!`

```js
grunt.initConfig({
  debian_package: {
    options: {
      separator: ': ',
      punctuation: ' !!!',
    },
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
