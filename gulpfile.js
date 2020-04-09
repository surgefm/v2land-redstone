/* eslint-disable @typescript-eslint/no-var-requires */
const gulp = require('gulp');
const { series, parallel } = gulp;
const server = require('gulp-develop-server');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');

const tsProject = ts.createProject('tsconfig.json');
const tsProjectQuick = ts.createProject('tsconfig.json', {
  isolatedModules: true,
});

gulp.task('build', parallel(
  (cb) => {
    tsProject.src()
      .pipe(sourcemaps.init())
      .pipe(tsProject())
      .pipe(sourcemaps.write('.', {
        includeContent: true,
        sourceRoot: '../src',
      }))
      .pipe(gulp.dest('dist'))
      .on('end', cb);
  },
  (cb) => {
    gulp.src('./assets/**/*')
      .pipe(gulp.dest('./dist/assets'))
      .on('end', cb);
  }
));

gulp.task('quick build', function(cb) {
  tsProject.src()
    .pipe(sourcemaps.init())
    .pipe(tsProjectQuick())
    .pipe(sourcemaps.write('.', {
      includeContent: true,
      sourceRoot: '../src',
    }))
    .pipe(gulp.dest('dist'))
    .on('end', cb);
});

gulp.task('server', series('build', (cb) => {
  server.listen({ path: 'dist/app.js' }, cb);
}));

gulp.task('watch', series('server', (cb) => {
  gulp
    .watch(['**/*.ts', '!node_modules/**/*'], { delay: 200 })
    .on('change', series('quick build', server.restart))
    .on('end', cb);
}));

gulp.task('default', series('server', 'watch'));
