# Prompt #5: The Dashboard & Visual Alerts

    Context:
    Our React/Vite frontend foundation is set up. The AuthContext and Axios API service are configured to talk to our backend.

    Your Task (Phase 3B - Dashboard & UI):
    Act as a Senior Frontend Engineer. I need you to build the core UI components for our MVP using Tailwind CSS.

    Step-by-Step Requirements:

        Login Page (src/pages/Login.tsx): Create a simple login form (email and password). Use the Supabase client to authenticate the user. On success, redirect to /dashboard.

        Types (src/types/index.ts): Ensure the frontend has matching TypeScript interfaces for Subject, Grade, and Absence based on our backend.

        Subject Card Component (src/components/SubjectCard.tsx): Create a reusable card component to display a single subject. It should show:

            Subject Name.

            Current Average Grade vs Passing Grade.

            Total Absences vs Allowed Absences (Assuming a standard 25% failure limit based on totalClasses).

        Visual Alert Logic (Tailwind): Implement the business rules for colors inside the SubjectCard:

            Grades: Text/Badge is text-green-600 if average is >= passing grade. text-red-600 if below.

            Absences: Background/Badge is bg-green-100 if safe, bg-yellow-100 if close to the 25% limit, and bg-red-100 if the user has failed by absence.

        Dashboard Page (src/pages/Dashboard.tsx): Create the main dashboard.

            Use useEffect to fetch the user's subjects via our Axios API service on mount.

            Map through the data and render a grid of SubjectCard components.

            Include a simple "Add Subject" button (it can just log to the console or open a blank modal for now).

    Coding Rules:

        Keep the design clean, modern, and minimalist.

        Strictly type all component props.

        Handle loading and error states cleanly (e.g., showing a "Loading subjects..." text).
        