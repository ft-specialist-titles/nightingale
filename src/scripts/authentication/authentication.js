/* global gapi, ng, auth2 */
var $ = require('jquery');

var Authentication = function (cb) {
    this.cb = cb;
};

Authentication.prototype.renderButton = function () {
    var self = this;
    gapi.signin2.render('my-signin2', {
            'width': 200,
            'height': 50,
            'longtitle': false,
            'theme': 'dark',
            'onsuccess': function(gu){
                console.log('onSuccess');
                console.log(gu);
                self.onSignIn(gu);
            },
            'onfailure': console.log
        });
};

Authentication.prototype.onSignIn = function (googleUser) {
    console.log('onSignIn');
    var profile = googleUser.getBasicProfile();

    var regexp = /^.*\@ft\.com$/gi;
    console.log(profile.getEmail());
    if (profile.getEmail().match(regexp)){

        var tracking_request = "http://track.ft.com/track/track.gif?nightingale_login=" + encodeURIComponent(profile.getEmail());
        $('#login-container').prepend('<img id="userlogintracking" src="'+tracking_request+'" />');

        $("#login-container").css('display', 'none');
        $("#layout").css('display', 'block');

        this.cb();

    } else {
        console.log(gapi);
        //if the user has multiple google accounts then calling disconnect() ensures the user will be shown the login preferences box
        //when re-signing in (otherwise login will automatically login with their previous selection).
        gapi.auth2.getAuthInstance().disconnect();
        gapi.auth2.getAuthInstance().signOut();

        $("#login-alert").css('display', 'block');
    }
};

module.exports = Authentication;
