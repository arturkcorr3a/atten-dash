# Prompt #14: Frontend UI (Chips, Cores e Títulos)

Use este prompt após atualizar o banco e o backend.

    Context:
    The backend now supports Tags (with colors) and Grade titles. We need to implement the visual part using pastel colors and chips.

    Your Task (Phase 8B - UI Refinement):
    Act as a Senior Frontend Engineer. Implement the tagging UI and enhance the display of grades.

    Step-by-Step Requirements:

        Tag Management UI: Create a simple component to manage tags (Create/Delete) and assign a hex color (pastel tones).

        Subject Cards (Dashboard): >    - If a subject has a tag, display it as a small chip.
{
"id":"160",
"titulo":"Postman",
"autor":"Joana Moura",
"ano": "2024"
}
            Dynamically style the card background using a very light (low opacity) version of the tag color or a left-border stripe.

            Instruction: Use inline styles or Tailwind's arbitrary values for dynamic hex colors.

        Subject Details Page: >    - Display the title of each grade prominently in the grades list/table.

            If an absence has a tag (e.g., "Medical", "Travel"), show the colored chip next to the date.

        Forms: Update the Add/Edit modals for Subjects, Grades, and Absences to include a Tag selector and the Grade Title input.

    Design Guidelines:

        Stick to pastel colors for the tags (e.g., #FFD1DC, #E0BBE4, #B2E2F2).

        Ensure text remains readable over colored backgrounds (check contrast).
        