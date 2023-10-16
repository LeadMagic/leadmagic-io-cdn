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
    let inputError = false;

    if (emailEl) {
        emailEl.addEventListener('input', function() {
                
            try {
                validateEmail(emailEl.value);
                buttonElErrorText.textContent = '';
                inputError = false;
            } catch (error) {
                buttonElErrorText.textContent = error.message;
                inputError = true;
            }
        });
    }

    if (buttonElement) {
        buttonElement.addEventListener('click', () => function(event) {
            if (inputError) {
                event.preventDefault();
            } else {
                handleHomeCTASubmit(buttonElement.value)
            }
        });
    }
});