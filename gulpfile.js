var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var less = require('gulp-less');
var path = require('path');
var plumber = require('gulp-plumber');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var useref = require('gulp-useref');
var filter = require('gulp-filter');
var uglify = require('gulp-uglify');
var csso = require('gulp-csso');

gulp.task('watch', function() {
    gulp.watch('./less/*.less', ['less']);
    gulp.watch(['./css/*.css', './js/*.js', './*.html'], ['index']);
});

gulp.task('less', function() {
    return gulp.src('./less/*.less')
        .pipe(plumber())
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
        .on('error', function(e) {})
        .pipe(gulp.dest('./css'));
});

gulp.task("index", function() {
    var jsFilter = filter("./js/*.js", { restore: true });
    var cssFilter = filter("./css/*.css", { restore: true });
    var indexHtmlFilter = filter(['./*.html', '!**/index.html'], { restore: true });

    return gulp.src("./*.html")
        .pipe(useref()) // Concatenate with gulp-useref
        .pipe(jsFilter)
        .pipe(uglify()) // Minify any javascript sources
        .pipe(jsFilter.restore)
        .pipe(cssFilter)
        .pipe(csso()) // Minify any CSS sources
        .pipe(cssFilter.restore)
        .pipe(indexHtmlFilter)
        .pipe(rev()) // Rename the concatenated files (but not index.html)
        .pipe(indexHtmlFilter.restore)
        .pipe(revReplace()) // Substitute in new filenames
        .pipe(gulp.dest('public'));
});

// 静态服务器
gulp.task('browser-sync', ['watch'], function() {
    // 监听HTML更改事件并重新加载
    browserSync.watch(["*/*.html", "*.html"]).on("change", browserSync.reload);

    // 提供一个回调来捕获所有事件的CSS 
    // files - 然后筛选的'change'和重载所有
    // css文件在页面上
    browserSync.watch("*/*.css", function(event, file) {
        if (event === "change") {
            browserSync.reload("*.css");
        } else {
            browserSync.reload();
        }
    });

    browserSync.init({
        server: {
            baseDir: "./"
        },
        port: 1234
    });
});

gulp.task('init', ['browser-sync', 'less', 'index'])
gulp.task('default', ['init']);