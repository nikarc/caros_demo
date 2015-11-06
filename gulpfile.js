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
	gulp.watch('./*.html').on('change', browserSync.reload);
});

gulp.task('sass', function() {
	return gulp.src('./sass/*.scss')
		.pipe(sass())
		.pipe(minifyCss())
		.pipe(gulp.dest('./styles'))
		.pipe(browserSync.stream());
});

gulp.task('babel', function() {
  return gulp.src('./scripts/*.js')
    .pipe(babel())
    .pipe(uglify())
    .pipe(gulp.dest('./scripts'));
});

gulp.task('watch', ['serve']);
