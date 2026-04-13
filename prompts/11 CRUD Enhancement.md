# Prompt #11: Backend (Datas nas Faltas e CRUD Completo)

    Context:
    We are expanding our "AttenDash" app to include a detailed view for each subject. We need to upgrade our backend to support full CRUD operations for both Grades and Absences, and introduce a date field for absences.

    Your Task (Phase 7A - Backend Expansion):
    Act as a Senior Backend Engineer. Update the database schema and controllers to support the new detailed subject view.

    Step-by-Step Requirements:

        SQL Migration: Provide the ALTER TABLE SQL script to add a date column (type date or timestamp) to the absences table in Supabase.

        Types & Models (src/types/index.ts): Update the Absence interface to include the date property. Ensure the Grade interface properly reflects value and weight.

        Absence Controller & Routes:

            Update the POST method to accept and save a specific date.

            Implement a PUT method to update an absence's date.

            Implement a DELETE method to remove a specific absence by ID.

        Grade Controller & Routes:

            Implement a PUT method to update a specific grade's value and weight by ID.

            Ensure the DELETE method for grades is fully implemented and mapped in the routes.

        Subject Controller: Ensure the GET subject by ID route (/subjects/:id) fetches the subject with its nested grades and absences (ordered by date).

    Coding Rules:

        Strictly follow our centralized error handling (next(error)).

        Ensure all operations are scoped to the authenticated user's ID to respect RLS.
        