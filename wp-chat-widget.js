/**
 * Bridgy AI WhatsApp Lead Widget
 * Version: 2.4
 * * CHANGES:
 * - PERMANENT FIX: Hover button disappearance issue resolved.
 * - NEW: Added WhatsApp icon inside the main CTA button.
 * - Darkened header text for premium readability.
 * - UX Close Button with hover effects.
 */
(function() {
    // --- 1. CONFIGURATION ---
    const defaultConfig = {
        whatsapp: {
            phoneNumber: '+61412345678',
            prefilledMessage: 'Hi👋, I would like to chat with Bridgy!',
            n8nBackendUrl: 'https://your-n8n-webhook-url.com',
        },
        branding: {
            logo: 'https://example.com/sarah-bridgeware-image.png', // Replace with your image URL
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
        { name: 'Australia', code: 'AU', dial_code: '+61' },
        { name: 'United States', code: 'US', dial_code: '+1' },
        { name: 'Spain', code: 'ES', dial_code: '+34' },
        { name: 'Mexico', code: 'MX', dial_code: '+52' },
        { name: 'Colombia', code: 'CO', dial_code: '+57' }
    ].sort((a, b) => a.name.localeCompare(b.name));
    
    const defaultCountryCode = countryCodes.find(c => c.code === 'AU') || countryCodes[0]; 

    // --- 3. CSS STYLES ---
    const styles = `
        .n8n-chat-widget {
            --chat-navy: #1c274b;
            --chat-green: #25D366;
            --chat-bg-input: #e8f0fe;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .n8n-chat-widget .chat-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.6); z-index: 1001; display: none; 
            justify-content: center; align-items: center;
        }
        .n8n-chat-widget .chat-overlay.open { display: flex; }
        
        .n8n-chat-widget .chat-container {
            display: flex; width: 95%; max-width: 850px; height: 600px;
            background: white; border-radius: 20px; overflow: hidden; position: relative;
            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        }
        
        .n8n-chat-widget .image-sidebar {
            flex: 0 0 45%; background-image: url('${config.branding.logo}');
            background-size: cover; background-position: center;
        }
        
        .n8n-chat-widget .form-content-area {
            flex: 1; padding: 40px; display: flex; flex-direction: column; position: relative;
        }

        .n8n-chat-widget .welcome-header {
            font-size: 22px; color: ${config.style.headerTextColor}; 
            margin-bottom: 25px; line-height: 1.4; font-weight: 700;
        }

        .n8n-chat-widget .form-input {
            width: 100%; padding: 14px; margin-bottom: 12px; border-radius: 10px;
            border: 2px solid transparent; background: var(--chat-bg-input); color: #333; font-size: 16px; box-sizing: border-box;
        }
        .n8n-chat-widget .form-input:focus { border-color: var(--chat-navy); outline: none; }

        .n8n-chat-widget .phone-input-group { display: flex; gap: 10px; margin-bottom: 12px; }
        .n8n-chat-widget .country-code-select { width: 90px; cursor: pointer; }

        /* FIXED BUTTON STYLES */
        .n8n-chat-widget .whatsapp-btn {
            display: flex; align-items: center; justify-content: center; gap: 10px;
            width: 100%; padding: 16px; border-radius: 12px; border: none;
            background-color: var(--chat-navy) !important; color: white !important; 
            font-size: 16px; font-weight: bold; cursor: pointer;
            transition: transform 0.1s ease, background-color 0.2s ease; 
            margin-top: 10px; visibility: visible !important; opacity: 1 !important;
        }
        .n8n-chat-widget .whatsapp-btn:hover:not(:disabled) { background-color: #2a3a6d !important; }
        .n8n-chat-widget .whatsapp-btn:active { transform: scale(0.98); }
        .n8n-chat-widget .whatsapp-btn:disabled { opacity: 0.6 !important; cursor: not-allowed; background-color: #666 !important; }

        .n8n-chat-widget .ux-close-btn {
            position: absolute; right: 20px; top: 20px; padding: 8px 15px;
            background: #f0f0f0; border: none; border-radius: 8px; color: #666;
            font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px;
            transition: all 0.2s ease; z-index: 10;
        }
        .n8n-chat-widget .ux-close-btn:hover { background: #ff4d4d; color: white; }

        .n8n-chat-widget .chat-toggle {
            position: fixed; bottom: 30px; right: 30px;
            padding: 15px 25px; border-radius: 50px; background: var(--chat-green);
            color: white; border: none; cursor: pointer; display: flex; align-items: center; gap: 10px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.2); font-weight: bold; font-size: 16px;
        }
        
        .n8n-chat-widget .terms-text { font-size: 13px; color: #777; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
        .n8n-chat-widget .terms-text a { color: #00bcd4; text-decoration: none; font-weight: 600; }
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
                            <input type="checkbox" id="terms-accepted" style="width:18px; height:18px;"> 
                            <span>I accept the <a href="${config.links.serviceAgreement}" target="_blank">Terms</a> and <a href="${config.links.privacyPolicy}" target="_blank">Privacy Policy</a>.</span>
                        </div>
                    </div>
                    <div class="action-area">
                        <button class="whatsapp-btn" id="submit-btn" disabled>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12.031 2.004c-5.513 0-9.989 4.477-9.989 9.991 0 1.763.459 3.42 1.263 4.86L2 22l5.289-1.388a9.948 9.948 0 004.742 1.196h.001c5.513 0 9.99-4.478 9.99-9.992 0-5.514-4.477-9.992-9.991-9.992zM17.6 15.65c-.244.686-1.439 1.32-1.95 1.32-.51 0-1.11-.194-1.72-.714-.61-.519-2.28-1.166-2.79-1.166-.51 0-.66.393-.91.686-.244.296-.487.593-.732.889-.244.296-.488.592-.976.592-.487 0-1.88-.716-2.81-1.77-.93-.1-1.54-2.35-1.73-2.646-.194-.296 0-.46.15-.62.15-.16.33-.37.49-.55.15-.18.2-.3.3-.49.1-.2.05-.37-.02-.55-.08-.18-.73-1.76-1-2.42-.26-.66-.53-.57-.73-.57-.18 0-.38-.03-.58-.03-.2 0-.53.03-.82.3-.29.27-1.11 1.1-1.11 2.7 0 1.59 1.14 3.12 1.3 3.35.16.23 2.25 3.52 5.46 4.93 3.21 1.41 3.21.94 3.88.94.67 0 2.18-.82 2.46-1.62.28-.79.28-1.23.2-1.37-.08-.14-.24-.22-.51-.36z"/></svg>
                            Start Conversation
                        </button>
                        <p id="form-error" style="color:#d32f2f; display:none; font-size:12px; text-align:center; margin-top:8px; font-weight:bold;"></p>
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
    const closeBtn = widget.querySelector('.ux-close-btn');
    const submitBtn = widget.querySelector('#submit-btn');
    const scrollContent = widget.querySelector('.form-scroll-content');
    const actionArea = widget.querySelector('.action-area');
    const countrySelect = widget.querySelector('#country-code');

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
                scrollContent.innerHTML = `
                    <div style="text-align:center; padding: 60px 20px;">
                        <div style="font-size: 70px; color: #25D366; margin-bottom: 20px;">✓</div>
                        <h2 style="color: #1c274b; margin-bottom: 10px;">All Set!</h2>
                        <p style="font-size: 18px; color: #444; line-height: 1.5;">
                            Thank you, <b>${payload.firstName}</b>. Bridgy will be messaging you on WhatsApp shortly!
                        </p>
                    </div>
                `;
                actionArea.style.display = 'none';
                setTimeout(() => { toggleModal(false); location.reload(); }, 6000);
            } else {
                throw new Error();
            }
        } catch (e) {
            const err = widget.querySelector('#form-error');
            err.textContent = "Unable to connect. Please try again.";
            err.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Start Conversation';
        }
    }

    toggle.onclick = () => toggleModal(true);
    closeBtn.onclick = () => toggleModal(false);
    submitBtn.onclick = sendToWebhook;
    widget.querySelectorAll('input').forEach(i => i.oninput = validate);

})();
