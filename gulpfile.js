'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var changed = require('gulp-changed');
var concat = require('gulp-concat');
var del = require('del');
var es = require('event-stream');
var flatten = require('gulp-flatten');
var html2js = require('gulp-html2js');
var inject = require('gulp-inject');
var less = require('gulp-less');
var mainBowerFiles = require('main-bower-files');
var minifyCSS = require('gulp-minify-css');
var minifyHTML = require('gulp-minify-html');
var ngAnnotate = require('gulp-ng-annotate');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var uglify = require('gulp-uglify');
var zip = require('gulp-zip');

// Paths
// ------------------------------------------------------------------------------------------------

var basePaths = {
    build: 'build/',
    src: 'src/'
}

var paths = {
    build: {
        debug: basePaths.build + 'debug/',
        release: basePaths.build + 'release/'
    },
    html: {
        index: basePaths.src + 'index.html',
        all: basePaths.src + '**/*.html'
    },
    js: {
        all: basePaths.src + '**/*.js',
        modules: basePaths.src + '**/*.module.js',
        nonModules: basePaths.src + '**/!(*.module.js)'
    },
    less: {
        src: basePaths.src + 'less/*.less',
        output: basePaths.src + 'less/app.less'
    }
};

var CSS = 'app.css';
var HTML_TEMPLATES = 'app.html.templates';

// Debug
// ------------------------------------------------------------------------------------------------

gulp.task('debug', function () {

    var bowerFiles = gulp.src(mainBowerFiles(), {read: false});

    /*
        Inject files from multiple source streams using event-stream merge
        This provides us with script loading order according to our .js file naming conventions
        i.e. we load all *.module.js files first
        This is necessary as the module needs to execute before any files that use it
        e.g. home.module.js
     */
    var moduleStream = gulp.src(paths.js.modules, {read: false});
    var nonModuleStream = gulp.src(paths.js.nonModules, {read: false});
    var templates = gulp.src(paths.build.debug + HTML_TEMPLATES + '.js', {read: false});
    var css = gulp.src(paths.build.debug + CSS, {read: false});

    return gulp.src(paths.html.index)
        /*
            The name option passed to inject is the string used to define the placeholder in index.html where the script
            tags will be injected e.g.
            <!-- bower:js -->
            <script src="/bower_components/angular/angular.js"></script>
            ...
            <!-- endinject -->
         */
        .pipe(inject(css, {ignorePath: paths.build.debug}))
        .pipe(inject(templates, {name: 'templates', ignorePath: paths.build.debug}))
        .pipe(inject(bowerFiles, {name: 'vendor'}))
        .pipe(inject(es.merge(moduleStream, nonModuleStream), {relative: true}))
        .pipe(gulp.dest(paths.build.debug));
});

gulp.task('html', function () {
    return gulp.src([paths.html.all, '!' + paths.html.index])
        .pipe(html2js({
            outputModuleName: HTML_TEMPLATES,
            useStrict: true,
            base: 'src/app'
        }))
        .pipe(concat(HTML_TEMPLATES + '.js'))
        .pipe(gulp.dest(paths.build.debug));
});

gulp.task('js', function () {
    return gulp.src(paths.js.all)
        .pipe(changed(paths.build.debug))
        .pipe(gulp.dest(paths.build.debug));
});

gulp.task('less', function () {
    return gulp.src(paths.less.output)
        .pipe(less())
        .pipe(gulp.dest(paths.build.debug));
});

gulp.task('vendor', function () {
    /*
        Note: passing base path as second argument to gulp.src is required.
        See: http://stackoverflow.com/questions/21386940/why-does-gulp-src-not-like-being-passed-an-array-of-complete-paths-to-files
        This is not intuitive, perhaps find a different approach?

        mainBowerFiles() returns the absolute path of bower files e.g.
            /Users/username/project/bower_components/angular/angular.js,
        If we do not use the base option then angular.js is written to the root of the debug directory...
            debug/angular.js
        If we use {base: 'bower_components'} angular.js is written to...
            debug/angular/angular.js
        Thus in order to get what we expect we have to set the base option to this project dir as follows...
            {base: '.'}
        This results in...
            debug/bower_components/angular/angular.js
        We require this structure to match the injected bower scripts in index.html e.g.
            <script src="/bower_components/angular/angular.js"></script>
     */

    return gulp.src(mainBowerFiles(), {base: '.'})
        .pipe(gulp.dest(paths.build.debug));
});

gulp.task('browserSync', function () {
    return browserSync({
        server: {
            baseDir: paths.build.debug
        },
        browser: ['google chrome canary']
    });
});

gulp.task('browserSyncRelease', function () {
    return browserSync({
        server: {
            baseDir: paths.build.release
        },
        browser: ['google chrome canary']
    });
});

// Release
// ------------------------------------------------------------------------------------------------

gulp.task('release', function (cb) {

    runSequence('clean-release',
        ['vendor-release', 'js-release', 'less-release', 'html-release'],
        'package-release',
        cb);
});

gulp.task('release-serve', function () {

    gulp.run('release', ['browserSyncRelease']);
});

gulp.task('package-release', function () {

    var css = gulp.src('build/release/app.min.css', {read: false});
    var js = gulp.src('build/release/app.min.js', {read: false});
    var templates = gulp.src(paths.build.release + HTML_TEMPLATES + '.min.js', {read: false});
    var vendor = gulp.src('build/release/vendor.min.js', {read: false});

    return gulp.src(paths.html.index)
        .pipe(inject(css, {ignorePath: paths.build.release}))
        .pipe(inject(js, {ignorePath: paths.build.release}))
        .pipe(inject(templates, {name: 'templates', ignorePath: paths.build.release}))
        .pipe(inject(vendor, {name: 'vendor', ignorePath: paths.build.release}))
        .pipe(minifyHTML({quotes: true, empty: true}))
        //.pipe(zip('app.zip'))
        .pipe(gulp.dest(paths.build.release));
});

gulp.task('js-release', function () {

    return gulp.src([paths.js.modules, paths.js.all])
        .pipe(ngAnnotate())
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.build.release));
});

gulp.task('html-release', function () {
    return gulp.src([paths.html.all, '!' + paths.html.index])
        .pipe(html2js({
            outputModuleName: HTML_TEMPLATES,
            useStrict: true,
            base: 'src/app'
        }))
        .pipe(concat(HTML_TEMPLATES + '.js'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.build.release));
});

gulp.task('less-release', function () {
    return gulp.src(paths.less.output)
        .pipe(less())
        .pipe(minifyCSS())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.build.release));
});

gulp.task('vendor-release', function () {
    return gulp.src('bower_components/**/*.min.js')
        .pipe(concat('vendor.js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(flatten())
        .pipe(gulp.dest(paths.build.release));
});

// Clean
// ------------------------------------------------------------------------------------------------

gulp.task('clean', function (cb) {
    del([basePaths.build], cb);
});

gulp.task('clean-debug', function (cb) {
    del([paths.build.debug], cb);
});

gulp.task('clean-release', function (cb) {
    del([paths.build.release], cb);
});

// Default
// ------------------------------------------------------------------------------------------------

gulp.task('default', function (cb) {
    runSequence('clean-debug',
        ['vendor', 'js', 'html', 'less', 'browserSync'],
        'debug',
        cb);
    gulp.watch(paths.js.all, ['js', browserSync.reload]);
    gulp.watch([paths.html.all, '!' + paths.html.index], ['html', browserSync.reload]);
    gulp.watch(paths.html.index, ['debug', browserSync.reload]);
    gulp.watch(paths.less.src, ['less', browserSync.reload]);
});