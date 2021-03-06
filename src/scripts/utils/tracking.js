/* global ga*/
var Tracking = function () {
    if (document.domain === 'localhost') {
        this.track = false;
        return;
    }
    this.track = true;
    (function (i, s, o, g, r, a, m) {
        i.GoogleAnalyticsObject = r;
        i[r] = i[r] || function () {
                (i[r].q = i[r].q || []).push(arguments);
            }, i[r].l = 1 * new Date();
        a = s.createElement(o),
            m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m);
    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

    ga('create', 'UA-60698836-1', 'auto');
    ga('send', 'pageview');
};

Tracking.prototype.trackPage = function (pageName) {
    if (!this.track) return;
    //Set custom screen
    ga('send', 'screenview', {
        'screenName': pageName
    });
};

Tracking.prototype.trackEvent = function (chartType, chartSize, imageFormat) {
    if (!this.track) return;
    ga('send', 'event', chartType, chartSize, imageFormat);
};

Tracking.prototype.user = function (container, email) {
    if (!this.track) return;
    var trackingImage = document.createElement('img');
    trackingImage.src = "http://track.ft.com/track/track.gif?nightingale_login=" + encodeURIComponent(email);
    container.appendChild(trackingImage);
};

module.exports = new Tracking();
