// Generated on 2014-03-17 using generator-angular 0.7.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);
  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: {
      // configurable paths
      app: require('./bower.json').appPath || '',
      dist: 'dist'
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: ['scripts/{,*/}*.js'],
        tasks: ['newer:jshint:all']
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test']
      },
      compass: {
        files: ['styles/{,*/}*.{scss,sass}'],
        tasks: ['compass:server','autoprefixer']
      },
      views: {
        files : [ 'templates/*.html', 'templates/partials/**/*.html'],
        tasks: [
          'clean:views',
          'useminPrepare',
          'concat',
          'copy:views',
          'rev',
          'usemin',
          'htmlmin'
        ]
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      dev: {
        files: [
          '{,*/}*.html',
          'images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          'templates/*.html', 'templates/partials/**/*.html',
          'styles/{,*/}*.{scss,sass}',
          'scripts/{,*/}*.js',
          'bower_components/{,*/}*.js'
        ],
        tasks: [
          'clean:dist',
          //'bowerInstall',
          'copy:fonts',
          'concurrent:server',
          'autoprefixer',
          'copy:dev'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            '<%= yeoman.app %>'
          ]
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%= yeoman.app %>'
          ]
        }
      },
      dist: {
        options: {
          base: '<%= yeoman.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/{,*/}*.js'
      ],
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        options: { force: true },
        files: [{
          dot: true,
          src: [
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      js: {
        options: { force: true },
        files: [{
          dot: true,
          src: [
            '<%= yeoman.dist %>/scripts/*'
          ]
        }]
      },
      css: {
        options: { force: true },
        files: [{
          dot: true,
          src: [
            '<%= yeoman.dist %>/styles/*'
          ]
        }]
      },
      views: {
        options: { force: true },
        files: [{
          dot: true,
          src: [
            ['<%= yeoman.dist %>/templates']
          ]
        }]
      },
      server: '.tmp',
      compressed: '.tmp/compressed'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },

    // Automatically inject Bower components into the app
    'bowerInstall': {
      target: {
        src: [
          'index.html',
          '404.html',
          'maintenance.html',
          'styles/main.scss'
        ],
        exclude: ['bower_components/bootstrap-sass-official/vendor/assets/javascripts/bootstrap.js']
      }
    },




    // Compiles Sass to CSS and generates necessary files if requested
    compass: {
      options: {
        sassDir: 'styles',
        cssDir: '.tmp/styles',
        generatedImagesDir: '.tmp/images/generated',
        imagesDir: 'images',
        javascriptsDir: 'scripts',
        fontsDir: 'styles/fonts',
        importPath: 'bower_components',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/styles/fonts',
        relativeAssets: false,
        assetCacheBuster: false,
        raw: 'Sass::Script::Number.precision = 10\n'
      },
      dist: {
        options: {
          generatedImagesDir: '<%= yeoman.dist %>/images/generated'
        }
      },
      server: {
        options: {
          generatedImagesDir: '<%= yeoman.dist %>/images/generated',
          debugInfo: true
        }
      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/styles/{,*/}*.css',
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/images/icons/favicon.ico',
            '!<%= yeoman.dist %>/images/pinpin/dail-*.png',
            '!<%= yeoman.dist %>/images/ordered.png',
            '!<%= yeoman.dist %>/images/cancelled.png',
            '!<%= yeoman.dist %>/images/closed.png',
            '!<%= yeoman.dist %>/images/reopened.png',
            '!<%= yeoman.dist %>/images/started.png',
            '!<%= yeoman.dist %>/images/pinpin/clouds_mainpage3_.png',
            '!<%= yeoman.dist %>/images/px_bg.png',
            '!<%= yeoman.dist %>/images/table-layout.jpg',
            '!<%= yeoman.dist %>/images/icons/pimg_big*',
            '!<%= yeoman.dist %>/images/cam_icon.png',
            '!<%= yeoman.dist %>/images/manual_icon.png',
            '!<%= yeoman.dist %>/images/photo.png',
            '!<%= yeoman.dist %>/images/attendance/*.png',
            '!<%= yeoman.dist %>/images/NoMenuImage.png'
          ]
        }
      },
      ngtemplates: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/templates.js'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: ['index.html'],
      options: {
        dest: '<%= yeoman.dist %>'
      },
      flow: {
        html: {
          steps: {
            js: ['concat', 'uglifyjs'],
            css: ['cssmin']
          },
          post: {}
        }
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html', '<%= yeoman.dist %>/templates/*.html', '<%= yeoman.dist %>/templates/partials/**/*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= yeoman.dist %>', '<%= yeoman.dist %>/images']
      }
    },

    uglify: {
      ngtemplates: {
        files: [
          {
            dest: '<%= yeoman.dist %>/scripts/templates.js',
            src: [ '<%= yeoman.dist %>/scripts/templates.js' ]
          }
        ]
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        options: { force: true },
        files: [{
          expand: true,
          cwd: 'images',
          src: '**/*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },

    svgmin: {
      dist: {
        options: { force: true },
        files: [{
          expand: true,
          cwd: 'images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: ['*.html', 'templates/*.html', 'templates/partials/**/*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      },
      ngtemplates : {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: ['templates/*.html', 'templates/partials/**/*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      },
      mainviews : {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: ['*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          //cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.html',
            'templates/*.html', 'templates/partials/**/*.html',
            'css/angular/**/*',
            'css/images/**/*',
            //'scripts/lib/**/*',
            //'images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            'fonts/*',
            //'images/**/*',
            'jar/**/*',
            '.htaccess'
          ]
        }, {
          expand: true,
          cwd: '.tmp/styles/',
          dest: '<%= yeoman.dist %>/styles',
          src: [
            '**/*'
          ]
        }, {
          expand: true, cwd: 'css/angular/', src: ['**/*'], dest: '<%= yeoman.dist %>/styles/angular/'
        }, {
          expand: true, cwd: 'css/images/', src: ['**/*'], dest: '<%= yeoman.dist %>/styles/images/'
        }]
      },

      dev: {
        files: [{
          expand: true,
          dot: true,
          //cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            'templates/*.html', 'templates/partials/**/*.html',
            'scripts/**/*',
            'bower_components/**/*',
            'images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            'fonts/*',
            'images/**/*',
            'i18n/**/*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/styles/',
          dest: '<%= yeoman.dist %>/styles',
          src: [
            '**/*'
          ]
        }]
      },
      js: {
        expand: true,
        cwd: 'scripts/',
        dest: '<%= yeoman.dist %>/scripts',
        src: [
          '**/*'
        ]
      },
      css: {
        expand: true,
        cwd: '.tmp/styles/',
        dest: '<%= yeoman.dist %>/styles',
        src: [
          '**/*'
        ]
      },
      views: {
        expand: true,
        cwd: 'templates/',
        dest: '<%= yeoman.dist %>/templates',
        src: [
          '**/*'
        ]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      },
      fonts: {
        files: [{
          expand: true,
          cwd: 'bower_components/fontawesome/fonts',
          dest: '<%= yeoman.dist %>/styles/fonts/',
          src: '*'
        }, {
          expand: true,
          cwd: 'styles/fonts',
          dest: '<%= yeoman.dist %>/styles/fonts/',
          src: [
            '**/*'
          ]
        }]
      },
      compressedassets : {
        files: [{
          expand: true,
          cwd: '.tmp/compressed',
          dest: '<%= yeoman.dist %>',
          src: ['**/*']
        }]
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'compass:server'
      ],
      test: [
        'compass'
      ],
      dist: [
        // 'compass:dist',
        // 'copy:fonts',
        'imagemin',
        'svgmin'
      ]
    },

    // By default, your `index.html`'s <!-- Usemin block --> will take care of
    // minification. These next options are pre-configured if you do not wish
    // to use the Usemin blocks.
    // cssmin: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/styles/main.css': [
    //         '.tmp/styles/{,*/}*.css',
    //         '<%= yeoman.app %>/styles/{,*/}*.css'
    //       ]
    //     }
    //   }
    // },
    // uglify: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/scripts/scripts.js': [
    //         '<%= yeoman.dist %>/scripts/scripts.js'
    //       ]
    //     }
    //   }
    // },
    // concat: {
    //   dist: {}
    // },

    // Test settings
    
    ngtemplates: {
      soft: {
        cwd: '<%= yeoman.dist %>',
        src: ['templates/*.html', 'templates/partials/**/*.html'],
        dest: '<%= yeoman.dist %>/scripts/templates.js'
      }
    },
    cdn: {
      options: {
        /** @required - root URL of your CDN (may contains sub-paths as shown below) */
        cdn: 'http://local.softpointdev.com//',
        /** @optional  - if provided both absolute and relative paths will be converted */
        flatten: true,
        /** @optional  - if provided will be added to the default supporting types */
        supportedTypes: { 'phtml': 'html' }
      },
      dist: {
        /** @required  - gets sources here, may be same as dest  */
        cwd: '<%= yeoman.dist %>',
        /** @required  - puts results here with respect to relative paths  */
        dest: '<%= yeoman.dist %>',
        /** @required  - files to process */
        src: ['index.html', '*.css', '{,*/}*.html', '{,**/}*.html']
      },
      ngtemplates: {
        /** @required  - gets sources here, may be same as dest  */
        cwd: '<%= yeoman.dist %>/views',
        /** @required  - puts results here with respect to relative paths  */
        dest: '<%= yeoman.dist %>/views',
        /** @required  - files to process */
        src: ['{,*/}*.html', '{,**/}*.html']
      }
    },
    compress: {
      css: {
        options: {
          mode: 'gzip'
        },
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.dist %>/styles',
            dest: '.tmp/compressed/styles',
            src: [
              '**/*.css'
            ]
          }
        ]
      },
      js: {
        options: {
          mode: 'gzip'
        },
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.dist %>/scripts',
            dest: '.tmp/compressed/scripts',
            src: [
              '**/*.js'
            ]
          }
        ]
      },
      dist: {
        options: {
            archive: './builds/dist.' + grunt.template.today('yyyy-mm-dd') + '.zip',
            mode: 'zip'
        },
        files: [
            { src: ['<%= yeoman.dist %>/**', '<%= yeoman.dist %>/.htaccess'] }
        ]
      }
    }
  });


  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:dist',
      //'bowerInstall',
      'copy:fonts',
      'concurrent:server',
      'autoprefixer',
      'copy:dev',
      //open preview
      'connect:livereload',
      'watch:dev'
    ]);
  });

  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });

  grunt.registerTask('test', [
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'clean:server',
    //'bowerInstall',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'ngAnnotate',
    'copy:dist',
    //'cdnify',
    'cssmin',
    'uglify',
    'rev',
    'usemin',
    'create-template-cache',
    // 'cdn:dist',
    'clean:views',
    'compress-assets',
    'compress:dist'
  ]);

  // Real deployment ops for Staing and Production
  grunt.registerTask('create-template-cache', [
    // minify views before creating cache
    'htmlmin:ngtemplates',
    //'cdn:ngtemplates',
    // create template cache (templates.js)
    'ngtemplates',
    //minify templates.js
    'uglify:ngtemplates',
    // rename templates.js
    'rev:ngtemplates',
    // update html agains
    'usemin',
    'htmlmin:mainviews'
  ]);

  // Real deployment ops for Staing and Production
  grunt.registerTask('prepare-deploy', [
    'clean:dist',
    //'bowerInstall',
    'copy:fonts',
    'useminPrepare',
    'concurrent:server',
    'autoprefixer',
    'concat',
    'ngAnnotate',
    'copy:dist',
  ]);

  grunt.registerTask('staging', [
    'prepare-deploy',
    'cdnify:staging',
    'cssmin',
    'uglify',
    'rev',
    'usemin',
    'create-template-cache',
  ]);

  grunt.registerTask('production', [
    'prepare-deploy',
    'cdnify:production',
    'cssmin',
    'uglify',
    'rev',
    'usemin',
    'create-template-cache',
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);

  grunt.registerTask('compress-assets', [
    'clean:compressed',
    'compress:css',
    'compress:js',
    'copy:compressedassets'
  ]);

  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-ng-constant');
  grunt.loadNpmTasks('grunt-cdn');
  grunt.loadNpmTasks('grunt-contrib-compress');
};
