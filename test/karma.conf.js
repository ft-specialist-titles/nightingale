module.exports = function(config) {
    var pkg = require('../package.json');
    var karmaConfig = {
        basePath: '..',
        browsers: ['PhantomJS'],
        frameworks: ['jasmine', 'browserify'],
        reporters: ['progress', 'coverage'],
        preprocessors: {
            //'src/scripts/**/*.js': ['browserify', 'coverage'],
            'test/**/*.js': ['browserify'],
            '_site/*.html': ['html2js']
        },
        //plugins:['karma-html2js-preprocessor', 'karma-coverage', 'karma-commonjs', 'karma-jasmine', 'karma-phantomjs-launcher', 'karma-chrome-launcher', 'karma-browserify'],
        coverageReporter: {
            dir : 'test/coverage/',
            reporters: [
                { type: 'html',
                    subdir: function(browser) {
                        return browser.toLowerCase().split(/[ /-]/)[0];
                    },
                    watermarks: {
                        statements: [75, 85],
                        lines: [75, 85],
                        functions: [75, 85],
                        branches:[50, 85]
                    }},
                { type: 'json-summary', subdir: '.', file: 'summary.json' }
            ]
        },
        files: [
            {pattern: '_site/*.html', watched: false },
            {pattern: '_site/styles/*.*', included: false, served: true},
            //{pattern: 'src/scripts/**/*.*', included: true},
            'test/**/*.spec.js'
        ],
        exclude: [
            'src/**/*.requirejs.js',
            'src/**/*.txt',
            'src/**/*.csv',
            'src/**/*.hbs'
        ]
    };
    if (pkg.browserify) karmaConfig.browserify = pkg.browserify;
    if (pkg.browser) karmaConfig.browser = pkg.browser;
    if (pkg["browserify-shim"]) karmaConfig["browserify-shim"] = pkg["browserify-shim"];
    return config.set(karmaConfig);
};