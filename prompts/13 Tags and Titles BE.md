# Prompt #13: Backend & Database (Tags e Títulos)

    Context:
    We are enhancing "AttenDash" with a tagging system for subjects and absences, and adding titles to grade entries.

    Your Task (Phase 8A - Infrastructure for Tags & Titles):
    Act as a Senior Backend Engineer. Update the Supabase schema and the Express API to handle these new attributes.

    Step-by-Step Requirements:

        SQL Migration (Tags Table): Create a tags table with: id (uuid), user_id (uuid, fk to auth.users), name (text), and color (text). Enable RLS.

        SQL Migration (Alterations): >    - Add tag_id (uuid, fk to tags) to the subjects and absences tables.

            Add a title (text) column to the grades table.

        Tag Controller & Routes: Create a TagController to handle basic CRUD (Create, Read, Delete) for tags.

        Update Entities: Update the TypeScript interfaces in src/types/index.ts to include Tag and the new optional tagId and title fields.

        Controller Updates: >    - Update SubjectController to allow linking a tagId during creation/update.

            Update GradeController to persist the title field.

            Ensure the GET routes return the associated Tag object (join) for subjects and absences.

    Coding Rules:

        Ensure all operations are scoped to the authenticated user.

        Maintain clean code and consistent error handling as defined in AGENTS.md.
        