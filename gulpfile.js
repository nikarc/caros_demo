var gulp = require('gulp'),
		sass = require('gulp-sass'),
		minifyCss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    babel = require('gulp-babel'),
		browserify = require('browserify'),
		source = require('vinyl-source-stream'),
		buffer = require('vinyl-buffer'),
		babelify = require('babelify');

gulp.task('demo-babel', function() {
	var dbBundler = browserify('src/demo/database.js');
	dbBundler.transform(babelify);

	dbBundler.bundle()
		.on('error', function(err) { console.log(err); })
		.pipe(source('database.js'))
		.pipe(gulp.dest('./static/scripts'));

	var mainBundler = browserify('src/demo/main.js');
	mainBundler.transform(babelify);

	mainBundler.bundle()
		.on('error', function(err) { console.log(err); })
		.pipe(source('main.js'))
		.pipe(gulp.dest('./static/scripts'));
});

gulp.task('server-babel', function() {
	return gulp.src('./src/server/*.js')
		.pipe(babel())
		.pipe(gulp.dest('./'));
});

gulp.task('sass', function() {
	return gulp.src('./src/sass/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('./static/styles'));
});

gulp.task('watch', ['demo-babel', 'server-babel', 'sass'], function() {
	gulp.watch('./src/demo/*.js', ['demo-babel']);
	gulp.watch('./src/server/server.js', ['server-babel']);
	gulp.watch('./src/sass/*.scss', ['sass']);
});
