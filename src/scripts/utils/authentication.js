/* global gapi, ng, auth2 */
var Authentication = function (cb) {
    this.cb = cb;
};

Authentication.prototype.renderButton = function () {
    var self = this;
    if (!document.getElementById('my-signin2')) return;
    gapi.signin2.render('my-signin2', {
        'width': 200,
        'height': 50,
        'longtitle': false,
        'theme': 'dark',
        'onsuccess': function (gu) {
            self.onSignIn(gu);
        }
    });
};

Authentication.prototype.onSignIn = function (googleUser) {
    var profile = googleUser.getBasicProfile();
    var regexp = /^.*\@ft\.com$/gi;
    var email = profile.getEmail();
    if (email.match(regexp)) {
        var container = document.getElementById("login-container");
        var trackingImage = document.createElement('img');
        trackingImage.src = "http://track.ft.com/track/track.gif?nightingale_login=" + encodeURIComponent(email);
        container.appendChild(trackingImage);
        container.setAttribute('style','display:none');
        this.cb && typeof this.cb === 'function' && this.cb();
    } else {
        //if the user has multiple google accounts then calling disconnect() ensures the user will be shown the login preferences box
        //when re-signing in (otherwise login will automatically login with their previous selection).
        gapi.auth2.getAuthInstance().disconnect();
        gapi.auth2.getAuthInstance().signOut();
        document.getElementById("login-alert").setAttribute('style','display:block');
    }
};

module.exports = Authentication;
