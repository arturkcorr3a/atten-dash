import { Router } from "express";

import {
  addAbsence,
  deleteAbsence,
  getTotalAbsences,
  updateAbsence,
} from "../controllers/absence.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const absenceRouter = Router();

absenceRouter.use(authMiddleware);

/**
 * @swagger
 * /api/subjects/{subjectId}/absences:
 *   post:
 *     tags:
 *       - Absences
 *     summary: Add an absence to a subject
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
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               absenceDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *     responses:
 *       201:
 *         description: Absence created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Absence'
 *       400:
 *         description: Invalid subject id or insertion failed
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
absenceRouter.post("/subjects/:subjectId/absences", addAbsence);

/**
 * @swagger
 * /api/subjects/{subjectId}/absences:
 *   get:
 *     tags:
 *       - Absences
 *     summary: Get total absences for one subject
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
 *         description: Total absences returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TotalAbsencesResponse'
 *       400:
 *         description: Invalid subject id or query failed
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
absenceRouter.get("/subjects/:subjectId/absences", getTotalAbsences);

/**
 * @swagger
 * /api/absences/{absenceId}:
 *   put:
 *     tags:
 *       - Absences
 *     summary: Update an absence's date
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: absenceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               absenceDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *             required:
 *               - absenceDate
 *     responses:
 *       200:
 *         description: Absence updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Absence'
 *       400:
 *         description: Invalid payload or update failed
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
 *         description: Absence not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 */
absenceRouter.put("/absences/:absenceId", updateAbsence);

/**
 * @swagger
 * /api/absences/{absenceId}:
 *   delete:
 *     tags:
 *       - Absences
 *     summary: Delete an absence by id
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: absenceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Absence deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Invalid absence id or deletion failed
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
 *         description: Absence not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 */
absenceRouter.delete("/absences/:absenceId", deleteAbsence);

export { absenceRouter };
