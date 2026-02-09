// Configuration - SET YOUR FORMSPREE FORM ID HERE
const FORMSPREE_FORM_ID = "mdalogbg"; // Just the ID part (no URL)
const FORMSPREE_ENDPOINT = `https://formspree.io/f/${FORMSPREE_FORM_ID}`;

// Fallback email (will use mailto if Formspree fails)
const OWNER_EMAIL = "johnmichaelbcastor@gmail.com"; // Fixed: removed the 'A' typo

const openBtn = document.getElementById('openBtn');
const openParagraph = document.getElementById('openParagraph');
const buttonContainer = document.getElementById('buttonContainer');
const buttonNo = document.getElementById('ButtonNo');
const buttonYes = document.getElementById('ButtonYes');
const buttonMaybe = document.getElementById('ButtonMaybe');
const buttonFriends = document.getElementById('ButtonFriends');
const containerCard = document.querySelector('.container-card');
const resetButton = document.getElementById('resetButton');

// Response messages
const yesResponse = document.getElementById('yesResponse');
const maybeResponse = document.getElementById('maybeResponse');
const friendsResponse = document.getElementById('friendsResponse');

// Message form elements
const messageForm = document.getElementById('messageForm');
const contactForm = document.getElementById('contactForm');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const confirmationMessage = document.getElementById('confirmationMessage');
const errorMessage = document.getElementById('errorMessage');
const loadingIndicator = document.getElementById('loadingIndicator');

document.addEventListener('DOMContentLoaded', () => {
    const nextBtn = document.getElementById('nextBtn');
    const NextForm = document.getElementById('NextForm');
    const containerDes = document.querySelector('.container-des');
    
    NextForm.style.justifyContent = 'center';
    NextForm.style.alignItems = 'center';
    
    nextBtn.addEventListener('click', () => {
        NextForm.style.display = 'flex';
        containerDes.style.display = 'none';
    });
});



let gameActive = true;
let userChoice = '';

// Function to make the "No" button move away from cursor
function makeButtonRunaway() {
    if (!gameActive) return;

    // Get button dimensions
    const buttonWidth = buttonNo.offsetWidth;
    const buttonHeight = buttonNo.offsetHeight;

    // Get container dimensions
    const containerWidth = containerCard.offsetWidth - 40;
    const containerHeight = containerCard.offsetHeight - 40;

    // Calculate safe boundaries
    const maxX = containerWidth - buttonWidth;
    const maxY = containerHeight - buttonHeight;

    // Generate random position
    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;

    // Apply new position
    buttonNo.style.left = randomX + 'px';
    buttonNo.style.top = randomY + 'px';
}

// Function to show all option buttons
function showAllOptions() {
    buttonNo.style.position = 'absolute';
    buttonNo.style.left = '200px';
    buttonNo.style.top = '50px';
    buttonMaybe.style.display = 'inline-block';
    buttonFriends.style.display = 'inline-block';
}

// Show the question when heart is clicked
openBtn.addEventListener('click', function () {
    if (openParagraph.style.display === 'none' || openParagraph.style.display === '') {
        openParagraph.style.display = 'block';
        showAllOptions();
    } else {
        openParagraph.style.display = 'none';
        hideAllResponses();
        resetButton.style.display = 'none';
        messageForm.style.display = 'none';
        confirmationMessage.style.display = 'none';
        errorMessage.style.display = 'none';
    }
});

// Make "No" button run away when mouse moves near it
document.addEventListener('mousemove', function (event) {
    if (!gameActive || openParagraph.style.display !== 'block') return;

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const buttonRect = buttonNo.getBoundingClientRect();
    const buttonCenterX = buttonRect.left + buttonRect.width / 2;
    const buttonCenterY = buttonRect.top + buttonRect.height / 2;

    // Calculate distance
    const distance = Math.sqrt(
        Math.pow(mouseX - buttonCenterX, 2) +
        Math.pow(mouseY - buttonCenterY, 2)
    );

    // If cursor is within 120px, make it run away
    if (distance < 120) {
        makeButtonRunaway();
    }
});

// Also run away when hovering directly
buttonNo.addEventListener('mouseenter', function () {
    if (gameActive) makeButtonRunaway();
});

// Handle choice selection and show message form
function handleChoice(choice, responseElement) {
    if (!gameActive) return;
    gameActive = false;
    userChoice = choice;
    hideAllOptions();
    hideAllResponses();
    responseElement.style.display = 'block';
    resetButton.style.display = 'block';

    // Show message form after a short delay
    setTimeout(() => {
        messageForm.style.display = 'block';
    }, 1000);

    if (choice === 'yes') {
        createHeartsAnimation();
    }
}

// Handle Yes button click
buttonYes.addEventListener('click', () => handleChoice('yes', yesResponse));

// Handle Maybe button click
buttonMaybe.addEventListener('click', () => handleChoice('maybe', maybeResponse));

// Handle Friends button click
buttonFriends.addEventListener('click', () => handleChoice('friends', friendsResponse));

// Handle No button click (if they manage to catch it!)
buttonNo.addEventListener('click', function () {
    if (!gameActive) return;
    gameActive = false;
    userChoice = 'no';
    hideAllOptions();
    hideAllResponses();

    // Create a sad response
    const sadResponse = document.createElement('div');
    sadResponse.className = 'response-message';
    sadResponse.style.background = 'linear-gradient(135deg, #8e9aaf, #cbc0d3)';
    sadResponse.style.color = '#495057';
    sadResponse.innerHTML = '😢 Okay, I understand. Maybe next time! Thank you for your honesty. 😢';
    sadResponse.style.display = 'block';

    buttonContainer.parentNode.insertBefore(sadResponse, buttonContainer.nextSibling);
    resetButton.style.display = 'block';

    // Show message form after a short delay
    setTimeout(() => {
        messageForm.style.display = 'block';
    }, 1000);
});

// Handle message form submission
contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const userName = document.getElementById('userName').value;
    const userMessage = document.getElementById('userMessage').value;
    const userEmail = document.getElementById('userEmail').value;

    // Show loading indicator
    loadingIndicator.style.display = 'block';
    sendMessageBtn.disabled = true;
    errorMessage.style.display = 'none';

    try {
        // Prepare form data for Formspree
        const formData = new FormData();
        formData.append('name', userName);
        formData.append('message', userMessage);
        formData.append('choice', userChoice);
        formData.append('timestamp', new Date().toLocaleString());

        if (userEmail) {
            formData.append('email', userEmail);
            formData.append('_replyto', userEmail); // Formspree specific
        }

        formData.append('_subject', `Valentine's Response from ${userName}`);

        // Send to Formspree API
        const response = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();
            if (result.ok || result.success) {
                // Success - show confirmation
                loadingIndicator.style.display = 'none';
                messageForm.style.display = 'none';
                confirmationMessage.style.display = 'block';

                // Reset form
                contactForm.reset();
                sendMessageBtn.disabled = false;

                // Scroll to confirmation message
                confirmationMessage.scrollIntoView({ behavior: 'smooth' });

                console.log('Message sent successfully via Formspree!');
            } else {
                throw new Error('Formspree returned error');
            }
        } else {
            throw new Error('Formspree API error');
        }

    } catch (error) {
        console.error('API Error:', error);

        // Try fallback email method
        try {
            await sendFallbackEmail(userName, userChoice, userMessage, userEmail);

            // Fallback succeeded
            loadingIndicator.style.display = 'none';
            messageForm.style.display = 'none';
            confirmationMessage.style.display = 'block';

            // Reset form
            contactForm.reset();
            sendMessageBtn.disabled = false;

            confirmationMessage.scrollIntoView({ behavior: 'smooth' });

        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);

            // Both methods failed
            loadingIndicator.style.display = 'none';
            errorMessage.style.display = 'block';
            sendMessageBtn.disabled = false;

            errorMessage.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Fallback email function using mailto
function sendFallbackEmail(name, choice, message, email) {
    return new Promise((resolve, reject) => {
        try {
            const subject = `Valentine's Response - ${name} chose: ${choice}`;
            let body = `Name: ${name}\nChoice: ${choice}\nMessage: ${message}\n\n`;
            body += `Timestamp: ${new Date().toLocaleString()}\n`;
            if (email) body += `Email: ${email}\n`;
            body += `\nSent from Valentine's Day Proposal website`;

            // Create mailto link
            const mailtoLink = `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            // Open email client in new tab
            window.open(mailtoLink, '_blank');

            // Simulate a delay to make it feel like it's processing
            setTimeout(() => {
                resolve();
            }, 1000);

        } catch (error) {
            reject(error);
        }
    });
}

// Reset the game
resetButton.addEventListener('click', function () {
    gameActive = true;
    userChoice = '';
    hideAllResponses();
    messageForm.style.display = 'none';
    confirmationMessage.style.display = 'none';
    errorMessage.style.display = 'none';
    resetButton.style.display = 'none';
    showAllOptions();

    // Reset button positions
    buttonNo.style.position = 'absolute';
    buttonNo.style.left = '200px';
    buttonNo.style.top = '50px';

    // Show all buttons
    const optionButtons = document.querySelectorAll('.option-button');
    optionButtons.forEach(button => {
        button.style.display = 'inline-block';
    });

    // Remove any dynamically created responses
    const allResponses = document.querySelectorAll('.response-message');
    allResponses.forEach(response => {
        if (!response.id) response.remove();
    });
});

// Helper functions
function hideAllOptions() {
    const optionButtons = document.querySelectorAll('.option-button');
    optionButtons.forEach(button => {
        button.style.display = 'none';
    });
}

function hideAllResponses() {
    yesResponse.style.display = 'none';
    maybeResponse.style.display = 'none';
    friendsResponse.style.display = 'none';
    confirmationMessage.style.display = 'none';
    errorMessage.style.display = 'none';
}

// Create hearts animation for Yes response
function createHeartsAnimation() {
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.innerHTML = '💖';
            heart.style.position = 'fixed';
            heart.style.fontSize = Math.random() * 20 + 20 + 'px';
            heart.style.left = Math.random() * window.innerWidth + 'px';
            heart.style.top = window.innerHeight + 100 + 'px';
            heart.style.zIndex = '9999';
            heart.style.pointerEvents = 'none';
            heart.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;

            document.body.appendChild(heart);

            // Remove heart after animation
            setTimeout(() => {
                heart.remove();
            }, 5000);
        }, i * 100);
    }

    // Add CSS for falling animation
    const style = document.createElement('style');
    style.innerHTML = `
          @keyframes fall {
            to {
              transform: translateY(-100vh) rotate(360deg);
              opacity: 0;
            }
          }
        `;
    document.head.appendChild(style);
}

// Initialize
showAllOptions();

