async function handleHomeCTASubmit(submitButtonText) {
    console.log('Submit button clicked')

    const email = document.getElementById("home-cta-email").value;
    const hubspotUtk = getCookieValue('hubspotutk');
    const fbp = getCookieValue('_fbp');
    const fbc = getCookieValue('_fbc');
    
    const email_hash = await sha256(email);

    const formData = { 
        form_type: 'home_cta',
        email: email,
        email_hash: email_hash,
        hubspotutk: hubspotUtk,
        fbp: fbp,
        fbc: fbc,
        button_text: submitButtonText
    }

    console.log('formData: ', formData);

    if (email) {
        console.log('Submit button clicked')
        await segmentIdentify({
            email: email
        })
            .then(() => console.log('segmentIdentify called'));
        
        await segmentTrack(formData)
            .then(() => console.log('segmentTrack called'));

        // Google Ads conversion
        window.gtag('event', 'conversion', {'send_to': 'AW-618863666/W55HCJDW7esYELK4jKcC'});

        // LinkedIn Ads conversion
        window.lintrk('track', { conversion_id: 15896073 });
    }
}

// Attach click event to the button when the document is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const buttonElement = document.getElementById("home-cta-button");
    if (buttonElement) {
        console.log('Found submit button')
        buttonElement.addEventListener('click', handleHomeCTASubmit(buttonElement.value));
    }
});