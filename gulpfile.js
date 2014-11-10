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
    The destination for debug build
 */
var DEBUG_DEST = './debug';

gulp.task('debug', function () {
    var bowerFiles = gulp.src(mainBowerFiles(), {read: false});
    return gulp.src('./src/index.html')
        // The name option passed to inject is the string used to define the placeholder in index.html where the script
        // tags will be injected e.g.
        // <!-- bower:js -->
        // bower files injected here
        // <!-- endinject -->
        .pipe(inject(bowerFiles, {name: 'bower'}))
        .pipe(gulp.dest(DEBUG_DEST));
});


gulp.task('default', ['debug']);
