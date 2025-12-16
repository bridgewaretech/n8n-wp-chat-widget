(function() {
    // --- Configuration (Defaults - Overridden by WordPress Config) ---
    const defaultConfig = {
        whatsapp: {
            phoneNumber: '+61412345678',
            prefilledMessage: 'Hi👋, This is Sarah, thank thank you for contacting Bridgeware Technologies. How can we help you today?',
            n8nBackendUrl: 'https://myExample-n8n-instance/webhook/whatsapp-lead',
        },
        branding: {
            logo: 'https://example.com/sarah-bridgeware-image.png',
            name: 'Sarah Brisdgeware',
            welcomeText: '¡Hi! I am **[Sarah]**, Your visrtual assistant. Fill the form to chat with me.',
            poweredBy: {
                text: 'Sarah AI is powered by BWT AI',
                link: 'https://bwtai.ai/'
            }
        },
        style: {
            primaryColor: '#00BB2D',
            secondaryColor: '#075E54',
            position: 'right',
            backgroundColor: '#ffffff',
            fontColor: '#333333'
        },
        links: {
            serviceAgreement: '#',
            privacyPolicy: '#',
        }
    };

    // Merge user config (from WordPress snippet) with defaults
    const config = window.ChatWidgetConfig ? 
        {
            whatsapp: { ...defaultConfig.whatsapp, ...window.ChatWidgetConfig.whatsapp },
            branding: { ...defaultConfig.branding, ...window.ChatWidgetConfig.branding },
            style: { ...defaultConfig.style, ...window.ChatWidgetConfig.style },
            links: { ...defaultConfig.links, ...window.ChatWidgetConfig.links }
        } : defaultConfig;

    // Prevent multiple initializations
    if (window.N8NChatWidgetInitialized) return;
    window.N8NChatWidgetInitialized = true;

    // --- Country Codes Data ---
    const countryCodes = [
        { name: 'Spain', code: 'ES', dial_code: '+34' },
        { name: 'United States', code: 'US', dial_code: '+1' },
        { name: 'Mexico', code: 'MX', dial_code: '+52' },
        { name: 'Colombia', code: 'CO', dial_code: '+57' },
        { name: 'Argentina', code: 'AR', dial_code: '+54' },
        { name: 'Chile', code: 'CL', dial_code: '+56' },
        { name: 'Peru', code: 'PE', dial_code: '+51' },
        { name: 'Venezuela', code: 'VE', dial_code: '+58' },
        { name: 'Ecuador', code: 'EC', dial_code: '+593' },
        { name: 'Uruguay', code: 'UY', dial_code: '+598' },
        { name: 'Paraguay', code: 'PY', dial_code: '+595' },
        { name: 'Bolivia', code: 'BO', dial_code: '+591' },
        { name: 'Brazil', code: 'BR', dial_code: '+55' },
        { name: 'Australia', code: 'AU', dial_code: '+61' },
    ].sort((a, b) => a.name.localeCompare(b.name));
    
    // Default selected code (e.g., Australia or the first one)
    const defaultCountryCode = countryCodes.find(c => c.code === 'AU') || countryCodes[0]; 

    // --- Custom Styles for Form/Modal View ---
    const styles = `
        .n8n-chat-widget {
            --chat--color-primary: var(--n8n-chat-primary-color, ${config.style.primaryColor}); 
            --chat--color-secondary: var(--n8n-chat-secondary-color, ${config.style.secondaryColor}); 
            --chat--color-background: var(--n8n-chat-background-color, #f4f6f8);
            --chat--color-font: var(--n8n-chat-font-color, #333333);
            /* Input colors */
            --chat--color-input-bg: #1c274b;
            --chat--color-input-font: #ffffff;
            font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        /* Full screen overlay (modal background) */
        .n8n-chat-widget .chat-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            z-index: 1001;
            display: none;
            justify-content: center;
            align-items: center;
        }
        .n8n-chat-widget .chat-overlay.open {
            display: flex;
        }
        
        /* Main Modal Container */
        .n8n-chat-widget .chat-container {
            position: relative;
            bottom: auto;
            right: auto;
            z-index: 1002;
            display: none;
            width: 90%;
            max-width: 700px;
            height: auto;
            max-height: 90vh;
            background: var(--chat--color-background);
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            border: none;
            overflow: hidden;
            font-family: inherit;
        }
        
        @media (min-width: 601px) {
            .n8n-chat-widget .chat-container {
                width: 700px;
                height: 600px; /* FIXED: Increased height to accommodate field spacing */
                max-height: 90vh;
            }
        }
        
        @media (max-width: 600px) {
             .n8n-chat-widget .chat-container {
                 width: 95vw;
                 height: auto;
                 max-height: 90vh;
                 border-radius: 8px;
            }
        }
        
        .n8n-chat-widget .chat-container.open {
            display: flex;
            flex-direction: row;
        }
        
        /* Image Sidebar (Agent Photo) */
        .n8n-chat-widget .image-sidebar {
            flex: 0 0 45%;
            background-image: url('${config.branding.logo}');
            background-size: cover;
            background-position: center center;
            border-top-left-radius: 12px;
            border-bottom-left-radius: 12px;
        }
        
        @media (max-width: 600px) {
            .n8n-chat-widget .image-sidebar {
                display: none;
            }
            .n8n-chat-widget .form-content-area {
                flex: 1 1 100%;
            }
        }

        /* Form Content Area: height: 100% added to ensure flex pinning works */
        .n8n-chat-widget .form-content-area {
            flex: 1 1 55%;
            padding: 40px;
            background: white;
            border-radius: 12px;
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between; 
            height: 100%; 
            box-sizing: border-box; 
        }

        /* Wrapper for scrolling content */
        .n8n-chat-widget .form-scroll-content {
            overflow-y: hidden; /* FIXED: Prevents scrollbar from appearing */
            margin-right: 0; 
            padding-right: 0;
            margin-bottom: 16px; 
            padding-bottom: 0; 
        }
        
        /* Close Button (Top Right of Form) */
        .n8n-chat-widget .close-button {
            position: absolute;
            right: 15px;
            top: 15px;
            transform: none;
            background: none;
            border: none;
            color: var(--chat--color-font);
            cursor: pointer;
            padding: 5px;
            font-size: 24px;
            opacity: 0.6;
            z-index: 10; 
        }

        /* Header Text Styling */
        .n8n-chat-widget .welcome-text {
            font-size: 18px; 
            font-weight: 500;
            color: var(--chat--color-font);
            margin-bottom: 24px;
            line-height: 1.4;
            text-align: left;
            margin-right: 30px; 
        }
        .n8n-chat-widget .welcome-text strong {
            font-weight: 700;
        }
        
        /* Input Field Spacing FIX */
        .n8n-chat-widget .input-group {
            margin-bottom: 16px; /* Standardized vertical spacing between groups */
            position: relative;
        }

        .n8n-chat-widget .form-input {
            width: 100%;
            padding: 15px 18px; 
            border: 1px solid var(--chat--color-input-bg);
            border-radius: 8px; 
            font-size: 16px;
            color: var(--chat--color-input-font); 
            background: var(--chat--color-input-bg); 
            transition: border-color 0.2s, box-shadow 0.2s;
            box-sizing: border-box;
            font-family: inherit;
        }
        .n8n-chat-widget .form-input::placeholder {
            color: rgba(255, 255, 255, 0.7); 
            opacity: 1; 
        }
        .n8n-chat-widget .form-input:focus {
            outline: none;
            border-color: var(--chat--color-primary);
            box-shadow: 0 0 0 1px var(--chat--color-primary);
        }

        /* Phone Input Group */
        .n8n-chat-widget .phone-input-group {
            display: flex;
            gap: 10px; 
        }
        .n8n-chat-widget .country-code-select {
            flex: 0 0 90px; 
            padding: 15px 5px; 
            border: 1px solid var(--chat--color-input-bg);
            border-radius: 8px;
            font-size: 16px;
            color: var(--chat--color-input-font); 
            background: var(--chat--color-input-bg); 
            background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2064.9c-2.8-2.8-6.9-4.7-11.9-5.1H17.3c-5%200.4-9.1%202.3-11.9%205.1-5.7%205.7-5.7%2014.9%200%2020.6l130.6%20130.6c2.8%202.8%206.9%204.7%2011.9%205.1%205-0.4%209.1-2.3%2011.9-5.1L287%2085.5c5.7-5.7%205.7-14.9%200-20.6z%22%2F%3E%3C%2Fsvg%3E"); 
            background-repeat: no-repeat;
            background-position: right 8px center;
            background-size: 10px;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            cursor: pointer;
        }

        .n8n-chat-widget .phone-number-input {
            flex: 1;
        }
        
        /* Checkbox and Terms Spacing FIX */
        .n8n-chat-widget .terms-checkbox-group {
            display: flex;
            align-items: flex-start;
            margin-top: 5px; 
            margin-bottom: 16px; /* Standardized vertical spacing before the button */
            font-size: 13px; 
            line-height: 1.2; 
            color: var(--chat--color-font); 
        }
        .n8n-chat-widget .terms-checkbox-group label {
             padding-top: 2px;
             flex: 1; 
        }

        .n8n-chat-widget .terms-checkbox-group input[type="checkbox"] {
            margin-top: 2px;
            margin-right: 10px;
            min-width: 16px;
            min-height: 16px;
            border-radius: 3px;
            border: 1px solid #ccc;
            cursor: pointer;
            flex-shrink: 0; 
        }

        .n8n-chat-widget .terms-checkbox-group a {
            color: var(--chat--color-primary);
            text-decoration: none;
            font-weight: 600;
            transition: opacity 0.2s;
        }
        .n8n-chat-widget .terms-checkbox-group a:hover {
            opacity: 0.8;
        }
        
        /* Start Conversation Button (Modal Button) */
        .n8n-chat-widget .whatsapp-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            width: 100%;
            padding: 15px 24px;
            background: #f1f1f1; 
            color: #888888; 
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: background 0.3s ease, transform 0.1s ease;
            font-family: inherit;
            margin-top: 0; 
            margin-bottom: 10px; 
        }

        /* Styling for ENABLED button */
        .n8n-chat-widget .whatsapp-btn:not(:disabled) {
            background: var(--chat--color-primary);
            color: white;
        }
        
        .n8n-chat-widget .action-area {
            margin-top: auto; 
        }

        .n8n-chat-widget .whatsapp-btn:hover:not(:disabled) {
            background: #008f1b;
        }
        
        .n8n-chat-widget .whatsapp-btn:disabled {
            cursor: not-allowed;
        }

        /* Footer Styling */
        .n8n-chat-widget .chat-footer {
            padding: 10px 0 0; 
            text-align: center;
            background: white;
            border-top: 1px solid #f0f0f0;
            font-size: 11px; 
            white-space: normal; 
            line-height: 1.2;
            padding-top: 10px;
        }
        .n8n-chat-widget .chat-footer a {
            color: var(--chat--color-secondary);
            text-decoration: none;
            font-weight: 500;
        }
        
        .n8n-chat-widget .error-message {
            color: red;
            font-size: 13px;
            margin-top: 10px;
            margin-bottom: 10px; 
            text-align: center;
            display: none;
        }
        
        /* --- Chat Toggle Button (Pill/Extended Bubble) --- */
        .n8n-chat-widget .chat-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: auto; 
            padding: 12px 20px; 
            height: 48px; 
            border-radius: 24px !important; 
            background: #25D366; 
            color: white; 
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 999;
            transition: transform 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px; 
            font-weight: 600;
            text-decoration: none;
            gap: 10px; 
        }

        .n8n-chat-widget .chat-toggle.position-left {
            right: auto;
            left: 20px;
        }

        .n8n-chat-widget .chat-toggle:hover {
            transform: scale(1.05);
            background: #1da851; 
        }
        
        .n8n-chat-widget .chat-toggle svg {
            width: 24px; 
            height: 24px;
            fill: white !important; 
            flex-shrink: 0;
            pointer-events: none; 
        }
    `;

    // Load Geist font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css';
    document.head.appendChild(fontLink);

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);


    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'n8n-chat-widget';
    
    // Set CSS variables for colors
    widgetContainer.style.setProperty('--chat--color-primary', config.style.primaryColor);
    widgetContainer.style.setProperty('--chat--color-secondary', config.style.secondaryColor);
    widgetContainer.style.setProperty('--chat--color-background', config.style.backgroundColor);
    widgetContainer.style.setProperty('--chat--color-font', config.style.fontColor);

    // 1. Create Overlay
    const chatOverlay = document.createElement('div');
    chatOverlay.className = 'chat-overlay';

    // 2. Create Chat Container (Modal)
    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat-container';
    
    // 3. Image Sidebar (Agent Photo)
    const imageSidebar = document.createElement('div');
    imageSidebar.className = 'image-sidebar';
    chatContainer.appendChild(imageSidebar);
    
    // 4. Form Content Area
    const formContentArea = document.createElement('div');
    formContentArea.className = 'form-content-area';
    
    // Welcome text with agent name substitution
    const welcomeText = config.branding.welcomeText.replace('[Agent Name]', config.branding.name);
    
    // Create Scrollable Content Wrapper
    const formScrollContent = document.createElement('div');
    formScrollContent.className = 'form-scroll-content';

    formScrollContent.innerHTML = `
        <p class="welcome-text">${welcomeText}</p>

        <div class="input-group">
            <input type="text" id="nombre" class="form-input" placeholder="Name" required />
        </div>
        
        <div class="input-group">
            <input type="text" id="apellido" class="form-input" placeholder="LastName" required />
        </div>
        
        <div class="input-group phone-input-group">
            <select id="country-code" class="country-code-select"></select>
            <input type="tel" id="telefono" class="form-input phone-number-input" placeholder="Phone" required />
        </div>
        
        <div class="input-group">
            <input type="email" id="correo-corporativo" class="form-input" placeholder="Email" />
        </div>

        <div class="terms-checkbox-group">
            <input type="checkbox" id="terms-accepted" required />
            <label for="terms-accepted">
                I've read and accept the <a href="${config.links.serviceAgreement}" target="_blank">Terms and Conditions</a> and the <a href="${config.links.privacyPolicy}" target="_blank">Privacy Policy</a>
            </label>
        </div>
    `;

    // Create Button and Error Message wrapper (Action Area)
    const actionArea = document.createElement('div');
    actionArea.className = 'action-area';
    actionArea.innerHTML = `
        <button class="whatsapp-btn" type="button" disabled>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12.039 2.007c-5.518 0-9.998 4.48-9.998 9.997 0 1.708.435 3.327 1.258 4.757L2.001 22l5.441-1.472a9.986 9.986 0 0 0 4.597.981h.001c5.517 0 9.997-4.48 9.997-9.997S17.557 2.007 12.039 2.007zm5.556 12.06c-.198.547-1.168 1.054-1.583 1.054-.415 0-.901-.157-1.397-.568-.495-.412-1.854-.925-2.269-.925-.415 0-.537.311-.735.547-.198.236-.396.471-.595.707-.198.236-.396.471-.791.471-.396 0-1.529-.569-2.285-1.405-.754-.837-1.254-1.866-1.405-2.102-.158-.236 0-.368.125-.494.124-.125.269-.296.396-.441.125-.146.166-.236.249-.393.083-.158.042-.296-.021-.439-.063-.146-.595-1.433-.811-1.966-.215-.533-.431-.458-.595-.458-.146 0-.311-.021-.475-.021-.165 0-.431.021-.667.237-.235.216-.901.882-.901 2.158 0 1.275.922 2.5 1.053 2.684.131.185 1.831 2.809 4.45 3.935 2.618 1.126 2.618.751 3.165.751.546 0 1.78-.654 2.008-1.291.229-.638.229-.982.166-1.096-.062-.112-.198-.171-.414-.283z" />
            </svg>
            Start Conversation
        </button>
        <div class="error-message" id="form-error"></div>
    `;

    // Create Close Button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.title = 'Close';
    closeButton.innerHTML = '×';
    
    // Footer
	const footer = document.createElement('div');
	footer.className = 'chat-footer';
	footer.innerHTML = `
		<a href="${config.branding.poweredBy.link}" target="_blank" rel="noopener noreferrer">
			${config.branding.poweredBy.text}
		</a>
	`;

    // Assemble form content area
    formContentArea.appendChild(closeButton);
    formContentArea.appendChild(formScrollContent);
    formContentArea.appendChild(actionArea); 
    formContentArea.appendChild(footer);     
    
    chatContainer.appendChild(formContentArea);
    chatOverlay.appendChild(chatContainer);
    widgetContainer.appendChild(chatOverlay);

    
    // Create chat toggle button 
    const chatToggle = document.createElement('button');
    chatToggle.className = `chat-toggle${config.style.position === 'left' ? ' position-left' : ''}`;
    chatToggle.title = 'Chat With Us';
    
    // **Combined Text and SVG for Pill Look**
    chatToggle.innerHTML = `
        <span>Hi!</span>
        <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.039 2.007c-5.518 0-9.998 4.48-9.998 9.997 0 1.708.435 3.327 1.258 4.757L2.001 22l5.441-1.472a9.986 9.986 0 0 0 4.597.981h.001c5.517 0 9.997-4.48 9.997-9.997S17.557 2.007 12.039 2.007zm5.556 12.06c-.198.547-1.168 1.054-1.583 1.054-.415 0-.901-.157-1.397-.568-.495-.412-1.854-.925-2.269-.925-.415 0-.537.311-.735.547-.198.236-.396.471-.595.707-.198.236-.396.471-.791.471-.396 0-1.529-.569-2.285-1.405-.754-.837-1.254-1.866-1.405-2.102-.158-.236 0-.368.125-.494.124-.125.269-.296.396-.441.125-.146.166-.236.249-.393.083-.158.042-.296-.021-.439-.063-.146-.595-1.433-.811-1.966-.215-.533-.431-.458-.595-.458-.146 0-.311-.021-.475-.021-.165 0-.431.021-.667.237-.235.216-.901.882-.901 2.158 0 1.275.922 2.5 1.053 2.684.131.185 1.831 2.809 4.45 3.935 2.618 1.126 2.618.751 3.165.751.546 0 1.78-.654 2.008-1.291.229-.638.229-.982.166-1.096-.062-.112-.198-.171-.414-.283z" />
        </svg>
    `;
    widgetContainer.appendChild(chatToggle);

    // Append widget to body
    document.body.appendChild(widgetContainer);

    // --- Elements references ---
    const openBtn = chatToggle;
    const closeBtn = closeButton; 
    const whatsappBtn = actionArea.querySelector('.whatsapp-btn');
    const termsCheckbox = formScrollContent.querySelector('#terms-accepted');
    const nameInput = formScrollContent.querySelector('#nombre');
    const lastNameInput = formScrollContent.querySelector('#apellido');
    const phoneInput = formScrollContent.querySelector('#telefono');
    const emailInput = formScrollContent.querySelector('#correo-corporativo');
    const countryCodeSelect = formScrollContent.querySelector('#country-code');
    const errorEl = actionArea.querySelector('#form-error');

    // --- Initialization and Utility ---
    
    // Populate Country Code Dropdown
    countryCodes.forEach(country => {
        const option = document.createElement('option');
        option.value = country.dial_code;
        option.textContent = country.dial_code;
        if (country.dial_code === defaultCountryCode.dial_code) {
             option.selected = true;
        }
        countryCodeSelect.appendChild(option);
    });
    
    // --- Handlers ---
    
    function showModal() {
        chatOverlay.classList.add('open');
        chatContainer.classList.add('open');
        openBtn.style.display = 'none';
        errorEl.style.display = 'none';
    }

    function closeModal() {
        chatOverlay.classList.remove('open');
        chatContainer.classList.remove('open');
        openBtn.style.display = 'flex';
    }

    function updateButtonState() {
        // Validation logic
        const isNameValid = nameInput.value.trim().length > 0;
        const isPhoneValid = phoneInput.value.trim().length >= 5; 
        const isTermsChecked = termsCheckbox.checked;
        
        if (isNameValid && isPhoneValid && isTermsChecked) {
            whatsappBtn.removeAttribute('disabled');
        } else {
            whatsappBtn.setAttribute('disabled', 'true');
        }
    }

    async function handleWhatsAppStart(e) {
        e.preventDefault();
        
        const name = nameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const phone = phoneInput.value.trim();
        const email = emailInput.value.trim();
        const countryCode = countryCodeSelect.value;
        const fullPhoneNumber = countryCode + phone;
        
        if (!termsCheckbox.checked) {
            errorEl.textContent = "You need to accept Our Privacy Policy and Our Terms and Conditions.";
            errorEl.style.display = 'block';
            return;
        }
        
        // 1. Send data to n8n backend for lead logging
        // We use the URL provided in the WordPress config (config.whatsapp.n8nBackendUrl)
        try {
            await fetch(config.whatsapp.n8nBackendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: name,
                    lastName: lastName,
                    phone: fullPhoneNumber,
                    email: email,
                    source: 'Website Chat Form'
                })
            });
            // We ignore errors here so the user can still start the chat if the backend logging fails
        } catch (err) {
            console.error('Error logging lead to n8n:', err);
        }
        
        // 2. Redirect to WhatsApp
        // We use the WhatsApp number provided in the WordPress config (config.whatsapp.phoneNumber)
        const whatsappUrl = `https://wa.me/${config.whatsapp.phoneNumber.replace('+', '')}?text=${encodeURIComponent(config.whatsapp.prefilledMessage + ' - ' + name + ' ' + lastName + ' (' + fullPhoneNumber + ')')}`;
        
        // Open in a new tab/window
        window.open(whatsappUrl, '_blank');
        
        // Close the modal after redirection
        closeModal();
    }


    // --- Event listeners ---
    openBtn.addEventListener('click', showModal);
    closeBtn.addEventListener('click', closeModal);
    whatsappBtn.addEventListener('click', handleWhatsAppStart);

    // Input listeners to enable/disable button
    [nameInput, phoneInput, termsCheckbox].forEach(el => {
        el.addEventListener('input', updateButtonState);
    });

    // Start with modal closed and toggle button visible
    openBtn.style.display = 'flex';
    chatContainer.classList.remove('open');
    chatOverlay.classList.remove('open');

})();
