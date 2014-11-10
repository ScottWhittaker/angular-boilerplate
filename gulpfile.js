/*
    https://github.com/gulpjs/gulp/
 */
var gulp = require('gulp');

/*
    https://github.com/klei/gulp-inject
 */
var inject = require('gulp-inject');

/*
    https://github.com/ck86/main-bower-files
 */
var mainBowerFiles = require('main-bower-files');

/*
    https://github.com/sindresorhus/del
 */
var del = require('del');

/*
    The destination for debug build
 */
var DEBUG_DEST = './debug';

gulp.task('debug', ['clean', 'vendor'], function () {
    var bowerFiles = gulp.src(mainBowerFiles(), {read: false});
    return gulp.src('./src/index.html')
        /*
            The name option passed to inject is the string used to define the placeholder in index.html where the script
            tags will be injected e.g.
            <!-- bower:js -->
            <script src="/bower_components/angular/angular.js"></script>
            ...
            <!-- endinject -->
         */
        .pipe(inject(bowerFiles, {name: 'bower'}))
        .pipe(gulp.dest(DEBUG_DEST));
});

gulp.task('clean', function (cb) {
    del([DEBUG_DEST], cb);
});

gulp.task('vendor', ['clean'], function () {
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
        .pipe(gulp.dest('./debug'));
});

gulp.task('default', ['debug']);
