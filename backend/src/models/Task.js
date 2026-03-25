const pool = require('../config/database');

class Task {
  static async create(userId, title, description, priority, dueDate = null) {
    const result = await pool.query(
      'INSERT INTO tasks (user_id, title, description, priority, due_date, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
      [userId, title, description, priority, dueDate, 'pending']
    );

    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [id]
    );

    return result.rows[0];
  }

  static async findByIdAndUserId(id, userId) {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    return result.rows[0];
  }

  static async findByUserId(userId, limit = 20, offset = 0) {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );

    return result.rows;
  }

  static async updateTask(id, userId, updates) {
    const task = await this.findByIdAndUserId(id, userId);

    if (!task) {
      throw new Error('Task not found or unauthorized');
    }

    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      return task;
    }

    values.push(id);
    values.push(userId);

    const result = await pool.query(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramCount} AND user_id = $${paramCount + 1} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async deleteTask(id, userId) {
    const task = await this.findByIdAndUserId(id, userId);

    if (!task) {
      throw new Error('Task not found or unauthorized');
    }

    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    return result.rows[0];
  }

  static async listAllTasks(limit = 20, offset = 0) {
    const result = await pool.query(
      'SELECT * FROM tasks ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    return result.rows;
  }
}

module.exports = Task;
