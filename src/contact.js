async function handleContactSubmit() {
    const firstname = document.getElementById("first-name").value;
    const lastname = document.getElementById("last-name").value;
    const email = document.getElementById("contact-email").value;
    const natureOfRequest = document.getElementById("nature-of-request").value;
    const anonymousId = getCookieValue('ajs_anonymous_id');
    const hubspotUtk = getCookieValue('hubspotutk');
    const fbp = getCookieValue('_fbp');
    const fbc = getCookieValue('_fbc');
    
    const firstname_hash = await sha256(firstname);
    const lastname_hash = await sha256(lastname);
    const email_hash = await sha256(email);

    const contactButtonElText = document.getElementById('contact-button').value;

    if (email) {
        analytics.identify(anonymousId, {
        firstname: firstname,
        lastname: lastname,
        email: email,
    })
}

    if (firstname && lastname && email && natureOfRequest) {
        analytics.track('Submitted Contact Form', { 
            firstname: firstname,
            lastname: lastname,
            email: email,
            firstname_hash: firstname_hash,
            lastname_hash: lastname_hash,
            email_hash: email_hash,
            nature_of_request: natureOfRequest,
            hubspotutk: hubspotUtk,
            fbp: fbp,
            fbc: fbc,
            button_text: contactButtonElText
        });

        if (window.location.search.includes('utm_source=linkedin')) {
            window.lintrk('track', { conversion_id: 15896065 });
        }
    }

    

}

document.addEventListener('DOMContentLoaded', function() {
    let buttonElement = document.getElementById("contact-button");
    if (buttonElement) {
        buttonElement.addEventListener('click', handleContactSubmit);
    }
});