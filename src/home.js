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

        // Get root URL, redirect to signup page
        const rootUrl = window.location.origin;
        window.location.href = `${rootUrl}/signup`;
    }
}

// Attach click event to the button when the document is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const emailInputEl = document.getElementById('home-cta-email');
    const buttonEl = document.getElementById("home-cta-button");
    const buttonElErrorText = document.getElementById('home-cta-button-error');
    let inputError = false;

    if (emailInputEl) {
        emailInputEl.addEventListener('input', function() {
                
            try {
                validateEmail(emailInputEl.value);
                buttonElErrorText.textContent = '';
                inputError = false;
            } catch (error) {
                buttonElErrorText.textContent = error.message;
                inputError = true;
            }

            console.log('inputError: ', inputError)
        });
    }

    if (buttonEl) {
        buttonEl.addEventListener('click', () => function(event) {
            if (inputError) {
                event.preventDefault();
            } else {
                handleHomeCTASubmit(buttonEl.value)
            }
        });
    }
});