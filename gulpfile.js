var gulp = require('gulp');
var component = require('component-helper');
var paths = component.paths;
var argv = process.argv.slice(3).toString();

function onError(err) {
    console.log(err.message || err);
    process.exit(1);
}

gulp.task('build-vendor', function() {
    return component.build.scripts({
        noParse: [
            './bower_components/jquery/dist/jquery.js',
            './bower_components/underscore/underscore.js',
            './bower_components/backbone/backbone.js',
            './node_modules/hbsfy/runtime.js',
            './bower_components/d3/d3.js',
            './bower_components/bootstrap-sass/assets/javascripts/bootstrap.js'
        ]}).catch(onError);
});

gulp.task('serve',  function() {
    return component.serve.all().catch(onError);
});

gulp.task('test', function(){
    return component.test.all().catch(onError);
});

gulp.task('release', function(){
    var version = argv.split('--version=')[1];
    return component.release.all(version).catch(onError);
});