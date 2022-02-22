'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const image = require('gulp-image');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify-es').default;
const rigger = require('gulp-rigger');
const cssmin = require('gulp-minify-css');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const reload = browserSync.reload;

sass.compiler = require('node-sass');

gulp.task('clean', (done) => {
    del.sync('build'); // Delete folder before building
    done();
});

gulp.task('fonts', (done) => {
    gulp.src('./src/assets/fonts/*')
        .pipe(gulp.dest('./build/assets/fonts'));
    done();
});

gulp.task('image', (done) => {
    gulp.src('./src/assets/img/*')
        .pipe(image())
        .pipe(imagemin({ //Сожмет img
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest('./build/assets/img'))
        .pipe(reload({stream: true}));
    done();
});

gulp.task('html', (done) => {
    gulp.src('./src/**/*.html')
        .pipe(rigger())
        .pipe(gulp.dest('./build'))
        .pipe(reload({stream: true}));
    done();
});

gulp.task('sass', (done) => {
    gulp.src('./src/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.init())
        .pipe(concat('style.css'))
        .pipe(cssmin())
        .pipe(sourcemaps.write())
        .pipe(autoprefixer()) //Добавит префиксы
        .pipe(gulp.dest('./build/styles'))
        .pipe(reload({stream: true}));
    done();
});

gulp.task('js', (done) => {
    gulp.src('./src/**/*.js')
        .pipe(rigger())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./build/'))
        .pipe(reload({stream: true}));
    done();
});

gulp.task('browserSync', (done) => {
    browserSync.init({
        server: {
            baseDir: './build'
        }
    });
    browserSync.watch('build/').on('change', browserSync.reload);
    gulp.parallel('sass', 'image', 'html', 'js', 'fonts')();

    gulp.watch('./src/styles**/*.scss', { events: 'all' }, gulp.series('sass'));
    gulp.watch('./src/assets/img/*', gulp.series('image'));
    gulp.watch('./src/**/*.html', gulp.series('html'));
    gulp.watch('./src/js**/*.js', gulp.series('js'));
    gulp.watch('./src/assets/fonts**/*.woff', gulp.series('fonts'));
    gulp.watch('./build/*.html', browserSync.reload);
    gulp.watch('./build/**/*.css').on('change', browserSync.reload);
    gulp.watch('./build/**/*.js').on('change', browserSync.reload);
    done();
});

gulp.task('default', gulp.series('browserSync'), (done) => {
    done();
});
