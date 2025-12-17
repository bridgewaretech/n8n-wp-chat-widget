/**
 * Sarah AI WhatsApp Lead Widget
 * Version: 2.2
 * Fixes: Restored original header/button appearance.
 * Includes: Success Message, Form Reset, and Terms Acceptance Record.
 */
(function() {
    // --- 1. CONFIGURATION ---
    const defaultConfig = {
        whatsapp: {
            phoneNumber: '+61412345678',
            prefilledMessage: 'Hi👋, This is Sarah, thank thank you for contacting Bridgeware Technologies.',
            n8nBackendUrl: 'https://myExample-n8n-instance/webhook/whatsapp-lead',
        },
        branding: {
            logo: 'https://example.com/sarah-bridgeware-image.png',
            name: 'Sarah Bridgeware',
            welcomeText: 'Hi! 👋 I’m **[Sarah]**, your virtual assistant. Start a conversation with me on WhatsApp.',
            poweredBy: {
                text: 'Sarah AI is powered by Bridgeware Technologies',
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

    const config = window.ChatWidgetConfig ? 
        {
            whatsapp: { ...defaultConfig.whatsapp, ...window.ChatWidgetConfig.whatsapp },
            branding: { ...defaultConfig.branding, ...window.ChatWidgetConfig.branding },
            style: { ...defaultConfig.style, ...window.ChatWidgetConfig.style },
            links: { ...defaultConfig.links, ...window.ChatWidgetConfig.links }
        } : defaultConfig;

    if (window.N8NChatWidgetInitialized) return;
    window.N8NChatWidgetInitialized = true;

    // --- 2. COUNTRY CODES ---
    const countryCodes = [
        { name: 'Spain', code: 'ES', dial_code: '+34' },
        { name: 'United States', code: 'US', dial_code: '+1' },
        { name: 'Australia', code: 'AU', dial_code: '+61' },
        { name: 'Mexico', code: 'MX', dial_code: '+52' },
        { name: 'Colombia', code: 'CO', dial_code: '+57' }
    ].sort((a, b) => a.name.localeCompare(b.name));
    
    const defaultCountryCode = countryCodes.find(c => c.code === 'AU') || countryCodes[0]; 

    // --- 3. CSS STYLES (Restored to Original Look) ---
    const styles = `
        .n8n-chat-widget {
            --chat--color-primary: ${config.style.primaryColor}; 
            --chat--color-font: ${config.style.fontColor};
            --chat--color-input-bg: #e8f0fe;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .n8n-chat-widget .chat-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.6); z-index: 1001; display: none; 
            justify-content: center; align-items: center;
        }
        .n8n-chat-widget .chat-overlay.open { display: flex; }
        
        .n8n-chat-widget .chat-container {
            display: flex; width: 90%; max-width: 800px; height: 550px;
            background: white; border-radius: 15px; overflow: hidden; position: relative;
        }
        
        .n8n-chat-widget .image-sidebar {
            flex: 0 0 45%; background-image: url('${config.branding.logo}');
            background-size: cover; background-position: center;
        }
        
        .n8n-chat-widget .form-content-area {
            flex: 1; padding: 40px; display: flex; flex-direction: column; position: relative;
        }

        .n8n-chat-widget .welcome-header {
            font-size: 22px; color: #6e76a5; margin-bottom: 25px; line-height: 1.3;
        }

        .n8n-chat-widget .form-input {
            width: 100%; padding: 15px; margin-bottom: 12px; border-radius: 10px;
            border: none; background: #e8f0fe; color: #333; font-size: 16px; box-sizing: border-box;
        }

        .n8n-chat-widget .phone-input-group { display: flex; gap: 10px; margin-bottom: 12px; }
        .n8n-chat-widget .country-code-select { width: 90px; }

        .n8n-chat-widget .whatsapp-btn {
            width: 100%; padding: 16px; border-radius: 10px; border: none;
            background: #1c274b; color: white; font-size: 16px; font-weight: 500; cursor: pointer;
            transition: background 0.3s; margin-top: 10px;
        }
        .n8n-chat-widget .whatsapp-btn:hover:not(:disabled) { background: #2a3a6d; }
        .n8n-chat-widget .whatsapp-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .n8n-chat-widget .chat-toggle {
            position: fixed; bottom: 20px; right: 20px;
            padding: 12px 25px; border-radius: 30px; background: #25D366;
            color: white; border: none; cursor: pointer; display: flex; align-items: center; gap: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2); font-weight: bold;
        }

        .n8n-chat-widget .close-button {
            position: absolute; right: 20px; top: 20px; font-size: 28px;
            background: none; border: none; cursor: pointer; color: #ccc;
        }
        
        .n8n-chat-widget .terms-text { font-size: 13px; color: #666; margin-bottom: 15px; }
        .n8n-chat-widget .terms-text a { color: #00bcd4; text-decoration: none; }
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
                    <button class="close-button">&times;</button>
                    <div class="form-scroll-content">
                        <div class="welcome-header">
                            ${config.branding.welcomeText.replace('[Sarah]', config.branding.name)}
                        </div>
                        <input type="text" id="nombre" class="form-input" placeholder="First Name">
                        <input type="text" id="apellido" class="form-input" placeholder="Last Name">
                        <div class="phone-input-group">
                            <select id="country-code" class="form-input country-code-select"></select>
                            <input type="tel" id="telefono" class="form-input" placeholder="Phone Number">
                        </div>
                        <input type="email" id="correo" class="form-input" placeholder="Email Address">
                        <div class="terms-text">
                            <input type="checkbox" id="terms-accepted"> 
                            I accept the <a href="${config.links.serviceAgreement}" target="_blank">Terms</a> and <a href="${config.links.privacyPolicy}" target="_blank">Privacy Policy</a>.
                        </div>
                    </div>
                    <div class="action-area">
                        <button class="whatsapp-btn" id="submit-btn" disabled>Start Conversation</button>
                        <p id="form-error" style="color:red; display:none; font-size:12px; text-align:center; margin-top:5px;"></p>
                    </div>
                    <div style="text-align:center; margin-top:auto; font-size:11px; color:#00bcd4;">
                        <a href="${config.branding.poweredBy.link}" target="_blank" style="color:inherit; text-decoration:none;">
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

    // --- 5. LOGIC & EVENT HANDLERS ---
    const overlay = widget.querySelector('.chat-overlay');
    const toggle = widget.querySelector('.chat-toggle');
    const closeBtn = widget.querySelector('.close-button');
    const submitBtn = widget.querySelector('#submit-btn');
    const scrollContent = widget.querySelector('.form-scroll-content');
    const actionArea = widget.querySelector('.action-area');
    const countrySelect = widget.querySelector('#country-code');

    // Fill Country Codes
    countryCodes.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.dial_code;
        opt.textContent = c.dial_code;
        if(c.dial_code === defaultCountryCode.dial_code) opt.selected = true;
        countrySelect.appendChild(opt);
    });

    function toggleModal(show) {
        overlay.classList.toggle('open', show);
        toggle.style.display = show ? 'none' : 'flex';
    }

    function validate() {
        const isFilled = widget.querySelector('#nombre').value.trim() && 
                         widget.querySelector('#apellido').value.trim() &&
                         widget.querySelector('#telefono').value.trim() &&
                         widget.querySelector('#correo').value.trim() &&
                         widget.querySelector('#terms-accepted').checked;
        submitBtn.disabled = !isFilled;
    }

    async function sendToWebhook() {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        const payload = {
            firstName: widget.querySelector('#nombre').value,
            lastName: widget.querySelector('#apellido').value,
            phone: countrySelect.value + widget.querySelector('#telefono').value,
            email: widget.querySelector('#correo').value,
            termsAccepted: true, // Verification record
            source: 'Website Chat Widget'
        };

        try {
            const res = await fetch(config.whatsapp.n8nBackendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                // SUCCESS STATE: Clear form and show message
                scrollContent.innerHTML = `
                    <div style="text-align:center; padding: 60px 20px;">
                        <div style="font-size: 60px; color: #25D366; margin-bottom: 20px;">✓</div>
                        <h2 style="color: #1c274b;">Perfect!</h2>
                        <p style="font-size: 18px; color: #555;">Thank you, <b>${payload.firstName}</b>. I will get in touch with you on WhatsApp soon!</p>
                    </div>
                `;
                actionArea.style.display = 'none';
                setTimeout(() => { toggleModal(false); location.reload(); }, 6000);
            } else {
                throw new Error();
            }
        } catch (e) {
            const err = widget.querySelector('#form-error');
            err.textContent = "Oops! Something went wrong. Please try again.";
            err.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Start Conversation';
        }
    }

    // Listeners
    toggle.onclick = () => toggleModal(true);
    closeBtn.onclick = () => toggleModal(false);
    submitBtn.onclick = sendToWebhook;
    widget.querySelectorAll('input').forEach(i => i.oninput = validate);

})();
