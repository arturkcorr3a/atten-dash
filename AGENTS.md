# 🤖 SYSTEM INSTRUCTIONS & PROJECT CONTEXT

## 🎯 1. Project Overview
We are building a web application MVP for academic tracking. The goal is to allow university students to track their enrolled subjects, log published grades, and manage their attendance (absences).
The application must be lightweight, fast, and scalable, relying on free-tier tools.

## 🛠️ 2. Tech Stack & Environment
**Host Environment:** Linux Fedora 41, utilizing `oh-my-zsh` terminal.
**Frontend:**
- Framework: React (initialized via Vite)
- Language: TypeScript
- Styling: Tailwind CSS
**Backend:**
- Runtime: Node.js
- Framework: Express.js
- Language: TypeScript
**Database & Authentication:**
- Provider: Supabase (PostgreSQL relational database + Built-in Auth)

## 🏗️ 3. Architecture & Structure
Maintain strict separation of concerns. The monorepo/workspace should be organized logically:
- `frontend/`: Contains all React/Vite code.
- `backend/`: Contains all Node/Express code.
  - `src/config/`: Setup for Supabase client, environment variables.
  - `src/controllers/`: Request/Response handling.
  - `src/routes/`: Express route definitions.
  - `src/middlewares/`: Authentication and error handling middlewares.
  - `src/models/` or `src/types/`: TypeScript interfaces and type definitions.

## 🧹 4. Clean Code & Programming Guidelines
As an AI coding assistant, you must adhere to the following Senior Software Engineering principles:

### TypeScript & Typing
- **Strict Typing:** Never use `any`. Always define descriptive interfaces or types for variables, function parameters, and return values.
- **Null Safety:** Handle `null` and `undefined` explicitly. Use optional chaining (`?.`) and nullish coalescing (`??`).

### Naming Conventions
- **Variables & Functions:** `camelCase` (e.g., `calculateAverage`, `remainingAbsences`).
- **Classes, Interfaces & React Components:** `PascalCase` (e.g., `SubjectController`, `GradeDisplay`).
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_ABSENCES_ALLOWED`).
- **Booleans:** Prefix with `is`, `has`, or `should` (e.g., `isApproved`, `hasMissingGrades`).

### Functions & Logic
- **Single Responsibility Principle (SRP):** A function should do exactly one thing. If it does multiple things, extract them into helper functions.
- **Early Returns:** Avoid deep nesting (Arrow Anti-Pattern). Return early to handle edge cases or errors at the top of the function.
- **Immutability:** Prefer `const` over `let`. Avoid mutating arrays and objects directly; use map, filter, reduce, or spread operators.

### Error Handling
- Use `try/catch` blocks for all asynchronous operations (Supabase calls, API requests).
- The backend must have a centralized Express error-handling middleware. Do not leak stack traces to the client.
- Always return consistent HTTP status codes (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error).

### Comments & Documentation
- **Do not state the obvious:** Code should be self-documenting through good naming.
- **Explain the "Why", not the "What":** Add comments only when explaining complex business logic, workarounds, or specific academic calculation formulas.

## 🧑‍💻 5. Agent Workflow (How you must act)
1. **No Hallucinations:** If a library or Supabase method is deprecated, use the most up-to-date syntax.
2. **Terminal Commands:** When providing terminal commands, ensure they are compatible with `zsh` on Linux.
3. **Step-by-Step Execution:** Do not attempt to build the entire app in one go. Follow the phases provided by the user (e.g., Foundation -> API -> Frontend).
4. **Context Awareness:** Always check this document before suggesting architectural changes.