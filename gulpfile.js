'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var changed = require('gulp-changed');
var concat = require('gulp-concat');
var del = require('del');
var es = require('event-stream');
var html2js = require('gulp-html2js');
var inject = require('gulp-inject');
var mainBowerFiles = require('main-bower-files');
var runSequence = require('run-sequence');

var paths = {
    build: {
        debug: './build/debug/'
    },
    html: {
        index: './src/index.html',
        all: './src/**/*.html'
    },
    js: {
        all: './src/**/*.js',
        modules: './src/**/*.module.js',
        nonModules: './src/**/!(*.module.js)'
    }
};

var HTML_TEMPLATES = 'app.html.templates';

gulp.task('browserSync', function () {
    return browserSync({
        server: {
            baseDir: paths.build.debug
        },
        browser: ['google chrome canary']
    });
});

gulp.task('debug', ['vendor', 'scripts', 'templates'], function () {

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

    return gulp.src(paths.html.index)
        /*
            The name option passed to inject is the string used to define the placeholder in index.html where the script
            tags will be injected e.g.
            <!-- bower:js -->
            <script src="/bower_components/angular/angular.js"></script>
            ...
            <!-- endinject -->
         */
        .pipe(inject(bowerFiles, {name: 'vendor'}))
        .pipe(inject(es.merge(moduleStream, nonModuleStream), {relative: true}))
        .pipe(gulp.dest(paths.build.debug));
});


gulp.task('clean', function (cb) {
    del([paths.build.debug], cb);
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

gulp.task('scripts', function () {
    return gulp.src(paths.js.all)
        .pipe(changed(paths.build.debug))
        .pipe(gulp.dest(paths.build.debug))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('html', function () {
    return gulp.src(paths.html.all)
        .pipe(gulp.dest(paths.build.debug));
});

gulp.task('templates', function() {
    return gulp.src([paths.html.all, '!' + paths.html.index])
        .pipe(html2js({
            outputModuleName: HTML_TEMPLATES,
            useStrict: true,
            base: 'src/app'
        }))
        .pipe(concat(HTML_TEMPLATES + '.js'))
        .pipe(gulp.dest(paths.build.debug))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('default', function (cb) {
    runSequence('clean',
        ['debug', 'browserSync'],
        cb);
    gulp.watch(paths.js.all, ['scripts']);
    gulp.watch(paths.html.all, ['templates']);
});


