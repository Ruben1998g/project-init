var gulp = require('gulp');

const webpack = require('webpack-stream');
var browserSync = require("browser-sync").create();

var plumber = require("gulp-plumber");
var rename = require("gulp-rename");
var del = require("del");

var sass = require('gulp-sass')(require('sass'));
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var minify = require("gulp-csso");


var imagemin = require("gulp-imagemin")
var webp = require("gulp-webp")


const pug = require('gulp-pug');
var htmlbeautify = require('gulp-html-beautify');

const babel = require('gulp-babel');


//Следит за папкой src/build и обновляет браузер при необходимости
gulp.task("browser-sync", function(done){
    browserSync.init({
        server:{
            baseDir:"./src/build"
        },
        notify:false
    });
    browserSync.watch("src/build/css/*.css").on("change", browserSync.reload);
    browserSync.watch("src/build/*.html").on("change", browserSync.reload);
    browserSync.watch("src/build/js/*.js").on("change", browserSync.reload);
    browserSync.watch("src/build/fonts/*.*").on("add", browserSync.reload);
    browserSync.watch("src/build/img/*.*").on("add", browserSync.reload);
done()
});


//Следит за папкой src/sass и обрабатывает sass файлы
gulp.task('style', function(done){
    gulp.src('src/sass/*.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest('src/build/css'))
    done();
});

//Следит за папкой src/pug и обрабатывает sass файлы
gulp.task('pugs', function(done){
    gulp.src('src/pug/*.pug')
    .pipe(plumber())
    .pipe(pug({}))
    .pipe(htmlbeautify({}))
    .pipe(gulp.dest('src/build'))
    done();
});

//Следит за папкой src/js и обрабатывает sass файлы
gulp.task('js', function(done){
    gulp.src('src/js/*.js')
    .pipe(plumber())
    .pipe(babel({
        presets: ['@babel/preset-env']
    })).pipe(
        webpack({})
    )
    .pipe(rename("script.js"))
    .pipe(gulp.dest('src/build/js'))
    done();
});

//Следит за папкой src/fonts и обрабатывает шрифты
gulp.task('fonts', function(done){
    gulp.src('src/fonts/**.*')
    .pipe(gulp.dest('src/build/fonts'))
    done();
});

//Следит за папкой src/img
gulp.task('img', function(done){
    gulp.src('src/img/**.*')
    .pipe(gulp.dest('src/build/img'))
    done();
});

//Следит за папками и запускает таски
gulp.task("watch", gulp.series('pugs', 'style', 'js', 'fonts', 'img', "browser-sync", function(done){
    gulp.watch("src/sass/**/*" , gulp.series("style"));
    gulp.watch("src/pug/**/*" , gulp.series("pugs"));
    gulp.watch("src/js/**/*" , gulp.series("js"));
    gulp.watch("src/fonts/**/*" , gulp.series("fonts"));
    gulp.watch("src/img/**/*" , gulp.series("img"));
    done()
}));

//Во время сборки удаляет папку build
gulp.task("clean", function(){
    return del("build")
})

//Во время сборки копирует и обрабатывает css
gulp.task("sass", function(done){
    gulp.src('src/build/css/style.css')
    .pipe(plumber())
    .pipe(postcss([autoprefixer()]))
    .pipe(minify())
    .pipe(rename("style.css"))
    .pipe(gulp.dest("build/css"))
    done();
});

//Во время сборки копирует и обрабатывает html
gulp.task("html", function(){
    return gulp.src("src/build/*.html")
    .pipe(gulp.dest("build"))
})

//Во время сборки копирует и обрабатывает js
gulp.task("scripts", function(){
    return gulp.src([
        "src/build/js/**/*"
    ]
    )
    .pipe(babel({
        presets: ["@babel/preset-env"]
    }))

    .pipe(gulp.dest("build/js"))
})

//Во время сборки копирует шрифты
gulp.task("fonts-to-build", function(){
    return gulp.src([
        "src/build/fonts/**/*.*"
    ])
    .pipe(gulp.dest("build/fonts"))
})

//Во время сборки копирует и оптимизирует изображения
gulp.task("images", function(){
    return gulp.src("src/build/img/*{png,jpg,jpeg,PNG,JPG,JPEG}")
    .pipe(imagemin([
        imagemin.optipng({optimizationLevel: 3}),
        imagemin.mozjpeg({progressive:true})
    ]))
    .pipe(gulp.dest("build/img"))
})

//Во время сборки конвертирует изображение в WebP
gulp.task("webp", function(){
    return gulp.src("build/img/*.{png,jpg,jpeg,PNG,JPG,JPEG}")
    .pipe(webp())
    .pipe(gulp.dest("build/img/webp"))
})

//Во время сборки копирует svg
gulp.task("svg-to-build", function(){
    return gulp.src([
        "src/build/img/*.svg"
    ])
    .pipe(gulp.dest("build/img"))
})

//Сборка проекта
gulp.task("build", gulp.series(
    "clean",
    "sass",
    "html",
    "scripts",
    "fonts-to-build",
    "images",
    //"webp",
    "svg-to-build"
));