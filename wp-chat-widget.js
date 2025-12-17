/**
 * Bridgy AI WhatsApp Lead Widget
 * Version: 2.6
 * * SUMMARY OF FIXES:
 * - Restored "Powered By" footer link and fixed its positioning.
 * - WhatsApp Icon: High-fidelity SVG, scaled to 24px for better visibility.
 * - Header: Reduced to 19px for a premium, modern feel.
 * - Close Button: Compact UX design (13px font) to save space.
 * - Hover Stability: CSS "!important" flags used to prevent button disappearance.
 */
(function() {
    // --- 1. CONFIGURATION OBJECT ---
    // All customizable settings are centralized here for easy updates.
    const defaultConfig = {
        whatsapp: {
            phoneNumber: '+61412345678',
            prefilledMessage: 'Hi👋, I would like to chat with Bridgy!',
            n8nBackendUrl: 'https://your-n8n-webhook-url.com',
        },
        branding: {
            logo: 'https://example.com/sarah-bridgeware-image.png',
            name: 'Bridgy',
            welcomeText: 'Hi! 👋 I’m **[Bridgy]**, your virtual assistant. Start a conversation with me on WhatsApp.',
            poweredBy: {
                text: 'Bridgy AI is powered by Bridgeware Technologies',
                link: 'https://bwtai.ai/'
            }
        },
        style: {
            primaryColor: '#1c274b', // Navy Blue
            accentColor: '#25D366',  // WhatsApp Green
            backgroundColor: '#ffffff',
            headerTextColor: '#1c274b'
        },
        links: {
            serviceAgreement: '#',
            privacyPolicy: '#',
        }
    };

    // Merges local defaults with any global window.ChatWidgetConfig settings
    const config = window.ChatWidgetConfig ? 
        {
            whatsapp: { ...defaultConfig.whatsapp, ...window.ChatWidgetConfig.whatsapp },
            branding: { ...defaultConfig.branding, ...window.ChatWidgetConfig.branding },
            style: { ...defaultConfig.style, ...window.ChatWidgetConfig.style },
            links: { ...defaultConfig.links, ...window.ChatWidgetConfig.links }
        } : defaultConfig;

    // Prevent double initialization
    if (window.N8NChatWidgetInitialized) return;
    window.N8NChatWidgetInitialized = true;

    // --- 2. DATA: COUNTRY CODES ---
    const countryCodes = [
        { name: 'Australia', code: 'AU', dial_code: '+61' },
        { name: 'United States', code: 'US', dial_code: '+1' },
        { name: 'Spain', code: 'ES', dial_code: '+34' },
        { name: 'Mexico', code: 'MX', dial_code: '+52' },
        { name: 'Colombia', code: 'CO', dial_code: '+57' }
    ].sort((a, b) => a.name.localeCompare(b.name));
    
    const defaultCountryCode = countryCodes.find(c => c.code === 'AU') || countryCodes[0]; 

    // --- 3. CSS STYLING ---
    const styles = `
        .n8n-chat-widget {
            --chat-navy: #1c274b;
            --chat-green: #25D366;
            --chat-bg-input: #e8f0fe;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        /* Modal Overlay - Darkens page background */
        .n8n-chat-widget .chat-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.6); z-index: 1001; display: none; 
            justify-content: center; align-items: center;
        }
        .n8n-chat-widget .chat-overlay.open { display: flex; }
        
        /* Main Container - Shared layout for image and form */
        .n8n-chat-widget .chat-container {
            display: flex; width: 95%; max-width: 820px; height: 580px;
            background: white; border-radius: 20px; overflow: hidden; position: relative;
            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        }
        
        /* Sidebar - Displays Bridgy's image */
        .n8n-chat-widget .image-sidebar {
            flex: 0 0 42%; background-image: url('${config.branding.logo}');
            background-size: cover; background-position: center;
        }
        
        /* Form Area - Handles inputs and footer */
        .n8n-chat-widget .form-content-area {
            flex: 1; padding: 35px; display: flex; flex-direction: column; position: relative;
        }

        .n8n-chat-widget .welcome-header {
            font-size: 19px; color: ${config.style.headerTextColor}; 
            margin-bottom: 20px; line-height: 1.4; font-weight: 600;
        }

        /* Inputs - Styled for clarity and focus */
        .n8n-chat-widget .form-input {
            width: 100%; padding: 12px; margin-bottom: 10px; border-radius: 10px;
            border: 2px solid transparent; background: var(--chat-bg-input); color: #333; font-size: 15px; box-sizing: border-box;
        }
        .n8n-chat-widget .form-input:focus { border-color: var(--chat-navy); outline: none; }

        .n8n-chat-widget .phone-input-group { display: flex; gap: 10px; margin-bottom: 10px; }
        .n8n-chat-widget .country-code-select { width: 85px; cursor: pointer; }

        /* CTA Button - "Start Conversation" with hover stability */
        .n8n-chat-widget .whatsapp-btn {
            display: flex; align-items: center; justify-content: center; gap: 12px;
            width: 100%; padding: 15px; border-radius: 12px; border: none;
            background-color: var(--chat-navy) !important; color: white !important; 
            font-size: 16px; font-weight: bold; cursor: pointer;
            transition: all 0.2s ease; margin-top: 10px;
            visibility: visible !important; opacity: 1 !important;
        }
        .n8n-chat-widget .whatsapp-btn:hover:not(:disabled) { background-color: #2a3a6d !important; transform: translateY(-1px); }
        .n8n-chat-widget .whatsapp-btn:disabled { opacity: 0.6 !important; cursor: not-allowed; background-color: #666 !important; }

        /* Close Button - Smaller, top-right positioning */
        .n8n-chat-widget .ux-close-btn {
            position: absolute; right: 15px; top: 15px; padding: 6px 12px;
            background: #f2f2f2; border: none; border-radius: 6px; color: #777;
            font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px;
            transition: all 0.2s ease; z-index: 10;
        }
        .n8n-chat-widget .ux-close-btn:hover { background: #e0e0e0; color: #333; }

        /* Floating Button - Toggle on the bottom right of the website */
        .n8n-chat-widget .chat-toggle {
            position: fixed; bottom: 30px; right: 30px;
            padding: 15px 25px; border-radius: 50px; background: var(--chat-green);
            color: white; border: none; cursor: pointer; display: flex; align-items: center; gap: 10px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.2); font-weight: bold; font-size: 16px;
        }
        
        .n8n-chat-widget .terms-text { font-size: 12px; color: #777; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
        .n8n-chat-widget .terms-text a { color: #00bcd4; text-decoration: none; font-weight: 600; }

        /* Footer Branding */
        .n8n-chat-widget .powered-by-footer {
            text-align: center; margin-top: auto; padding-top: 15px; font-size: 11px;
        }
        .n8n-chat-widget .powered-by-footer a { color: #00bcd4; text-decoration: none; font-weight: 600; }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // --- 4. DOM CONSTRUCTION ---
    const widget = document.createElement('div');
    widget.className = 'n8n-chat-widget';
    widget.innerHTML = `
        <div class="chat-overlay">
            <div class="chat-container">
                <div class="image-sidebar"></div>
                <div class="form-content-area">
                    <button class="ux-close-btn"><span>&times;</span> Close</button>

                    <div class="form-scroll-content">
                        <div class="welcome-header">
                            ${config.branding.welcomeText.replace('[Bridgy]', config.branding.name)}
                        </div>
                        <input type="text" id="nombre" class="form-input" placeholder="First Name">
                        <input type="text" id="apellido" class="form-input" placeholder="Last Name">
                        <div class="phone-input-group">
                            <select id="country-code" class="form-input country-code-select"></select>
                            <input type="tel" id="telefono" class="form-input" placeholder="Phone Number">
                        </div>
                        <input type="email" id="correo" class="form-input" placeholder="Email Address">
                        <div class="terms-text">
                            <input type="checkbox" id="terms-accepted" style="width:16px; height:16px;"> 
                            <span>I accept the <a href="${config.links.serviceAgreement}" target="_blank">Terms</a> and <a href="${config.links.privacyPolicy}" target="_blank">Privacy Policy</a>.</span>
                        </div>
                    </div>
                    
                    <div class="action-area">
                        <button class="whatsapp-btn" id="submit-btn" disabled>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M12.031 2C6.49 2 2 6.49 2 12.03c0 1.764.46 3.42 1.263 4.86L2 22l5.29-1.388c1.44.734 3.067 1.196 4.741 1.196h.001c5.54 0 10.03-4.49 10.03-10.03S17.57 2 12.031 2ZM17.202 15.82c-.284.8-.98 1.448-1.745 1.713-.64.22-1.28.31-2.02.13-.53-.13-1.02-.34-1.53-.59-2.14-1.05-3.83-2.91-4.73-5.1-.21-.5-.39-1.02-.45-1.56-.05-.72.07-1.37.38-1.99.31-.61.88-1.07 1.54-1.22.25-.06.51-.06.76.02.2.06.37.19.49.36l1.01 1.45c.17.24.22.54.14.83-.05.18-.16.34-.3.47l-.61.54c-.13.12-.17.3-.1.46.36.85 1.01 1.55 1.83 2.01.16.09.36.08.51-.03l.7-.62c.16-.14.37-.2.58-.17.28.05.54.2.73.41l1.19 1.34c.18.2.27.46.24.72z" fill="white"/>
                            </svg>
                            Start Conversation
                        </button>
                        <p id="form-error" style="color:#d32f2f; display:none; font-size:12px; text-align:center; margin-top:8px; font-weight:bold;"></p>
                    </div>

                    <div class="powered-by-footer">
                        <a href="${config.branding.poweredBy.link}" target="_blank">
                            ${config.branding.poweredBy.text}
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <button class="chat-toggle">
            <span>Hi!</span>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M12.039 2.007c-5.518 0-9.998 4.48-9.998 9.997 0 1.708.435 3.327 1.258 4.757L2.001 22l5.441-1.472a9.986 9.986 0 0 0 4.597.981h.001c5.517 0 9.997-4.48 9.997-9.997S17.557 2.007 12.039 2.007zm5.556 12.06c-.198.547-1.168 1.054-1.583 1.054-.415 0-.901-.157-1.397-.568-.495-.412-1.854-.925-2.269-.925-.415 0-.537.311-.735.547-.198.236-.396.471-.595.707-.198.236-.396.471-.791.471-.396 0-1.529-.569-2.285-1.405-.754-.837-1.254-1.866-1.405-2.102-.158-.236 0-.368.125-.494.124-.125.269-.296.396-.441.125-.146.166-.236.249-.393.083-.158.042-.296-.021-.439-.063-.146-.595-1.433-.811-1.966-.215-.533-.431-.458-.595-.458-.146 0-.311-.021-.475-.021-.165 0-.431.021-.667.237-.235.216-.901.882-.901 2.158 0 1.275.922 2.5 1.053 2.684.131.185 1.831 2.809 4.45 3.935 2.618 1.126 2.618.751 3.165.751.546 0 1.78-.654 2.008-1.291.229-.638.229-.982.166-1.096-.062-.112-.198-.171-.414-.283z" /></svg>
        </button>
    `;
    document.body.appendChild(widget);

    // --- 5. FUNCTIONALITY & LOGIC ---
    const overlay = widget.querySelector('.chat-overlay');
    const toggle = widget.querySelector('.chat-toggle');
    const closeBtn = widget.querySelector('.ux-close-btn');
    const submitBtn = widget.querySelector('#submit-btn');
    const scrollContent = widget.querySelector('.form-scroll-content');
    const actionArea = widget.querySelector('.action-area');
    const countrySelect = widget.querySelector('#country-code');

    /** Populates the country dropdown with phone prefixes */
    countryCodes.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.dial_code;
        opt.textContent = c.dial_code;
        if(c.dial_code === defaultCountryCode.dial_code) opt.selected = true;
        countrySelect.appendChild(opt);
    });

    /** Handles opening and closing the widget */
    function toggleModal(show) {
        overlay.classList.toggle('open', show);
        toggle.style.display = show ? 'none' : 'flex';
    }

    /** Validates that all fields are filled and checkbox is ticked */
    function validate() {
        const isFilled = widget.querySelector('#nombre').value.trim() && 
                         widget.querySelector('#apellido').value.trim() &&
                         widget.querySelector('#telefono').value.trim() &&
                         widget.querySelector('#correo').value.trim() &&
                         widget.querySelector('#terms-accepted').checked;
        submitBtn.disabled = !isFilled;
    }

    /** Sends lead data to n8n webhook and handles success/error states */
    async function sendToWebhook() {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Connecting...';

        const payload = {
            firstName: widget.querySelector('#nombre').value,
            lastName: widget.querySelector('#apellido').value,
            phone: countrySelect.value + widget.querySelector('#telefono').value,
            email: widget.querySelector('#correo').value,
            termsAccepted: true,
            source: window.location.hostname
        };

        try {
            const res = await fetch(config.whatsapp.n8nBackendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                // Success: Show confirmation message
                scrollContent.innerHTML = `
                    <div style="text-align:center; padding: 50px 20px;">
                        <div style="font-size: 60px; color: #25D366; margin-bottom: 15px;">✓</div>
                        <h2 style="color: #1c274b; margin-bottom: 10px; font-size: 22px;">Success!</h2>
                        <p style="font-size: 16px; color: #444; line-height: 1.5;">
                            Thanks, <b>${payload.firstName}</b>. Bridgy will reach out on WhatsApp shortly.
                        </p>
                    </div>
                `;
                actionArea.style.display = 'none';
                setTimeout(() => { toggleModal(false); location.reload(); }, 5000);
            } else {
                throw new Error();
            }
        } catch (e) {
            // Error: Notify user
            const err = widget.querySelector('#form-error');
            err.textContent = "Error connecting. Please try again.";
            err.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Start Conversation';
        }
    }

    // --- 6. EVENT ATTACHMENTS ---
    toggle.onclick = () => toggleModal(true);
    closeBtn.onclick = () => toggleModal(false);
    submitBtn.onclick = sendToWebhook;
    widget.querySelectorAll('input').forEach(i => i.oninput = validate);

})();
