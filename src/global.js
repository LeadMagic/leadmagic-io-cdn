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


// Check sessionStorage for UTMs
const utmSourceSS = sessionStorage.getItem('utm_source');
const utmMediumSS = sessionStorage.getItem('utm_medium');
const utmCampaignSS = sessionStorage.getItem('utm_campaign');
const utmContentSS = sessionStorage.getItem('utm_content');

// Check URl for UTMs
const urlParams = new URLSearchParams(window.location.search);
const utmSource = urlParams.get('utm_source');
const utmMedium = urlParams.get('utm_medium');
const utmCampaign = urlParams.get('utm_campaign');
const utmContent = urlParams.get('utm_content');

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
