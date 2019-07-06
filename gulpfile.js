const autoprefixer = require('gulp-autoprefixer')
const bs = require('browser-sync').create()
const cleanCSS = require('gulp-clean-css')
const concat = require('gulp-concat')
const data = require('gulp-data')
const del = require('del')
const fs = require('fs')
const gulp = require('gulp')
const imageResize = require('gulp-image-resize')
const inject = require('gulp-inject')
const pug = require('gulp-pug')
const rename = require('gulp-rename')
const sass = require('gulp-sass')
const uglify = require('gulp-uglify')

// Reminder: to include directories AND their contents, use gulp.src('path', { base: 'basePath' }).pipe(...)

/* DELETE PREVIOUS BUILD */
gulp.task('clean', function() {
  return del(['build/'])
})

/* MOVE FONTS, IMAGES, AND OTHER SUPPORTING FILES TO build */
// copy htaccess, php, txt, and ico files to build
gulp.task('files', function() {
  return gulp
    .src(['src/config/robots.txt', 'src/config/.htaccess', 'src/php/*.php', 'src/img/*.ico'])
    .pipe(gulp.dest('build/'))
})

// copy font-awesome fonts to build
gulp.task('fa', function() {
  return gulp
    .src('node_modules/@fortawesome/fontawesome-free/webfonts/*')
    .pipe(gulp.dest('build/fonts/fontawesome'))
})

// copy other chosen fonts to build
gulp.task('local-fonts', function() {
  return gulp.src('src/fonts/**', { base: 'src/fonts/' }).pipe(gulp.dest('build/fonts/'))
})

// copy non-thumbnail images to build
gulp.task('img', function() {
  return gulp.src(['src/img/*', '!src/img/thumbs/']).pipe(gulp.dest('build/img/'))
})

// resize thumbnail images for desktop
// rename the result
// copy to build
gulp.task('thumbs-lg', function() {
  return gulp
    .src('src/img/thumbs/*')
    .pipe(
      imageResize({
        width: 825, // passed as pixel or percentage value to ImageMagick
        height: 550,
        crop: true,
        upscale: false,
        quality: 0.9,
        // format: '.jpg' // can override original file format
        imageMagick: true, // otherwise will use GrahicsMagick
        interlace: true,
        cover: true
      })
    )
    .pipe(rename(path => (path.basename += '-lg')))
    .pipe(gulp.dest('build/img/thumbs/'))
})

// resize thumbnail images for mobile
// rename the result
// copy to build
gulp.task('thumbs-sm', function() {
  return gulp
    .src('src/img/thumbs/*')
    .pipe(
      imageResize({
        width: 495, // passed as pixel or percentage value to imagemagick
        height: 330,
        crop: true,
        upscale: false,
        quality: 0.9,
        // format: '.jpg' // can override original file format
        imageMagick: true, // otherwise will use GrahicsMagick
        interlace: true,
        cover: true
      })
    )
    .pipe(rename(path => (path.basename += '-sm')))
    .pipe(gulp.dest('build/img/thumbs/'))
})

// combined resources tasks
gulp.task('resources', gulp.parallel('files', 'fa', 'local-fonts', 'img', 'thumbs-lg', 'thumbs-sm'))

/* CREATE CSS AND JS INJECTORS */
// convert scss to css
// concatenate it into a single file
// autoprefix everything
// clean everything
// put it in build/styles
// stream
gulp.task('styles', function() {
  return (
    gulp
      // Font Awesome SCSS manually copied from `node_modules` to `src/scss/fontawesome/`
      // because it requires manual path updating in `fontawesome/_variables.scss`.
      // Similar story for `src/scss/_devicon.scss`.
      .src('src/styles/*.scss')
      .pipe(sass())
      .pipe(concat('index.min.css'))
      .pipe(autoprefixer())
      .pipe(cleanCSS({ compatibility: 'ie8' }))
      .pipe(gulp.dest('build/styles/'))
      .pipe(bs.stream())
  )
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
    .pipe(gulp.dest('build/js/'))
    .pipe(bs.stream())
})

// combined injectors task - these sources will be injected into pug templates in the `build` step
gulp.task('injectors', gulp.parallel('styles', 'js'))

// injector file paths - variable must be set with *.css and *.js files in build or will not work. A function works best for async
const setInjectors = () => gulp.src(['build/styles/*.css', 'build/js/*.js'], { read: false })

/* RENDER PUG FILES */
// index.html
// import sites.json object for pug to iterate - multiple ways to do this, but fs method works with browserSync
// inject sources with proper paths
// render it
// put it in build
// stream
gulp.task('index', function() {
  const target = gulp.src('src/pages/home/index.pug', { read: true })
  return target
    .pipe(
      data(file => {
        return JSON.parse(fs.readFileSync('./src/pages/home/projects.json'))
      })
    )
    .pipe(inject(setInjectors(), { ignorePath: 'build/' }))
    .pipe(pug())
    .pipe(concat('index.html'))
    .pipe(gulp.dest('build/'))
    .pipe(bs.stream())
})

gulp.task('fcc', function() {
  const target = gulp.src('src/pages/freecodecamp/index.pug', { read: true })
  return target
    .pipe(
      data(file => {
        return JSON.parse(fs.readFileSync('./src/pages/freecodecamp/projects.json'))
      })
    )
    .pipe(inject(setInjectors(), { ignorePath: 'build/' }))
    .pipe(pug())
    .pipe(concat('index.html'))
    .pipe(gulp.dest('build/freecodecamp/'))
    .pipe(bs.stream())
})

// thanks.html
// inject sources with proper paths
// render stream with locals
// name it
// put it in build
// stream
gulp.task('ty', function() {
  const target = gulp.src('src/pages/thanksAndError/index.pug', { read: true })
  return target
    .pipe(inject(setInjectors(), { ignorePath: 'build/' }))
    .pipe(
      pug({
        data: {
          thanksTop: 'Thanks for your message!',
          thanksSub: "I'll be in touch."
        }
      })
    )
    .pipe(concat('index.html'))
    .pipe(gulp.dest('build/thanks/'))
    .pipe(bs.stream())
})

// error404.html
gulp.task('404', function() {
  const target = gulp.src('src/pages/thanksAndError/index.pug', { read: true })
  return target
    .pipe(inject(setInjectors(), { ignorePath: 'build/' }))
    .pipe(
      pug({
        data: {
          missingTop: 'Page not found.',
          missingSub: "Maybe I'm missing something?"
        }
      })
    )
    .pipe(concat('index.html'))
    .pipe(gulp.dest('build/404/'))
    .pipe(bs.stream())
})

// error501.html
gulp.task('501', function() {
  const target = gulp.src('src/pages/thanksAndError/index.pug', { read: true })
  return target
    .pipe(inject(setInjectors(), { ignorePath: 'build/' }))
    .pipe(
      pug({
        data: {
          fiveOhOneTop: 'There seems to be a problem.',
          fiveOhOneSub: 'Could you check the address?'
        }
      })
    )
    .pipe(concat('index.html'))
    .pipe(gulp.dest('build/501/'))
    .pipe(bs.stream())
})

// combined pug task - render pug files with appropriate injections and locals
gulp.task('pug', gulp.parallel('index', 'fcc', 'ty', '404', '501'))

/* COMPLETE BUILD TASK */
gulp.task('build', gulp.series('clean', 'resources', 'injectors', 'pug'))

// Static server + watch files
gulp.task(
  'watch',
  gulp.series('build', function() {
    bs.init({
      open: false,
      server: {
        baseDir: 'build/'
      }
    })

    gulp.watch(
      [
        'src/php/*.php',
        'src/config/*.txt',
        'node_modules/font-awesome/fonts/*',
        'src/img/*',
        'src/img/thumbs/*'
      ],
      gulp.series('resources')
    )
    gulp.watch('src/styles/**/*.scss', gulp.series('styles'))
    gulp.watch('src/js/**/*.js', gulp.series('js'))
    gulp.watch(['src/pages/home/sites.json', 'src/pages/home/index.pug'], gulp.series('index'))
    gulp.watch(
      ['src/pages/freecodecamp/projects.json', 'src/pages/freecodecamp/index.pug'],
      gulp.series('fcc')
    )
    gulp.watch('src/pages/thanksAndError/index.pug', gulp.parallel('ty', '404', '501'))
    gulp.watch('build/**/*.html').on('change', bs.reload)
  })
)
