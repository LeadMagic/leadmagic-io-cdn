// Utility function to validate email and return a promise for email hash
async function processEmail(email) {
    if (!validateEmail(email)) {
        throw new Error("Invalid email format");
    }
    return await sha256(email);
}

// Handles form submission
async function handleHomeCTASubmit(submitButtonText) {
    const email = document.getElementById("home-cta-email").value;

    try {
        const email_hash = await processEmail(email);

        const formData = {
            form_type: 'home_cta',
            email: email,
            email_hash: email_hash,
            button_text: submitButtonText
        };

        // Store email in local storage
        localStorage.setItem('em', email);

        // Identify user for Segment and Customer.io
        identifyUser(email);

        // Track form submission for Segment and Customer.io
        trackFormSubmission(email, formData);

        // Redirect to signup page
        redirectToSignup();
    } catch (error) {
        console.error(error.message);
        // Handle error (e.g., show error message to the user)
    }
}

// Identify user for Segment and Customer.io
function identifyUser(email) {
    const userProperties = {
        email: email,
        // Add other B2B relevant properties as needed
    };

    // Segment identify call
    segmentIdentify(userProperties);

    // Customer.io identify call
    customerIoIdentify(userProperties);
}

// Track form submission for Segment and Customer.io
function trackFormSubmission(email, formData) {
    // Combine formData with additional properties if needed
    const eventData = {
        ...formData,
        page_visited: 'Home Page', // Additional property for page visited
    };

    // Segment track call
    segmentTrack('Form Submitted', eventData);

    // Customer.io track call
    customerIoTrack('Form Submitted', eventData);
}

// Redirect to the signup page
function redirectToSignup() {
    const rootUrl = window.location.origin;
    window.location.href = `${rootUrl}/signup`;
}

// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    setupFormEventListeners();
});

// Setup form event listeners
function setupFormEventListeners() {
    const emailInputEl = document.getElementById('home-cta-email');
    const buttonEl = document.getElementById("home-cta-button");
    const buttonElErrorText = document.getElementById('home-cta-button-error');
    let inputError = false;

    setupEmailInputListener(emailInputEl, buttonElErrorText, inputError);
    setupButtonClickListener(buttonEl, inputError);
}

// Setup email input listener
function setupEmailInputListener(emailInputEl, buttonElErrorText, inputError) {
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
        });
    }
}

// Setup button click listener
function setupButtonClickListener(buttonEl, inputError) {
    if (buttonEl) {
        buttonEl.addEventListener('click', async (event) => {
            event.preventDefault();
            if (!inputError) {
                await handleHomeCTASubmit(buttonEl.value);
            }
        });
    }
}

// Define the validateEmail function
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}