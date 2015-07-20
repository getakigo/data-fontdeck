'use strict';

var _  = require('lodash');
var del = require('del');
var vinylPaths = require('vinyl-paths');
var runSequence = require('run-sequence');

var gulp = require('gulp');
var plugin = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'gulp.*', '@*/gulp{-,.}*', 'webpack-stream'],
  rename: {
    'gulp-lint-filepath': 'filepathlint'
  }
});

// Configs
var filePathLintConfig = require('./config/filepath-lint');

// ---

gulp.task('clean-data', function () {
  return gulp.src([ './data/cache/*.json', './data/dist/*.json' ])
    .pipe(plugin.plumber())
    .pipe(vinylPaths(del))
});

gulp.task('filepathlint', function () {
  return gulp.src(['./**/*.*', '!./node_modules/**/*'])
             .pipe(plugin.filepathlint(filePathLintConfig))
             .pipe(plugin.filepathlint.reporter())
             .pipe(plugin.filepathlint.reporter('fail'));
});

gulp.task('eslint', function() {
  return gulp.src('./src/**/*.js')
      .pipe(plugin.plumber())
      .pipe(plugin.eslint({ configFile: './config/eslint.json' }))
      // Binding a function on data event is a workaround to issue #36
      // https://github.com/adametry/gulp-eslint/issues/36#issuecomment-104325891
      .pipe(plugin.eslint.format().on('data', function() {}));
});

// ---

gulp.task('clean', [ 'clean-data' ]);
gulp.task('lint', [ 'filepathlint', 'eslint' ]);

gulp.task('default', function(callback) {
  runSequence('clean', 'lint');
});
