# Prompt #2: The API & Controllers

    Context:
    We have successfully completed Phase 1. Our Express server is running, and our Supabase database schema (with RLS policies linked to auth.users) is deployed.

    Your Task (Phase 2 - The API):
    Act as a Senior Software Engineer. I need you to build the core backend logic to interact with our Supabase database.

    Step-by-Step Requirements:

        Auth Middleware (src/middlewares/authMiddleware.ts): Create an Express middleware that extracts the JWT from the Authorization header, verifies it using the Supabase client, and attaches the user object to the Express req. Return a 401 if unauthorized.

        Type Definitions (src/types/index.ts): Generate TypeScript interfaces for our entities: Subject, Grade, and Absence, matching the database schema we just created.

        Controllers (src/controllers/): Create the following controllers with complete error handling and strict typing:

            SubjectController: Create a subject, get all subjects for the user, get a specific subject, delete a subject.

            GradeController: Add a grade to a subject, delete a grade.

            AbsenceController: Add an absence, get total absences for a subject.

        Routes (src/routes/): Create the Express routes for these controllers and protect them using the authMiddleware.

        Server Integration: Show me exactly how to update src/index.ts to register these new routes.

    Coding Rules:

        Strictly follow the Clean Code and formatting guidelines from AGENTS.md.

        Ensure all Supabase queries use the authenticated user's context so RLS works correctly.

        Do not write the frontend code yet.
        