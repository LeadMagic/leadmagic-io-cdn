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
        displayError(error.message);
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

// Display error message to the user
function displayError(message) {
    // Implement how you wish to display the error to the user
    alert(message); // For demonstration purposes, using alert
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
                buttonEl.disabled = true; // Disable the button to prevent multiple submissions
                await handleHomeCTASubmit(buttonEl.value)
                    .catch((error) => {
                        buttonEl.disabled = false; // Re-enable the button if there's an error
                    });
            }
        });
    }
}

// Define the validateEmail function
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Define Segment and Customer.io specific functions (placeholders)
function segmentIdentify(properties) {
    // Implement Segment identify call
}

function segmentTrack(eventName, properties) {
    // Implement Segment track call
}

function customerIoIdentify(properties) {
    // Implement Customer.io identify call
}

function customerIoTrack(eventName, properties) {
    // Implement Customer.io track call
}