var pkg = require('./package.json');

module.exports = {
    pkg: pkg,
    buildPaths: [
        { source: "./src",  "target": './_site' , minify:true}
    ],
    tasks: {
        copy: ['{images,CNAME}'],
        build: ['sass', 'mustache', 'browserify'],
        test: 'karma',
        release: ['gh-pages'],
        serve: 'staticApp'
    },
    browserify: {
        insertGlobals : true,
        detectGlobals : false,
        noParse: [
            './bower_components/jquery/dist/jquery.js',
            './bower_components/underscore/underscore.js',
            './bower_components/backbone/backbone.js',
            './node_modules/hbsfy/runtime.js',
            './bower_components/bootstrap-sass/assets/javascripts/bootstrap.js',
            './bower_components/d3/d3.js'
        ]
        //vendorBundle: [
        //{ file :'./bower_components/underscore/underscore.js', expose: 'underscore'},
        //{ file :'./bower_components/backbone/backbone.js', expose: 'backbone'},
        //{ file :'./node_modules/hbsfy/runtime.js', expose: 'hbsfy'},
        //{ file :'./bower_components/d3/d3.js', expose: 'd3'},
        //{ file :'./bower_components/bootstrap-sass/assets/javascripts/bootstrap.js', expose: 'bootstrap-sass'},
        //{ file :'./bower_components/jquery/dist/jquery.js', expose: 'jquery'},
        //{ file :'./node_modules/handlebars/runtime.js', expose: 'handlebars'}
        //]
    },
    karma: ['./test/karma.unit.js']
};
