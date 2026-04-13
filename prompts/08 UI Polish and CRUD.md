# Prompt #8: UI Polish, Full CRUD, & Registration

    Context:
    The backend now correctly persists totalClasses, passingGrade, and weight, and returns nested grades and absences. The frontend is currently relying on local storage for averages, missing Update/Delete UI actions, lacking modal accessibility, and missing a sign-up flow.

    Your Task (Phase 4B - Frontend Polish):
    Act as a Senior Frontend Engineer. Wire up the remaining CRUD loop, fix the state management, and improve accessibility.

    Step-by-Step Requirements:

        Registration Flow (src/pages/Register.tsx): Create a Sign-Up page using the Supabase Auth client (supabase.auth.signUp). Add a link to navigate between Login and Register.

        Server-Driven State (src/pages/Dashboard.tsx): Remove all localStorage logic for grades and averages. Refactor the dashboard to calculate the average strictly based on the grades array returned by our new backend GET payload.

        Complete the CRUD UI:

            Add "Edit" and "Delete" icon buttons to the SubjectCard.

            Wire the "Delete" button to send a DELETE request to the backend and remove the subject from the UI.

            Wire the "Edit" button to open a pre-filled modal to update the subject details.

        Modal Accessibility (src/components/Modal.tsx): Refactor the modal to include a focus trap. When the modal opens, focus the first input. When it closes, return focus to the trigger button. You can use standard React useRef and useEffect or suggest a lightweight library.

    Coding Rules:

        Strictly follow the TypeScript interfaces matching our updated backend.

        Ensure seamless error handling and loading states for the new Delete/Update actions.
        