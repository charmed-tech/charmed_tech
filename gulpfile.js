var autoprefixer = require('gulp-autoprefixer')
var browserSync = require('browser-sync').create()
var cleanCSS = require('gulp-clean-css')
var concat = require('gulp-concat')
var gulp = require('gulp')
var inject = require('gulp-inject')
var pug = require('gulp-pug')
var sass = require('gulp-sass')
var uglify = require('gulp-uglify')

// compile local and font-awesome scss into css
// concatenate to one file
// autoprefix
// clean and minify
// put the result in the styles folder
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
    .pipe(gulp.dest('styles/'))
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
    .pipe(gulp.dest('js/'))
    .pipe(browserSync.stream())
})

// Render index.html
gulp.task('index', function buildHTML() {
  var sources = gulp.src(['styles/*.css', 'js/*.js'], { read: false })
  var target = gulp.src('src/index.pug', { read: true })
  return target
    .pipe(inject(sources, { addRootSlash: false }))
    .pipe(
      pug({
        data: {
          title: 'Recipe Box',
          description:
            "Made with React.js, React Bootstrap, and oodles of SCSS. Add your own recipes and style the instructions to your taste! Recipes will stick around until you clear your browser's cache.",
          url: 'https://charmedsatyr.github.io/recipe_box'
        }
      })
    )
    .pipe(concat('index.html'))
    .pipe(gulp.dest('./'))
    .pipe(browserSync.stream())
})

//Render thanks.html
gulp.task('thanks', function buildHTML() {
  var sources = gulp.src(['styles/*.css', 'js/*.js'], { read: false })
  var target = gulp.src('src/thanksAndError.pug', { read: true })
  return target
    .pipe(inject(sources, { addRootSlash: false }))
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
    .pipe(browserSync.stream())
})

//Render error404.html
gulp.task('missing', function buildHTML() {
  var sources = gulp.src(['styles/*.css', 'js/*.js'], { read: false })
  var target = gulp.src('src/thanksAndError.pug', { read: true })
  return target
    .pipe(inject(sources, { addRootSlash: false }))
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
    .pipe(browserSync.stream())
})

//Render error501.html
gulp.task('fiveOhOne', function buildHTML() {
  var sources = gulp.src(['styles/*.css', 'js/*.js'], { read: false })
  var target = gulp.src('src/thanksAndError.pug', { read: true })
  return target
    .pipe(inject(sources, { addRootSlash: false }))
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
    .pipe(browserSync.stream())
})

// Static server + watchin scss/js/pug files
gulp.task('start', ['scss', 'js', 'index' /*, 'thanks', 'missing', 'fiveOhOne'*/], function() {
  browserSync.init({
    server: {
      baseDir: './'
    }
  })
  gulp.watch('src/scss/*.scss', ['scss'])
  gulp.watch('src/js/*.js', ['js'])
  gulp.watch('src/index.pug', ['index'])
  //  gulp.watch('src/thanksAndError.pug', ['thanks'])
  //  gulp.watch('src/thanksAndError.pug', ['missing'])
  //  gulp.watch('src/thanksAndError.pug', ['fiveOhOne'])
  gulp.watch('*.html').on('change', browserSync.reload)
})
