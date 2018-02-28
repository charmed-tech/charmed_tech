var autoprefixer = require('gulp-autoprefixer')
var bs = require('browser-sync').create()
var cleanCSS = require('gulp-clean-css')
var concat = require('gulp-concat')
var data = require('gulp-data')
var del = require('del')
var fs = require('fs')
var gulp = require('gulp')
var imageResize = require('gulp-image-resize')
var inject = require('gulp-inject')
var pug = require('gulp-pug')
var rename = require('gulp-rename')
var sass = require('gulp-sass')
var uglify = require('gulp-uglify')

// Reminder: to include directories AND their contents, use gulp.src('path', { base: 'basePath' }).pipe(...)

/* DELETE PREVIOUS BUILD */
gulp.task('clean', function() {
  return del(['dist/'])
})

/* MOVE FONTS, IMAGES, AND OTHER SUPPORTING FILES TO DIST */
// copy htaccess, php, and txt files to dist
gulp.task('files', function() {
  return gulp.src(['src/.htaccess', 'src/*.php', 'src/*.txt']).pipe(gulp.dest('dist/'))
})

// copy font-awesome fonts to dist
gulp.task('fa', function() {
  return gulp.src('node_modules/font-awesome/fonts/*').pipe(gulp.dest('dist/fonts/'))
})

// copy other chosen fonts to dist
gulp.task('local-fonts', function() {
  return gulp.src('src/fonts/**', { base: 'src/fonts/' }).pipe(gulp.dest('dist/fonts/'))
})

// copy non-thumbnail images to dist
gulp.task('img', function() {
  return gulp.src(['src/img/*', '!src/img/thumbs/']).pipe(gulp.dest('dist/img/'))
})

// resize thumbnail images for desktop
// rename the result
// copy to dist
gulp.task('thumbs-lg', function() {
  return gulp
    .src('src/img/thumbs/*')
    .pipe(
      imageResize({
        width: 750, // passed as pixel or percentage value to ImageMagick
        height: 500,
        crop: true,
        upscale: false,
        quality: 0.9,
        //format: '.jpg' // can override original file format
        imageMagick: true, // otherwise will use GrahicsMagick
        interlace: true,
        cover: true
      })
    )
    .pipe(rename(path => (path.basename += '-lg')))
    .pipe(gulp.dest('dist/img/thumbs/'))
})

// resize thumbnail images for mobile
// rename the result
// copy to dist
gulp.task('thumbs-sm', function() {
  return gulp
    .src('src/img/thumbs/*')
    .pipe(
      imageResize({
        width: 450, // passed as pixel or percentage value to imagemagick
        height: 300,
        crop: true,
        upscale: false,
        quality: 0.9,
        //format: '.jpg' // can override original file format
        imageMagick: true, // otherwise will use GrahicsMagick
        interlace: true,
        cover: true
      })
    )
    .pipe(rename(path => (path.basename += '-sm')))
    .pipe(gulp.dest('dist/img/thumbs/'))
})

// combined resources tasks
gulp.task('resources', gulp.parallel('files', 'fa', 'local-fonts', 'img', 'thumbs-lg', 'thumbs-sm'))

/* CREATE CSS AND JS INJECTORS */
// convert scss to css
// concatenate it into a single file
// autoprefix everything
// clean everything
// put it in dist/styles
// stream
gulp.task('styles', function() {
  return gulp
    .src(['node_modules/font-awesome/scss/*.scss', 'src/scss/*.scss'])
    .pipe(sass())
    .pipe(concat('styles.min.css'))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(gulp.dest('dist/styles/'))
    .pipe(bs.stream())
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
    .pipe(bs.stream())
})

// combined injectors task - these sources will be injected into pug templates
gulp.task('injectors', gulp.parallel('styles', 'js'))

// injector file paths - variable must be set with *.css and *.js files in dist or will not work
function setInjectors() {
  var injectors = gulp.src(['dist/styles/*.css', 'dist/js/*.js'], { read: false })
  return injectors
}

/* RENDER PUG FILES */
// index.html
// import sites.json object for pug to iterate - multiple ways to do this, but fs method works with browserSync
// inject sources with proper paths
// render it
// put it in dist
// stream
gulp.task('index', function() {
  var target = gulp.src('src/index.pug', { read: true })
  return target
    .pipe(
      data(file => {
        return JSON.parse(fs.readFileSync('./src/sites.json'))
      })
    )
    .pipe(inject(setInjectors(), { addRootSlash: false, ignorePath: '../dist', relative: true }))
    .pipe(pug())
    .pipe(gulp.dest('dist/'))
    .pipe(bs.stream())
})

// thanks.html
// inject sources with proper paths
// render stream with locals
// name it
// put it in dist
// stream
gulp.task('ty', function() {
  var target = gulp.src('src/thanksAndError.pug', { read: true })
  return target
    .pipe(inject(setInjectors(), { addRootSlash: false, ignorePath: '../dist', relative: true }))
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
    .pipe(bs.stream())
})

// error404.html
gulp.task('404', function() {
  var target = gulp.src('src/thanksAndError.pug', { read: true })
  return target
    .pipe(inject(setInjectors(), { addRootSlash: false, ignorePath: '../dist', relative: true }))
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
    .pipe(bs.stream())
})

// error501.html
gulp.task('501', function() {
  var target = gulp.src('src/thanksAndError.pug', { read: true })
  return target
    .pipe(inject(setInjectors(), { addRootSlash: false, ignorePath: '../dist', relative: true }))
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
    .pipe(bs.stream())
})

// combined pug task - render pug files with appropriate injections and locals
gulp.task('pug', gulp.parallel('index', 'ty', '404', '501'))

/* COMPLETE BUILD TASK */
gulp.task('build', gulp.series('clean', gulp.parallel('resources', 'injectors'), 'pug'))

// Static server + watch files
gulp.task(
  'watch',
  gulp.series('build', function() {
    bs.init({
      browser: 'chromium',
      server: {
        baseDir: 'dist/'
      }
    })

    gulp.watch(
      [
        'src/*.php',
        'src/*.txt',
        'node_modules/font-awesome/fonts/*',
        'src/img/*',
        'src/img/thumbs/*'
      ],
      gulp.series('resources')
    )
    gulp.watch('src/scss/*.scss', gulp.series('styles'))
    gulp.watch('src/js/*.js', gulp.series('js'))
    gulp.watch(['src/sites.json', 'src/index.pug'], gulp.series('index'))
    gulp.watch('src/thanksAndError.pug', gulp.parallel('ty', '404', '501'))
    gulp.watch('dist/*.html').on('change', bs.reload)
  })
)
