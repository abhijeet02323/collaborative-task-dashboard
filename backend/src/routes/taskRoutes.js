const express = require('express');
const TaskController = require('../controllers/taskController');
const { taskValidator, handleValidationErrors } = require('../validators');
const { authorize } = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * /tasks:
 *   post:
 *     tags:
 *       - Tasks
 *     summary: Create a new task
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *               dueDate:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 */
router.post('/', taskValidator, handleValidationErrors, TaskController.createTask);

/**
 * @swagger
 * /tasks:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get user tasks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 */
router.get('/', TaskController.getUserTasks);

/**
 * @swagger
 * /tasks/all:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get all tasks (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All tasks retrieved successfully
 */
router.get('/all', authorize('admin'), TaskController.listAllTasks);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get a specific task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 */
router.get('/:id', TaskController.getTask);

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     tags:
 *       - Tasks
 *     summary: Update a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *               status:
 *                 type: string
 *               dueDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 */
router.put('/:id', TaskController.updateTask);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     tags:
 *       - Tasks
 *     summary: Delete a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task deleted successfully
 */
router.delete('/:id', TaskController.deleteTask);

module.exports = router;
