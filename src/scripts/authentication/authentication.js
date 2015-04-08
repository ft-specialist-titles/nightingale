/* global gapi, ng*/
var $ = require('jquery');

var Authentication = function () {
};

Authentication.prototype.renderButton = function () {
    gapi.signin2.render('my-signin2', {
            'width': 200,
            'height': 50,
            'longtitle': false,
            'theme': 'dark',
            'onsuccess': ng.onSignIn
        });
};

Authentication.prototype.onSignIn = function (googleUser) {
    var profile = googleUser.getBasicProfile();
    var regexp = /^.*\@ft\.com$/gi;
    if (profile.getEmail().match(regexp)){
        var tracking_request = "http://track.ft.com/track/track.gif?nightingale_login=" + encodeURIComponent(profile.getEmail());
        console.log(tracking_request);
        $('#login-overlay').prepend('<img id="userlogintracking" src="'+tracking_request+'" />');
        $("#login-overlay").css('display', 'none');
        $("#layout").css('display', 'block');
    }
};

module.exports = new Authentication();
