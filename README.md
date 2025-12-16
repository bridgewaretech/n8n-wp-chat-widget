# n8n-wp-chat-widget

🚀 OverviewThis repository hosts the core JavaScript and CSS logic for a custom WhatsApp Lead Capture Widget. This widget is designed to collect a user's name, phone number, and email via a modal form, send that data to a private n8n webhook for lead logging, and then immediately redirect the user to a WhatsApp conversation with a pre-filled message.The goal of this setup is to keep the lightweight, dynamic front-end code public while ensuring all sensitive configuration details (like webhook URLs and private phone numbers) remain secured within the WordPress environment.📦 Repository ContentsFileDescriptionwp-chat-widget.jsThe complete, minified JavaScript file containing the logic, form creation, event handlers, and embedded CSS for the WhatsApp Lead Modal. This file does NOT contain any private configuration.README.mdThis documentation file.⚙️ How It WorksThe system operates in two parts:WordPress Configuration (Private): A small script placed directly into your WordPress site's header/footer defines the global window.ChatWidgetConfig object. This object holds all the unique and sensitive values (e.g., n8nBackendUrl, phoneNumber).GitHub Logic (Public): The wp-chat-widget.js file, loaded via CDN from this repository, runs the main application. It reads the window.ChatWidgetConfig object to dynamically build and power the widget, including where the data should be sent.🖥️ Step 1: WordPress Implementation (The Configuration)This is the code snippet that should be placed in your WordPress site's header, footer, or via a dedicated plugin (e.g., Insert Headers and Footers).⚠️ IMPORTANT: Replace all placeholder values (+61412345678, https://n8n-xxxxxx.com/..., image URLs, etc.) with your actual production values.HTML<script>
    window.ChatWidgetConfig = {
        // 1. WhatsApp Configuration (Required for functionality)
        whatsapp: {
            // Your ACTUAL WhatsApp number (E.164 format: +<country_code><number>)
            phoneNumber: '+61412345678', 
            // Your n8n webhook URL for LEAD CAPTURE (PRIVATE)
            n8nBackendUrl: 'https://n8n-xxxxxx.com/webhook/123335e67-31a9-6yge-8d76-08098910b123/whatsapp-lead',
            // Default message sent to your WhatsApp number
            prefilledMessage: 'Hi! I saw your form on the website and would like to start a conversation.', 
        },

        // 2. Branding (Custom Text and Images)
        branding: {
            // URL of the agent image for the modal sidebar
            logo: 'https://mywebsite.com/wp-content/uploads/2025/06/MyLogo.png', 
            // Agent/Business Name for the widget header
            name: 'My Business Name', 
            // Welcome text (MUST include **[Agent Name]** placeholder)
            welcomeText: '¡Hola! Soy **[Agent Name]**, tu Vendedora con IA. Completa el formulario y me pondré en contacto contigo.', 
            
            poweredBy: {
                text: 'Biky AI is powered by Keybe AI',
                link: 'https://keybe.ai/'
            }
        },

        // 3. Legal Links
        links: {
            serviceAgreement: 'https://mywebsite.com/service-agreement', 
            privacyPolicy: 'https://mywebsite.com/privacy-policy'
        },

        // 4. Style (WhatsApp Green Theme recommended)
        style: {
            primaryColor: '#00BB2D', 
            secondaryColor: '#075E54', 
            position: 'right', // 'right' or 'left'
            backgroundColor: '#ffffff',
            fontColor: '#333333'
        }
    };
</script>

<script>
    window.addEventListener('DOMContentLoaded', () => {
        const script = document.createElement('script');
        // This CDN URL points to the JavaScript file in THIS repository
        script.src = 'https://cdn.jsdelivr.net/gh/My-gh-Repo/n8n-wp-chat-widget@XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/wp-chat-widget.js';
        document.body.appendChild(script);
    });
</script>
⚙️ Step 2: n8n Backend Setup (The Lead Logger)The form data is sent to your n8nBackendUrl as a POST request with a JSON body.Trigger Node: Use the Webhook node.Method: POSTPath: whatsapp-lead (or whatever you configured in the URL).Wait for response: NoData Received: The Webhook receives the following JSON payload:JSON{
  "firstName": "...",
  "lastName": "...",
  "phone": "+<country_code><number>",
  "email": "...",
  "source": "Website Chat Form"
}
Action Node: Connect the Webhook to a node that stores the lead (e.g., Google Sheets, CRM, or Database). Map the incoming $json fields to your desired destination.📝 Development Notes for wp-chat-widget.jsTechnology Stack: Pure JavaScript and CSS.Dependencies: None outside of the embedded styles and the optional Geist font loaded via CDN.Validation: The widget enforces required fields (nombre, telefono, terms-accepted) before enabling the "Iniciar Conversación" button.Redirection Logic: Upon successful validation and submission, the script constructs the WhatsApp URL and opens it in a new tab:JavaScript// Redirect logic example
const whatsappUrl = `https://wa.me/${config.whatsapp.phoneNumber.replace('+', '')}?text=${encodeURIComponent(config.whatsapp.prefilledMessage + ' - ' + name + ' ' + lastName + ' (' + fullPhoneNumber + ')')}`;
window.open(whatsappUrl, '_blank');
