var gulp = require('gulp');
var gutil = require('gulp-util');
var fs = require('graceful-fs');
var typeScriptCompile = require('./tscomp.js');
var through2 = require('through2');
var webpack = require("webpack");

gulp.task('bump', function(){
  var bump = require('gulp-bump');
  return gulp.src('./package.json')
    .pipe(bump({version: 'minor'}))
    .pipe(gulp.dest('./'));
});

var alltsfilesToWatch = ['./*.ts','./src/**/*.ts','./test/**/*.ts'];
var alltsProjsToCompile = ['./tsconfig.json'];
alltsfilesToWatch = alltsfilesToWatch.concat(alltsProjsToCompile);

gulp.task('ts', ['webpack'], function () {
    gulp.watch(alltsfilesToWatch, ['webpacki']);
});

gulp.task('compiletsi', function () {
    return gulp.src(alltsProjsToCompile, { read:false })
	      .pipe(through2.obj(function(file,enc,cb) {
			  typeScriptCompile(file.path, false);
			  setImmediate(cb);
			  }));
});

gulp.task('compilets', function () {
    return gulp.src(alltsProjsToCompile, { read:false })
	      .pipe(through2.obj(function(file,enc,cb) {
			  console.log(file.path);
			  typeScriptCompile(file.path, true);
			  setImmediate(cb);
			  }));
});

function bundletest(callback) {
    webpack({
        context: __dirname,
		entry: [
            "./test/msgFormatParserSpec.js",
            "./test/msgFormatterSpec.js",
            "./test/extractUsedParamsSpec.js",
            "./test/translateSpec.js"
        ],
        module: {
          noParse: [/moment.js/]
        },
      	output: {
			path: __dirname + "/testbundle",
			filename: "bundle.js"
		}
    }, function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({
            // output options
        }));
        callback();
    });
}

gulp.task("webpacki", ['compiletsi'], bundletest);
gulp.task("webpack", ['compilets'], bundletest);

gulp.task('default', ['ts']);

// var peg = require('gulp-peg');
// var peg_sources='./src/**/*.pegjs';
// gulp.task('peg', function() {
    // return gulp.src(peg_sources)
        // .pipe(peg().on('error', gutil.log))
        // .pipe(replace(/^[\s\S]*$/, function(text) {
            // var lines=text.split('\n').map(function(l) { return l.substring(2); });
            // lines.splice(0,1,'// AUTOGENERATED! Converted to TypeScript by code in gulpfile.js');
            // lines.splice(lines.length-5,5);
            // return lines.join('\n').replace('function parse(input)','export function parse(input: string): string');
        // }))
        // .pipe(rename(function(p) { p.extname='.ts'; }))
        // .pipe(gulp.dest('./src/'));
// });
