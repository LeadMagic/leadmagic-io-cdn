async function handleSignupSubmit() {
    const firstname = document.getElementById("first-name").value;
    const lastname = document.getElementById("last-name").value;
    const email = document.getElementById("email").value;
    const websiteUrl = document.getElementById("website-url").value;
    const phone = document.getElementById("phone").value;
    const privacyAgreement = document.getElementById("privacy-agreement").value;
    const anonymousId = getCookieValue('ajs_anonymous_id');
    const hubspotUtk = getCookieValue('hubspotutk');
    const fbp = getCookieValue('_fbp');
    const fbc = getCookieValue('_fbc');

    const buttonElText = document.getElementById('signup-button').value;
    
    const firstname_hash = await sha256(firstname);
    const lastname_hash = await sha256(lastname);
    const email_hash = await sha256(email);
    const phone_hash = await sha256(phone);

    if (email) {
        analytics.identify(anonymousId, {
            firstname: firstname,
            lastname: lastname,
            email: email,
            phone: phone
        })
    }

    // Segment track
    if (firstname && lastname && email && websiteUrl && phone && privacyAgreement) {
        analytics.track('Submitted Signup Form', { 
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
            hubspotutk: hubspotUtk,
            fbp: fbp,
            fbc: fbc,
            button_text: buttonElText
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

    // Google Ads conversion
    window.gtag('event', 'conversion', {'send_to': 'AW-618863666/qSE4COri9esYELK4jKcC'});

    // LinkedIn Ads conversion
    window.lintrk('track', { conversion_id: 14427316 });
        
    }
}
  
function validateEmail(email) {
    const freeEmailDomains = ['gmail.com','yahoo.com','hotmail.com','aol.com','mail.com','outlook.com','icloud.com','yandex.com','zoho.com','inbox.com','fastmail.com','hushmail.com','gmx.com','gmx.net','gmx.us','tutanota.com','aim.com','yahoo.co.uk','msn.com','live.com','yahoo.co.in','rediffmail.com','mail.ru','163.com','126.com','sina.com','sohu.com','qq.com', 'test.com'];
            
    const emailDomain = email.split('@')[1];
    if (freeEmailDomains.includes(emailDomain)) {
        throw new Error('Please enter a work email.')
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
        buttonEl.addEventListener('click', function(event) {
            if (errorList.length > 0) {
                buttonElErrorText.textContent = 'Clear any errors before submitting.';
                event.preventDefault();
            } else {
                buttonElErrorText.textContent = '';
                handleSignupSubmit(errorList);
            }
        })
    }
});