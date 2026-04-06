import path from "path";

import swaggerJsdoc from "swagger-jsdoc";
import type { Options } from "swagger-jsdoc";

const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "AttenDash API",
      version: "1.0.0",
      description:
        "Academic tracking API for subjects, grades, and attendance (absences).",
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Use a Supabase JWT access token.",
        },
      },
      schemas: {
        Subject: {
          type: "object",
          required: ["id", "userId", "name", "createdAt"],
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            name: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Grade: {
          type: "object",
          required: ["id", "userId", "subjectId", "value", "createdAt"],
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            subjectId: { type: "string", format: "uuid" },
            value: { type: "number" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Absence: {
          type: "object",
          required: ["id", "userId", "subjectId", "createdAt"],
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            subjectId: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        CreateSubjectBody: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
          },
        },
        AddGradeBody: {
          type: "object",
          required: ["value"],
          properties: {
            value: { type: "number" },
          },
        },
        TotalAbsencesResponse: {
          type: "object",
          required: ["subjectId", "totalAbsences"],
          properties: {
            subjectId: { type: "string", format: "uuid" },
            totalAbsences: { type: "integer", minimum: 0 },
          },
        },
        MessageResponse: {
          type: "object",
          required: ["message"],
          properties: {
            message: { type: "string" },
          },
        },
        ErrorResponse: {
          type: "object",
          required: ["statusCode", "message"],
          properties: {
            statusCode: { type: "integer", example: 400 },
            message: { type: "string", example: "Bad request" },
          },
        },
      },
    },
  },
  apis: [
    path.resolve(process.cwd(), "src/routes/*.ts"),
    path.resolve(process.cwd(), "dist/routes/*.js"),
  ],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
