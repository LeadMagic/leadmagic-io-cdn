async function handleContactSubmit(submitButtonText) {
    const firstname = document.getElementById("first-name").value;
    const lastname = document.getElementById("last-name").value;
    const email = document.getElementById("contact-email").value;
    const natureOfRequest = document.getElementById("nature-of-request").value;
    
    const firstname_hash = await sha256(firstname);
    const lastname_hash = await sha256(lastname);
    const email_hash = await sha256(email);

    if (email) {
        await segmentIdentify({
            firstname: firstname,
            lastname: lastname,
            email: email
        });
    }

    if (firstname && lastname && email && natureOfRequest) {
        await segmentTrack({
            form_type: 'contact',
            firstname: firstname,
            lastname: lastname,
            email: email,
            firstname_hash: firstname_hash,
            lastname_hash: lastname_hash,
            email_hash: email_hash,
            nature_of_request: natureOfRequest,
            button_text: submitButtonText
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    let buttonElement = document.getElementById("contact-button");
    if (buttonElement) {
        buttonElement.addEventListener('click', () => handleContactSubmit(buttonElement.value));
    }
});