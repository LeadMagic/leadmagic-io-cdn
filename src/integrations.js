// Load PostHog JS
!function(t, e) {
    var o, n, p, r;
    e.__SV || (window.posthog = e, e._i = [], e.init = function(i, s, a) {
        function g(t, e) {
            var o = e.split(".");
            2 == o.length && (t = t[o[0]], e = o[1]), t[e] = function() {
                t.push([e].concat(Array.prototype.slice.call(arguments, 0)))
            }
        }(p = t.createElement("script")).type = "text/javascript", p.async = !0, p.src = s.api_host + "/static/array.js", (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(p, r);
        var u = e;
        for (void 0 !== a ? u = e[a] = [] : a = "posthog", u.people = u.people || [], u.toString = function(t) {
                var e = "posthog";
                return "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e
            }, u.people.toString = function() {
                return u.toString(1) + ".people (stub)"
            }, o = "capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "), n = 0; n < o.length; n++) g(u, o[n]);
        e._i.push([i, s, a])
    }, e.__SV = 1)
}(document, window.posthog || []);

// Load Segment
var analytics = window.analytics = window.analytics || [];
if (!analytics.initialize)
    if (analytics.invoked)
        window.console && console.error && console.error("Segment snippet included twice.");
    else {
        analytics.invoked = !0;
        analytics.methods = ["trackSubmit", "trackClick", "trackLink", "trackForm", "pageview", "identify", "reset", "group", "track", "ready", "alias", "debug", "page", "once", "off", "on", "addSourceMiddleware", "addIntegrationMiddleware", "setAnonymousId", "addDestinationMiddleware"];
        analytics.factory = function(e) {
            return function() {
                if (window.analytics.initialized)
                    return window.analytics[e].apply(window.analytics, arguments);
                var i = Array.prototype.slice.call(arguments);
                i.unshift(e);
                analytics.push(i);
                return analytics
            }
        }
        ;
        for (var i = 0; i < analytics.methods.length; i++) {
            var key = analytics.methods[i];
            analytics[key] = analytics.factory(key)
        }
        analytics.load = function(key, i) {
            var t = document.createElement("script");
            t.type = "text/javascript";
            t.async = !0;
            t.src = "https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";
            var n = document.getElementsByTagName("script")[0];
            n.parentNode.insertBefore(t, n);
            analytics._loadOptions = i
        }
        ;
        analytics._writeKey = "0t6JtdHEh6FDlVLPBVVqnYXfJXMA0A2O";
        ;analytics.SNIPPET_VERSION = "4.16.1";
        analytics.load("0t6JtdHEh6FDlVLPBVVqnYXfJXMA0A2O");
    }


// Segment + PostHog
// Check if browser is in EU
const isEU = window.location.hostname.endsWith('.eu') || window.location.hostname.endsWith('eu');
analytics.ready(() => {
    window.posthog.init("phc_hd8F0sixMUqzbgVkjn1oVYB0rk7VqvKZHpBkXQU1niC", {
        api_host: (!isEU) ? 'https://app.posthog.com': 'eu.posthog.com', // Use eu.posthog.com for EU instances
        segment: window.analytics, // Pass window.analytics here - NOTE: `window.` is important
        capture_pageview: false, // You want this false if you are going to use segment's `analytics.page()` for pageviews
        // When the posthog library has loaded, call `analytics.page()` explicitly.
        loaded: () => window.analytics.page(),    
    });
})