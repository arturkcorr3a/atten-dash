# Prompt #1: Backend Foundation

    Main Context:
    We are building the backend for an MVP web app for academic tracking (grades and attendance).
    Backend Stack: Node.js, Express, TypeScript, and @supabase/supabase-js for database connection and authentication.

    Your Task (Phase 1 - Foundation):
    Act as a Senior Software Engineer. I need you to set up the initial structure of our backend. Please provide the exact step-by-step guide and the initial code.

    Response Requirements:

        Terminal Commands: Provide all necessary commands to initialize the project (npm init), and install production and development dependencies (including types). Keep in mind I am running a zsh terminal in a Linux environment.

        TypeScript Setup: Generate a tsconfig.json file optimized for Node.js with Express.

        Folder Structure: Suggest a clean, scalable folder architecture for routes, controllers, and database configuration (e.g., /src/routes, /src/controllers, /src/config).

        Supabase Client: Create the configuration file to initialize the Supabase client (e.g., src/config/supabase.ts), reading credentials from a .env file.

        Express Server: Create a basic src/index.ts file that initializes the server on port 3000 and includes a Health Check route (/ping) to test if it's running.

    Coding Rules:

        Write clean, modular, and typed code.

        Do not implement the business routes (grades/subjects) yet. Focus strictly on the foundation.
