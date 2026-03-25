const pool = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

class User {
  static async create(firstName, lastName, email, password, role = 'user') {
    const hashedPassword = await hashPassword(password);
    
    const result = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password, role, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, first_name, last_name, email, role, created_at',
      [firstName, lastName, email, hashedPassword, role]
    );
    
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT id, first_name, last_name, email, role, created_at FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows[0];
  }

  static async authenticateUser(email, password) {
    const user = await this.findByEmail(email);
    
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    const token = generateToken(user.id, user.role);
    
    return {
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async updateUser(id, updates) {
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
      throw new Error('No fields to update');
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING id, first_name, last_name, email, role, created_at`,
      values
    );

    return result.rows[0];
  }

  static async deleteUser(id) {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    return result.rows[0];
  }

  static async listUsers(limit = 10, offset = 0) {
    const result = await pool.query(
      'SELECT id, first_name, last_name, email, role, created_at FROM users LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    return result.rows;
  }
}

module.exports = User;
