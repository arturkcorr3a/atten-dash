# Prompt #3: Swagger & Error Handling

    Context:
    Our Express backend is successfully implemented and compiling. Now, we need to polish the API and make it testable before we start Phase 3 (Frontend).

    Your Task (API Polish):
    Act as a Senior Software Engineer. I need you to implement Swagger UI for documentation and a centralized error handler.

    Step-by-Step Requirements:

        Dependencies: Provide the terminal commands to install swagger-ui-express, swagger-jsdoc, and their respective @types for development.

        Swagger Setup (src/config/swagger.ts): Create the Swagger configuration file. Crucial: You must configure a security scheme for BearerAuth (JWT) so I can authorize and test my protected Supabase routes directly from the UI.

        Error Middleware (src/middlewares/errorHandler.ts): Implement the centralized error-handling middleware you suggested. It should format errors cleanly (status code, message). Update src/index.ts to use it as the last middleware.

        Controller Refactor: Briefly refactor the controllers we just created so that any catch blocks pass the error to next(error) instead of handling it directly.

        Route Annotations: Add the necessary Swagger JSDoc YAML comments to subject.routes.ts, grade.routes.ts, and absence.routes.ts so all endpoints, expected payloads, and responses appear in the Swagger UI. Ensure all protected routes require the BearerAuth security.

        Server Integration: Show me how to update src/index.ts to serve the Swagger documentation at the /api-docs endpoint.

    Rules:

        Keep adhering to the AGENTS.md guidelines.

        Ensure the Swagger UI definitions match our TypeScript interfaces perfectly.
        