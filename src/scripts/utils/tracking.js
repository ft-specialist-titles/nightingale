/* global ga*/
var Tracking = function () {
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
    //Set custom screen
    ga('send', 'screenview', {
        'screenName': pageName
    });
};

Tracking.prototype.trackEvent = function (eventName) {
    ga('send', 'event', 'button', 'click', eventName);
};

module.exports = new Tracking();
