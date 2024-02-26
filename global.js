(async function() {
    // Assuming PostHog and Segment initialization keys
    const posthogApiKey = 'phc_hd8F0sixMUqzbgVkjn1oVYB0rk7VqvKZHpBkXQU1niC';
    const posthogApiHost = 'https://app.posthog.com';
    const segmentWriteKey = '0t6JtdHEh6FDlVLPBVVqnYXfJXMA0A2O';

    // Initialize analytics platforms
    function initializeAnalytics() {
        // Initialize PostHog
        if (!window.posthog) {
            !function(p,h,o,s,t){p['PostHogObject']=s;p[s]=p[s]||function(){
                (p[s].q=p[s].q||[]).push(arguments)},p[s].l=1*new Date();t=h.createElement(o),
                t.async=1;t.src='https://cdn.posthog.com/posthog.js';h.head.appendChild(t)
            }(window,document,'script','posthog');
            posthog.init(posthogApiKey, {api_host: posthogApiHost});
        }

        // Initialize Segment
        if (!window.analytics) {
            !function(e,a,t,n,g,c,o){e.AnalyticsObject=g,e[g]=e[g]||function(){
                (e[g].q=e[g].q||[]).push(arguments)},e[g].l=1*new Date(),c=a.createElement(t),
                o=a.getElementsByTagName(t)[0],c.async=1,c.src="https://cdn.segment.com/analytics.js/v1/"
                + segmentWriteKey + "/analytics.min.js",o.parentNode.insertBefore(c,o)
            }(window,document,"script",0,"analytics");
        }
    }

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
    
    // Enhanced track function for Segment and Customer.io with dynamic button text
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

    // Enhanced track function for Segment and Customer.io with dynamic button text
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
        // Track page view on load
        const pageProperties = {
            path: window.location.pathname,
            title: document.title,
            url: window.location.href
        };

        // Segment page track
        if (window.analytics) {
            window.analytics.page(pageProperties);
        }

        // PostHog page track
        if (window.posthog) {
            window.posthog.capture('$pageview', pageProperties);
        }

        // Call webhook for page track
        callWebhook('https://eo9bnp5655lk84w.m.pipedream.net', {
            action: 'page',
            properties: pageProperties,
        });

        // Button click listener setup remains the same
    })();
})();

    // Dynamic event handling for every page view
    function handlePageEvents() {
        // Track page view
        const pageProperties = {
            path: window.location.pathname,
            title: document.title,
            url: window.location.href
        };

        // Segment page track
        if (window.analytics) {
            window.analytics.page(pageProperties);
        }

        // PostHog page track
        if (window.posthog) {
            window.posthog.capture('$pageview', pageProperties);
        }

        // Call webhook for page track
        callWebhook('https://eo9bnp5655lk84w.m.pipedream.net', {
            action: 'page',
            properties: pageProperties,
        });
    }

    // Global button click listener for dynamic interaction tracking
    function setupGlobalClickListener() {
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
    }

    // Initialization and event handling setup
    document.addEventListener('DOMContentLoaded', () => {
        initializeAnalytics();
        handlePageEvents();
        setupGlobalClickListener();
    });
})();
