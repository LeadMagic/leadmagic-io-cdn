// Grab the public IP address if not in sessionStorage
if (!sessionStorage.getItem('publicIpData')) {
    fetch('https://api.ipify.org/?format=json')
        .then(response => response.json())
        .then(data => {
            sessionStorage.setItem('publicIpData', JSON.stringify(data));
        });
}

// Segment anon id
var anonymousId = getCookieValue('ajs_anonymous_id');
var sr = sessionStorage.getItem('snid_company') ? true : false;

// Check sessionStorage for UTMs
var utmSourceSS = sessionStorage.getItem('utm_source');
var utmMediumSS = sessionStorage.getItem('utm_medium');
var utmCampaignSS = sessionStorage.getItem('utm_campaign');
var utmContentSS = sessionStorage.getItem('utm_content');

// Check URl for UTMs
const urlParams = new URLSearchParams(window.location.search);
var utmSource = urlParams.get('utm_source');
var utmMedium = urlParams.get('utm_medium');
var utmCampaign = urlParams.get('utm_campaign');
var utmContent = urlParams.get('utm_content');

// If the UTMs are not in sessionStorage, store them there
if (utmSource && !utmSourceSS) {
    sessionStorage.setItem('utm_source', utmSource);
    sessionStorage.setItem('utm_medium', utmMedium);
    sessionStorage.setItem('utm_campaign', utmCampaign);
    sessionStorage.setItem('utm_content', utmContent);
}

// If they are in sessionStorage, but not in the URL, add them to the URL
if (!utmSource && utmSourceSS) {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('utm_source', sessionStorage.getItem('utm_source'));
    currentUrl.searchParams.set('utm_medium', sessionStorage.getItem('utm_medium'));
    currentUrl.searchParams.set('utm_campaign', sessionStorage.getItem('utm_campaign'));
    currentUrl.searchParams.set('utm_content', sessionStorage.getItem('utm_content'));
    window.history.replaceState({}, '', currentUrl);
}

function validateEmail(email) {
    const freeEmailDomains = ['gmail.com','yahoo.com','hotmail.com','aol.com','mail.com','outlook.com','icloud.com','yandex.com','zoho.com','inbox.com','fastmail.com','hushmail.com','gmx.com','gmx.net','gmx.us','tutanota.com','aim.com','yahoo.co.uk','msn.com','live.com','yahoo.co.in','rediffmail.com','mail.ru','163.com','126.com','sina.com','sohu.com','qq.com', 'test.com'];
            
    const emailDomain = email.split('@')[1];
    if (freeEmailDomains.includes(emailDomain)) {
        throw new Error('Please enter a work email.')
    }
}

function getCookieValue(cookieName) {
    let cookieArray = document.cookie.split(';');
    for (let cookie of cookieArray) {
      let [name, value] = cookie.trim().split('=');
      if (name === cookieName) {
        return value;
      }
    }
    return '';
 }

async function sha256(text) {
     if (text) {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);

      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

      return hashHex;
    }
      return null;
}

function createContextObject() {
    const context = {
        ip: sessionStorage.getItem('publicIpData') ? JSON.parse(sessionStorage.getItem('publicIpData')).ip : null,
        locale: navigator.language,
        page: {
            path: window.location.pathname,
            referrer: document.referrer,
            search: window.location.search,
            title: document.title,
            url: window.location.href
        },
        userAgent: navigator.userAgent
    }

    if (utmSource || utmSourceSS) {
        context.campaign = {
            content: utmContent || utmContentSS,
            medium: utmMedium || utmMediumSS,
            name: utmCampaign || utmCampaignSS,
            source: utmSource || utmSourceSS,
        }
    }

    return context;
}

function fireConversionEvents(formData) {
    const formType = formData.form_type;
    let gtagConversionId = '';
    let linkedinConversionId = '';

    if (formType === 'contact') {
        gtagConversionId = 'AW-618863666/PZliCM3x-esYELK4jKcC'
        linkedinConversionId = 15896065;
    } else if (formType === 'home_cta') {
        gtagConversionId = 'AW-618863666/W55HCJDW7esYELK4jKcC'
        linkedinConversionId = 15896073;
    } else if (formType === 'signup') {
        gtagConversionId = 'AW-618863666/qSE4COri9esYELK4jKcC'
        linkedinConversionId = 14427316;
    }

    // Gtag user properties
    window.gtag('set', 'user_data', {
        'email': formData?.email,
        'sha256_email_address': formData?.email_hash,
        'address.first_name': formData?.firstname,
        'address.sha256_first_name': formData?.firstname_hash,
        'address.last_name': formData?.lastname,
        'address.sha256_last_name': formData?.lastname_hash,
    })

    // Google Ads conversion
    window.gtag('event', 'conversion', {'send_to': gtagConversionId});

    // LinkedIn Ads conversion
    window.lintrk('track', { conversion_id:  linkedinConversionId});
}

async function segmentIdentify(formData) {
    // identifyFormData should only include email, firstname, lastname, phone, if they exist
    const identifyFormData = {
        email: formData?.email,
        firstname: formData?.firstname,
        lastname: formData?.lastname,
        phone: formData?.phone
    }

    // check if the segment script has been loaded
    if (isSegmentScriptLoaded) {
        analytics.identify(anonymousId, identifyFormData)
    } else {
        await fetch('https://eok1gl2jpo2gqtn.m.pipedream.net', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                callType: 'identify',
                anonymousId: anonymousId,
                formData: identifyFormData,
                context: createContextObject()
            })
        })
    }
}

async function segmentTrack(formData) {
    // Get cookies
    const hubspotUtk = getCookieValue('hubspotutk');
    const fbp = getCookieValue('_fbp');
    const fbc = getCookieValue('_fbc');

    // Add the hubspotUtk, fbp, fbc to the formData object
    formData.hubspotutk = hubspotUtk;
    formData.fbp = fbp;
    formData.fbc = fbc;

    // If the segment script has been loaded, use the analytics object to track the form submission.
    if (isSegmentScriptLoaded) {
        formData.segment_script_loaded = true;
        analytics.track('Submitted Form', formData)
        fireConversionEvents(formData);
    } else { // Else, use the Segment API to track the form submission. Get response and log it.
        formData.segment_script_loaded = false;
        await fetch('https://eok1gl2jpo2gqtn.m.pipedream.net', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                callType: 'track',
                anonymousId: anonymousId,
                eventName: 'Submitted Form',
                formData: formData,
                context: createContextObject()
            })
        })
        
    }
}
