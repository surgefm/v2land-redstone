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
gulp.task('build/compile TypeScript', function (cb) {
    tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(sourcemaps.write('.', {
        includeContent: true,
        sourceRoot: '../src',
    }))
        .pipe(gulp.dest('dist'))
        .on('end', cb);
});
gulp.task('build/copy static file', function (cb) {
    gulp.src('./assets/**/*')
        .pipe(gulp.dest('./dist/assets'))
        .on('end', cb);
});
gulp.task('build', parallel('build/compile TypeScript', 'build/copy static file'));
gulp.task('quick build', function (cb) {
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

//# sourceMappingURL=gulpfile.js.map
