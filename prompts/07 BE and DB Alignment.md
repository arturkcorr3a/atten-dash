# Prompt #7: Database & Backend Alignment

    Context:
    We are auditing our MVP and found a persistence mismatch between the frontend forms and the backend.

    Your Task (Phase 4A - Backend Fixes):
    Act as a Senior Backend Engineer. Fix the data schema and controllers to ensure all frontend data is properly stored and calculated on the server.

    Step-by-Step Requirements:

        SQL Migration: Provide the ALTER TABLE SQL script to add totalClasses (integer) and passingGrade (numeric) to the subjects table, and weight (numeric) to the grades table in Supabase. Use snake_case for DB columns (total_classes, passing_grade).

        Types & Models: Update src/types/index.ts in the backend so the Subject and Grade interfaces include these new fields.

        Controller Updates: Update SubjectController and GradeController to map and persist these new fields during POST and PUT requests.

        Server-Driven Data: Update the GET route for subjects so that it performs a SQL join (or Supabase relationship query) to fetch the subject alongside its associated grades and absences in a single payload.

    Coding Rules:

        Ensure all snake_case DB columns are properly mapped to camelCase in the TypeScript responses.

        Maintain our centralized error handling.
        