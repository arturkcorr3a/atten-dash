import { Router } from "express";

import {
  createSubject,
  deleteSubject,
  getSubjectById,
  getSubjects,
} from "../controllers/subject.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const subjectRouter = Router();

subjectRouter.use(authMiddleware);

/**
 * @swagger
 * /api/subjects:
 *   post:
 *     tags:
 *       - Subjects
 *     summary: Create a subject
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubjectBody'
 *     responses:
 *       201:
 *         description: Subject created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subject'
 *       400:
 *         description: Invalid payload or creation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 */
subjectRouter.post("/subjects", createSubject);

/**
 * @swagger
 * /api/subjects:
 *   get:
 *     tags:
 *       - Subjects
 *     summary: List authenticated user subjects
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Subject list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subject'
 *       400:
 *         description: Failed to fetch subjects
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 */
subjectRouter.get("/subjects", getSubjects);

/**
 * @swagger
 * /api/subjects/{subjectId}:
 *   get:
 *     tags:
 *       - Subjects
 *     summary: Get one subject by id
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Subject found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subject'
 *       400:
 *         description: Invalid subject id or fetch failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       404:
 *         description: Subject not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 */
subjectRouter.get("/subjects/:subjectId", getSubjectById);

/**
 * @swagger
 * /api/subjects/{subjectId}:
 *   delete:
 *     tags:
 *       - Subjects
 *     summary: Delete one subject by id
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Subject deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Invalid subject id or deletion failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       404:
 *         description: Subject not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 */
subjectRouter.delete("/subjects/:subjectId", deleteSubject);

export { subjectRouter };
