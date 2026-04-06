import { Router } from "express";

import { addGrade, deleteGrade } from "../controllers/grade.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const gradeRouter = Router();

gradeRouter.use(authMiddleware);

/**
 * @swagger
 * /api/subjects/{subjectId}/grades:
 *   post:
 *     tags:
 *       - Grades
 *     summary: Add a grade to a subject
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddGradeBody'
 *     responses:
 *       201:
 *         description: Grade added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Grade'
 *       400:
 *         description: Invalid payload or insertion failed
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
gradeRouter.post("/subjects/:subjectId/grades", addGrade);

/**
 * @swagger
 * /api/grades/{gradeId}:
 *   delete:
 *     tags:
 *       - Grades
 *     summary: Delete a grade by id
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gradeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Grade deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Invalid grade id or deletion failed
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
 *         description: Grade not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 */
gradeRouter.delete("/grades/:gradeId", deleteGrade);

export { gradeRouter };
