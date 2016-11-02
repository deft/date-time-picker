var
  gulp = require('gulp'),
  watch = require('gulp-watch'),
  merge = require('merge-stream'),
  ngAnnotate = require('gulp-ng-annotate'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  templateCache = require('gulp-angular-templatecache'),
  less = require('gulp-less'),
  cleanCss = require('gulp-clean-css')
;

gulp.task('default', function() {
  merge(
    gulp.src('js/date-time-picker.js'),
    gulp.src('templates/**/*.html')
      .pipe(templateCache('date-time-picker-templates.js', {
        root: 'templates/',
        module: 'deft.date_time_picker'
      }))
  )
    .pipe(concat('date-time-picker-templates.js'))
    .pipe(gulp.dest('dist'))
    .pipe(concat('date-time-picker-templates.min.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
  ;

  gulp.src('less/style.less')
    .pipe(less())
    .pipe(cleanCss({compatibility: 'ie8'}))
    .pipe(gulp.dest('dist'))
  ;
});

gulp.task('watch', function() {
  gulp.watch(['js/date-time-picker.js', 'templates/**/*.html', 'less/style.less'], ['default']);
});
