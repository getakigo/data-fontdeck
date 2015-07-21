'use strict';

var _  = require('lodash');
var del = require('del');
var vinylPaths = require('vinyl-paths');
var runSequence = require('run-sequence');
var babel = require('babel/register');

var gulp = require('gulp');
var plugin = require('gulp-load-plugins')({
  pattern: [ 'gulp-*', 'gulp.*', '@*/gulp{-,.}*' ],
  rename: {
    'gulp-lint-filepath': 'filepathlint'
  }
});

// Configs
var filePathLintConfig = require('./config/filepath-lint');

// ---

gulp.task('mocha', function() {
  return gulp.src([ './test/**/*.test.js' ], { read: false })
             .pipe(plugin.mocha({
                compilers: { js: babel },
                reporter: 'spec',
                timeout: 2000
              }));
});

gulp.task('clean-data', function() {
  var cacheLocations = [ './data/cache/**', '!./data/cache', '!./data/cache/.gitkeep',
                         './data/dist/**',  '!./data/dist',  '!./data/dist/.gitkeep' ];
  return gulp.src(cacheLocations, { read: false })
             .pipe(plugin.plumber())
             .pipe(vinylPaths(del))
});

gulp.task('filepathlint', function() {
  return gulp.src(['./**/*.*', '!./node_modules/**/*'])
             .pipe(plugin.filepathlint(filePathLintConfig))
             .pipe(plugin.filepathlint.reporter())
             .pipe(plugin.filepathlint.reporter('fail'));
});

gulp.task('eslint', function() {
  return gulp.src('./src/**/*.js')
             .pipe(plugin.plumber())
             .pipe(plugin.eslint({ configFile: './config/eslint.json' }))
              // Binding a function on data event is a workaround to gulp-eslint issue #36
             .pipe(plugin.eslint.format().on('data', _.noop));
});

// ---

gulp.task('clean', [ 'clean-data' ]);
gulp.task('lint', [ 'filepathlint', 'eslint' ]);
gulp.task('test', [ 'mocha' ]);

gulp.task('default', function(callback) {
  runSequence('clean', 'lint', 'test');
});
