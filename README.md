# n8n-wp-chat-widget

Bridgy AI WhatsApp Lead Widget & n8n Automation

Bridgy AI is a premium, high-conversion lead generation widget designed to bridge the gap between your website and WhatsApp. Unlike standard "click-to-chat" buttons, Bridgy captures user data first, logs it into your CRM (Google Sheets), and initiates an AI-driven conversation via n8n and OpenAI.

🚀 FeaturesData-First Capture: Captures Name, Email, and Phone before redirecting to chat, ensuring no lead is lost.
n8n Integration: Built-in support for Webhooks to trigger complex automation workflows.
AI-Ready: Designed to pass data to an AI Agent (GPT-4o) for instant, personalized WhatsApp greetings.
Premium UX:
Responsive design for Mobile & Desktop.
Modern side-bar branding.
Smart country code selector.
Validation logic (disables button until terms are accepted).

🛠️ How it Works: The Integration FlowThe Trigger: 
A visitor fills out the Bridgy widget on your WordPress site.
The Handshake: The widget sends a JSON payload to your n8n Webhook URL.
The CRM Log: n8n receives the data and automatically appends a new row to Google Sheets.
The AI Brain: The data is passed to an AI Agent node (OpenAI), which generates a personal greeting based on the user's name.
The Connection: n8n sends the AI's response to the user's phone via the WhatsApp Business API.

📦 Installation (WordPress/Web)
1. Add the Script
Copy the code in widget.js and paste it into your WordPress site. You can use a plugin like "Header and Footer Scripts" or add it to your theme's footer.php.2.

2. Configure your BackendUpdate the defaultConfig object at the top of the script with your specific details:

   ***JavaScript***
   const defaultConfig = {
    whatsapp: {
        phoneNumber: '+61412345678', // Your business number
        n8nBackendUrl: 'https://your-n8n-instance.com/webhook/bridgy-lead',
    },
    branding: {
        logo: 'https://yourlink.com/photo.png',
        name: 'Bridgy',
    }
};

🤖 n8n Workflow Configuration
To replicate the AI chat experience, your n8n workflow should contain the following nodes:

<img width="485" height="215" alt="image" src="https://github.com/user-attachments/assets/50cb660d-f62b-4196-ba44-a0e99209a0cd" />

🎨 CustomizationThe widget uses CSS variables for easy styling. 
You can modify the colors directly in the styles constant within the script:
--chat-navy: Primary branding color (Buttons/Headers).
--chat-green: WhatsApp branding color (Toggle Button).
--chat-bg-input: Background color for input fields.

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

Developed by Bridgeware Technologies Empowering businesses through AI-driven automation.
