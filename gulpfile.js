var autoprefixer = require('gulp-autoprefixer')
var browserSync = require('browser-sync').create()
var cleanCSS = require('gulp-clean-css')
var concat = require('gulp-concat')
var data = require('gulp-data')
var gulp = require('gulp')
var inject = require('gulp-inject')
var pug = require('gulp-pug')
var sass = require('gulp-sass')
var uglify = require('gulp-uglify')

// copy resources, including all images, to dist
gulp.task('resources', function() {
  return gulp
    .src(['src/resources/*', 'src/resources/img/*'], {
      base: 'src/resources/' // gulp will copy directories w/contents after specified base
    })
    .pipe(gulp.dest('dist/'))
})

// copy font-awesome fonts to dist
gulp.task('fonts', function() {
  return gulp.src('node_modules/font-awesome/fonts/*').pipe(gulp.dest('dist/fonts/'))
})

// convert scss from font-awesome and src/scss to css
// concatenate it into a single file
// autoprefix it
// clean it
// put it in dist/styles
// stream updates to the browser.
gulp.task('scss', function() {
  return gulp
    .src(['node_modules/font-awesome/scss/*.scss', 'src/scss/*.scss'])
    .pipe(
      sass({
        'sourcemap=none': true
      })
    )
    .pipe(concat('styles.min.css'))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(gulp.dest('dist/styles/'))
    .pipe(browserSync.stream())
})

// Concat jquery into one file with src JS
// uglify the result
// put into js folder
// stream updates to browser
gulp.task('js', function() {
  return gulp
    .src(['node_modules/jquery/dist/jquery.min.js', 'src/js/*.js'])
    .pipe(concat('index.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js/'))
    .pipe(browserSync.stream())
})

//These sources will be injected into pug templates
var sources = gulp.src(['dist/styles/*.css', 'dist/js/*.js'], { read: false })

// import sites.json object for pug to iterate (see index.pug middle)
// inject sources with proper paths
// build index.html
// put it in dist
// stream
gulp.task('index', () => {
  var target = gulp.src('src/index.pug', { read: true })

  return target
    .pipe(data(file => require('./src/sites.json')))
    .pipe(inject(sources, { addRootSlash: false, ignorePath: '../dist', relative: true }))
    .pipe(pug())
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream())
})

//Render thanks.html
gulp.task('thanks', function buildHTML() {
  var target = gulp.src('src/thanksAndError.pug', { read: true })
  return target
    .pipe(inject(sources, { addRootSlash: false, ignorePath: '../dist', relative: true }))
    .pipe(
      pug({
        data: {
          thanksTop: 'Thanks for your message!',
          thanksSub: "I'll be in touch."
        }
      })
    )
    .pipe(concat('thanks.html'))
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream())
})

//Render error404.html
gulp.task('missing', function buildHTML() {
  var target = gulp.src('src/thanksAndError.pug', { read: true })
  return target
    .pipe(inject(sources, { addRootSlash: false, ignorePath: '../dist', relative: true }))
    .pipe(
      pug({
        data: {
          missingTop: 'Page not found.',
          missingSub: "Maybe I'm missing something?"
        }
      })
    )
    .pipe(concat('error404.html'))
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream())
})

//Render error501.html
gulp.task('fiveOhOne', function buildHTML() {
  var target = gulp.src('src/thanksAndError.pug', { read: true })
  return target
    .pipe(inject(sources, { addRootSlash: false, ignorePath: '../dist', relative: true }))
    .pipe(
      pug({
        data: {
          fiveOhOneTop: 'There seems to be a problem.',
          fiveOhOneSub: 'Could you check the address?'
        }
      })
    )
    .pipe(concat('error501.html'))
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream())
})

// Static server + watchin scss/js/pug files
gulp.task(
  'start',
  ['resources', 'fonts', 'scss', 'js', 'index', 'thanks', 'missing', 'fiveOhOne'],
  function() {
    browserSync.init({
      server: {
        baseDir: 'dist/'
      }
    })
    gulp.watch('src/scss/*.scss', ['scss'])
    gulp.watch('src/js/*.js', ['js'])
    gulp.watch('src/index.pug', ['index'])
    gulp.watch('src/sites.json', ['index']) //This doesn't quite work but tries
    gulp.watch('src/thanksAndError.pug', ['thanks'])
    gulp.watch('src/thanksAndError.pug', ['missing'])
    gulp.watch('src/thanksAndError.pug', ['fiveOhOne'])
    gulp.watch('*.html').on('change', browserSync.reload)
  }
)
