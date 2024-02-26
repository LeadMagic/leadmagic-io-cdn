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
