# Prompt #9: Auth Polish (Password Reset & Toasts)

Now let's get the code updated. To make the toast notifications look great instantly without writing custom CSS animations, we will have Copilot use react-hot-toast, a standard, lightweight library.

Copy and paste this into Copilot Chat (using @workspace or #file:AGENTS.md):

    Context:
    We are polishing the authentication flow for our app, now named "AttenDash". Email confirmation is enabled in Supabase.

    Your Task (Phase 5 - Auth Polish):
    Act as a Senior Frontend Engineer. I need you to implement a password reset flow and add user-friendly toast notifications to our React frontend.

    Step-by-Step Requirements:

        Toast Setup: Provide the terminal command to install react-hot-toast. Set up the <Toaster /> component at the root level of our app (likely in App.tsx or main.tsx) so we can trigger toasts from anywhere.

        Register Feedback (src/pages/Register.tsx): Update the sign-up logic. On successful registration, do NOT redirect to the dashboard immediately. Instead, trigger a success toast: "Registration successful! Please check your email to confirm your account."

        Forgot Password Flow (src/pages/ForgotPassword.tsx): Create a new page with a simple email input. When submitted, call supabase.auth.resetPasswordForEmail (ensure the redirectTo URL points to our local update-password route). Show a success toast instructing them to check their email.

        Update Password Flow (src/pages/UpdatePassword.tsx): Create a new page that the user lands on after clicking the reset link in their email. It should have an input for a new password and call supabase.auth.updateUser to set it. On success, redirect to /login with a success toast.

        Routing & Links: Add these new routes to App.tsx. Add a "Forgot Password?" link on the Login page, and ensure smooth navigation between them.

    Coding Rules:

        Keep the styling consistent with our Tailwind MVP vibe.

        Handle all Supabase Auth errors gracefully, displaying the error message in a toast.error().
        