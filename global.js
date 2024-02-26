<script>
!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
posthog.init('phc_hd8F0sixMUqzbgVkjn1oVYB0rk7VqvKZHpBkXQU1niC',{api_host:'https://app.posthog.com'});

!function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","screen","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware","register"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/"+key+"/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n)};analytics._writeKey="0t6JtdHEh6FDlVLPBVVqnYXfJXMA0A2O";analytics.load("0t6JtdHEh6FDlVLPBVVqnYXfJXMA0A2O");analytics.page();}}();

(async function() {
    // Utility functions
    async function sha256(text) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    function getAllCookies() {
        return document.cookie.split(';').reduce((cookies, cookie) => {
            const [name, value] = cookie.split('=').map(c => c.trim());
            cookies[name] = value;
            return cookies;
        }, {});
    }

    async function callWebhook(url, data) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const responseData = await response.json();
            console.log('Webhook call successful:', responseData);
        } catch (error) {
            console.error('Webhook call failed:', error);
        }
    }

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function getFormData(formElement) {
        const formData = new FormData(formElement);
        const data = {};
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    }

    // Enhanced identification and tracking functions
    async function enhancedIdentify(formData) {
        const emailHash = formData.email ? await sha256(formData.email) : null;
        const identifyTraits = {
            email: formData?.email,
            emailHash,
            firstName: formData?.firstname,
            lastName: formData?.lastname,
            phone: formData?.phone,
        };

        // Segment identify
        if (window.analytics) {
            window.analytics.identify(identifyTraits);
        }

        // Customer.io identify
        if (window._cio) {
            window._cio.identify({
                id: emailHash,
                email: formData.email,
                created_at: Math.floor(Date.now() / 1000),
                ...identifyTraits
            });
        }

        // PostHog identify
        if (window.posthog) {
            window.posthog.identify(emailHash);
            window.posthog.people.set(identifyTraits);
        }

        // Call webhook
        await callWebhook('https://eo9bnp5655lk84w.m.pipedream.net', {
            action: 'identify',
            traits: identifyTraits,
        });
    }

    async function enhancedTrack(eventName, formData, buttonText) {
        const trackProperties = {
            ...formData,
            buttonText,
            cookies: getAllCookies(),
        };

        // Segment track
        if (window.analytics) {
            window.analytics.track(eventName, trackProperties);
        }

        // Customer.io track
        if (window._cio) {
            window._cio.track(eventName, trackProperties);
        }

        // Call webhook
        await callWebhook('https://eo9bnp5655lk84w.m.pipedream.net', {
            action: 'track',
            eventName: eventName,
            properties: trackProperties,
        });
    }

    // Setup global button click listener with dynamic button text handling
    document.addEventListener('DOMContentLoaded', () => {
        document.body.addEventListener('click', async (event) => {
            const buttonEl = event.target.closest('button, input[type="submit"]');
            if (buttonEl) {
                event.preventDefault();
                buttonEl.disabled = true;

                let formData = {};
                if (buttonEl.form) {
                    formData = getFormData(buttonEl.form);
                }

                const buttonText = buttonEl.textContent || buttonEl.value || 'Unknown Button';
                const inputError = formData.email && !validateEmail(formData.email);

                if (!inputError) {
                    try {
                        if (formData.email) {
                            await enhancedIdentify(formData);
                        }
                        await enhancedTrack('Button Clicked - ' + buttonText, formData);
                    } catch (error) {
                        console.error('Error:', error);
                    } finally {
                        buttonEl.disabled = false;
                    }
                } else {
                    console.error('Validation error');
                    buttonEl.disabled = false;
                }
            }
        });
    })();
})();
</script>
