# Prompt #4: Frontend Foundation & Auth

    Context:
    Phase 1 and 2 are complete. Our Node.js backend is running on http://localhost:3000 and our Supabase database is active.

    Your Task (Phase 3A - Frontend Foundation):
    Act as a Senior Frontend Engineer. I need you to bootstrap our React application inside a new frontend/ folder in our monorepo.

    Step-by-Step Requirements:

        Initialization: Provide the zsh terminal commands to create a new Vite project (React + TypeScript) in a frontend directory, and install Tailwind CSS, react-router-dom, axios, and @supabase/supabase-js.

        Tailwind Config: Show me the exact configuration for tailwind.config.js and index.css to get the styling engine running.

        API Service (src/services/api.ts): Create an Axios instance configured with a baseURL pointing to our local Node.js backend (http://localhost:3000). Add an interceptor that automatically attaches the Supabase JWT token to the Authorization header of every request.

        Auth Context (src/context/AuthContext.tsx): Create a React Context that uses the Supabase client to manage the user's session state (logged in, logged out, loading).

        Base Routing (src/App.tsx): Set up react-router-dom with two basic routes:

            A public /login route (just a placeholder component for now).

            A protected /dashboard route (wrapped in a guard that checks the AuthContext).

    Coding Rules:

        Strictly follow the Clean Code, TypeScript strict typing, and naming conventions from AGENTS.md.

        Ensure a clean folder structure (src/components, src/pages, src/context, src/services).

        Keep the UI extremely simple for now; focus on the wiring.
        