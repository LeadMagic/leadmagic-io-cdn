async function handleSignupSubmit(submitButtonText) {
    const firstname = document.getElementById("first-name").value;
    const lastname = document.getElementById("last-name").value;
    const email = document.getElementById("email").value;
    const websiteUrl = document.getElementById("website-url").value;
    const phone = document.getElementById("phone").value;
    const privacyAgreement = document.getElementById("privacy-agreement").value;
    
    const firstname_hash = await sha256(firstname);
    const lastname_hash = await sha256(lastname);
    const email_hash = await sha256(email);
    const phone_hash = await sha256(phone);

    if (email) {
        await segmentIdentify({
            firstname: firstname,
            lastname: lastname,
            email: email,
            phone: phone
        })
    }

    // Segment track
    if (firstname && lastname && email && websiteUrl && phone && privacyAgreement) {
        await segmentTrack({ 
            form_type: 'signup',
            firstname: firstname,
            lastname: lastname,
            email: email,
            phone: phone,
            website_url: websiteUrl,
            privacy_agreement: privacyAgreement,
            firstname_hash: firstname_hash,
            lastname_hash: lastname_hash,
            email_hash: email_hash,
            phone_hash: phone_hash,
            button_text: submitButtonText
        });
            
        await fetch('https://eou7fgkrdaqr3q1.m.pipedream.net', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                website_url: websiteUrl
            })
        })
    }
}
  
function validateWebsiteUrl(websiteUrl) {
    const httpsRegex = /^https:\/\//;
    const domainRegex = /^https:\/\/[a-z\d.-]+\.[a-z.]{2,6}.*$/i;
    let errorMessageList = []
    
    if (!httpsRegex.test(websiteUrl)) {
        errorMessageList.push("- The URL must start with 'https://'.");
    }
    
    if (!domainRegex.test(websiteUrl)) {
        errorMessageList.push("- The domain format is incorrect. It should be like 'company.com'.");
    }

    if (errorMessageList.length > 0) {
        let errorMessage = errorMessageList.join("<br>");
        throw new Error(errorMessage);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const buttonEl = document.getElementById("signup-button");
    const buttonElErrorText = document.getElementById('signup-button-error');
    const emailEl = document.getElementById('email');
    const emailErrorTest = document.getElementById('email-error');
    const websiteUrlEl = document.getElementById("website-url");
    const websiteUrlErrorText = document.getElementById('website-url-error');
    let errorList = [];
    
    if (emailEl) {
        // If em in localStorage, set emailEl value to em
        if (localStorage.getItem('em')) {
            emailEl.value = localStorage.getItem('em');
        }

        emailEl.addEventListener('input', function() {
                errorList = errorList.filter(item => item.source !== 'email');
            try {
                validateEmail(emailEl.value);
                emailErrorTest.textContent = '';
            } catch (error) {
                emailErrorTest.textContent = error.message;
                errorList.push({'source': 'email', 'message': error.message});
            }
        });
    }
    
    if (websiteUrlEl) {
        websiteUrlEl.addEventListener('input', function() {
                errorList = errorList.filter(item => item.source !== 'website-url')
            try {
                validateWebsiteUrl(websiteUrlEl.value);
                websiteUrlErrorText.textContent = '';
            } catch (error) {
                websiteUrlErrorText.innerHTML = error.message;
                errorList.push({'source': 'website-url', 'message': error.message});
            }
    });
    }
    
    if (buttonEl) {
        buttonEl.addEventListener('click', (event) => {
            if (errorList.length > 0) {
                buttonElErrorText.textContent = 'Clear any errors before submitting.';
                event.preventDefault();
            } else {
                buttonElErrorText.textContent = '';
                handleSignupSubmit(buttonEl.value);
            }
        })
    }
});