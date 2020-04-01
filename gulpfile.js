/* eslint-disable @typescript-eslint/no-var-requires */
const gulp = require('gulp');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');

const tsProject = ts.createProject('tsconfig.json');

gulp.task('scripts', function() {
  return tsProject.src()
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(sourcemaps.write('.', {
      includeContent: true,
      sourceRoot: '../src',
    }))
    .pipe(gulp.dest('dist'));
});
