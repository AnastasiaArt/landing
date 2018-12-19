"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var csso = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var del = require("del");
var concat = require("gulp-concat");
var uglify = require('gulp-uglify');
var spritesmith = require("gulp.spritesmith");

gulp.task("delete", function() {
  return del("build");
});

gulp.task("css", function() {
  return gulp.src("source/sass/style.scss")
  .pipe(plumber())
  .pipe(sass())
  .pipe(postcss([
    autoprefixer()
  ]))
  .pipe(gulp.dest("build/css"))
  .pipe(csso())
  .pipe(rename("style-min.css"))
  .pipe(gulp.dest("build/css"))
  .pipe(server.stream());
});
gulp.task('sprite', function() {
    var spriteData =
        gulp.src('source/img/*-icon.png') // путь, откуда берем картинки для спрайта
            .pipe(spritesmith({
                imgName: 'sprite.png',
                cssName: 'sprite.css',
            }));

    spriteData.img.pipe(gulp.dest('source/img/')); // путь, куда сохраняем картинку
    spriteData.css.pipe(gulp.dest('source/sass')); // путь, куда сохраняем стили
});
gulp.task('scripts', function() {
return gulp.src([
'node_modules/jquery/dist/jquery.min.js',
'source/js/main.js'
])
.pipe(concat('main-min.js'))
.pipe(gulp.dest('source/js/'));
});

gulp.task("images", function() {
  return gulp.src("files/img/*.{png,jpg}")
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel:3}),
    imagemin.jpegtran({progressive:true})
  ]))
  .pipe(gulp.dest("build/img"));
});

gulp.task("images", function() {
  return gulp.src("source/img/**/*.{png,jpg}")
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel:3}),
    imagemin.jpegtran({progressive:true}),
    imagemin.svgo()
  ]))
  .pipe(gulp.dest("build/img"));
});

gulp.task("html", function() {
  return gulp.src("source/*.html")
  .pipe(gulp.dest("build"));
});

gulp.task("copy", function () {
  return gulp.src([
    "source/fonts/**",
    "source/js/**"
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"));
});

gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  })

  gulp.watch("source/sass/**/*.{scss,sass}", gulp.series("css"));
  gulp.watch("source/*.html", gulp.series("html", "refresh"));
});

gulp.task("refresh", function(done) {
  server.reload();
  done();
});

gulp.task("build", gulp.series(
  "delete",
  "scripts",
  "copy",
  "images",
  "css",
  "html"
));

gulp.task("start", gulp.series("build", "server"));
