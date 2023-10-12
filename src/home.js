async function handleHomeCTASubmit() {
    const email = document.getElementById("home-cta-email").value;
    const anonymousId = getCookieValue('ajs_anonymous_id');
    const hubspotUtk = getCookieValue('hubspotutk');
    const fbp = getCookieValue('_fbp');
    const fbc = getCookieValue('_fbc');
    
    const email_hash = await sha256(email);

    if (email) {
        analytics.identify(anonymousId, {
            email: email,
        });
        
        analytics.track('Submitted Home CTA Form', { 
            email: email,
            email_hash: email_hash,
            hubspotutk: hubspotUtk,
            fbp: fbp,
            fbc: fbc,
            button_text: 'See My Leads'
        });
    }
}

// Attach click event to the button when the document is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const buttonElement = document.getElementById("home-cta-button");
    if (buttonElement) {
        buttonElement.addEventListener('click', handleHomeCTASubmit);
    }
});