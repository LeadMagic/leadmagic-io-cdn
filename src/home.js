async function handleHomeCTASubmit(submitButtonText) {
    const email = document.getElementById("home-cta-email").value;
    
    const email_hash = await sha256(email);

    const formData = { 
        form_type: 'home_cta',
        email: email,
        email_hash: email_hash,
        button_text: submitButtonText
    }

    if (email) {
        // store email in local storage
        localStorage.setItem('em', email);

        await segmentIdentify({
            email: email
        })
        await segmentTrack(formData)

        // Google Ads conversion
        window.gtag('event', 'conversion', {'send_to': 'AW-618863666/W55HCJDW7esYELK4jKcC'});

        // LinkedIn Ads conversion
        window.lintrk('track', { conversion_id: 15896073 });
    }
}

// Attach click event to the button when the document is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const buttonElement = document.getElementById("home-cta-button");
    const buttonElErrorText = document.getElementById('home-cta-button-error');
    let errorList = [];

    if (emailEl) {
        emailEl.addEventListener('input', function() {
                errorList = errorList.filter(item => item.source !== 'email');
            try {
                validateEmail(emailEl.value);
            } catch (error) {
                errorList.push({'source': 'email', 'message': error.message});
            }
        });
    }

    if (buttonElement) {
        buttonElement.addEventListener('click', () => function(event) {
            if (errorList.length > 0) {
                buttonElErrorText.textContent = 'Clear any errors before submitting.';
                event.preventDefault();
            } else {
                buttonElErrorText.textContent = '';
                handleHomeCTASubmit(buttonElement.value)
            }
            
        });
    }

});