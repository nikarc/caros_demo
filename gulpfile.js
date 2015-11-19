var gulp = require('gulp'),
		sass = require('gulp-sass'),
		minifyCss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    babel = require('gulp-babel'),
		browserSync = require('browser-sync').create();

// Place .scss files in ./sass
gulp.task('serve', ['sass'], function() {
	browserSync.init({
		server: './',
		open: false
	});
	gulp.watch('./sass/*.scss', ['sass']);
	gulp.watch('./src/server/*.js', ['server-babel']);
	gulp.watch('./src/*.js', ['babel']);
	gulp.watch('./*.html').on('change', browserSync.reload);
});

gulp.task('sass', function() {
	return gulp.src('./sass/*.scss')
		.pipe(sass())
		.pipe(minifyCss())
		.pipe(gulp.dest('./static/styles'))
		.pipe(browserSync.stream());
});

gulp.task('server-babel', function() {
  return gulp.src('./src/server/server.js')
    .pipe(babel())
    .pipe(gulp.dest('./'));
});

gulp.task('babel', function() {
	return gulp.src('./src/*.js')
		.pipe(babel())
		.pipe(uglify())
		.pipe(gulp.dest('./scripts'));
});

gulp.task('watch', ['serve']);
