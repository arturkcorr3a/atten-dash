# Prompt #12: Frontend (A Página da Disciplina)

Execute este prompt apenas depois que o backend estiver compilando e a tabela do Supabase estiver atualizada.

    Context:
    The backend now supports full CRUD for Grades (value, weight) and Absences (date).

    Your Task (Phase 7B - Frontend Subject Details):
    Act as a Senior Frontend Engineer. Build a dedicated Subject Details page with full CRUD UI for grades and absences.

    Step-by-Step Requirements:

        Routing (src/App.tsx): Add a new protected route: /subject/:id. Update the SubjectCard component on the Dashboard so clicking on it navigates to this new details page.

        Subject Details Page (src/pages/SubjectDetails.tsx): >    - Fetch the subject data (with nested grades and absences) using the ID from the URL (useParams).

            Create a clean header showing the Subject Name, Current Average, and Total Absences. Include a "Back to Dashboard" button.

        Grades Section:

            Render a table or list showing each grade's Value and Weight.

            Add "Edit" and "Delete" icon buttons for each row.

            Include an "Add Grade" button.

        Absences Section:

            Render a list of absences formatted by Date (e.g., DD/MM/YYYY).

            Add "Edit" and "Delete" icon buttons for each row.

            Include an "Add Absence" button (with a date picker input).

        Modals & Forms: Use our existing Modal component to handle the Add/Edit forms for both Grades and Absences. When a form is submitted or an item is deleted, trigger an Axios request and refresh the page data seamlessly. Show react-hot-toast notifications on success/error.

    Coding Rules:

        Maintain the minimalist Tailwind CSS design system.

        Strictly type all Axios responses and React state using our interfaces.
        