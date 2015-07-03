/* global gapi, ng, auth2 */
var tracking = require('./../utils/tracking.js');

var Authentication = function (cb) {
    this.cb = cb;
    this.loginContainer = document.getElementById("login-container");
    this.appConatiner = document.getElementById("layout");

    if (document.domain === 'localhost') {
        this.startApp();
    } else {
        var gapiScript = document.createElement('script');
        gapiScript.src = "https://apis.google.com/js/platform.js?onload=nightingaleAuth";
        document.body.appendChild(gapiScript);
        window.nightingaleAuth = this.gapi;
        window.auth = this;
    }
};

Authentication.prototype.gapi = function(){
    var self = window.auth || this;
    self.loginContainer.classList.add('block');
    if (!document.getElementById('my-signin2')) return;
    gapi.signin2.render('my-signin2', {
        'width': 200,
        'height': 50,
        'longtitle': false,
        'theme': 'dark',
        'onsuccess': self.onsuccess.bind(self)
    });
};

Authentication.prototype.onsuccess = function (googleUser) {
    var profile = googleUser.getBasicProfile();
    var regexp = /^.*\@ft\.com$/gi;
    var email = profile.getEmail();
    if (email.match(regexp)) {
        tracking.user(this.loginContainer, email);
        this.startApp(email);
    } else {
        //if the user has multiple google accounts then calling disconnect() ensures the user will be shown the login preferences box
        //when re-signing in (otherwise login will automatically login with their previous selection).
        gapi.auth2.getAuthInstance().disconnect();
        gapi.auth2.getAuthInstance().signOut();
        document.getElementById("login-alert").classList.add('block');
    }
};

Authentication.prototype.startApp = function (email) {
    this.loginContainer.classList.remove('block');
    this.appConatiner.classList.add('block');
    this.cb && typeof this.cb === 'function' && this.cb(email);
};

module.exports = Authentication;
