const Task = require('../models/Task');

class TaskController {
  static async createTask(req, res) {
    try {
      const { title, description, priority, dueDate } = req.body;

      const task = await Task.create(
        req.userId,
        title,
        description,
        priority,
        dueDate
      );

      return res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task,
      });
    } catch (error) {
      console.error('Create task error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create task',
      });
    }
  }

  static async getTask(req, res) {
    try {
      const { id } = req.params;

      const task = await Task.findByIdAndUserId(id, req.userId);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Task retrieved successfully',
        data: task,
      });
    } catch (error) {
      console.error('Get task error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve task',
      });
    }
  }

  static async getUserTasks(req, res) {
    try {
      const { limit = 20, offset = 0 } = req.query;

      const tasks = await Task.findByUserId(
        req.userId,
        parseInt(limit),
        parseInt(offset)
      );

      return res.status(200).json({
        success: true,
        message: 'Tasks retrieved successfully',
        data: tasks,
      });
    } catch (error) {
      console.error('Get tasks error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve tasks',
      });
    }
  }

  static async updateTask(req, res) {
    try {
      const { id } = req.params;
      const { title, description, priority, status, dueDate } = req.body;

      const updates = {};
      if (title) updates.title = title;
      if (description) updates.description = description;
      if (priority) updates.priority = priority;
      if (status) updates.status = status;
      if (dueDate) updates.due_date = dueDate;

      const task = await Task.updateTask(id, req.userId, updates);

      return res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: task,
      });
    } catch (error) {
      console.error('Update task error:', error);
      if (error.message === 'Task not found or unauthorized') {
        return res.status(404).json({
          success: false,
          message: 'Task not found',
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to update task',
      });
    }
  }

  static async deleteTask(req, res) {
    try {
      const { id } = req.params;

      const result = await Task.deleteTask(id, req.userId);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Task not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
        data: result,
      });
    } catch (error) {
      console.error('Delete task error:', error);
      if (error.message === 'Task not found or unauthorized') {
        return res.status(404).json({
          success: false,
          message: 'Task not found',
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to delete task',
      });
    }
  }

  static async listAllTasks(req, res) {
    try {
      const { limit = 20, offset = 0 } = req.query;

      const tasks = await Task.listAllTasks(parseInt(limit), parseInt(offset));

      return res.status(200).json({
        success: true,
        message: 'All tasks retrieved successfully',
        data: tasks,
      });
    } catch (error) {
      console.error('List tasks error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve tasks',
      });
    }
  }
}

module.exports = TaskController;
