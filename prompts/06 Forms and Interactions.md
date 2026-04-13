# Prompt #6: Forms & Interactions

    Context:
    Our React frontend is successfully authenticating and fetching data from our Express backend. The Dashboard is rendering the SubjectCard components correctly.

    Your Task (Phase 3C - Forms & Interactions):
    Act as a Senior Frontend Engineer. I need you to implement the UI and logic for adding new data, completing the CRUD loop for our MVP.

    Step-by-Step Requirements:

        Modal Component (src/components/Modal.tsx): Create a reusable, accessible modal component using Tailwind CSS (with a dark semi-transparent backdrop and a centered white card).

        Add Subject Form: Implement a form to create a new subject (fields: Name, Total Classes, Passing Grade). When submitted, send a POST request using our Axios service, close the modal, and refresh the dashboard data.

        Subject Card Expansion/Actions: Update the SubjectCard to include two new buttons: "Log Grade" and "Log Absence".

        Log Grade Form: Create a modal/form that triggers when "Log Grade" is clicked. It needs fields for the grade value (number) and an optional weight. Submit via Axios POST to the grades endpoint and refresh the subject data.

        Log Absence Form: Create a simple confirmation modal/action when "Log Absence" is clicked that sends a POST request to the absences endpoint (recording 1 absence) and updates the UI.

    Coding Rules:

        Handle form states properly (loading indicators, error messages if the API fails).

        Keep the Tailwind styling consistent with the clean, minimal vibe of the dashboard.

        Ensure all form inputs are strictly typed according to our TypeScript interfaces.
