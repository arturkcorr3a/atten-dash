import { Router } from "express";
import {
  getTags,
  createTag,
  deleteTag,
  updateTag,
} from "../controllers/tag.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const tagRouter = Router();

tagRouter.use(authMiddleware);

/**
 * @swagger
 * /api/tags:
 *   get:
 *     tags:
 *       - Tags
 *     summary: Get all tags
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of tags
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tag'
 *       401:
 *         description: Unauthorized
 */
tagRouter.get("/", getTags);

/**
 * @swagger
 * /api/tags:
 *   post:
 *     tags:
 *       - Tags
 *     summary: Create a new tag
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Important"
 *               color:
 *                 type: string
 *                 example: "#FF5733"
 *     responses:
 *       201:
 *         description: Tag created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *       400:
 *         description: Invalid payload
 *       401:
 *         description: Unauthorized
 */
tagRouter.post("/", createTag);

/**
 * @swagger
 * /api/tags/{tagId}:
 *   put:
 *     tags:
 *       - Tags
 *     summary: Update a tag
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tag updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *       400:
 *         description: Invalid payload or update failed
 *       401:
 *         description: Unauthorized
 */
tagRouter.put("/:tagId", updateTag);

/**
 * @swagger
 * /api/tags/{tagId}:
 *   delete:
 *     tags:
 *       - Tags
 *     summary: Delete a tag
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tag deleted
 *       400:
 *         description: Failed to delete tag
 *       401:
 *         description: Unauthorized
 */
tagRouter.delete("/:tagId", deleteTag);

export { tagRouter };
