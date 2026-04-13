# Prompt #10: Branding & Logos

Now let's have Copilot wire this image into your UI and update the browser tab. Copy and paste this prompt into your Copilot Chat (using @workspace):

    Context:
    We are officially branding our application as "AttenDash". I have placed a logo.png file in the public/ folder of the React frontend.

    Your Task (Phase 6 - Branding):
    Act as a Senior Frontend Engineer. Update the application's HTML and React components to display the new brand identity.

    Step-by-Step Requirements:

        Document Title & Favicon (index.html): Change the <title> tag to "AttenDash". Update the <link rel="icon"> tag to use /logo.png (make sure the type is set to image/png).

        Login & Register Pages (src/pages/Login.tsx & src/pages/Register.tsx): Add an <img> tag referencing /logo.png at the very top of the authentication forms. Center it and give it a reasonable size using Tailwind utility classes (e.g., h-16 w-auto mx-auto mb-6).

        Dashboard Header (src/pages/Dashboard.tsx): Add the logo to the top navigation or header area of the dashboard. It should sit inline next to the "AttenDash" title. Use Tailwind classes to size it appropriately for a navbar (e.g., h-8 w-auto mr-3) and ensure vertical alignment.

    Coding Rules:

        Ensure all <img> tags have proper alt="AttenDash Logo" attributes for accessibility.

        Keep the layout responsive so the logo scales well on mobile screens.

Once Copilot applies these updates, your browser tab will display "AttenDash" with your custom icon, and your login and dashboard screens will feature your branding perfectly aligned using Tailwind CSS.
