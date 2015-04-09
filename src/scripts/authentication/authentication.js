/* global gapi, ng, auth2 */
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
        $('#login-overlay').prepend('<img id="userlogintracking" src="'+tracking_request+'" />');

        $("#login-overlay").css('display', 'none');
        $("#layout").css('display', 'block');

    } else {
        //if the user has multiple google accounts then calling disconnect ensures the user will be shown the login preferences box
        //when re-signing in (otherwise login will automatically login with their previous selection).
        gapi.auth2.getAuthInstance().disconnect();
        gapi.auth2.getAuthInstance().signOut();

        $("#login-alert").css('display', 'block');
    }
};

module.exports = new Authentication();
