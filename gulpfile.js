const gulp = require('gulp')
const concat = require('gulp-concat')
const pug = require('gulp-pug')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const cleanCSS = require('gulp-clean-css')

//Render thanks.html
gulp.task('thanks', function buildHTML() {
  return gulp
    .src('thanksAndError.pug')
    .pipe(
      pug({
        data: {
          thanksTop: 'Thanks for your message!',
          thanksSub: "I'll be in touch."
        }
      })
    )
    .pipe(concat('thanks.html'))
    .pipe(gulp.dest('./'))
})

//Render error404.html
gulp.task('missing', function buildHTML() {
  return gulp
    .src('thanksAndError.pug')
    .pipe(
      pug({
        data: {
          missingTop: 'Page not found.',
          missingSub: "Maybe I'm missing something?"
        }
      })
    )
    .pipe(concat('error404.html'))
    .pipe(gulp.dest('./'))
})

//Render error501.html
gulp.task('fiveOhOne', function buildHTML() {
  return gulp
    .src('thanksAndError.pug')
    .pipe(
      pug({
        data: {
          fiveOhOneTop: 'There seems to be a problem.',
          fiveOhOneSub: 'Could you check the address?'
        }
      })
    )
    .pipe(concat('error501.html'))
    .pipe(gulp.dest('./'))
})

//Handle styles
gulp.task('style', function() {
  return gulp
    .src('style/*.scss')
    .pipe(
      sass({
        'sourcemap=none': true
      })
    )
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(gulp.dest('style/'))
})

//All tasks
gulp.task('default', ['thanks', 'missing', 'fiveOhOne', 'style'])
